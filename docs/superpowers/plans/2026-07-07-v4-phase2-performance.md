# v4.0 Phase 2 — Performance (implementation plan)

**Spec:** `docs/V4-PLAN.md` Phase 2 (approved 2026-07-07). Continues on branch `v4/phase-1-a11y` (rename decision deferred; NO push ever — remote auto-deploys production).
**Baseline (recorded pre-phase):** main JS chunk 683 KB; Google Fonts via render-blocking CSS `@import` chain requesting 10 weights; expedition images 273–436 KB into ~224px cards; logo 53 KB rendered at 40–48px; FB iframes eager; ChatWidget in main chunk.
**Scope discovery:** `route-images` Supabase bucket is EMPTY (verified via storage API + browser probe — route pages fall back to static assets), so V4-PLAN's "CMS srcset" item is DEFERRED until real uploads exist (noted for Phase 5, where upload-time variant generation belongs anyway).
**TDD policy:** build config, asset files, and HTML head changes are TDD-exempt (config exception); behavior changes (ChatWidget lazy split) get RTL tests. Every task verified by fresh build output and/or a Playwright network probe. Test suite (23 green) must stay green each task.
**Facts for implementers:** Tailwind 3.4.17 (native `dvh` utilities available). Used font weights — Inter (`font-sans`): 400/500/600/700; Montserrat (`font-heading`): 700/800/900 (`font-black` used 28×; global h1–h4 rule sets 800). Playwright drives via system Edge `channel: "msedge"` (Chromium download broken on this machine); dev server `npm run dev` → :8080.

## Task 1 — Fonts: kill the @import chain, trim weights

**Files:** `index.html`, `src/index.css:1`

