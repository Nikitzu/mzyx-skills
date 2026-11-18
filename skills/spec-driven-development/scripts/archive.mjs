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
    .map((r) => {
      const name = renamed.get(r.name) ?? r.name;
      const changed = modified.get(name) ?? modified.get(r.name);
      return changed ? { ...changed, name } : { ...r, name };
    });
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
  const target = argv[0];
  const dateFlag = argv.indexOf('--date');
  const date = dateFlag >= 0 ? argv[dateFlag + 1] : new Date().toISOString().slice(0, 10);
  if (!target) {
    console.error('usage: archive.mjs <specs/changes/name.md> [--date YYYY-MM-DD]');
    process.exit(2);
  }
  const single = target.endsWith('.md');
  const changeFile = single ? target : join(target, 'change.md');
  const name = single ? basename(target, '.md') : basename(resolve(target));
  const changesDir = dirname(resolve(target));
  const changeMarkdown = readFileSync(changeFile, 'utf8');
  const change = parseChange(changeMarkdown);
  const specsDir = resolve(changesDir, '..');
  const livingFile = join(specsDir, `${change.area}.md`);
  const livingBefore = existsSync(livingFile) ? readFileSync(livingFile, 'utf8') : null;

  const result = applyChange(livingBefore, changeMarkdown);
  if (result.problems) fail(result.problems, changeFile);

  const supersededFile = change.supersedes ? resolve(specsDir, '..', change.supersedes) : null;
  if (supersededFile && !existsSync(supersededFile)) {
    fail([{ line: 1, message: `supersedes ${change.supersedes}, which does not exist` }], changeFile);
  }
  const archiveDir = join(changesDir, 'archive');
  const tasksFile = join(changesDir, `${name}.tasks.md`);
  const moves = single
    ? [[resolve(target), join(archiveDir, `${date}-${name}.md`)]]
    : [[resolve(target), join(archiveDir, `${date}-${name}`)]];
  if (single && existsSync(tasksFile)) moves.push([tasksFile, join(archiveDir, `${date}-${name}.tasks.md`)]);
  for (const [, to] of moves) {
    if (existsSync(to)) fail([{ line: 1, message: `${to} already exists` }], changeFile);
  }

  mkdirSync(archiveDir, { recursive: true });
  for (const [from, to] of moves) renameSync(from, to);
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
    for (const [from, to] of moves) renameSync(to, from);
    throw error;
  }
  console.log(`archived ${name} into specs/${change.area}.md and ${moves[0][1]}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
