---
name: spec-driven-development
description: "Spec-first feature development: write a structured specification (goals, scope, acceptance criteria, edge cases) before any code. Use for multi-file or ambiguous features where the what must be pinned down before the how. Not for clear small changes (use writing-plans) or idea exploration (use brainstorming)."
---

# Spec-Driven Development

## Overview

Write a structured specification before writing any code. The spec is the shared source of truth between you and the human engineer — it defines what we're building, why, and how we'll know it's done. Code without a spec is guessing.

## When to Use

- Starting a new project or feature
- Requirements are ambiguous or incomplete
- The change touches multiple files or modules
- You're about to make an architectural decision
- The task would take more than 30 minutes to implement

**When NOT to use:** Single-line fixes, typo corrections, or changes where requirements are unambiguous and self-contained.

## The Gated Workflow

Spec-driven development has five phases. Do not advance to the next phase until the current one is validated.

```
SPECIFY ──→ CLARIFY ──→ PLAN ──→ TASKS ──→ IMPLEMENT
   │           │          │        │          │
   ▼           ▼          ▼        ▼          ▼
 Human       Human      Human    Human      Human
 reviews     answers    reviews  reviews    reviews
```

### Phase 1: Specify

Start with a high-level vision. Ask the human clarifying questions until requirements are concrete.

**Surface assumptions immediately.** Before writing any spec content, list what you're assuming:

```
ASSUMPTIONS I'M MAKING:
1. This is a web application (not native mobile)
2. Authentication uses session-based cookies (not JWT)
3. The database is PostgreSQL (based on existing Prisma schema)
4. We're targeting modern browsers only (no IE11)
→ Correct me now or I'll proceed with these.
```

Don't silently fill in ambiguous requirements. The spec's entire purpose is to surface misunderstandings *before* code gets written — assumptions are the most dangerous form of misunderstanding.

**Write functional requirements in EARS notation.** Prose requirements hide ambiguity; EARS (Easy Approach to Requirements Syntax) forces each requirement into a testable trigger-response shape. Every functional requirement should map to one of these patterns:

```
Ubiquitous:    THE SYSTEM SHALL [expected behavior]
Event-driven:  WHEN [trigger] THE SYSTEM SHALL [expected behavior]
State-driven:  WHILE [in a state] THE SYSTEM SHALL [expected behavior]
Conditional:   IF [condition], THEN THE SYSTEM SHALL [expected behavior]
Optional:      WHERE [feature is included] THE SYSTEM SHALL [expected behavior]
```

Example — vague "users can reset their password" becomes:

```
WHEN a user submits a valid email on the reset form THE SYSTEM SHALL send a reset link valid for 1 hour.
IF the email is not registered, THEN THE SYSTEM SHALL show the same confirmation message (no account enumeration).
WHILE a reset link is expired THE SYSTEM SHALL reject it and prompt to request a new one.
```

Each EARS line is one acceptance test. If a requirement can't be written this way, it's not yet concrete enough to build.

**Write a spec document covering these six core areas:**

1. **Objective** — What are we building and why? Who is the user? What does success look like?

2. **Commands** — Full executable commands with flags, not just tool names.
   ```
   Build: npm run build
   Test: npm test -- --coverage
   Lint: npm run lint --fix
   Dev: npm run dev
   ```

3. **Project Structure** — Where source code lives, where tests go, where docs belong.
   ```
   src/           → Application source code
   src/components → React components
   src/lib        → Shared utilities
   tests/         → Unit and integration tests
   e2e/           → End-to-end tests
   docs/          → Documentation
   ```

4. **Code Style** — One real code snippet showing your style beats three paragraphs describing it. Include naming conventions, formatting rules, and examples of good output.

5. **Testing Strategy** — What framework, where tests live, coverage expectations, which test levels for which concerns.

6. **Boundaries** — Three-tier system:
   - **Always do:** Run tests before commits, follow naming conventions, validate inputs
   - **Ask first:** Database schema changes, adding dependencies, changing CI config
   - **Never do:** Commit secrets, edit vendor directories, remove failing tests without approval

**Spec template:**

```markdown
# Spec: [Project/Feature Name]

## Objective
[What we're building and why. User stories or acceptance criteria.]

## Functional Requirements
[Each requirement in EARS notation — WHEN/WHILE/IF...THEN/WHERE + THE SYSTEM SHALL. One line = one acceptance test.]

## Tech Stack
[Framework, language, key dependencies with versions]

## Commands
[Build, test, lint, dev — full commands]

## Project Structure
[Directory layout with descriptions]

## Code Style
[Example snippet + key conventions]

## Testing Strategy
[Framework, test locations, coverage requirements, test levels]

## Boundaries
- Always: [...]
- Ask first: [...]
- Never: [...]

## Success Criteria
[How we'll know this is done — specific, testable conditions]

## Open Questions
[Anything unresolved that needs human input]
```

Save this as `SPEC.md` in the project root while it is the active spec. See "Spec Lifecycle and Location" below for where it goes once finalized.

**Reframe instructions as success criteria.** When receiving vague requirements, translate them into concrete conditions:

