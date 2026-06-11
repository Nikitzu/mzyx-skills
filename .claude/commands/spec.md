---
description: Start spec-driven development — write a structured specification before writing code
---

If the request is fuzzy or under-specified, run `/brainstorm` first to surface intent and constraints, then return here.

Invoke the `spec-driven-development` skill.

Begin by understanding what the user wants to build. Ask clarifying questions about:
1. The objective and target users
2. Core features and acceptance criteria
3. Tech stack preferences and constraints
4. Known boundaries (what to always do, ask first about, and never do)

Then generate a structured spec covering all six core areas: objective, commands, project structure, code style, testing strategy, and boundaries.

**Spec lifecycle:**
- While in progress, the active spec lives as `SPEC.md` in the project root. There is exactly one active `SPEC.md` at a time. Save it there and confirm with the user before proceeding.
- Once the spec is finalized (human-approved, ready to implement), move `SPEC.md` into the `specs/` folder and rename it to a descriptive slug based on its contents (for example, `specs/password-reset-flow.md`). Create `specs/` if it does not exist. The root is then free for the next active spec.

`specs/` is version-controlled. Plans and tasks (the `tasks/` artifacts from `/plan`) stay out of git. Add `tasks/` to `.gitignore`.

Next step in the flow: `/plan`.
