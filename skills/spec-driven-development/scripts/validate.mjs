#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CORE_SECTIONS = [
  'Objective',
  'Commands',
  'Project Structure',
  'Code Style',
  'Testing Strategy',
  'Boundaries',
];
const EARS = /^(THE SYSTEM SHALL|WHEN|WHILE|IF|WHERE)\b/;

function frontMatterOf(markdown) {
  const block = /^---\n([\s\S]*?)\n---\n/.exec(markdown)?.[1];
  if (!block) return {};
  return Object.fromEntries(
    block
      .split('\n')
      .map((line) => /^([\w-]+):\s*(.*)$/.exec(line))
      .filter(Boolean)
      .map((match) => [match[1], match[2].trim()]),
  );
}

function blocks(markdown) {
  const lines = markdown.split('\n');
  const sections = [];
  let current = null;
  let fenced = false;
  lines.forEach((line, i) => {
    if (line.startsWith('```')) fenced = !fenced;
    if (fenced) return;
    const h2 = /^## (.+)$/.exec(line);
    if (h2) {
      current = { name: h2[1].trim(), line: i + 1, requirements: [], items: [] };
      sections.push(current);
      return;
    }
    if (!current) return;
    const h3 = /^### (.+)$/.exec(line);
    if (h3) {
      const rest = lines.slice(i + 1);
      const end = rest.findIndex((next) => /^#{2,3} /.test(next));
      const body = (end < 0 ? rest : rest.slice(0, end)).filter((next) => next.trim());
      current.requirements.push({
        name: h3[1].trim(),
        line: i + 1,
        text: (body[0] ?? '').trim(),
        body: body.join('\n'),
      });
      return;
    }
    if (line.trim()) current.items.push({ line: i + 1, text: line.trim() });
  });
  return sections;
}

export function parseSpec(markdown) {
  const sections = blocks(markdown);
  return {
    frontMatter: frontMatterOf(markdown),
    sections: sections.map((section) => section.name),
    requirements: sections.find((section) => section.name === 'Requirements')?.requirements ?? [],
  };
}

function requirementProblems(requirements) {
  const problems = [];
  const seen = new Set();
  for (const requirement of requirements) {
    if (!EARS.test(requirement.text)) {
      problems.push({
        line: requirement.line,
        message: `"${requirement.name}" does not start with an EARS keyword (THE SYSTEM SHALL, WHEN, WHILE, IF, WHERE)`,
      });
    }
    if (seen.has(requirement.name)) {
      problems.push({ line: requirement.line, message: `duplicate requirement name: ${requirement.name}` });
    }
    seen.add(requirement.name);
  }
  return problems;
}

export function validateSpec(markdown) {
  const { sections, requirements } = parseSpec(markdown);
  const problems = [...CORE_SECTIONS, 'Requirements']
    .filter((name) => !sections.includes(name))
    .map((name) => ({ line: 1, message: `missing section: ${name}` }));
  return [...problems, ...requirementProblems(requirements)];
}

const DELTAS = ['Added', 'Modified', 'Removed', 'Renamed'];

function bulletNames(section) {
  return (section?.items ?? [])
    .map((item) => ({ line: item.line, text: item.text.replace(/^[-*]\s+/, '').trim() }))
    .filter((item) => item.text);
}

export function parseChange(markdown) {
  const frontMatter = frontMatterOf(markdown);
  const sections = blocks(markdown);
  const named = (name) => sections.find((section) => section.name === name);
  return {
    area: frontMatter.area ?? null,
    supersedes: frontMatter.supersedes ?? null,
    sections: sections.map((section) => section.name),
    added: named('Added')?.requirements ?? [],
    modified: named('Modified')?.requirements ?? [],
    removed: bulletNames(named('Removed')).map((item) => ({ name: item.text, line: item.line })),
    renamed: bulletNames(named('Renamed')).map((item) => {
      const [from, to] = item.text.split(/\s*(?:→|->)\s*/);
      return { from: (from ?? '').trim(), to: (to ?? '').trim(), line: item.line };
    }),
  };
}

export function validateChange(changeMarkdown, livingMarkdown) {
  const change = parseChange(changeMarkdown);
  const problems = [];
  if (!change.area) problems.push({ line: 1, message: 'front matter has no area' });
  if (!change.sections.includes('Why')) problems.push({ line: 1, message: 'missing section: Why' });
  if (!DELTAS.some((delta) => change.sections.includes(delta))) {
    problems.push({ line: 1, message: 'no delta section (Added, Modified, Removed or Renamed)' });
  }
  problems.push(...requirementProblems([...change.added, ...change.modified]));
  for (const rename of change.renamed) {
    if (!rename.from || !rename.to) {
      problems.push({ line: rename.line, message: 'a rename needs "old name → new name"' });
    }
  }

  if (livingMarkdown === null) {
    const area = change.area ?? '?';
    if (change.modified.length || change.removed.length || change.renamed.length) {
      problems.push({ line: 1, message: `new area "${area}" has no living spec, so it may only use Added` });
    }
    for (const section of CORE_SECTIONS.filter((name) => !change.sections.includes(name))) {
      problems.push({ line: 1, message: `new area "${area}" needs section: ${section}` });
    }
    return problems;
  }

  const existing = new Set(parseSpec(livingMarkdown).requirements.map((r) => r.name));
  for (const requirement of change.added) {
    if (existing.has(requirement.name)) {
      problems.push({ line: requirement.line, message: `Added "${requirement.name}" already exists in the living spec` });
    }
  }
  for (const requirement of change.modified) {
    if (!existing.has(requirement.name)) {
      problems.push({ line: requirement.line, message: `Modified "${requirement.name}" is not in the living spec` });
    }
  }
  for (const requirement of change.removed) {
    if (!existing.has(requirement.name)) {
      problems.push({ line: requirement.line, message: `Removed "${requirement.name}" is not in the living spec` });
    }
  }
  for (const rename of change.renamed) {
    if (rename.from && !existing.has(rename.from)) {
      problems.push({ line: rename.line, message: `Renamed "${rename.from}" is not in the living spec` });
    }
  }
  return problems;
}

export function livingPathFor(changeFile, area) {
  return join(resolve(dirname(changeFile), '..', '..'), `${area}.md`);
}

function print(file, problems) {
  for (const problem of problems) console.log(`${file}:${problem.line}: ${problem.message}`);
  console.log(problems.length ? `${problems.length} problem(s)` : `${file}: ok`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: validate.mjs <specs/area.md | specs/changes/name/change.md>');
    process.exit(2);
  }
  const text = readFileSync(file, 'utf8');
  const area = frontMatterOf(text).area;
  let problems;
  if (area) {
    const living = livingPathFor(file, area);
    problems = validateChange(text, existsSync(living) ? readFileSync(living, 'utf8') : null);
  } else {
    problems = validateSpec(text);
  }
  print(file, problems);
  process.exit(problems.length ? 1 : 0);
}

