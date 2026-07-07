# v4.0 Phase 3 — Design-system discipline (implementation plan)

**Spec:** `docs/V4-PLAN.md` Phase 3. Same branch `v4/phase-1-a11y`; NEVER push. No Co-Authored-By trailers.
**Identity to PRESERVE:** dark midnight-blue + cyan accent + gold, Montserrat uppercase headings. This phase tightens consistency & snappiness — NOT a redesign. Look should feel the same, just cleaner and quicker.
**Recon (verified):** 52 `hsl()` literals in TSX (26× `hsl(193,100%,42%)` = cyan-hover, 5× `hsl(193,100%,70%)` = cyan-soft, ~9 misc); 52 `transition-all`; 14 `duration-500/700`; 8 `text-[10px]/[11px]`. Tokens `--cyan-hover`/`--cyan-soft` exist in index.css:42-43 but are NOT mapped in tailwind.config.ts (only `cyan`=cyan-glow is). Three headers: Navbar (Index only, transparent-over-hero, section-scroll links + full nav), PublicHeader (RoutesIndex/News/RouteDetail, always-solid, only Routes/News), BookingHeader (inline in Booking.tsx, no nav).
**Verify:** `npm test` (24 green) each task; `npm run build` clean; dev server :8080; Playwright via system Edge; Phase-1 `a11y-gate.cjs` must stay 0 serious/critical at the end.

## Task 1 — Semantic color tokens (kill hsl literals)

**Files:** `tailwind.config.ts`, then all TSX with `hsl(` literals.
1. In tailwind.config.ts extend `colors`: `"cyan-hover": "hsl(var(--cyan-hover))"`, `"cyan-soft": "hsl(var(--cyan-soft))"`. (Keep existing `cyan`.)
2. Replace `bg-[hsl(193,100%,42%)]`→`bg-cyan-hover`, `text-[hsl(193,100%,70%)]`→`text-cyan-soft`, `hover:` variants likewise, across all files (26+5 occurrences).
3. The ~9 misc literals (`hsl(207 75% 10%)` etc. — mostly in map/leaflet inline styles or gradients): map each to its existing token (`--midnight-deep`, `--foreground`, etc.) via the mapped Tailwind color, OR if it's a JS inline style (not a className) that needs a raw value, leave it but add a `// token: --xxx` comment. Report which were converted vs left and why.
4. **Grep gate:** `grep -rn "hsl(" src/ --include=*.tsx | grep -v "// token:"` → zero className literals. Document any intentional survivors.
5. Verify build + suite. Commit: `style(tokens): map cyan-hover/soft, replace hsl() literals with semantic classes`.

## Task 2 — Motion timing

**Files:** all TSX with `duration-500`/`duration-700` and `transition-all`.
1. Card/hover micro-interactions `duration-500`/`duration-700` → `duration-300` (keep genuinely-slow intentional ones ONLY if clearly deliberate — e.g. hero cinematic; report any kept).
2. Replace `transition-all` with the narrowest that works per element: `transition-colors` (color/bg/border hovers), `transition-transform` (scale/translate), or `transition-[transform,opacity]`/`transition` where both. Do NOT change durations that are already 150–300ms except the 500/700 ones above.
3. The Navbar nav-underline animates `width` (`after:w-0`→`hover:after:w-full`) — leave for now (works, low priority; noted for possible transform-based rewrite later) OR convert to `scale-x` if trivial without visual regression — report choice.
4. Verify build + suite; Playwright screenshot `/` hover states unchanged in feel (spot check). Commit: `style(motion): 300ms hovers, scope transition-all to colors/transform`.

## Task 3 — Type scale

**Files:** TSX with `text-[10px]`/`text-[11px]`; `src/pages/RouteDetail.tsx` body copy.
1. `text-[10px]`/`text-[11px]` → `text-xs` (12px floor). Check each isn't a tightly-fitted badge that overflows at 12px — if it is, note it and keep but flag.
2. RouteDetail description body `text-sm` → `text-base` on mobile (`text-base md:text-sm` only if desktop genuinely needs smaller — prefer `text-base` throughout for reading copy).
3. Verify build + suite; screenshot RouteDetail + a stat-label area. Commit: `style(type): 12px min labels, 16px route description body`.

