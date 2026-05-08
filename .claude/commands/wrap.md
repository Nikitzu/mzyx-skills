---
description: Close out a development branch — decide between merge, PR, or cleanup based on current state.
---

Invoke the `mzyx-skills:finishing-a-development-branch` skill.

Run this **after** `/ship` returns a GO verdict (or after any feature is implementation-complete and verified). The skill walks through:

1. Current branch state — uncommitted changes, untracked files, ahead/behind main
2. Integration choice — merge to main, open PR, or rebase first
3. Cleanup — delete the local branch, prune the remote tracking ref
4. Worktree wrap-up if applicable (note: worktree workflow is disabled in this skill set)

Do not run this command before `/ship` — shipping decides whether the branch is ready to integrate; wrapping decides how to integrate it.