```
REQUIREMENT: "Make the dashboard faster"

REFRAMED SUCCESS CRITERIA:
- Dashboard LCP < 2.5s on 4G connection
- Initial data load completes in < 500ms
- No layout shift during load (CLS < 0.1)
→ Are these the right targets?
```

This lets you loop, retry, and problem-solve toward a clear goal rather than guessing what "faster" means.

### Phase 2: Clarify

Before planning, hunt the spec for ambiguity and close it with targeted questions. Cheap rework here prevents expensive rework after code exists.

- Scan every functional requirement, boundary, and success criterion for under-specified behavior: unhandled error paths, undefined edge cases, missing limits (rate, size, timeout), unstated non-functional targets.
- Ask focused, answerable questions — not open-ended ones. Prefer multiple-choice or yes/no over "what do you want?".
- Record each answer back into the spec (a `## Clarifications` section) so the resolved decision is durable, not buried in chat.

```
CLARIFICATIONS NEEDED:
1. Reset link reuse — single-use, or valid until expiry? → [single-use / reusable-until-expiry]
2. Concurrent reset requests — invalidate prior links, or allow multiple live? → [invalidate / allow]
3. Rate limit on reset requests per email? → [none / N per hour — specify N]
→ Answer these before I plan.
```

Skip only when the spec has zero open questions. If you wrote any assumption in Phase 1, it belongs here as a question first.

### Phase 3: Plan

With the validated spec, generate a technical implementation plan:

1. Identify the major components and their dependencies
2. Determine the implementation order (what must be built first)
3. Note risks and mitigation strategies
4. Identify what can be built in parallel vs. what must be sequential
5. Define verification checkpoints between phases

The plan should be reviewable: the human should be able to read it and say "yes, that's the right approach" or "no, change X."

### Phase 4: Tasks

Break the plan into discrete, implementable tasks:

- Each task should be completable in a single focused session
- Each task has explicit acceptance criteria
- Each task includes a verification step (test, build, manual check)
- Tasks are ordered by dependency, not by perceived importance
- No task should require changing more than ~5 files

**Task template:**
```markdown
- [ ] Task: [Description]
  - Acceptance: [What must be true when done]
  - Verify: [How to confirm — test command, build, manual check]
  - Files: [Which files will be touched]
```

### Phase 5: Implement

Execute tasks one at a time following the `test-driven-development` skill. Load the right spec sections and source files at each step rather than flooding the agent with the entire spec.

## Spec Lifecycle and Location

The spec moves through two locations over its life:

- **Active (in progress):** the spec lives as `SPEC.md` in the project root. There is exactly one active `SPEC.md` at a time. The root location keeps the current work obvious and gives `/plan` a single, predictable file to read.
- **Finalized:** once the spec is human-approved and ready to implement, move `SPEC.md` into the `specs/` folder and rename it to a descriptive slug derived from its contents (for example, `specs/password-reset-flow.md`). Create `specs/` if it is missing. The root is then free for the next active spec.

`specs/` is version-controlled. Plans and tasks (the `tasks/plan.md` and `tasks/todo.md` artifacts produced downstream) stay out of git. Add `tasks/` to `.gitignore`.

## Keeping the Spec Alive

The spec is a living document, not a one-time artifact:

- **Update when decisions change** — If you discover the data model needs to change, update the spec first, then implement.
- **Update when scope changes** — Features added or cut should be reflected in the spec.
- **Commit the spec:** The active `SPEC.md` and the finalized `specs/<name>.md` both belong in version control alongside the code. Only `tasks/` stays untracked.
- **Reference the spec in PRs** — Link back to the spec section that each PR implements.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "This is simple, I don't need a spec" | Simple tasks don't need *long* specs, but they still need acceptance criteria. A two-line spec is fine. |
| "I'll write the spec after I code it" | That's documentation, not specification. The spec's value is in forcing clarity *before* code. |
| "The spec will slow us down" | A 15-minute spec prevents hours of rework. Waterfall in 15 minutes beats debugging in 15 hours. |
| "Requirements will change anyway" | That's why the spec is a living document. An outdated spec is still better than no spec. |
| "The user knows what they want" | Even clear requests have implicit assumptions. The spec surfaces those assumptions. |

## Red Flags

- Starting to write code without any written requirements
- Asking "should I just start building?" before clarifying what "done" means
- Implementing features not mentioned in any spec or task list
- Making architectural decisions without documenting them
- Skipping the spec because "it's obvious what to build"

## Verification

Before proceeding to implementation, confirm:

- [ ] The spec covers all six core areas
- [ ] Functional requirements are written in EARS notation (each maps to one acceptance test)
- [ ] All clarifications are resolved and recorded in the spec (no open assumptions left)
- [ ] The human has reviewed and approved the spec
- [ ] Success criteria are specific and testable
- [ ] Boundaries (Always/Ask First/Never) are defined
- [ ] The active spec is saved as `SPEC.md` in the project root
- [ ] On finalization, `SPEC.md` is moved to `specs/<descriptive-name>.md` and the root is cleared for the next spec
- [ ] `tasks/` is gitignored (plans and tasks stay out of version control)
