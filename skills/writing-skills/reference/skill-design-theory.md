# Skill Design Theory

Where the rest of this skill covers *structure and conventions* (what a SKILL.md contains, how the frontmatter is written, how to test it), this file covers *why one skill behaves predictably and another does not*. Adapted from Matt Pocock's `writing-great-skills` (MIT).

A skill exists to wrangle determinism out of a stochastic system. **Predictability**, the agent taking the same *process* every run (not producing the same output), is the root virtue. Every lever below serves it. A brainstorming skill should predictably diverge: its tokens vary, its behavior does not.

Full definitions live in `skill-glossary.md`.

## Invocation: the two loads

Two choices, trading different costs.

A **model-invoked** skill keeps its `description`, so the agent can fire it autonomously and other skills can reach it. The human can still type its name, so model-invocation always *includes* user reach. It pays a permanent **context load**: the description sits in the listing every turn, spending tokens and attention. Mechanics: omit `disable-model-invocation`, and write a description with real trigger phrasing.

A **user-invoked** skill strips the description from the agent's reach. Only the human, typing its name, can invoke it, and no other skill can. Zero context load, but it spends **cognitive load**: *you* become the index that has to remember it exists. Mechanics: `disable-model-invocation: true`, and the description becomes human-facing (a one-line summary, trigger lists stripped).

Pick model-invocation only when the agent must reach the skill on its own, or another skill must. A skill that only ever fires by hand should be user-invoked and pay no context load.

Cognitive load is not a cost to minimise at all costs: it is the price of human agency, and the reason some skills stay user-invoked. Spend it where human judgement matters. When user-invoked skills multiply past what one person can remember, the cure is a **router skill** (in this plugin, `using-skills`) that names them and says when to reach for each.

## Writing the description

A model-invoked description does two jobs: state what the skill is, and list the branches that should trigger it. Every word costs context load, so a description earns harder pruning than the body.

- **Front-load the leading word.** The description is where it does its invocation work.
- **One trigger per branch.** Synonyms that rename a single branch are duplication. "Build features using TDD ... asks for test-first development" is one branch written twice. Collapse them.
- **Cut identity already in the body.** Keep the description to triggers, plus any "when another skill needs..." reach clause.

## The information hierarchy

A skill is built from two content types, **steps** and **reference**, that mix freely: a skill can be all steps, all reference, or both. The decision is which to use, and how far down the ladder each piece sits. The ladder is ranked by how immediately the agent needs the material:

1. **In-skill step**: an ordered action in SKILL.md. The primary tier: what the agent does, in order. Each step ends on a **completion criterion**, the condition that says the work is done. Make it *checkable* (can the agent tell done from not-done?) and, where it matters, *exhaustive* ("every modified model accounted for", not "produce a change list"). A vague criterion invites premature completion.
2. **In-skill reference**: a definition, rule, or fact in SKILL.md, consulted on demand. Often a legitimately flat peer-set (every rule of a review on one rung), which is a fine arrangement rather than a smell.
3. **External reference**: reference pushed out of SKILL.md into a separate file, reached by a **context pointer**, loaded only when the pointer fires.

Push too little down and the top bloats; push too much and you hide material the agent needs. That tension is the whole decision.

**Progressive disclosure** is the move down the ladder. Branching is the cleanest test for it: inline what every branch needs, push behind a pointer what only some branches reach. A **context pointer**'s *wording*, not its target, decides when and how reliably the agent reaches the material. A must-have target behind a weakly worded pointer is a variance bug: sharpen the wording first, and pull the material back inline only if that fails.

Where the ladder decides how far down a piece sits, **co-location** decides what sits beside it once there: keep a concept's definition, rules, and caveats under one heading rather than scattered, so reading one part brings its neighbours with it.

## When to split

**Granularity** is how finely you divide skills, and each cut spends one of the two loads. Two cuts:

- **By invocation.** Split off a model-invoked skill when it has a distinct **leading word** that should trigger it on its own, or when another skill must reach it. You pay context load for the new always-loaded description, so that independent reach has to be worth it.
- **By sequence.** Split a run of steps when the steps still ahead tempt the agent to rush the one in front of it. Keeping them out of view encourages more legwork on the current task. This only works across a real context boundary (a hand-off or a subagent dispatch); an inline call leaves the later steps in context and clears nothing.

## Leading words

A **leading word** is a compact concept already living in the model's pretraining that the agent thinks with while running the skill (*tracer bullet*, *fog of war*, *seam*, *red*, *tight*). Repeated as a token rather than as a sentence, it accumulates a distributed definition and anchors a whole region of behavior in very few tokens, by recruiting priors the model already holds.

It serves predictability twice. In the body it anchors *execution*: the agent reaches for the same behavior every time the word appears. In the description it anchors *invocation*: when the same word lives in your prompts, your docs, and your code, the agent links that shared language to the skill and fires it more reliably.

Coining your own word works if you define it clearly, but a made-up word recruits no priors, so you pay in definition tokens what a pretrained word gives free. Reach for an existing word first.

Hunt for chances to collapse prose into leading words. "Fast, deterministic, low-overhead" is one quality restated three times: it becomes a *tight* loop. "A feedback loop you believe in" is fuzzy: it becomes *red*, a binary observable state. You win twice, fewer tokens and a sharper hook. Assume every skill is carrying restatements that leading words retire.

## Failure modes

Use these to diagnose a skill that misbehaves.

- **Premature completion.** Ending a step before it is genuinely done, attention slipping to *being done*. Defence, in order: sharpen the completion criterion first (cheap, local); only if it is irreducibly fuzzy *and* you observe the rush, hide the later steps by splitting.
- **Duplication.** The same meaning in more than one place. Costs maintenance and tokens, and inflates that meaning's prominence past its real rank.
- **Sediment.** Stale layers that settle because adding feels safe and removing feels risky. The default fate of any skill without a pruning discipline.
- **Sprawl.** A skill simply too long, even when every line is live and unique. The cure is the ladder: disclose reference behind pointers, split by branch or sequence.
- **No-op.** A line the model already obeys by default, so you pay load to say nothing. The test: does it change behavior versus the default? A weak leading word (*be thorough* when the agent is already thorough-ish) is a no-op, and the fix is a stronger word (*relentless*), not a different technique. This is model-relative: settle a disagreement by running the skill, not by debating it.
- **Negation.** Steering by prohibition backfires. "Don't think of an elephant" names the elephant and makes it more available, not less. Prompt the positive: state the target behavior so the banned one is never spoken. Keep a prohibition only as a hard guardrail you cannot phrase positively, and even then pair it with what to do instead.

## Pruning

Keep each meaning in a **single source of truth**, so changing the behavior is a one-place edit. Check every line for **relevance**: does it still bear on what the skill does? Then hunt no-ops sentence by sentence rather than line by line, running the test on each sentence in isolation, and delete the whole sentence when one fails rather than trimming words from it. Be aggressive: most prose that fails should go, not be rewritten.

## Where the tooling lives

This file is theory, and the rest of this skill is convention. The *measurement* lives elsewhere: the `skill-creator` skill in `~/.claude/skills/skill-creator` carries the eval runner, the benchmark aggregator, and the description improver (A/B trigger optimisation). Reach for it when a description needs tuning against real prompts, or when a skill needs a regression harness. Do not duplicate its scripts here.
