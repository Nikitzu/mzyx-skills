import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyChange } from './archive.mjs';
import { parseSpec, validateSpec } from './validate.mjs';

const CORE = ['Objective', 'Commands', 'Project Structure', 'Code Style', 'Testing Strategy', 'Boundaries'];
const core = CORE.map((s) => `## ${s}\n\n${s} text.\n`).join('\n');
const LIVING = `# Spec: memory\n\n${core}\n## Requirements\n\n### Size cap\nTHE SYSTEM SHALL cap at 100 KB.\n\n### Old name\nTHE SYSTEM SHALL keep a lock.\n\n### Gone\nTHE SYSTEM SHALL do a thing.\n`;
const change = (body, area = 'memory') => `---\narea: ${area}\n---\n\n# Change\n\n## Why\n\nBecause.\n\n${body}`;

test('applies added, modified, removed and renamed by name', () => {
  const out = applyChange(
    LIVING,
    change(
      '## Added\n\n### Turn cap\nTHE SYSTEM SHALL stop at 150 turns.\n\n## Modified\n\n### Size cap\nIF the text exceeds 300 KB, THEN THE SYSTEM SHALL defer the rest.\n\n## Removed\n\n- Gone\n\n## Renamed\n\n- Old name → Lock\n',
    ),
  );
  assert.ok(out.living, JSON.stringify(out.problems));
  const requirements = parseSpec(out.living).requirements;
  assert.deepEqual(requirements.map((r) => r.name), ['Size cap', 'Lock', 'Turn cap']);
  assert.equal(requirements[0].text, 'IF the text exceeds 300 KB, THEN THE SYSTEM SHALL defer the rest.');
  assert.equal(requirements[1].text, 'THE SYSTEM SHALL keep a lock.');
  assert.match(out.living, /## Objective\n\nObjective text\./);
  assert.deepEqual(validateSpec(out.living), []);
});

test('a new area becomes a living spec from the change', () => {
  const out = applyChange(null, change(`${core}\n## Added\n\n### First\nTHE SYSTEM SHALL exist.\n`, 'fresh'));
  assert.ok(out.living, JSON.stringify(out.problems));
  assert.match(out.living, /^# Spec: fresh/);
  assert.deepEqual(parseSpec(out.living).requirements.map((r) => r.name), ['First']);
  assert.deepEqual(validateSpec(out.living), []);
});

test('a stale name is refused and named, and no text is returned', () => {
  const out = applyChange(LIVING, change('## Modified\n\n### Removed meanwhile\nTHE SYSTEM SHALL x.\n'));
  assert.equal(out.living, undefined);
  assert.deepEqual(out.problems.map((p) => p.message), ['Modified "Removed meanwhile" is not in the living spec']);
});

test('a result that would not validate is refused', () => {
  const broken = LIVING.replace('## Boundaries\n\nBoundaries text.\n', '');
  const out = applyChange(broken, change('## Added\n\n### New\nTHE SYSTEM SHALL work.\n'));
  assert.equal(out.living, undefined);
  assert.ok(out.problems.some((p) => p.message === 'missing section: Boundaries'));
});
