---
description: Multi-axis code review before merge. Wires to mzyx-skills:code-review-and-quality.
---

Two-phase review:

1. **Self-audit (content).** Invoke `mzyx-skills:code-review-and-quality` to audit the pending changes across correctness, readability, architecture, security, and performance. Resolve any Critical/Important findings before continuing.
2. **Handoff (workflow).** Invoke `mzyx-skills:requesting-code-review` to package the change for an external reviewer (subagent or human). This phase shapes the request, not the review itself.

For PR-shaped review with multiple specialists in parallel (security / api-contract / performance / conventions), prefer `/team-pr-review` instead.

If you receive review feedback later and need to evaluate it rigorously, invoke `mzyx-skills:receiving-code-review` directly — that's a separate phase, not part of `/review`.

Next step in the flow: `/ship`.
