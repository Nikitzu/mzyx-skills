import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseSpec, validateSpec } from './validate.mjs';

const CORE = ['Objective', 'Commands', 'Project Structure', 'Code Style', 'Testing Strategy', 'Boundaries'];

function living(requirements) {
  return [
    '# Spec: Memory',
    ...CORE.flatMap((s) => ['', `## ${s}`, '', 'text']),
    '',
    '## Requirements',
    '',
    requirements,
  ].join('\n');
}

test('a clean living spec has no problems', () => {
  const md = living('### Size cap\nIF the text exceeds 300 KB, THEN THE SYSTEM SHALL defer the rest.\n');
  assert.deepEqual(validateSpec(md), []);
});

test('parseSpec reads requirement names, lines and EARS text', () => {
  const md = living('### Size cap\nIF the text is large, THEN THE SYSTEM SHALL defer.\n');
  const { requirements } = parseSpec(md);
  assert.equal(requirements.length, 1);
  assert.equal(requirements[0].name, 'Size cap');
  assert.equal(requirements[0].text, 'IF the text is large, THEN THE SYSTEM SHALL defer.');
  assert.ok(requirements[0].line > 1);
});

test('missing core sections are reported', () => {
  const problems = validateSpec('# Spec\n\n## Objective\n\nx\n\n## Requirements\n');
  assert.ok(problems.some((p) => p.message === 'missing section: Commands'));
  assert.ok(problems.some((p) => p.message === 'missing section: Boundaries'));
});

test('a requirement without an EARS line is reported with its line', () => {
  const md = living('### Vague\nThe system should probably cache things.\n');
  const problems = validateSpec(md);
  assert.equal(problems.length, 1);
  assert.match(problems[0].message, /"Vague" does not start with an EARS keyword/);
  assert.equal(problems[0].line, md.split('\n').indexOf('### Vague') + 1);
});

test('duplicate requirement names are reported', () => {
  const md = living('### A\nTHE SYSTEM SHALL x.\n\n### A\nTHE SYSTEM SHALL y.\n');
  assert.ok(validateSpec(md).some((p) => p.message === 'duplicate requirement name: A'));
});

import { parseChange, validateChange } from './validate.mjs';

const LIVING = living(
  '### Size cap\nIF the text is large, THEN THE SYSTEM SHALL defer.\n\n### Old name\nTHE SYSTEM SHALL keep a lock.\n',
);

function change(body, area = 'memory') {
  return `---\narea: ${area}\n---\n\n# Change: tweak\n\n## Why\n\nBecause.\n\n${body}`;
}

test('parseChange reads area and every delta kind', () => {
  const parsed = parseChange(
    change(
      '## Added\n\n### Turn cap\nTHE SYSTEM SHALL stop at 150 turns.\n\n## Modified\n\n### Size cap\nIF the text exceeds 300 KB, THEN THE SYSTEM SHALL defer the rest.\n\n## Removed\n\n- Old name\n\n## Renamed\n\n- Size cap → Input cap\n',
    ),
  );
  assert.equal(parsed.area, 'memory');
  assert.deepEqual(parsed.added.map((r) => r.name), ['Turn cap']);
  assert.deepEqual(parsed.modified.map((r) => r.name), ['Size cap']);
  assert.deepEqual(parsed.removed.map((r) => r.name), ['Old name']);
  assert.deepEqual(parsed.renamed.map((r) => [r.from, r.to]), [['Size cap', 'Input cap']]);
});

test('a clean change against its living spec has no problems', () => {
  const md = change('## Added\n\n### Turn cap\nTHE SYSTEM SHALL stop at 150 turns.\n');
  assert.deepEqual(validateChange(md, LIVING), []);
});

test('a change needs an area, a Why and at least one delta section', () => {
  const problems = validateChange('# Change\n\nnothing here\n', LIVING);
  const messages = problems.map((p) => p.message);
  assert.ok(messages.includes('front matter has no area'));
  assert.ok(messages.includes('missing section: Why'));
  assert.ok(messages.includes('no delta section (Added, Modified, Removed or Renamed)'));
});

test('modified, removed and renamed names must exist; added names must not', () => {
  const md = change(
    '## Added\n\n### Size cap\nTHE SYSTEM SHALL x.\n\n## Modified\n\n### Ghost\nTHE SYSTEM SHALL y.\n\n## Removed\n\n- Phantom\n\n## Renamed\n\n- Nobody → Somebody\n',
  );
  const messages = validateChange(md, LIVING).map((p) => p.message);
  assert.ok(messages.includes('Added "Size cap" already exists in the living spec'));
  assert.ok(messages.includes('Modified "Ghost" is not in the living spec'));
  assert.ok(messages.includes('Removed "Phantom" is not in the living spec'));
  assert.ok(messages.includes('Renamed "Nobody" is not in the living spec'));
});

test('added and modified requirements must be EARS lines', () => {
  const md = change('## Added\n\n### Fuzzy\nMaybe cache it.\n');
  assert.match(validateChange(md, LIVING)[0].message, /"Fuzzy" does not start with an EARS keyword/);
});

test('a change for a new area carries the core sections and only Added', () => {
  const sections = CORE.map((s) => `## ${s}\n\ntext\n`).join('\n');
  const good = change(`${sections}\n## Added\n\n### First\nTHE SYSTEM SHALL exist.\n`, 'fresh');
  assert.deepEqual(validateChange(good, null), []);
  const bad = change('## Modified\n\n### First\nTHE SYSTEM SHALL exist.\n', 'fresh');
  const messages = validateChange(bad, null).map((p) => p.message);
  assert.ok(messages.includes('new area "fresh" has no living spec, so it may only use Added'));
  assert.ok(messages.includes('new area "fresh" needs section: Objective'));
});
