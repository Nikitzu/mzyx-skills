---
description: TDD workflow — write failing tests, implement, verify. Wires to mzyx-skills:test-driven-development.
---

Invoke the `mzyx-skills:test-driven-development` skill.

For new features: write tests describing expected behavior (must FAIL), implement to pass, refactor green.

For bug fixes (Prove-It pattern): write a test reproducing the bug (must FAIL), confirm failure, implement fix, confirm pass, run full suite for regressions.

For browser-related issues, also invoke `mzyx-skills:browser-testing-with-devtools` to verify with Chrome DevTools MCP.
