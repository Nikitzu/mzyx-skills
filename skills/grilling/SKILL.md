---
name: grilling
description: "Relentless one-question-at-a-time interview that stress-tests a plan, decision, or idea until both sides share the same understanding. Use to sharpen thinking before committing. Not for producing the artifact itself (use brainstorming, think, or spec-driven-development)."
when_to_use: "grill me, stress-test this, poke holes in this, challenge my thinking, are you sure about this plan, interview me"

metadata:
  version: "0.1.0"
---

# Grilling

Interview the user relentlessly about every aspect of the idea until you reach a shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one at a time. For each question, state your own recommended answer before waiting.

## The rules

**One question at a time.** Ask, then wait for the answer before asking the next. Several questions at once is bewildering and produces shallow answers to all of them.

**Look up facts, ask about decisions.** If something is discoverable from the filesystem, the git history, a tool, or the codebase, go find it. Spending the user's attention on a fact you could have read is the fastest way to lose it. The decisions are theirs: put each one to them and wait.

**Recommend, don't survey.** Every question carries your recommended answer and the reason for it. A menu of equal-looking options moves the work back onto the user; a recommendation gives them something to push against.

**Depth-first, resolving dependencies.** When an answer opens a new branch, follow it before returning to the breadth of the tree. Decisions that gate other decisions get asked first, otherwise you collect answers that the next answer invalidates.

**Do not act until they confirm.** Grilling produces shared understanding, not code, not files, not commits. The session ends when the user confirms you both see the same thing.

## Breadth-first variant

When the goal is to map a space rather than settle one decision (charting a `wayfinder` map, scoping a large effort), fan out across the whole space instead of following each branch to its end. Surface the open decisions and which of them are takeable now, and stop before resolving any of them.

## When the user is not there

If the user has gone quiet mid-session, do not answer your own questions and proceed. A grilling session where the agent plays both sides has produced nothing. Record the outstanding questions with your recommended answers, and stop.
