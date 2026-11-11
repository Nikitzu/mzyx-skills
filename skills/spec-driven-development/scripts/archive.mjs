#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORE_SECTIONS, parseChange, parseSpec, validateChange, validateSpec } from './validate.mjs';

function sectionRange(lines, name) {
  let fenced = false;
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith('```')) fenced = !fenced;
    if (fenced) continue;
    if (start < 0 && lines[i] === `## ${name}`) {
      start = i;
      continue;
    }
    if (start >= 0 && /^## /.test(lines[i])) return [start, i];
  }
  return start < 0 ? null : [start, lines.length];
}

function sectionText(markdown, name) {
  const lines = markdown.split('\n');
  const range = sectionRange(lines, name);
  return range ? lines.slice(range[0], range[1]).join('\n').trimEnd() : null;
}

function render(requirement) {
  return `### ${requirement.name}\n${requirement.body}`;
}

function requirementsSection(intro, requirements) {
  const parts = ['## Requirements', ''];
  if (intro.trim()) parts.push(intro.trim(), '');
  parts.push(requirements.map(render).join('\n\n'));
  return `${parts.join('\n').trimEnd()}\n`;
}

function newAreaSpec(change, changeMarkdown) {
  const sections = CORE_SECTIONS.map((name) => sectionText(changeMarkdown, name)).filter(Boolean);
  return [`# Spec: ${change.area}`, '', ...sections.flatMap((s) => [s, '']), requirementsSection('', change.added)].join('\n');
}

function updatedSpec(livingMarkdown, change) {
  const lines = livingMarkdown.split('\n');
  const range = sectionRange(lines, 'Requirements');
  const body = lines.slice(range[0] + 1, range[1]);
  const firstRequirement = body.findIndex((line) => /^### /.test(line));
  const intro = (firstRequirement < 0 ? body : body.slice(0, firstRequirement)).join('\n');

  const removed = new Set(change.removed.map((r) => r.name));
  const modified = new Map(change.modified.map((r) => [r.name, r]));
  const renamed = new Map(change.renamed.map((r) => [r.from, r.to]));
  const requirements = parseSpec(livingMarkdown)
    .requirements.filter((r) => !removed.has(r.name))
    .map((r) => modified.get(r.name) ?? r)
    .map((r) => (renamed.has(r.name) ? { ...r, name: renamed.get(r.name) } : r));
  requirements.push(...change.added);

  return [
    ...lines.slice(0, range[0]),
    requirementsSection(intro, requirements).trimEnd(),
    ...(range[1] < lines.length ? ['', ...lines.slice(range[1])] : ['']),
  ].join('\n');
}

export function applyChange(livingMarkdown, changeMarkdown) {
  const problems = validateChange(changeMarkdown, livingMarkdown);
  if (problems.length) return { problems };
  const change = parseChange(changeMarkdown);
  const living =
    livingMarkdown === null ? newAreaSpec(change, changeMarkdown) : updatedSpec(livingMarkdown, change);
  const after = validateSpec(living);
  return after.length ? { problems: after } : { living };
}

function fail(problems, file) {
  for (const problem of problems) console.log(`${file}:${problem.line}: ${problem.message}`);
  console.log(`${problems.length} problem(s); nothing was changed`);
  process.exit(1);
}

function main(argv) {
  const folder = argv[0];
  const dateFlag = argv.indexOf('--date');
  const date = dateFlag >= 0 ? argv[dateFlag + 1] : new Date().toISOString().slice(0, 10);
  if (!folder) {
    console.error('usage: archive.mjs <specs/changes/name> [--date YYYY-MM-DD]');
    process.exit(2);
  }
  const changeFile = join(folder, 'change.md');
  const changeMarkdown = readFileSync(changeFile, 'utf8');
  const change = parseChange(changeMarkdown);
  const specsDir = resolve(folder, '..', '..');
  const livingFile = join(specsDir, `${change.area}.md`);
  const livingBefore = existsSync(livingFile) ? readFileSync(livingFile, 'utf8') : null;

  const result = applyChange(livingBefore, changeMarkdown);
  if (result.problems) fail(result.problems, changeFile);

  const supersededFile = change.supersedes ? resolve(specsDir, '..', change.supersedes) : null;
  if (supersededFile && !existsSync(supersededFile)) {
    fail([{ line: 1, message: `supersedes ${change.supersedes}, which does not exist` }], changeFile);
  }
  const archived = join(specsDir, 'changes', 'archive', `${date}-${basename(resolve(folder))}`);
  if (existsSync(archived)) fail([{ line: 1, message: `${archived} already exists` }], changeFile);

  mkdirSync(dirname(archived), { recursive: true });
  renameSync(folder, archived);
  try {
    writeFileSync(livingFile, result.living);
    if (supersededFile) {
      const old = readFileSync(supersededFile, 'utf8');
      const mark = `> Superseded by \`specs/${change.area}.md\` on ${date}. Kept as history.`;
      if (!old.startsWith('> Superseded by')) writeFileSync(supersededFile, `${mark}\n\n${old}`);
    }
  } catch (error) {
    if (livingBefore === null) {
      if (existsSync(livingFile)) unlinkSync(livingFile);
    } else {
      writeFileSync(livingFile, livingBefore);
    }
    renameSync(archived, folder);
    throw error;
  }
  console.log(`archived ${basename(resolve(folder))} into specs/${change.area}.md and ${archived}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
