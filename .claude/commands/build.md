---
description: Execute tasks from the plan — always asks the user which execution mode to use first.
---

**Step 1 — ALWAYS ask the user which execution mode to use.** Do not pick a default. Use `AskUserQuestion` with these three options:

| Option | When to pick | Skills invoked |
| --- | --- | --- |
| **(a) Parallel teammates** | Multiple independent tasks; want concurrent work; this session has the `using-teams` skill and `TeamCreate` available | `mzyx-skills:using-teams` (if available, else `mzyx-skills:dispatching-parallel-agents`) → spawn teammates with `TeamCreate` → each teammate runs `mzyx-skills:subagent-driven-development` and `mzyx-skills:test-driven-development` per task → `mzyx-skills:verification-before-completion` before each task is marked done |
| **(b) Separate session (review checkpoints)** | Long horizon work; want explicit human checkpoints between phases; not running multiple agents in parallel | `mzyx-skills:executing-plans` → `mzyx-skills:test-driven-development` per task → `mzyx-skills:verification-before-completion` before each task is marked done |
| **(c) Inline solo (this session, sequential)** | Short, well-scoped change; no parallelism needed | `mzyx-skills:test-driven-development` per task → `mzyx-skills:verification-before-completion` before each task is marked done |

**Step 2 — Execute the chosen mode.** For every mode, the per-task discipline is the same:

1. Read the task's acceptance criteria from the plan
2. Load relevant context (existing code, patterns, types)
3. Write a failing test for the expected behavior (RED)
4. Implement the minimum code to pass the test (GREEN)
5. Run the full test suite to check for regressions
6. Run the build to verify compilation
7. **Gate**: invoke `mzyx-skills:verification-before-completion` — do not claim a task done without evidence
8. Commit with a descriptive message
9. Mark the task complete and move to the next one

If any step fails, follow `mzyx-skills:debugging-and-error-recovery`.

**Mode (a) specifics — parallel teammates:**

- Before spawning anything, invoke `mzyx-skills:using-teams` for the team_name + name discipline, idle≠silence rule, and TaskList-as-handoff rule.
- If `TeamCreate` is unavailable, fall back to `mzyx-skills:dispatching-parallel-agents` with the standard `Agent` tool — and warn the user that you've degraded from team mode.
- Tasks must be genuinely independent. If they share state or have ordering, choose mode (b) or (c) instead.

Next step in the flow: `/review`.
