# Skill Glossary

The domain model behind `skill-design-theory.md`. A skill exists to wrangle determinism out of a stochastic system: the root virtue is **predictability**, and every term here is a lever on it. Each **failure mode** sits beside the lever that cures it. *Avoid* lists give the words that blur the term.

## Predictability

The degree to which a skill makes the agent behave the same *way* on every run: the same process, not the same output. A brainstorming skill should predictably diverge. Cost and maintainability are symptoms of predictability, not rivals to it.
*Avoid*: consistency, reliability, robustness, output-determinism.

## Invocation

### Model-invoked

A skill that keeps its `description`, so the agent can fire it autonomously and the human can still type its name. Model-invocation always *includes* user reach: a description only ever adds agent discovery. Reachable by other skills, which makes a model-invoked reference skill one good home for material several skills need. Pays permanent **context load**.
*Avoid*: ability, tool, capability.

### User-invoked

A skill with its description stripped, invisible to the agent and reachable only by the human typing its name. Trades discoverability for zero context load. Because it has no description, nothing but the human can fire it, including other skills.
*Avoid*: procedure, workflow, command.

### Description

The skill's machine-readable trigger, and the one context pointer a model-invoked skill keeps loaded at all times. Its presence *is* the invocation axis: keep it and the skill is model-invoked, delete it and the skill is user-invoked.
*Avoid*: frontmatter, summary.

### Context pointer

A reference held in context that names out-of-context material and encodes the condition for reaching it. The description is the top-level pointer (context window to skill); pointers to disclosed files are the same object one level down. Its wording, not its target, decides when and how reliably the agent reaches.
*Avoid*: link, reference, import.

### Context load

The cost a model-invoked skill imposes on the context window: its description, always loaded, spending tokens and attention. The brake on splitting into more model-invoked skills.
*Avoid*: token cost, context bloat.

### Cognitive load

The cost a user-invoked skill imposes on the human, who becomes the index that must remember it exists. Not a cost to minimise at all costs: it is the price of human agency. The brake on splitting into more user-invoked skills.
*Avoid*: human index, burden, overhead.

### Router skill

A skill whose job is to point at the others, naming each and when to reach for it, so the human has one thing to remember instead of many. The cure for accumulated cognitive load. In this plugin, `using-skills`.
*Avoid*: dispatcher, menu, registry.

### Granularity

How finely you divide skills. Finer division spends one of the two loads: more model-invoked skills spend context load, more user-invoked skills spend cognitive load. Two cuts guide it, by **invocation** and by **sequence**.
*Avoid*: chunking, modularity.

## Information hierarchy

### Information hierarchy

A skill's content ranked by how immediately the agent needs it: steps (in-file, primary), reference in-file (secondary), reference disclosed (behind a context pointer). Independent of invocation. When a skill has steps, in-file reference that should have been disclosed buries them and turns attending to them into a coin flip.
*Avoid*: structure, organization, layout.

### Steps

The ordered actions the agent performs. Not every skill has them: a skill can be all steps, all reference, or both. Every step ends on a **completion criterion**, clear or vague.
*Avoid*: workflow, instructions, choreography.

### Reference

Material the agent consults on demand: definitions, facts, parameters, examples, conditional instructions. Secondary to steps where a skill has both, and the entire content where it has none. The prime candidate for progressive disclosure.
*Avoid*: supporting material, docs, background.

### Progressive disclosure

Moving reference out of SKILL.md and behind a context pointer so the top stays legible. Not primarily a token optimisation: it is how the information hierarchy is protected. Licensed by branching. If a pointer fires unreliably on must-have material, sharpen its wording, and pull the material back inline only if that fails.
*Avoid*: lazy loading, chunking.

### Co-location

Keeping the material an agent needs at once in one place: a concept's definition, rules, and caveats under a single heading rather than scattered. The within-file companion to the hierarchy, which ranks how far down a piece sits. Distinct from duplication: that repeats one meaning in two places, where scattering fragments one meaning across many.
*Avoid*: grouping, clustering, cohesion.

