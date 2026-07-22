---
name: prototype
description: "Builds throwaway code that answers one design question: does this state model feel right, or what should this screen look like. Use to raise the fidelity of a discussion before committing to an approach. Not for production work (use test-driven-development) or visual polish of shipped UI (use design)."
when_to_use: "prototype this, mock this up, spike it, does this model work, try a few layouts, I want to feel it before we build it"

metadata:
  version: "0.1.0"
---

# Prototype

A prototype is **throwaway code that answers a question**. The question decides the shape.

## Pick a branch

Identify which question is being answered, from the user's prompt, from the surrounding code, or by asking if the user is around:

- **"Does this logic or state model feel right?"** Load `references/logic-prototype.md`. Build a tiny interactive terminal app that pushes the state machine through cases that are hard to reason about on paper.
- **"What should this look like?"** Load `references/ui-prototype.md`. Generate several radically different UI variations on a single route, switchable via a URL search param and a floating bottom bar.

The two branches produce very different artifacts, so getting this wrong wastes the whole prototype. If the question is genuinely ambiguous and the user is not reachable, default to whichever branch matches the surrounding code (a backend module means logic, a page or component means UI) and state the assumption at the top of the prototype.

## Rules that apply to both

1. **Throwaway from day one, and clearly marked as such.** Put the prototype next to the module or page it is prototyping for, so its context is obvious, but name it so a casual reader can see it is a prototype rather than production. For throwaway UI routes, obey the project's existing routing convention. Don't invent a new top-level structure.
2. **One command to run.** Whatever the project's task runner supports (`pnpm <name>`, `python <path>`, `bun <path>`). The user must be able to start it without thinking.
3. **No persistence by default.** State lives in memory. Persistence is the thing the prototype is *checking*, not something it should depend on. If the question genuinely involves a database, hit a scratch DB or a local file named so it is obviously disposable.
4. **Skip the polish.** No tests, no error handling beyond what makes the prototype runnable, no abstractions. The point is to learn something fast.
5. **Surface the state.** After every action (logic) or on every variant switch (UI), print or render the full relevant state so the user can see what changed.
6. **Capture it when done.** Fold the validated decision into the real code, then keep the prototype itself as a primary source: commit it to a throwaway branch, off main, and leave a pointer to that branch on the issue or in the plan. Record the verdict and the question it settled. Main keeps only the validated decision.
