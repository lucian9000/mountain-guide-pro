# v4.0 Phase 1 — Accessibility & Interaction (implementation plan)

**Spec:** `docs/V4-PLAN.md` Phase 1 (approved 2026-07-07). Audit evidence: 3-reviewer `ui-ux-pro-max` pass.
**Branch:** `v4/phase-1-a11y` — local only, NO push (remote auto-deploys to production via Vercel).
**Test commands:** `npm test` (vitest run) · `npx vitest run <file>` for one file · Playwright drive per repo `verify` skill.
**TDD:** every behavior change gets a failing RTL test first. Pure styling/class changes (contrast, sizing) are TDD-exempt (config/styling exception) — verified instead by rendered-output assertions where cheap, and the Task 9 axe/Playwright gate.
**Commit per task, locally.** Message format: `a11y(<area>): <change>`.

---

## Task 0 — Branch + baseline evidence

1. `git checkout -b v4/phase-1-a11y`
2. `npm test` — record passing baseline (currently only `src/test/example.test.ts`).
3. `npm run build` — confirm clean build before any change.

## Task 1 — NotFound: visible home link

**File:** `src/pages/NotFound.tsx:16`
**Bug:** `text-primary` = dark navy on `bg-muted` (~1.1:1) — link invisible.

1. Test first (`src/test/pages/NotFound.test.tsx`): render `<NotFound />` in a MemoryRouter; assert the "Return to Home" link exists and its className includes `text-accent` (and NOT `text-primary`). Watch it fail.
2. Fix: `text-primary hover:text-primary/90` → `text-accent hover:text-cyan-hover underline underline-offset-4` (keep `underline`).
3. `npx vitest run src/test/pages/NotFound.test.tsx` — green. Commit.

## Task 2 — ChatWidget rehab (worst offender, 6 findings)

**File:** `src/components/ChatWidget.tsx`

1. Tests first (`src/test/components/ChatWidget.test.tsx`), all failing before the fix:
   - launcher button has accessible name (e.g. "Open chat") — L131 area
   - after open, close button has accessible name "Close chat"
   - the message list container has `role="log"` and `aria-live="polite"`
   - no text node in rendered quick-reply buttons matches emoji regex `/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u`
2. Implement:
   - L131 launcher: `aria-label="Open chat"`; keep 56px size.
   - L154 close: wrap `<X>` in the button with `p-3 -m-1` → ≥44px hit area, `aria-label="Close chat"`.
   - Message log wrapper: `role="log" aria-live="polite"`.
   - Replace emoji with Lucide (already imported set): 📱→`MessageCircle`/`Phone`, 🏔→`Mountain`, 💪→`Dumbbell`, 📍→`MapPin`, ⏱→`Clock`, ⛰→`TrendingUp`, ⛅→`CloudSun`. Size `w-4 h-4`, `text-accent`, `aria-hidden`.
   - Option buttons L255-269 and CTA buttons L181/218/277: `py-1.5`/`py-2` → `py-3` (≥44px).
3. Full file test green. Visual check in dev server (look must not change materially: same colors, same layout, icons swap only). Commit.

## Task 3 — Booking form accessibility

**File:** `src/pages/Booking.tsx`

1. Tests first (`src/test/pages/Booking.test.tsx`, mock supabase/auth context as existing tests do — if no pattern exists, render with providers stubbed):
   - every visible label is associated: `getByLabelText(/tour/i)`, `/date/i`, `/participants/i` resolve
   - stepper buttons ("Fewer participants"/"More participants") have `h-11 w-11` classes
   - Tour + Date labels render a required indicator (`*` with `aria-hidden` + sr-only "required")
2. Implement:
   - L184/203/231/262/282: add `htmlFor` + matching `id` on each control (shadcn `SelectTrigger`, date button, stepper input all accept `id`).
   - L288/298: `w-9 h-9` → `w-11 h-11`.
   - Required indicator component on Tour/Date labels.
   - Below the disabled submit (L317-331): when disabled because fields missing, render helper text "Select a tour and date to continue" (`text-muted-foreground`, not opacity-diluted).
3. Green. Commit.

## Task 4 — Navbar mobile menu: inert when closed, focus when open

**File:** `src/components/Navbar.tsx` (overlay L143-149)

1. Tests first (`src/test/components/Navbar.test.tsx`):
   - closed: overlay root has `inert` attribute (links unreachable)
   - open (click hamburger): overlay loses `inert`; first focusable element inside receives focus
