---
description: Fetch any URL or PDF as clean Markdown. Handles paywalls, JS-heavy pages, and platform-specific routing.
---

Invoke the `mzyx-skills:read` skill.

Use to fetch URLs or local PDFs and return clean Markdown — no analysis, no summary unless explicitly asked after the fetch.

Routing:
- GitHub → `gh`/raw first
- PDFs → extraction
- Most other sites → proxy cascade fallback

For multi-source research output, use `/learn` instead.
