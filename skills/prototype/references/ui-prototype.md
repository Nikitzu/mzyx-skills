# UI Prototype

Generate **several radically different UI variations** on a single route, switchable from a floating bottom bar. The user flips between variants in the browser, picks one (or steals bits from each), then throws the rest away.

If the question is about logic or state rather than appearance, wrong branch. Use `logic-prototype.md`.

## When this is the right shape

- "What should this page look like?"
- "I want to see a few options for this dashboard before committing."
- "Try a different layout for the settings screen."
- Any time the user would otherwise spend a day picking between three vague mockups in their head.

## Two sub-shapes, strongly prefer A

A UI prototype is much easier to judge when it butts up against the rest of the app: real header, real sidebar, real data, real density. A throwaway route on its own is a vacuum where every variant looks fine.

**Sub-shape A, adjustment to an existing page (preferred).** The route already exists. Variants render on the same route, gated by a `?variant=` URL search param. Existing data fetching, params, and auth all stay; only the rendering swaps. Something that has no page yet but would naturally live inside one (a new dashboard section, a new card on the settings screen, a new step in an existing flow) is still sub-shape A: mount the variants inside the host page.

**Sub-shape B, a new page (last resort).** Only when the thing being prototyped genuinely has no existing page to live inside, such as an entirely new top-level surface. Create a throwaway route following the project's existing routing convention, named so it is obviously a prototype, with the same `?variant=` pattern. Before committing to B, sanity-check that there really is no existing page to embed in. An empty route hides design problems that a populated one exposes.

The floating bottom bar is identical in both.

## Process

### 1. State the question and pick N

Default to **3 variants**. Past 5 they stop being radically different and start being noise, so cap there. Write the plan in one line, in the prototype's location or a top-of-file comment: "Three variants of the settings page, switchable via `?variant=`, on the existing `/settings` route."

### 2. Generate radically different variants

Hold each variant to the page's purpose and the data it can access, to the project's component library and styling system, and to a clear exported component name (`VariantA`, `VariantB`, `VariantC`).

Variants must be **structurally different**: different layout, different information hierarchy, different primary affordance, not merely different colors. Three slightly tweaked card grids is wallpaper, not a prototype. If two drafts come out similar, redo one with an explicit constraint against the shape they share.

### 3. Wire them together

Create a single switcher on the route: read the variant key from the search param, render the matching variant component, and render the switcher alongside it. For sub-shape A, keep all existing data fetching above the switcher so only the rendered subtree changes per variant. For sub-shape B, the throwaway route mounts the same switcher.

### 4. Build the floating switcher

A small fixed-position bar at the bottom-centre with three pieces: a left arrow cycling to the previous variant (wrapping), a label showing the current variant key plus its name if it exports one (`B, sidebar layout`), and a right arrow cycling forward (wrapping).

Behavior:

- Clicking an arrow updates the URL search param through the framework's router, so the variant is shareable and survives reload.
- Left and right arrow keys also cycle, except when an `input`, `textarea`, or `contenteditable` element has focus.
- Visually distinct from the page (high-contrast pill, subtle shadow) so it is obviously not part of the design under evaluation.
- Hidden in production builds, gated on an environment check, so a stray prototype merge cannot ship the bar to users.

Put the switcher in one shared component so both sub-shapes reuse it.

### 5. Hand it over

Surface the URL and the variant keys. The most useful feedback is usually "I want the header from B with the sidebar from C", which is the actual design they want.

### 6. Capture the answer and clean up

Once a variant wins, capture the answer (which variant, and why), then capture the prototype the way `SKILL.md` describes. For sub-shape A, fold the winner into the existing page and drop the losing variants and the switcher from main. For sub-shape B, promote the winning variant to a real route and drop the throwaway route and switcher from main. The full set of variants is the primary source, so it lands on the throwaway branch. Variant components left in main rot fast and confuse the next reader.

## Anti-patterns

- **Variants that differ only in color or copy.** That is a tweak. Real variants disagree about structure.
- **Sharing too much code between variants.** A shared header is fine; a shared layout defeats the point. Each variant should be free to throw out the layout.
- **Wiring variants to real mutations.** Read-only prototypes are fine. Point a variant that needs to mutate at a stub: the question is what it should look like, not whether the backend works.
- **Promoting the prototype straight to production.** The variant code was written under prototype constraints (no tests, minimal error handling). Rewrite it properly when folding it in.
