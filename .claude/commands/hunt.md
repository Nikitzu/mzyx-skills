---
description: Systematic root-cause debugging. Confirm the cause before applying any fix.
---

Invoke the `mzyx-skills:hunt` skill.

Use for any bug, regression, error, crash, or "used to work" report. The skill enforces hypothesis-first debugging — no code touched until you can state the root cause as `"I believe the root cause is [X] because [evidence]"`.

Hard rules:
- Same symptom after a fix is a hard stop — re-read the execution path, do not retry the same approach
- "I'll just try this" means no hypothesis — write one first
- "It works on my machine" means enumerate every env difference

Pairs with `mzyx-skills:debugging-and-error-recovery` (process scaffolding); `/hunt` is the discipline layer.
