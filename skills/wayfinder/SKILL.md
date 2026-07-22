---
name: wayfinder
description: "Charts work too big for one agent session as a map of decision tickets on the issue tracker, then resolves them one at a time until the way to the destination is clear."
disable-model-invocation: true

metadata:
  version: "0.1.0"
---

# Wayfinder

A loose idea has arrived, too big for one agent session and wrapped in fog: the way from here to the **destination** is not visible yet. Wayfinding is about finding that way, not charging at the destination. This skill charts the way as a **shared map** on the issue tracker, then works its **decision tickets** (questions whose resolution is a decision, not slices of a build to execute) one at a time until the route is clear.

The destination varies per effort, and naming it is the first act of charting, because it shapes every ticket. It might be a spec to hand off, a decision to lock before planning starts, or a change made in place such as a data-structure migration. The map is domain-agnostic.

## Plan, don't do

Wayfinder is **planning** by default: each ticket resolves a decision, and the map is done when nothing is left to decide before someone goes and does the thing. The pull to just do the work is usually the signal you have reached the edge of the map and it is time to hand off to `/plan` or `/build`. An effort can override this in its **Notes**, carrying execution into the map itself, but absent that, produce decisions, not deliverables.

## Refer by name

Every map and ticket is an issue, so it has a **name**: its title. In everything the human reads, refer to it by that name, never by a bare id, number, or slug. A wall of `RED-42, RED-43, RED-44` is illegible; names read at a glance. The id and URL do not vanish, they ride inside the name as its link.

## Where the map lives

**Linear (default).** Load the `/linear-cli` skill and run `linearis usage` to discover the current commands. Do not guess flags. The map is one issue labelled `wayfinder:map`; tickets are its sub-issues; blocking uses Linear's native blocking relation so the frontier renders in Linear's own UI.

**Local fallback.** Where the effort has no Linear project, write the map to `.mzyx/wayfinder/<slug>/map.md` and each ticket to `.mzyx/wayfinder/<slug>/tickets/<NN>-<slug>.md`, with blocking expressed as a "Blocked by" list of ticket numbers.

## The map

The map is the canonical artifact: an **index**, not a store. It lists the decisions made and points at the tickets holding their detail. A decision lives in exactly one place, its ticket, so the map never restates it, only gists it and links.

The body is the whole map at low resolution, loaded once per session. Open tickets are not listed; they are open children, found by query.

```markdown
## Destination

What reaching the end of this map looks like: the spec, decision, or change this
effort is finding its way to. One or two lines. Every session orients to it
before choosing a ticket.

## Notes

Domain; skills every session should consult; standing preferences for this effort.

## Decisions so far

- [<closed ticket title>](link) - one-line gist of the answer

## Not yet specified

In-scope fog you cannot ticket yet. Graduates as the frontier advances.

## Out of scope

Work ruled beyond the destination. Closed, never graduates.
```

### Tickets

Each ticket is a child of the map. Its body is the question, sized to one agent session:

```markdown
## Question

The decision or investigation this ticket resolves.
```

Each ticket carries a `wayfinder:<type>` label. A session **claims** a ticket by assigning it to the driver *first*, before any work, so concurrent sessions skip it. That assignee is the claim: an open, unassigned ticket is unclaimed.

A ticket is **unblocked** when every ticket blocking it is closed. The **frontier** is the open, unblocked, unclaimed children: the edge of the known.

The answer is not part of the body. It is recorded on resolution. Assets created while resolving a ticket are linked from the ticket, not pasted in.

## Ticket types

Every ticket is either **HITL** (human in the loop, worked *with* a human who speaks for themselves) or **AFK** (driven by the agent alone). A HITL ticket only resolves through that live exchange, and the agent never stands in for the human's side of it. A grilling agent that answers its own questions has broken this.

