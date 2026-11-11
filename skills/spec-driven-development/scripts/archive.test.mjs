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

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CLI = new URL('./archive.mjs', import.meta.url).pathname;

function repo() {
  const root = mkdtempSync(join(tmpdir(), 'specs-'));
  mkdirSync(join(root, 'specs', 'changes', 'tweak'), { recursive: true });
  writeFileSync(join(root, 'specs', 'memory.md'), LIVING);
  return root;
}

test('the CLI writes the living spec and moves the change into the dated archive', () => {
  const root = repo();
  writeFileSync(join(root, 'specs', 'changes', 'tweak', 'change.md'), change('## Added\n\n### New\nTHE SYSTEM SHALL work.\n'));
  execFileSync('node', [CLI, join(root, 'specs', 'changes', 'tweak'), '--date', '2026-11-11']);
  assert.match(readFileSync(join(root, 'specs', 'memory.md'), 'utf8'), /### New\nTHE SYSTEM SHALL work\./);
  assert.ok(existsSync(join(root, 'specs', 'changes', 'archive', '2026-11-11-tweak', 'change.md')));
  assert.ok(!existsSync(join(root, 'specs', 'changes', 'tweak')));
});

test('the CLI marks a superseded old spec on its first line', () => {
  const root = repo();
  writeFileSync(join(root, 'specs', 'old-design.md'), '# Spec: old design\n\ntext\n');
  const md = change('## Added\n\n### New\nTHE SYSTEM SHALL work.\n').replace('area: memory', 'area: memory\nsupersedes: specs/old-design.md');
  writeFileSync(join(root, 'specs', 'changes', 'tweak', 'change.md'), md);
  execFileSync('node', [CLI, join(root, 'specs', 'changes', 'tweak'), '--date', '2026-11-11']);
  assert.equal(
    readFileSync(join(root, 'specs', 'old-design.md'), 'utf8').split('\n')[0],
    '> Superseded by `specs/memory.md` on 2026-11-11. Kept as history.',
  );
});

test('on any problem the CLI changes nothing and exits 1', () => {
  const root = repo();
  writeFileSync(join(root, 'specs', 'changes', 'tweak', 'change.md'), change('## Removed\n\n- Ghost\n'));
  const run = spawnSync('node', [CLI, join(root, 'specs', 'changes', 'tweak'), '--date', '2026-11-11'], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.match(run.stdout, /Removed "Ghost" is not in the living spec/);
  assert.equal(readFileSync(join(root, 'specs', 'memory.md'), 'utf8'), LIVING);
  assert.ok(existsSync(join(root, 'specs', 'changes', 'tweak', 'change.md')));
  assert.ok(!existsSync(join(root, 'specs', 'changes', 'archive')));
});
