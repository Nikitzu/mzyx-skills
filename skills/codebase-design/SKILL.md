---
name: codebase-design
description: "Shared vocabulary for designing deep modules: interface, depth, seam, adapter, leverage, locality. Use when shaping a module's interface, deciding where a seam goes, or making code more testable. Not for behavior-preserving cleanup (use code-simplification) or bug diagnosis (use hunt)."
when_to_use: "design this module, where should the seam go, is this abstraction right, make this testable, interface design, deep module, too many layers"

metadata:
  version: "0.1.0"
---

# Codebase Design

Design **deep modules**: a lot of behavior behind a small interface, placed at a clean seam, testable through that interface. Use this language wherever code is being designed or restructured. The aim is leverage for callers, locality for maintainers, and testability for everyone.

## Glossary

Use these terms exactly. Don't substitute "component", "service", "API", or "boundary": consistent language is the whole point.

**Module**: anything with an interface and an implementation. Deliberately scale-agnostic, so a function, a class, a package, or a tier-spanning slice all qualify. *Avoid*: unit, component, service.

**Interface**: everything a caller must know to use the module correctly. The type signature, but also invariants, ordering constraints, error modes, required configuration, and performance characteristics. *Avoid*: API, signature (too narrow, they refer only to the type-level surface).

**Implementation**: what is inside a module, its body of code. Distinct from **adapter**: a thing can be a small adapter with a large implementation (a Postgres repo) or a large adapter with a small implementation (an in-memory fake). Reach for "adapter" when the seam is the topic, "implementation" otherwise.

**Depth**: leverage at the interface. The amount of behavior a caller (or a test) can exercise per unit of interface it has to learn. A module is **deep** when a large amount of behavior sits behind a small interface, **shallow** when the interface is nearly as complex as the implementation.

**Seam** (Michael Feathers): a place where you can alter behavior without editing in that place. The *location* at which a module's interface lives. Where to put the seam is its own design decision, separate from what goes behind it. *Avoid*: boundary (overloaded with DDD's bounded context).

**Adapter**: a concrete thing that satisfies an interface at a seam. Describes *role* (which slot it fills), not substance (what is inside).

**Leverage**: what callers get from depth. More capability per unit of interface they learn. One implementation pays back across N call sites and M tests.

**Locality**: what maintainers get from depth. Change, bugs, knowledge, and verification concentrate in one place instead of spreading across callers. Fix once, fixed everywhere.

## Deep vs shallow

A **deep module** is a small interface over a large implementation: few entry points, simple parameters, complex logic hidden. A **shallow module** is a large interface over a thin implementation, mostly passing values onward. Shallow is the one to avoid: the caller pays full price to learn the interface and gets almost nothing hidden in return.

When designing an interface, ask:

- Can I reduce the number of entry points?
- Can I simplify the parameters?
- Can I hide more complexity inside?

## Principles

- **Depth is a property of the interface, not the implementation.** A deep module can be internally composed of small, swappable parts. They just aren't part of the interface. A module can have **internal seams** (private to its implementation, used by its own tests) as well as the **external seam** at its interface.
- **The deletion test.** Imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. Wanting to test *past* the interface means the module is probably the wrong shape.
- **One adapter means a hypothetical seam. Two adapters means a real one.** Don't introduce a seam unless something actually varies across it.

## Designing for testability

1. **Accept dependencies, don't create them.** A function handed its payment gateway is testable; one that constructs a `StripeGateway` inside itself is not.
2. **Return results, don't produce side effects.** `calculateDiscount(cart): Discount` is testable; `applyDiscount(cart): void` that mutates `cart.total` is not.
3. **Small surface area.** Fewer entry points means fewer tests. Fewer parameters means simpler setup.

## Relationships

- A **module** has exactly one **interface**, the surface it presents to callers and tests.
- **Depth** is a property of a module, measured against its interface.
- A **seam** is where a module's interface lives.
- An **adapter** sits at a seam and satisfies the interface.
- **Depth** produces **leverage** for callers and **locality** for maintainers.

## Rejected framings

- **Depth as a ratio of implementation lines to interface lines** (Ousterhout): rewards padding the implementation. Use depth-as-leverage instead.
- **"Interface" as the TypeScript `interface` keyword, or a class's public methods**: too narrow. Interface here includes every fact a caller must know.
- **"Boundary"**: overloaded with DDD's bounded context. Say **seam** or **interface**.

## Going deeper

- **Deepening a cluster given its dependencies**: `references/deepening.md` covers dependency categories, seam discipline, and replace-don't-layer testing.
- **Exploring alternative interfaces**: `references/design-it-twice.md` spins up parallel subagents to design one interface several radically different ways, then compares them on depth, locality, and seam placement.
