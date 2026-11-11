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
