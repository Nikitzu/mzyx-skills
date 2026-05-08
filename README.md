# mzyx-skills

A curated, trimmed mix of two upstream Claude Code skill libraries —
[`superpowers`](https://github.com/obra/superpowers) and
[`agent-skills`](https://github.com/addyosmani/agent-skills) — assembled into
one plugin tuned for daily engineering use.

## Why

Both upstreams are excellent, but installing both side by side produces heavy
duplication (review/plan/test all appear in both, plus alias commands and
deprecated shims). This repo cherry-picks one canonical skill per concern and
drops everything covered by personal rules files.

Two-layer model:

- **Process layer (superpowers).** How work flows. Brainstorm → plan →
  execute → verify → review → finish. Lifecycle scaffolding.
- **Domain layer (agent-skills).** How to do the work in each phase. TDD,
  debugging, simplification, performance, shipping. Content checklists.

## Slash command flow

The pipeline. Each command invokes one or more skills. Commands ship in `.claude/commands/`; specialist agents in `agents/`.

```
/brainstorm  →  /spec  →  /plan  →  /build  →  /review  →  /ship  →  /wrap
   (sp)         (as+sp)   (sp)     (asks!)    (as+sp)    (3 agents+as+sp)  (sp)
```

| Command | Skills / agents invoked | Source |
| --- | --- | --- |
| `/brainstorm` | `mzyx-skills:brainstorming` | sp |
| `/spec` | `mzyx-skills:brainstorming` (if fuzzy) → `mzyx-skills:spec-driven-development` | sp + as |
| `/plan` | `mzyx-skills:writing-plans` | sp |
| `/build` | **Asks the user which mode first**: parallel teammates / separate session / inline solo. Each mode pairs `mzyx-skills:test-driven-development` + `mzyx-skills:verification-before-completion` per task; mode-specific skills layered on top (e.g. `using-teams` + `dispatching-parallel-agents` for the parallel mode). | sp + as |
| `/test` | `mzyx-skills:test-driven-development` (+ `mzyx-skills:browser-testing-with-devtools` if relevant) | as |
| `/code-simplify` | `mzyx-skills:code-simplification` | as |
| `/review` | `mzyx-skills:code-review-and-quality` → `mzyx-skills:requesting-code-review` | as + sp |
| `/ship` | Parallel fan-out: `code-reviewer` + `security-auditor` + `test-engineer` agents → `mzyx-skills:shipping-and-launch` → `mzyx-skills:verification-before-completion` → GO / NO-GO + rollback | 3 agents + as + sp |
| `/wrap` | `mzyx-skills:finishing-a-development-branch` | sp |

(`sp` = superpowers source, `as` = agent-skills source.)

Skills also auto-trigger on natural language as in the original repos — e.g. saying "fix this bug" still fires `debugging-and-error-recovery`. Commands are explicit verbs for the structured pipeline, not the only entry point.

## Lifecycle map

| Stage                          | Skill                                       | Source        |
| ------------------------------ | ------------------------------------------- | ------------- |
| Session start                  | `using-skills`                              | superpowers   |
| Explore intent                 | `brainstorming`                             | superpowers   |
| Spec (multi-file, ambiguous)   | `spec-driven-development`                   | agent-skills  |
| Plan (clear-enough)            | `writing-plans`                             | superpowers   |
| Pre-code research              | `source-driven-development`                 | agent-skills  |
| Implement (this session)       | `subagent-driven-development`               | superpowers   |
| Implement (separate session)   | `executing-plans`                           | superpowers   |
| Implement (parallel work)      | `dispatching-parallel-agents`               | superpowers   |
| Write code (logic / bug / change) | `test-driven-development`                | agent-skills  |
| Hit a bug / unexpected error   | `debugging-and-error-recovery`              | agent-skills  |
| UI / frontend                  | `frontend-ui-engineering`                   | agent-skills  |
| Browser verification           | `browser-testing-with-devtools`             | agent-skills  |
| Refactor / clean up            | `code-simplification`                       | agent-skills  |
| Pre-claim done                 | `verification-before-completion`            | superpowers   |
| Self-review                    | `code-review-and-quality`                   | agent-skills  |
| Request review                 | `requesting-code-review`                    | superpowers   |
| Receive feedback               | `receiving-code-review`                     | superpowers   |
| Perf concern                   | `performance-optimization`                  | agent-skills  |
| Pre-merge / pre-launch         | `shipping-and-launch`                       | agent-skills  |
| Wrap branch                    | `finishing-a-development-branch`            | superpowers   |
| Record decision                | `documentation-and-adrs`                    | agent-skills  |
| Removing old code              | `deprecation-and-migration`                 | agent-skills  |
| CI / pipeline work             | `ci-cd-and-automation`                      | agent-skills  |
| Tune agent context             | `context-engineering`                       | agent-skills  |
| Write / edit a skill           | `writing-skills`                            | superpowers   |

## Install

### Recommended — install as a plugin

This is the right install path. All skill cross-references in this repo use the `mzyx-skills:` prefix, which only resolves correctly when the plugin is loaded by name.

```bash
/plugin marketplace add github.com/Nikitzu/mzyx-skills
/plugin install mzyx-skills@mzyx-skills
```

After install, skills appear as `mzyx-skills:brainstorming`, `mzyx-skills:test-driven-development`, etc. in the listing, and the seven commands (`/brainstorm`, `/spec`, `/plan`, `/build`, `/test`, `/code-simplify`, `/review`, `/ship`, `/wrap`) become available.

### Alternative — symlink into `~/.claude/skills/`

Skills only, no commands. Bare names (no `mzyx-skills:` prefix) — cross-references inside skills will fail to resolve unless the prefix matches your install path, so prefer the plugin install above.

```bash
git clone https://github.com/Nikitzu/mzyx-skills.git ~/Code/mzyx-skills
ln -s ~/Code/mzyx-skills/skills/* ~/.claude/skills/
```

## Updating from upstream

This repo is a curated fork. To pull selective updates from upstream:

```bash
git remote add upstream-superpowers https://github.com/obra/superpowers.git
git remote add upstream-agent-skills https://github.com/addyosmani/agent-skills.git

git fetch upstream-superpowers
git fetch upstream-agent-skills

# See what changed in skills you actually use
git log --oneline HEAD..upstream-superpowers/main -- skills/
git log --oneline HEAD..upstream-agent-skills/main -- skills/

# Cherry-pick selectively (one file at a time keeps drift minimal)
git checkout upstream-superpowers/main -- skills/brainstorming/SKILL.md
git checkout upstream-agent-skills/main -- skills/test-driven-development/SKILL.md
```

Cherry-pick over merge. A merge would drag in the skills and behaviours
explicitly removed here.

## Excluded — and why

See `NOTICE` for the full exclusion list.

## License

MIT — see `LICENSE`. All upstream attributions preserved.