- **research** (AFK): reading documentation, third-party APIs, or local knowledge to surface a fact a decision waits on. Resolved by a `learn` subagent, or `read` for a single source. Use when knowledge outside the working directory is required.
- **prototype** (HITL): raise the fidelity of the discussion with a cheap, rough, concrete artifact to react to. Runs the `prototype` skill and links the result. Use when "how should it look" or "how should it behave" is the question.
- **grilling** (HITL): conversation via the `grilling` skill, one question at a time. The default case.
- **task** (HITL or AFK): manual work that must happen before a *decision* can be made. Signing up for a service so its API can be judged, provisioning access, moving data so its shape can be seen. The one type that does rather than decides, and it earns its place by unblocking a decision, not by delivering the destination. The agent drives it alone where it can, otherwise it hands the human a precise checklist. The answer records what was done plus any facts later tickets depend on.

## Fog of war

The map is *deliberately* incomplete: do not chart what you cannot yet see. Beyond the live tickets lies the **fog of war**, the dim view of decisions you can tell are coming but cannot yet pin down, because they hang on questions still open. Resolving a ticket clears the fog ahead of it, graduating whatever is now specifiable into fresh tickets, one at a time, until the way to the destination is clear and no tickets remain.

The map's **Not yet specified** section is where that dim view is written down: the suspected question, the area to revisit. Everything there is in scope, just not sharp enough to ticket.

**Fog or ticket?** The test is whether you can state the question precisely now, *not* whether you can answer it now. Ticket when the question is already sharp, even if it is blocked. Leave it in Not yet specified when you cannot phrase it that sharply, and do not pre-slice fog into ticket-sized pieces: one patch may graduate into several tickets, or none.

## Out of scope

Fog only gathers *toward* the destination. The destination fixes the scope, so work beyond it is **out of scope**: it is not fog, and it does not belong in Not yet specified. Ruling something out of scope is a scoping act, not a step on the route. When an existing ticket turns out to sit past the destination, close it (a closed ticket is unambiguously off the frontier) and leave one line in **Out of scope**: the gist, why it is out, and a link to the closed ticket. It stays out of Decisions so far, which records the route actually walked.

Out-of-scope work never graduates. It returns only if the destination is redrawn, and then as a fresh effort.

## Invocation

Two modes. Either way, **never resolve more than one ticket per session**, with the exception of research tickets.

### Chart the map

The user invokes with a loose idea.

1. **Name the destination.** Run `grilling` to pin down what this map is finding its way to. The destination fixes the scope, so it is settled first.
2. **Map the frontier.** Grill again, **breadth-first** this time: fan out across the whole space rather than deep on any one thread, surfacing the open decisions and the first steps takeable now. If this surfaces no fog, the way is already clear and the journey fits one session: stop, say so, and ask how the user wants to proceed.
3. **Create the map** labelled `wayfinder:map`, with Destination and Notes filled in, Decisions so far empty, and the fog sketched into Not yet specified.
4. **Create the tickets you can specify now** as children of the map, then wire blocking edges in a **second pass**, because issues need ids before they can reference each other. Wiring sorts them into the frontier and the blocked; everything you cannot yet specify stays in the fog.
5. **Fire the research subagents.** For each research ticket just created, dispatch a `learn` subagent to resolve it in parallel and record its findings against the ticket.
6. Stop. Charting is one session's work and hand-resolves nothing.

### Work through the map

The user invokes with a map. A ticket is optional: without one, you pick the next decision, not the user.

1. Load the **map**, the low-resolution view, not every ticket body.
2. Choose the ticket. If the user named one, use it. Otherwise take the first frontier ticket in order. **Claim it** by assigning it to yourself before any work.
3. Resolve it, zooming as needed: fetch the full body of any related or closed ticket on demand, and invoke the skills the Notes block names. When in doubt, run `grilling`.
4. Record the resolution: post the answer as a resolution comment, close the ticket, and append a one-line gist plus link to the map's Decisions so far.
5. Add newly surfaced tickets (create, then wire), and graduate any fog the answer made specifiable, clearing each graduated patch from Not yet specified so it lives only as its new ticket. If the answer reveals that a ticket sits beyond the destination, rule it out of scope rather than resolving it. If the decision invalidates other parts of the map, update or delete those tickets.

The user may run unblocked tickets in parallel, so expect other sessions to be editing the tracker concurrently.
