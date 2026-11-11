# Spec: Change folders and living specs (mzyx-skills 0.8.0)

## Objective

The spec pipeline (`/brainstorm`, `/spec`, `/plan`, `/build`, `/ship`) writes a spec per feature, then leaves it as a snapshot. When the design moves, the spec is edited in place with no record, plans grow into thousand-line documents nobody ticks off, and nothing checks that what shipped is what the spec said.

This release keeps the pipeline and its commands, and borrows four ideas from OpenSpec without depending on it:

- **Living specs:** `specs/<area>.md` always describes what the system does now.
- **Change folders:** a change is a delta (added, modified, removed, renamed requirements) plus its tasks, kept until it ships.
- **Archive:** after a change ships, its deltas are folded into the living spec by a script, in the same pull request.
- **Validation:** a script checks every spec and change before a human sees it.

It adds what OpenSpec lacks and mzyx already has: named EARS requirements, TDD per task, evidence before a done claim, and parallel review before shipping, now extended with a check that every changed requirement has evidence.

Users: anyone using the mzyx-skills plugin through the `mzyx` marketplace. A Transferz team version for `transferz/dev-tools` is a separate project.

## Commands

```bash
node skills/spec-driven-development/scripts/validate.mjs specs/changes/<name>/change.md
node skills/spec-driven-development/scripts/validate.mjs specs/<area>.md
node skills/spec-driven-development/scripts/archive.mjs specs/changes/<name>
node --test skills/spec-driven-development/scripts/
claude plugin validate .
```

## Project Structure

In a repository that uses the pipeline:

```
specs/
  <area>.md                              living spec
  changes/<name>/change.md                the delta, committed
  changes/<name>/tasks.md                 the checklist, gitignored
  changes/archive/<YYYY-MM-DD>-<name>/change.md
```

In this repository:

```
skills/spec-driven-development/SKILL.md          formats and lifecycle
skills/spec-driven-development/scripts/validate.mjs
skills/spec-driven-development/scripts/archive.mjs
skills/spec-driven-development/scripts/*.test.mjs
skills/writing-plans/SKILL.md                    tasks.md format
skills/executing-plans/SKILL.md                  reads and ticks tasks.md
skills/subagent-driven-development/SKILL.md      reads and ticks tasks.md
.claude/commands/{spec,plan,build,ship}.md
.claude-plugin/plugin.json                       0.8.0
README.md
```

## Requirements

### Living spec location
THE SYSTEM SHALL keep one living spec per area at `specs/<area>.md`, with the six core sections and a `## Requirements` section.

### Named requirement
THE SYSTEM SHALL write every requirement as a `###` heading holding a short unique name, followed by exactly one EARS line starting with `THE SYSTEM SHALL`, `WHEN`, `WHILE`, `IF` or `WHERE`.

### Change folder
WHEN `/spec` starts work THE SYSTEM SHALL create `specs/changes/<name>/change.md` with front matter naming its `area`, a `## Why` section, and one or more of `## Added`, `## Modified`, `## Removed` and `## Renamed`.

### Delta sections
THE SYSTEM SHALL hold named requirements under Added and Modified, requirement names only under Removed, and `old name → new name` lines under Renamed.

### New area
IF a change names an area with no living spec, THEN THE SYSTEM SHALL require the change to carry the six core sections and only an `## Added` delta.

### Clarifications in the change
WHEN `/spec` resolves an open question THE SYSTEM SHALL record the answer in a `## Clarifications` section of `change.md`.

### Validate before approval
WHEN `/spec` is about to ask for approval THE SYSTEM SHALL run `validate.mjs` on the change and SHALL NOT ask until it reports no problems.

### Commit the change
WHEN the user approves a change THE SYSTEM SHALL commit `change.md` and SHALL NOT move or rename it.

### Tasks file
WHEN `/plan` runs THE SYSTEM SHALL write the change's checklist to `specs/changes/<name>/tasks.md` and add `specs/changes/*/tasks.md` to `.gitignore`.

### Task shape
THE SYSTEM SHALL write each task as a checkbox with `Covers` (the requirement names it implements), `Acceptance`, `Verify` (an exact command) and `Files`, and SHALL include code only for a contract, an interface or a function whose shape is the point.

