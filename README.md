# mzyx-skills

A curated, trimmed mix of four upstream Claude Code skill libraries:
[`superpowers`](https://github.com/obra/superpowers),
[`agent-skills`](https://github.com/addyosmani/agent-skills),
[`waza`](https://github.com/tw93/waza), and
[`mattpocock/skills`](https://github.com/mattpocock/skills), assembled into one
plugin tuned for daily engineering use.

## Why

Both upstreams are excellent, but installing both side by side produces heavy
duplication (review/plan/test all appear in both, plus alias commands and
deprecated shims). This repo cherry-picks one canonical skill per concern and
drops everything covered by personal rules files.

Four-layer model:

- **Process layer (superpowers).** How work flows. Brainstorm → plan →
  execute → verify → review → finish. Lifecycle scaffolding.
- **Domain layer (agent-skills).** How to do the work in each phase. TDD,
  debugging, simplification, performance, shipping. Content checklists.
- **Discipline layer (waza).** Sharper opinions on think/design/check/hunt
  plus standalone utilities for research (`/learn`), URL fetch (`/read`),
  prose polish (`/write`), and config audit (`/health`). Eight skills, each
  a single habit with a clear trigger.
- **Design layer (mattpocock/skills).** Vocabulary and primitives for thinking
  before building: `grilling` (one-question-at-a-time interview),
  `codebase-design` (deep modules, seams, leverage), `prototype` (throwaway
  code that answers one question), and `wayfinder` (charting work too big for
  one session). Their sharpest ideas are also grafted into existing skills:
  loop-before-hypothesis in `hunt`, the Fowler smell baseline and a separate
  spec axis in `code-review-and-quality`, expand-migrate-contract in
  `writing-plans`, the triage state machine in `check`, and skill design
  theory in `writing-skills`.

## Slash command flow

The pipeline. Each command invokes one or more skills. Commands ship in `.claude/commands/`; specialist agents in `agents/`.

```
/brainstorm  →  /spec  →  /plan  →  /build  →  /ship
   (sp)         (as+sp)   (sp)     (asks!)    (3 agents+sp)
```

| Command | Skills / agents invoked | Source |
| --- | --- | --- |
| `/brainstorm` | `mzyx-skills:brainstorming` | sp |
| `/spec` | `mzyx-skills:brainstorming` (if fuzzy) → `mzyx-skills:spec-driven-development` | sp + as |
| `/plan` | `mzyx-skills:writing-plans` | sp |
| `/build` | **Asks the user which mode first**: parallel teammates / separate session / inline solo. Each mode pairs `mzyx-skills:test-driven-development` + `mzyx-skills:verification-before-completion` per task; the parallel mode layers `mzyx-skills:using-teams` on top. | sp + as |
| `/ship` | Parallel fan-out: `code-reviewer` + `security-auditor` + `test-engineer` agents → `mzyx-skills:verification-before-completion` → GO / NO-GO + rollback | 3 agents + sp |

Review, TDD, and simplification flow through skill auto-trigger on natural language ("review my changes", "write a failing test", "simplify this") — no wrapper commands needed.

(`sp` = superpowers, `as` = agent-skills.)

**Discipline-layer skills (waza)** ship without command stubs — invoke directly via the namespaced skill name or rely on auto-trigger:

| Skill | When |
| --- | --- |
| `mzyx-skills:think` | rough idea → decision-complete plan before code |
| `mzyx-skills:design` | UI direction-lock + screenshot iteration |
| `mzyx-skills:check` | solo diff review + verification (lighter than `/ship`) |
| `mzyx-skills:hunt` | hypothesis-first root-cause debugging |
| `mzyx-skills:learn` | six-phase research → publish workflow |
| `mzyx-skills:read` | fetch URL/PDF as clean Markdown |
| `mzyx-skills:write` | strip AI-pattern prose |
| `mzyx-skills:health` | Claude Code config-stack audit |

Skills also auto-trigger on natural language as in the original repos — e.g. saying "fix this bug" still fires `hunt`. Commands are explicit verbs for the structured pipeline, not the only entry point.

## Lifecycle map

| Stage                          | Skill                                       | Source        |
| ------------------------------ | ------------------------------------------- | ------------- |
| Session start                  | `using-skills`                              | superpowers   |
| Explore intent                 | `brainstorming`                             | superpowers   |
| Spec (multi-file, ambiguous)   | `spec-driven-development`                   | agent-skills  |
| Plan (clear-enough)            | `writing-plans`                             | superpowers   |
| Implement (this session)       | `subagent-driven-development`               | superpowers   |
| Implement (separate session)   | `executing-plans`                           | superpowers   |
| Write code (logic / bug / change) | `test-driven-development`                | agent-skills  |
| Hit a bug / unexpected error   | `hunt`                                      | waza          |
| UI / frontend                  | `frontend-ui-engineering`                   | agent-skills  |
| Refactor / clean up            | `code-simplification`                       | agent-skills  |
| Pre-claim done                 | `verification-before-completion`            | superpowers   |
| Self-review                    | `code-review-and-quality`                   | agent-skills  |
| Perf concern                   | `performance-optimization`                  | agent-skills  |
| Record decision                | `documentation-and-adrs`                    | agent-skills  |
| Write / edit a skill           | `writing-skills`                            | superpowers   |
| Plan / pressure-test design    | `think`                                     | waza          |
| UI direction lock              | `design`                                    | waza          |
| Solo review + verify           | `check`                                     | waza          |
| Hypothesis-first debug         | `hunt`                                      | waza          |
| Polish prose                   | `write`                                     | waza          |
| Multi-source research          | `learn`                                     | waza          |
| Fetch URL / PDF                | `read`                                      | waza          |
| Audit Claude Code config       | `health`                                    | waza          |
| Stress-test a decision         | `grilling`                                  | pocock        |
| Shape a module / place a seam  | `codebase-design`                           | pocock        |
| Answer a design question fast  | `prototype`                                 | pocock        |
| Chart work bigger than one session | `wayfinder`                             | pocock        |

## Install

### Recommended — install as a plugin

This is the right install path. All skill cross-references in this repo use the `mzyx-skills:` prefix, which only resolves correctly when the plugin is loaded by name.

```bash
/plugin marketplace add github.com/Nikitzu/mzyx-skills
/plugin install mzyx-skills@mzyx-skills
```

After install, skills appear as `mzyx-skills:brainstorming`, `mzyx-skills:test-driven-development`, etc. in the listing, and these slash commands become available:

- Pipeline commands (sp/as): `/brainstorm` `/spec` `/plan` `/build` `/ship`
- Discipline skills (wz): `mzyx-skills:think` · `design` · `check` · `hunt` · `write` · `learn` · `read` · `health` (no command stubs — invoke namespaced or rely on auto-trigger)

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
git remote add upstream-waza https://github.com/tw93/waza.git

git fetch upstream-superpowers
git fetch upstream-agent-skills
git fetch upstream-waza

# See what changed in skills you actually use
git log --oneline HEAD..upstream-superpowers/main -- skills/
git log --oneline HEAD..upstream-agent-skills/main -- skills/
git log --oneline HEAD..upstream-waza/main -- skills/

# Cherry-pick selectively (one file at a time keeps drift minimal)
git checkout upstream-superpowers/main -- skills/brainstorming/SKILL.md
git checkout upstream-agent-skills/main -- skills/test-driven-development/SKILL.md
```

Cherry-pick over merge. A merge would drag in the skills and behaviours
explicitly removed here.

**Waza re-strip on update.** After cherry-picking from `upstream-waza`, re-run the strip pass to remove the 🥷 emoji preamble and Chinese trigger phrases before committing — the original waza skills carry both, and they have no purpose in this fork.

## Excluded — and why

See `NOTICE` for the full exclusion list.

## License

MIT — see `LICENSE`. All upstream attributions preserved.
