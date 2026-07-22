# Design It Twice

When the user wants to explore alternative interfaces for a chosen deepening candidate, use this parallel subagent pattern. Based on "Design It Twice" (Ousterhout): your first idea is unlikely to be the best.

Uses the vocabulary in `SKILL.md`: **module**, **interface**, **seam**, **adapter**, **leverage**.

## Process

### 1. Frame the problem space

Before spawning subagents, write a user-facing explanation of the problem space for the chosen candidate:

- The constraints any new interface would need to satisfy.
- The dependencies it would rely on, and which category they fall into (see `deepening.md`).
- A rough illustrative code sketch to ground the constraints. Not a proposal, just a way to make the constraints concrete.

Show this to the user, then proceed immediately to step 2. The user reads and thinks while the subagents work in parallel.

### 2. Spawn subagents

Spawn three or more subagents in parallel, in a single message. Each must produce a **radically different** interface for the deepened module.

Prompt each one with a separate technical brief (file paths, coupling details, dependency category, what sits behind the seam). The brief is independent of the user-facing explanation from step 1. Give each agent a different design constraint:

- Agent 1: "Minimize the interface. Aim for one to three entry points, maximizing leverage per entry point."
- Agent 2: "Maximize flexibility. Support many use cases and extension."
- Agent 3: "Optimize for the most common caller. Make the default case trivial."
- Agent 4 (where relevant): "Design around ports and adapters for cross-seam dependencies."

Include both the `SKILL.md` vocabulary and the project's own domain vocabulary in each brief, so every agent names things consistently.

Each subagent outputs:

1. The interface (types, methods, parameters, plus invariants, ordering, error modes).
2. A usage example showing how callers use it.
3. What the implementation hides behind the seam.
4. Its dependency strategy and adapters.
5. Trade-offs: where leverage is high, where it is thin.

### 3. Present and compare

Present the designs one at a time so the user can absorb each, then compare them in prose. Contrast by **depth** (leverage at the interface), **locality** (where change concentrates), and **seam placement**.

After comparing, give your own recommendation: which design is strongest and why. Where elements from different designs would combine well, propose the hybrid. Be opinionated. The user wants a strong read, not a menu.
