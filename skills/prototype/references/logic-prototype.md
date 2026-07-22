# Logic Prototype

A tiny interactive terminal app that lets the user drive a state model by hand. Use this when the question is about **business logic, state transitions, or data shape**: the kind of thing that looks reasonable on paper but only feels wrong once real cases run through it.

## When this is the right shape

- "I'm not sure this state machine handles the case where X then Y."
- "Does this data model actually let me represent the case where..."
- "I want to feel out what the API should look like before writing it."
- Anything where the user wants to **press buttons and watch state change**.

If the question is "what should this look like", wrong branch. Use `ui-prototype.md`.

## Process

### 1. State the question

Before writing code, write down which state model and which question you are prototyping. One paragraph, in the prototype's README or a comment at the top of the file. A logic prototype that answers the wrong question is pure waste, so make the question explicit and checkable later.

### 2. Pick the language

Use whatever the host project uses. If the project has no obvious runtime (a docs repo, say), ask. Match the project's existing tooling. Don't add a package manager or runtime just for the prototype.

### 3. Isolate the logic in a portable module

Put the logic that answers the question behind a small, pure interface that could be lifted out and dropped into the real codebase later. The TUI around it is throwaway; the logic module is not.

The right shape depends on the question:

- **A pure reducer**, `(state, action) => state`. Good when actions are discrete events and state is a single value.
- **A state machine** with explicit states and transitions. Good when "which actions are even legal right now" is part of the question.
- **A small set of pure functions** over a plain data type. Good when there is no implicit current state, only transformations.
- **A class or module with a clear method surface**, when the logic genuinely owns ongoing internal state.

Pick whichever shape fits the question, not whichever is easiest to wire to a TUI. Keep it pure: no I/O, no terminal code, no logging for control flow. The TUI imports it and calls into it; nothing flows the other direction. That is what makes the prototype useful past its own lifetime.

### 4. Build the smallest TUI that exposes the state

Build a lightweight TUI: on every tick, clear the screen and re-render the whole frame, so the user always sees one stable view rather than growing scrollback.

Each frame has two parts, in this order:

1. **Current state**, pretty-printed and diff-friendly (one field per line, or formatted JSON). Bold for field names, dim for less important context (timestamps, IDs, derived values). Native ANSI escapes are fine; no styling library unless the project already has one.
2. **Keyboard shortcuts** at the bottom: `[a] add user  [d] delete user  [t] tick clock  [q] quit`.

Behavior: initialise state as a single in-memory value and render the first frame on start; read one keystroke (or line) at a time and dispatch to a handler; re-render the full frame after every action rather than appending; loop until quit. The whole frame should fit on one screen.

### 5. Make it runnable in one command

Add a script to the project's existing task runner (`package.json` scripts, `Makefile`, `justfile`, `pyproject.toml`) so the user runs `pnpm run <prototype-name>` or equivalent and never has to remember a path. If the project has no task runner, put the command at the top of the prototype's README.

### 6. Hand it over

Give the user the run command. They drive it themselves. The interesting moments are "wait, that shouldn't be possible" and "huh, I assumed X would be different": those are bugs in the *idea*, which is the whole point. If they want more actions, add them. Prototypes evolve.

### 7. Capture the answer and the prototype

Once the prototype has answered its question, capture the answer, then capture the prototype the way `SKILL.md` describes. The logic-specific mapping: the validated reducer, machine, or function set lifts into the real module (the decision, absorbed), and the TUI shell rides along to the throwaway branch that keeps the prototype as a primary source.

## Anti-patterns

- **Adding tests.** A prototype that needs tests is no longer a prototype.
- **Wiring it to the real database.** Use an in-memory store unless the question is specifically about persistence.
- **Generalising.** No "what if we wanted to support X later". The prototype answers one question.
- **Blurring the logic and the TUI together.** A reducer that references prompts or terminal escapes is no longer portable. Keep the TUI a thin shell over a pure module.
- **Shipping the TUI shell into production.** The shell is optimised for being driven by hand. The logic module behind it is the part worth keeping.
