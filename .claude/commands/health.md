---
description: Audit Claude Code config stack (CLAUDE.md → rules → skills → hooks → subagents → verifiers). Tier-aware, budget-aware.
---

Invoke the `mzyx-skills:health` skill.

Use when:
- Claude is ignoring instructions or behaving inconsistently
- Hooks misfire or MCP servers need an audit
- You want to verify rules and skills are wired correctly

The skill applies a six-layer model and tier-matches expectations to project complexity (Simple / Standard / Complex). Default is summary mode; escalate to deep mode only on explicit request — full audits burn tokens.
