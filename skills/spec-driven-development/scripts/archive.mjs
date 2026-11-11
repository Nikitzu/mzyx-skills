#!/usr/bin/env node
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
