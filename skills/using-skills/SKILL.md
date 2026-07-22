---
name: using-skills
description: Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## Instruction Priority

Superpowers skills override default system prompt behavior, but **user instructions always take precedence**:

1. **User's explicit instructions** (CLAUDE.md, GEMINI.md, AGENTS.md, direct requests) — highest priority
2. **Superpowers skills** — override default system behavior where they conflict
3. **Default system prompt** — lowest priority

If CLAUDE.md, GEMINI.md, or AGENTS.md says "don't use TDD" and a skill says "always use TDD," follow the user's instructions. The user is in control.

## How to Access Skills

**In Claude Code:** Use the `Skill` tool. When you invoke a skill, its content is loaded and presented to you—follow it directly. Never use the Read tool on skill files.

**In Copilot CLI:** Use the `skill` tool. Skills are auto-discovered from installed plugins. The `skill` tool works the same as Claude Code's `Skill` tool.

**In Gemini CLI:** Skills activate via the `activate_skill` tool. Gemini loads skill metadata at session start and activates the full content on demand.

**In other environments:** Check your platform's documentation for how skills are loaded.

## Platform Adaptation

Skills use Claude Code tool names. Non-CC platforms: see `references/copilot-tools.md` (Copilot CLI), `references/codex-tools.md` (Codex) for tool equivalents. Gemini CLI users get the tool mapping loaded automatically via GEMINI.md.

# Using Skills

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check. If an invoked skill turns out to be wrong for the situation, you don't need to use it.

```dot
digraph skill_flow {
    "User message received" [shape=doublecircle];
    "About to EnterPlanMode?" [shape=doublecircle];
    "Already brainstormed?" [shape=diamond];
    "Invoke brainstorming skill" [shape=box];
    "Might any skill apply?" [shape=diamond];
    "Invoke Skill tool" [shape=box];
    "Announce: 'Using [skill] to [purpose]'" [shape=box];
    "Has checklist?" [shape=diamond];
    "Create TodoWrite todo per item" [shape=box];
    "Follow skill exactly" [shape=box];
    "Respond (including clarifications)" [shape=doublecircle];

    "About to EnterPlanMode?" -> "Already brainstormed?";
    "Already brainstormed?" -> "Invoke brainstorming skill" [label="no"];
    "Already brainstormed?" -> "Might any skill apply?" [label="yes"];
    "Invoke brainstorming skill" -> "Might any skill apply?";

    "User message received" -> "Might any skill apply?";
    "Might any skill apply?" -> "Invoke Skill tool" [label="yes, even 1%"];
    "Might any skill apply?" -> "Respond (including clarifications)" [label="definitely not"];
    "Invoke Skill tool" -> "Announce: 'Using [skill] to [purpose]'";
    "Announce: 'Using [skill] to [purpose]'" -> "Has checklist?";
    "Has checklist?" -> "Create TodoWrite todo per item" [label="yes"];
    "Has checklist?" -> "Follow skill exactly" [label="no"];
    "Create TodoWrite todo per item" -> "Follow skill exactly";
}
```

## Red Flags

These thoughts mean STOP—you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |
| "I know what that means" | Knowing the concept ≠ using the skill. Invoke it. |

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (brainstorming, hunt) - these determine HOW to approach the task
2. **Implementation skills second** (test-driven-development, frontend-ui-engineering, design) - these guide execution

"Let's build X" → brainstorming first, then implementation skills.
"Fix this bug" → hunt first, then domain-specific skills.

## Canonical Pipeline & Boundaries

The structured lifecycle:

`/brainstorm` → `/spec` → `/plan` → `/build` → `/ship`

- **brainstorming** — explore intent and design alternatives. First, before specs or code.
- **spec-driven-development** (`/spec`) — multi-file or ambiguous features; pin the *what* before the *how*.
- **writing-plans** (`/plan`) — clear-enough change; sequence into verifiable tasks.
- **build** — execute: `subagent-driven-development` (in-session parallel) or `executing-plans` (separate session, checkpoints); `test-driven-development` per task; `verification-before-completion` before done.
- **check** / **ship** — review-and-act-and-ship; GO/NO-GO.

Two entry points sit outside the pipeline. **wayfinder** takes work too large for one session and charts it as decision tickets, feeding `/plan` once the way is clear. **grilling** is the interview primitive that `brainstorming`, `think`, and `wayfinder` reach for when a decision needs stress-testing.

**User-invoked only** (the agent will not fire these, so type them): `wayfinder`, `health`, `write`.

When two skills compete, pick by boundary:

| Need | Use | Not |
|---|---|---|
| Find a bug / failure root cause | `hunt` | code review |
| Multi-axis review, no shipping | `code-review-and-quality` | `check` |
| Review then commit / release / triage | `check` | `code-review-and-quality` |
| Refactor for clarity, behavior unchanged | `code-simplification` | `code-review-and-quality` |
| Full feature design | `brainstorming` | `think` |
| Lightweight keep-or-kill / value judgment | `think` | `brainstorming` |
| Ambiguous feature, pin the *what* | `spec-driven-development` | `writing-plans` |
| Clear multi-step change, sequence it | `writing-plans` | `spec-driven-development` |
| Visual / aesthetic UI, screenshot iteration | `design` | `frontend-ui-engineering` |
| UI structure / state / behavior engineering | `frontend-ui-engineering` | `design` |
| Fetch one URL / PDF | `read` | `learn` |
| Multi-source research workflow | `learn` | `read` |
| Stress-test a plan by interview | `grilling` | `brainstorming` |
| Shape a module interface / place a seam | `codebase-design` | `code-simplification` |
| Answer a design question with throwaway code | `prototype` | `frontend-ui-engineering` |
| Chart work too big for one session | `wayfinder` | `writing-plans` |

## Skill Types

**Rigid** (TDD, debugging): Follow exactly. Don't adapt away discipline.

**Flexible** (patterns): Adapt principles to context.

The skill itself tells you which.

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows.