## Task 4 — Focus rings + DifficultyBadge tokens

**Files:** `src/components/routes/DifficultyBadge.tsx`; hand-rolled CTAs (Hero, CTASection, Expeditions, Navbar/PublicHeader Book Now, etc.).
1. DifficultyBadge: replace raw `emerald`/`amber`/`red` palette classes with semantic tokens where they exist (`--success` for easy; for moderate/hard use `--warning`/`--destructive` or keep a documented difficulty scale in index.css if no token fits — add `--difficulty-*` tokens if cleaner). Report the mapping; the badge colors should look ~the same.
2. Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background` to hand-rolled interactive CTAs that only have `hover:` today (match the shadcn button pattern already in ui/button.tsx). Do not touch shadcn components (already handled).
3. Verify build + suite; Playwright: Tab to a hero CTA, assert a visible focus ring (computed outline/box-shadow changes). Commit: `style(a11y): focus-visible rings on custom CTAs, DifficultyBadge semantic tokens`.

## Task 5 — Unify headers into SiteHeader (the judgment task, TDD)

**New:** `src/components/SiteHeader.tsx`. **Edit:** Index.tsx, RoutesIndex.tsx, News.tsx, RouteDetail.tsx, Booking.tsx. **Delete:** Navbar.tsx, PublicHeader.tsx, BookingHeader (inline). Keep the Phase-1 mobile-menu a11y (inert, focus trap, Escape, scroll lock) — port it verbatim.
1. **Design:** `<SiteHeader variant="overlay" | "solid" onOpenChat?>`.
   - `overlay` (Index only): transparent at top, solid on scroll (port Navbar's isScrolled), fixed; section links scroll in-page.
   - `solid` (all subpages): always solid, sticky; section links navigate to `/#<section>` (home + scroll). Book Now always visible (fix the `hidden sm:` clipping). No onOpenChat on subpages (or route to /booking).
   - Full NAV_ITEMS everywhere: Routes, News, The Guide(#about), Training(#fitness), Contact(#contact) → **fixes unreachable-from-subpage bug.**
   - Section navigation from a subpage: `Link to={"/#about"}`; add a small hash-scroll effect on Index (on mount, if `location.hash`, scrollIntoView the id) so `/#about` lands correctly. Verify Index doesn't already do this.
2. **TDD** (`src/test/components/SiteHeader.test.tsx`): (a) solid variant renders all 5 nav items incl. Training/Contact + a visible Book Now (not `hidden`); (b) on a subpage, section item is an anchor to `/#fitness` (not a scroll button); (c) overlay variant starts transparent (no solid bg class) then gains it after a scroll event; (d) mobile menu still `inert` when closed. Port existing Navbar.test.tsx assertions into the new component's tests; delete the old test file. Red first.
3. Wire pages; delete old components + BookingHeader; grep for stale imports.
4. Verify: suite green; tsc no new errors; build; `a11y-gate.cjs` full run (skip link, inert, focus — must still pass); Playwright: from `/routes` click "Training" → lands on `/` scrolled to #fitness; screenshots of header on Index (top + scrolled) and a subpage — visually consistent, identity preserved.
5. Commit: `refactor(header): unify Navbar/PublicHeader/BookingHeader into one SiteHeader`.

## Task 6 — Gate + changelog

1. `npm run build` clean; `npm test` green; `a11y-gate.cjs` 0 serious/critical (re-run 2× for the known map-attribution flake).
2. Grep gates: zero `hsl(` classNames, zero `transition-all`, zero `text-[1[01]px]`, one header component.
3. Before/after Playwright screenshots (Index top+scrolled, RoutesIndex, RouteDetail, Booking) saved to scratchpad — eyeball that the dark/cyan identity is intact.
4. CHANGELOG entry under Unreleased v4.0 (Phase 3 section).
5. Commit: `style(gate): phase 3 evidence + changelog`.

**Done when:** grep gates clean; one SiteHeader with full nav on every page + always-visible Book Now; hovers 300ms; 12px type floor; focus rings on CTAs; 24+ tests green; axe still 0 serious/critical; identity visually preserved.
