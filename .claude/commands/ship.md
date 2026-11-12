---
description: The pre-merge gate - one inline review of the change, evidence for every spec requirement, then GO or NO-GO and archive
---

`/ship` is the last step before a change merges. It runs in this session, with no subagents: you review the change yourself, prove each spec requirement with evidence, and decide GO or NO-GO. Run it on the pull request before anyone merges it; after the merge it can no longer stop anything.

## Step 1: Read the change

Read the real diff against the base branch (`git diff <base>...HEAD`), not a summary of it, and the change file if there is one (`specs/changes/<name>/change.md`).

## Step 2: Review it inline

Go through the diff once with these questions, and write down every finding with `file:line` and a rating (Critical, Important or Minor):

1. **Correctness.** Edge inputs, error paths, anything the change silently skips or drops.
2. **Security.** Untrusted input reaching paths, commands or prompts; secrets and personal data; what the change lets someone write or read that they could not before.
3. **Tests.** Is each new behaviour covered by a test that would fail without it? Which edge cases have none?
4. **Readability and architecture.** Only what makes the code wrong or hard to change, not style.
5. **Infrastructure and docs.** Env vars, migrations, flags, workflows, and any instructions or docs that now describe the old behaviour.

## Step 3: Run the checks

Invoke `mzyx-skills:verification-before-completion`: run the tests, build and lint on this branch and read their output. A green CI badge is not enough.

## Step 4: Evidence for the spec

If there is a change file, give every requirement in its `## Added` and `## Modified` sections one row:

| Requirement | Evidence |
|---|---|
| [name] | [test name and file, or the command run and the line of its output that proves it] |

Evidence must come from this branch, after the last change. "The code looks right" is not evidence. **A requirement without evidence makes the verdict NO-GO.**

## Step 5: Decide

```markdown
## Ship Decision: GO | NO-GO

### Blockers (must fix before merge)
- [Critical finding + file:line, or a requirement without evidence]

### Recommended fixes
- [Important finding + file:line]

### Spec coverage
- [The Step 4 table, or "no change file"]

### Rollback plan
- Trigger: [what signals a rollback]
- Procedure: [exact steps]
```

A Critical finding means NO-GO unless the user explicitly accepts the risk. The rollback plan is required for GO.

## Step 6: Archive after GO

On GO, when there is a change file, run `node <skill dir>/scripts/archive.mjs specs/changes/<name>`, where `<skill dir>` is the base directory of the `spec-driven-development` skill. It folds the deltas into `specs/<area>.md` and moves the folder to `specs/changes/archive/<date>-<name>/`, or changes nothing if anything fails. Commit the result in the same pull request. Never edit `specs/<area>.md` by hand.
