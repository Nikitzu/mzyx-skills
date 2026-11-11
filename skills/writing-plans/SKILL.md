---
name: writing-plans
description: "Breaks a spec or requirements into an ordered, verifiable task plan with acceptance criteria before touching code. Use for a clear-enough multi-step change that needs sequencing. Not for ambiguous features needing a spec first (use spec-driven-development) or open-ended ideation (use brainstorming)."
---

# Writing Plans

## Overview

Write a plan an engineer with zero context for the codebase can follow: which files each task touches, which requirement it implements, how to prove it is done. Keep it short enough to read in one sitting. Show code only where its shape is the point. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Context:** Run it in the repository's normal checkout.

**Save the plan to:** `specs/changes/<name>/tasks.md`, next to the change it implements. Add `specs/changes/*/tasks.md` to `.gitignore` if it is not there. Write no other plan file: no `plan.md`, `todo.md`, `tasks/` or `docs/plans/`. A spec started before 0.8.0 as a root `SPEC.md` has no change folder; put its plan in `tasks/plan.md` and gitignore `tasks/`.

## Scope Check

If the spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. If it wasn't, suggest breaking this into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

## File Structure

Before defining tasks, map out which files will be created or modified and what each one is responsible for. This is where decomposition decisions get locked in.

- Design units with clear boundaries and well-defined interfaces. Each file should have one clear responsibility.
- You reason best about code you can hold in context at once, and your edits are more reliable when files are focused. Prefer smaller, focused files over large ones that do too much.
- Files that change together should live together. Split by responsibility, not by technical layer.
- In existing codebases, follow established patterns. If the codebase uses large files, don't unilaterally restructure - but if a file you're modifying has grown unwieldy, including a split in the plan is reasonable.

This structure informs the task decomposition. Each task should produce self-contained changes that make sense independently.

## Vertical Slices, and the One Exception

Each task is a **tracer bullet**: a narrow but complete path through every layer it touches (schema, API, UI, tests), demoable or verifiable on its own, and sized to fit one fresh context window. Not a horizontal slice of one layer. Any prefactoring goes first: make the change easy, then make the easy change.

**Wide refactors are the exception.** A wide refactor is one mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Don't force it into a tracer bullet. Sequence it as **expand, migrate, contract**:

1. **Expand.** Add the new form beside the old one so nothing breaks.
2. **Migrate.** Move call sites over in batches sized by blast radius (per package, per directory), each batch its own task blocked by the expand. CI stays green batch to batch because the old form still exists.
3. **Contract.** Delete the old form once no caller remains, in a task blocked by every migrate batch.

When even the batches cannot stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify task. Green is promised only there, and the plan should say so explicitly.

## Task Granularity

Each task is one vertical slice that a fresh session can finish, test and commit on its own. `/build` runs TDD and verification inside every task, so the plan does not spell out red, green and commit steps.

## Plan Header

Start `tasks.md` with:

```markdown
# [Change name]: tasks

Change: `specs/changes/<name>/change.md`. [One line on the approach.]

## Contracts
[Only if tasks share an interface: the function signatures, types or file formats every task must agree on.]
```

## Task Shape

```markdown
- [ ] **3. Refuse stale names on archive**
  - Covers: Stale delta
  - Acceptance: a change that modifies a name another change removed is refused, the name is reported, and no file changes.
  - Verify: `node --test scripts/`
  - Files: `scripts/archive.mjs`, `scripts/archive.test.mjs`
```

- **Covers** lists the change's requirement names this task implements. Every Added and Modified requirement in the change appears in at least one task; `/ship` checks the evidence against these names.
- **Acceptance** is what is observably true when the task is done.
- **Verify** is the exact command whose output proves it.
- **Files** are the paths the task creates or changes.

Add code only for a contract, an interface, or a function whose shape is the point. Everything else is left to the build, which runs TDD per task.

Put a **Checkpoint** line between phases: what must pass before the next phase starts.

## No Placeholders

Every task must be concrete enough to start without asking. These are **plan failures**; never write them:
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases" without saying which
- A Verify line that is not a runnable command or a specific manual check
- "Similar to Task N" (the engineer may read tasks out of order)
- References to types, functions or files no task or contract defines

## Remember
- Exact file paths always
- Every task names the requirements it covers
- Exact Verify commands
- DRY, YAGNI, TDD, frequent commits

## Self-Review

After writing the complete plan, look at the spec with fresh eyes and check the plan against it. This is a checklist you run yourself — not a subagent dispatch.

**1. Spec coverage:** Every Added and Modified requirement name in the change appears in some task's Covers. List any that do not.

**2. Placeholder scan:** Search your plan for red flags — any of the patterns from the "No Placeholders" section above. Fix them.

**3. Type consistency:** Do the types, method signatures, and property names you used in later tasks match what you defined in earlier tasks? A function called `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7 is a bug.

If you find issues, fix them inline. No need to re-review — just fix and move on. If you find a spec requirement with no task, add the task.

## Execution Handoff

After saving the plan, offer execution choice:

**"Plan complete and saved to `specs/changes/<name>/tasks.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?"**

**If Subagent-Driven chosen:**
- **REQUIRED SUB-SKILL:** Use mzyx-skills:subagent-driven-development
- Fresh subagent per task + two-stage review

**If Inline Execution chosen:**
- **REQUIRED SUB-SKILL:** Use mzyx-skills:executing-plans
- Batch execution with checkpoints for review