2. Implement:
   - Add `inert={!open ? "" : undefined}` (React 18: pass as lowercase attr) alongside existing classes; keep the opacity transition.
   - On open: `useEffect` focuses first menu link; on close: return focus to hamburger. Keep existing Escape handler + scroll lock.
   - Simple focus trap: on Tab from last item wrap to first (or use existing Radix `FocusScope` if already in deps — check `@radix-ui/react-focus-scope` availability first).
3. Green + manual keyboard check in dev server. Commit.

## Task 5 — Skip link, main landmark, heading order

**Files:** `src/App.tsx`, `src/pages/Index.tsx`, `src/pages/RoutesIndex.tsx`, `src/components/routes/RouteCard.tsx`

1. Tests first:
   - App renders an anchor "Skip to content" as first focusable, href `#main`
   - Index wraps sections in `<main id="main">`
   - RouteCard title renders as `h2` (RoutesIndex page: h1 → h2, no skip)
2. Implement:
   - Skip link in `App.tsx` before routes: visually hidden until focused (`sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-accent focus:text-accent-foreground focus:px-4 focus:py-2`).
   - `<main id="main">` on Index (and check RoutesIndex/News/RouteDetail/Booking have a main landmark — add where missing).
   - RouteCard `h3` → `h2` (visual size unchanged — keep classes).
3. Green. Commit.

## Task 6 — Contrast sweep (opacity-diluted text)

**Files/lines:** `Footer.tsx:75` (`/40`), `Booking.tsx:253` + `RouteDetail.tsx:292` (`/60`), `UpdateCard.tsx:31` + `Login.tsx:116` (`/70`)

1. TDD-exempt (styling). Change all `text-muted-foreground/40|60|70` → `text-muted-foreground` (≈6.5:1 verified in audit). Where visual softness matters (footer copyright), acceptable alternative: keep full token but drop font-size no lower than `text-xs`.
2. Grep gate: `grep -rn "muted-foreground/" src/` → zero hits in public components (admin allowed this phase).
3. Visual check: footer/booking/news pages still look right in dev. Commit.

## Task 7 — Remaining small targets + lightbox title + alt text

**Files:** `Expeditions.tsx:73` ("View Details →"), `RouteDetail.tsx:301-333` (lightbox), `Gallery.tsx:64` (alt), `Hero.tsx:89-95` (scroll chevron)

1. Tests where behavioral: lightbox `DialogContent` renders an sr-only `DialogTitle` (route name + "photo gallery").
2. Implement:
   - "View Details →" and UpdateCard link: add `py-3 -my-3` (44px hit area, no visual shift); replace text `→` with `<ArrowRight className="w-4 h-4" aria-hidden>` inline.
   - Lightbox prev/next: `p-2` → `p-3`.
   - Gallery alt: use the real captions from the images data if present; else describe (`"Hikers on <route>"` style array).
   - Hero chevron: wrap in a 44px button with `aria-label="Scroll to routes"`; add it to the reduced-motion block (see Task 8).
3. Green. Commit.

## Task 8 — Reduced-motion completeness (pulled forward from Phase 3, 5 lines)

**File:** `src/index.css:188-201`
Add `.animate-fade-in-up`, `.animate-bounce` (and any `animate-pulse` glow) to the `prefers-reduced-motion` block. TDD-exempt. Verify with DevTools emulation. Commit.

## Task 9 — Gate: axe + keyboard drive (verification-before-completion)

1. Playwright script (scratch, not committed): for each of `/`, `/routes`, `/routes/<sample-slug>`, `/news`, `/booking`, `/404-nonsense` inject `axe-core` (`npm i -D axe-core` if absent) and assert zero serious/critical violations.
2. Keyboard-only drive: tab through home nav → open mobile menu (375px viewport) → open chat → booking form. Record results.
3. `npm test` full suite + `npm run build` — all green, fresh output pasted into the task log.
4. Update `docs/CHANGELOG.md` (v3.2.0 entry: accessibility pass) — version bump deferred until we decide ship vehicle.
5. Final local commit. **Do NOT push.**

---

**Definition of done:** all 9 tasks committed locally on `v4/phase-1-a11y`; axe clean; suite green; visual spot-check confirms the look is unchanged except: Lucide icons in chat (was emoji), visible-on-focus skip link, slightly larger tap targets, footer copyright at full muted token.
