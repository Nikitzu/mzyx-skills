---
description: Lightweight code-review-and-verify pass over a diff or release artifact. Auto-fixes safe issues, flags the rest.
---

Invoke the `mzyx-skills:check` skill.

Use after implementation, before `/ship` or before merging. The skill reads the diff, applies project-specific constraints, fixes what's safe, and asks about the rest. "Done" means verification ran in this session and passed.

This is a lighter alternative to `/ship` (which fans out to specialist agents). Use `/check` for solo passes; use `/ship` when you want adversarial multi-agent review.
