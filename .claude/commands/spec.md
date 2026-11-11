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

**Where it goes:**
- Find the area this work belongs to. If `specs/<area>.md` exists, write a change against it; if not, the change starts a new area and carries the six core sections.
- Write the change to `specs/changes/<name>/change.md`: front matter `area`, then `## Why`, then only the delta sections it needs (`## Added`, `## Modified`, `## Removed`, `## Renamed`). Every requirement is a `###` name followed by one EARS line.
- Record each clarification in its `## Clarifications` section.
- Before asking for approval, run `node <skill dir>/scripts/validate.mjs specs/changes/<name>/change.md` and fix everything it reports. Do not ask while it reports a problem.
- On approval, commit `change.md` where it is. Do not move or rename it.

Next step in the flow: `/plan`.