### Sprawl

*Failure mode.* A skill simply too long, independent of whether its lines are stale or repeated. Costs readability, maintainability, and tokens. Cured by the hierarchy: disclose reference, split by branch or sequence. Distinct from sediment (length from stale accumulation) and duplication (length from repeated meaning).
*Avoid*: bloat, length, verbosity.

## Steering

### Branch

A distinct way a skill can be invoked, so different runs take different paths through it. The cleanest test for what to disclose.
*Avoid*: path, case, fork.

### Leading word

A compact concept already in the model's pretraining that the agent thinks with while running the skill (*lesson*, *fog of war*, *tracer bullet*, *seam*). Repeated as a token, never as a sentence, it accumulates a distributed definition and anchors a region of behavior in the fewest tokens. Coining your own works if defined clearly, but a made-up word recruits no priors. Serves predictability twice: anchoring execution in the body, and invocation in the description.
*Avoid*: keyword, term, motif.

### Completion criterion

The condition that tells the agent a unit of work is done. Two properties make it a lever. Its **clarity** (can the agent tell done from not-done?) resists premature completion. Its **demand** (how much it requires) sets **legwork**, and binds flat reference too, which is how a skill with no steps still carries an exhaustiveness bar. The strongest criteria are both checkable and exhaustive.
*Avoid*: done condition, exit condition, stopping rule.

### Legwork

The work an agent does within a single step: reading files, exploring the codebase, digging up what it needs rather than offloading to the user. Never written as its own step; latent in the wording. Raised by a strong leading word or a demanding completion criterion. Goes thin when that demand is missing, or when premature completion cuts the step short.
*Avoid*: scope, effort, diligence.

### Post-completion steps

The steps that follow the current one. Visible, they pull the agent forward into premature completion, and the more it sees the stronger the tug. Hiding them requires a real context boundary.
*Avoid*: horizon, lookahead.

### Premature completion

*Failure mode.* Ending the current step before it is genuinely done, because attention slipped to being done. A tug of war between visible post-completion steps (the pull) and the completion criterion's clarity (the resistance). Fuzziness is the necessary condition, so reach for the levers in order: sharpen the bound first, because it is local and cheap; hide the later steps only when the criterion is irreducibly fuzzy and you actually observe the rush.
*Avoid*: premature closure, rushing, shortcutting.

### Negation

*Failure mode.* Steering by prohibition, which drags the forbidden behavior into context and makes it more available. "Never write verbose comments" leaves verbosity as the pattern just read. Cure: prompt the positive. A prohibition earns its place only as a hard guardrail on something you cannot phrase positively, and even then pair it with the positive target.
*Avoid*: ironic rebound, the pink elephant.

## Pruning

### Single source of truth

Each meaning living in exactly one authoritative place, so a change to behavior is a change in one place. Duplication is its violation.
*Avoid*: home, canonical location.

### Duplication

*Failure mode.* The same meaning given more than one home. Costs maintenance and tokens, and inflates that meaning's prominence past its real rank. The accidental inverse of a leading word, which raises attention on purpose by repeating a token, never the meaning.
*Avoid*: repetition, redundancy.

### Relevance

Whether a line still bears on what the skill does. A line loses relevance by never bearing on the task, or by going stale as the world it describes changes. Shorter skills are easier to keep relevant, because each line is cheaper to check.
*Avoid*: load-bearing, staleness.

### Sediment

*Failure mode.* Layers of old content that settle because adding feels safe and removing feels risky, so you must core down through stale lines to find what is live. The slow erosion of relevance.
*Avoid*: accretion, cruft, rot.

### No-op

*Failure mode.* An instruction that changes nothing because the model already does it by default. A line can be perfectly relevant and still be a no-op. The test (does it change behavior versus the default?) is also how you grade whether a leading word earns its repetitions.
*Avoid*: redundant instruction, restating the obvious.
