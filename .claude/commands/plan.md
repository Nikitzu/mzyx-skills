---
description: Break work into small verifiable tasks with acceptance criteria and dependency ordering
---

Invoke the `mzyx-skills:writing-plans` skill.

Read the open change (`specs/changes/<name>/change.md`), its area's living spec (`specs/<area>.md`), and the relevant codebase sections. Then:

1. Enter plan mode — read only, no code changes
2. Identify the dependency graph between components
3. Slice work vertically (one complete path per task, not horizontal layers)
4. Write tasks with the requirements they cover, acceptance criteria and verification commands
5. Add checkpoints between phases
6. Present the plan for human review

Save the plan to `specs/changes/<name>/tasks.md` as checkbox tasks with Covers, Acceptance, Verify and Files, and make sure `specs/changes/*/tasks.md` is in `.gitignore`. Write no `plan.md`, `todo.md`, `tasks/` or `docs/plans/`.

Next step in the flow: `/build`.