1. Remove the `@import url('https://fonts.googleapis.com/...')` line from index.css.
2. In index.html `<head>` (before the module script):
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap">
   ```
   (drops Montserrat 400/500/600 — unused; 7 weights total, was 10)
3. Verify: `npm run build`; Playwright probe records all font-related requests — no request chain deeper than HTML→css2→woff2; exactly ≤7 woff2 files; headings still render Montserrat (assert computed font-family on h1).
4. Commit: `perf(fonts): preconnect + link, trim to used weights (10→7)`.

## Task 2 — Hero LCP: preload + fetchpriority

**Files:** `index.html`, `src/components/Hero.tsx`, move `src/assets/hero-mountain.webp` → `public/hero-mountain.webp`

1. Move the file into public/ (stable URL enables preload from static HTML; it's the LCP on every first visit — cache-busting loss is acceptable, note it in the commit).
2. Hero.tsx: replace the asset import with `const heroImage = "/hero-mountain.webp";` — used by both `<img src>` and video `poster`. Add `fetchPriority="high"` + `width`/`height` (read real dimensions with `node -e` sharp/probe or from the file) + `decoding="async"` on the `<img>`.
3. index.html: `<link rel="preload" as="image" href="/hero-mountain.webp" fetchpriority="high">`.
4. Verify: build; Playwright network log on `/` shows hero-mountain.webp requested BEFORE the main JS chunk finishes (its request starts from the preload scanner); homepage renders identically (screenshot sanity check); reduced-motion still shows the image.
5. Commit: `perf(hero): preload LCP image, fetchpriority high`.

## Task 3 — Static image diet

**Files:** `src/assets/*.webp` (regenerate), consumers unchanged (same filenames), `package.json` (sharp devDep), `scripts/optimize-images.mjs` (new, committed for reuse)

1. `npm i -D sharp`. Write `scripts/optimize-images.mjs`: resize + re-encode WebP q75, longest edge per target:
   - `expedition-1/2/3.webp`, `helderberg-dome.webp` → 800px wide (display ~430px max at h-56 card, 2× DPR ≈ 860 — 800 is fine)
   - `meet-ernest.webp` → keep 1600 max but re-encode q75 if >100 KB output wins
   - `logo.webp` → NEW file `logo-small.webp` at 96px wide; keep original for OG/big uses
   - gallery-*.webp, guide-portrait.webp, hero-mountain (public/) → leave (already reasonable)
2. Run it; record before/after bytes per file (expect ~1.4 MB → ~250 KB total for the four big ones).
3. Update `Navbar.tsx` (and ChatWidget header if it uses logo) to import `logo-small.webp`.
4. Verify: build; visual spot-check expedition cards + navbar at 1× and 2× zoom (no visible quality loss at rendered size); suite green.
5. Commit: `perf(images): resize card images to display size, 96px navbar logo (-~1.2MB)`.

## Task 4 — Third-party + widget deferral

**Files:** `src/components/SocialFeed.tsx`, `src/pages/News.tsx`, `src/components/ChatWidget.tsx` (split), `src/pages/Index.tsx`, + RTL test updates

1. `loading="lazy"` on both Facebook iframes (SocialFeed ~L29-39, News ~L76-78).
2. ChatWidget split (TDD — extend existing ChatWidget.test.tsx first):
   - Keep a tiny always-eager launcher (`ChatLauncher` inside ChatWidget.tsx entry or a new thin `ChatWidget.tsx` exporting the launcher + `React.lazy(() => import("./ChatPanel"))` for the panel; move the existing conversation UI to `ChatPanel.tsx`).
   - Test: launcher renders immediately with its aria-label; panel content appears after click (async — `await screen.findByRole("log")`). Existing 6 chat tests must still pass (update imports/waits as needed, keep assertions).
   - Suspense fallback: null (launcher already gives feedback; panel loads in <100ms locally).
3. Verify: build output shows a separate chunk for the chat panel; homepage main chunk shrinks; FB iframe request does NOT fire on page load before scroll (Playwright: load `/` at 1280×900, capture requests for 3s, assert no facebook.com iframe request; then scroll to bottom and assert it fires).
4. Commit: `perf(defer): lazy FB embeds, code-split chat panel out of main chunk`.

## Task 5 — Bundle: vendor split + dead weight

**Files:** `vite.config.ts`, `package.json`, delete `src/components/ui/chart.tsx`

1. Confirm `recharts` unreferenced except ui/chart.tsx (grep); delete chart.tsx, `npm rm recharts`.
2. `build.rollupOptions.output.manualChunks`: `react-vendor` (react, react-dom, react-router-dom), `data-vendor` (@tanstack/react-query, @supabase/supabase-js), rest stays default (leaflet already lazy-chunked — do NOT disturb the existing map splitting).
3. Verify: fresh build; list dist/assets sizes; app main chunk target <400 KB (record actual); `npm test` green; quick Playwright smoke: `/`, `/routes`, `/booking` render without console errors (filter known FB noise).
4. Commit: `perf(bundle): vendor manualChunks, drop unused recharts (+chart.tsx)`.

## Task 6 — Viewport units sweep

**Files:** all public `min-h-screen` usages (RoutesIndex, RouteDetail, Login, NotFound, News, Booking, dashboard pages), `ChatWidget`/panel `max-h-[calc(100vh-...)]`, `ErrorBoundary.tsx` inline `100vh`

1. Tailwind 3.4 native: `min-h-screen` → `min-h-dvh`; `max-h-[calc(100vh-4rem)]` → `max-h-[calc(100dvh-4rem)]`; ErrorBoundary inline style → `100dvh`.
2. Hero already uses `h-[100svh]` — leave it.
3. Grep gate: no `min-h-screen` left in src/ (admin included — mechanical and safe); no bare `100vh` outside comments.
4. Verify: suite green; 375px Playwright screenshot of `/booking` and open chat panel — input row fully visible.
5. Commit: `perf(viewport): dvh units so mobile browser chrome never hides content`.

## Task 7 — Gate + changelog

1. Fresh `npm run build`: record full dist/assets table (before/after deltas vs baseline 683 KB).
2. Playwright performance probe on `/` (mobile 375px, dev-server caveat noted): font request chain ≤2 hops, hero preload fires, no FB request pre-scroll, no console errors (excluding known FB debugjs noise when scrolled).
3. Full `npm test` + the Phase 1 a11y gate script re-run (axe must stay at 0 serious/critical — perf changes must not regress a11y).
4. CHANGELOG entry under the Unreleased v4.0 heading (Phase 2 section with measured numbers).
5. Commit: `perf(gate): phase 2 evidence + changelog`.

**Definition of done:** all commits local on the branch; main app chunk <400 KB (or measured best + explanation); ≥1 MB static asset savings; fonts ≤7 woff2 via preconnect; FB lazy; chat panel split; dvh everywhere; 23+ tests green; axe still clean.