### No other plan files
THE SYSTEM SHALL NOT write `plan.md`, `todo.md`, `tasks/` or `docs/plans/`.

### Reuse the chosen mode
IF the execution mode was already chosen in the conversation, THEN `/build` SHALL use it without asking again.

### Tick on verified
WHEN a task's Verify command passes and its commit lands THE SYSTEM SHALL tick that task's box in `tasks.md`.

### Resume
WHEN `/build` starts on a change with ticked tasks THE SYSTEM SHALL continue at the first unticked task.

### Nothing left
IF `/build` starts on a change whose tasks are all ticked, THEN THE SYSTEM SHALL say so and point to `/ship`.

### Verify against the spec
WHEN `/ship` runs THE SYSTEM SHALL map every Added and Modified requirement of the change to evidence, a test name or a command with its output, and SHALL issue NO-GO for any requirement without evidence.

### Archive after GO
WHEN `/ship` issues GO THE SYSTEM SHALL run `archive.mjs` on the change and commit the result in the same pull request.

### Validator checks
THE SYSTEM SHALL have `validate.mjs` report, with line numbers, missing sections, requirements without a name or an EARS line, duplicate names, Modified, Removed or Renamed names missing from the living spec, and Added names already in it, and exit 1 on any problem.

### Archive applies deltas
WHEN `archive.mjs` runs on a valid change THE SYSTEM SHALL append Added requirements, replace Modified ones by name, delete Removed ones, retitle Renamed ones, write `specs/<area>.md`, and move the folder to `specs/changes/archive/<YYYY-MM-DD>-<name>/`.

### Archive all or nothing
IF the change or the resulting living spec fails validation, THEN `archive.mjs` SHALL write nothing, move nothing, and exit 1 with the problems.

### Stale delta
IF a change modifies, removes or renames a requirement another change already removed or renamed, THEN `archive.mjs` SHALL refuse it and name the stale requirements.

### Old-style spec in the area
WHEN the first change archives into an area and its front matter names an older spec file in `supersedes` THE SYSTEM SHALL create `specs/<area>.md` and mark the older file superseded in its first line.

### Release
WHEN the work merges THE SYSTEM SHALL ship as version 0.8.0 in `.claude-plugin/plugin.json`, on `main` of `Nikitzu/mzyx-skills`, tagged `v0.8.0`.

## Code Style

Node with no dependencies, ES modules, pure functions over strings, IO only in the entry point:

```js
export function requirementsOf(markdown) {
  const out = [];
  const lines = markdown.split('\n');
  lines.forEach((line, i) => {
    const name = /^### (.+)$/.exec(line)?.[1]?.trim();
    if (name) out.push({ name, line: i + 1, text: (lines[i + 1] ?? '').trim() });
  });
  return out;
}
```

Skill text stays in the existing voice: plain English, imperative, short sections. No em or en dashes in new text.

## Testing Strategy

- `node --test` next to the scripts: each validator rule passing and failing, each delta kind, a refused stale archive, all-or-nothing on a failing result, a new area, an old-style spec marked superseded.
- `claude plugin validate .` passes.
- Dogfood: this spec, rewritten as the first `change.md` once the validator exists, validates clean, and its archive creates `specs/pipeline.md`.
- After release: on this machine, update the marketplace and plugin, and confirm `/mzyx-skills:spec` shows the 0.8.0 text.

## Boundaries

- Always: keep the five command names and their order; run the tests and the plugin validator before each commit; keep the old `SPEC.md` habit working for a spec started before 0.8.0 until it ships.
- Ask first: changing any skill outside the list in Project Structure; renaming a command; adding a dependency.
- Never: depend on OpenSpec; let the model edit a living spec by hand where `archive.mjs` should; push to `main` without the user's go.

## Success Criteria

- Every requirement above has a test or a documented manual check.
- The next feature built with the pipeline produces a validated `change.md`, a ticked `tasks.md`, a verify table at `/ship`, and an archived living spec, with no hand edits to `specs/<area>.md`.
- 0.8.0 installs on this machine through the `mzyx` marketplace.

## Open Questions

- The repository carries `v5.x` tags from its upstream while `plugin.json` is at 0.7.2. This spec tags `v0.8.0`; say if the tags should follow another scheme.
