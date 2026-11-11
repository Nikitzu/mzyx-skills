#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
  const problems = validateSpec(readFileSync(file, 'utf8'));
  print(file, problems);
  process.exit(problems.length ? 1 : 0);
}

