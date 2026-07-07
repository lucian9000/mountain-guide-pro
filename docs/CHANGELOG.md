# SummitFit Adventures — Changelog

Version scheme: **semantic-ish releases** — `MAJOR.MINOR.PATCH`.

- **MAJOR** — a new feature phase (new subsystem, schema additions, new public pages)
- **MINOR** — features/improvements within the current phase
- **PATCH** — bug fixes, copy, styling tweaks

The version lives in `package.json` (`"version"`) — bump it in the same PR as
the feature, and add an entry here. Versions before 3.0.0 are reconstructed
retroactively; numbering starts for real at 3.0.0.

---

## Unreleased (v4.0 Phase 2) — Performance pass (2026-07-07)

Performance work per `docs/V4-PLAN.md` Phase 2 and the plan at
`docs/superpowers/plans/2026-07-07-v4-phase2-performance.md`. Same local
branch `v4/phase-1-a11y`; not yet pushed. No accessibility regression —
the Phase 1 axe gate still reports 0 serious/critical on all public pages.

- **Main JS chunk 648.7 KB → 257.9 KB (−60%, gzip 80 KB)** via
  `manualChunks`: `react-vendor` (157 KB) and `data-vendor`
  (Supabase + react-query, 261 KB) split out for long-term caching. The
  Leaflet `mapSetup` (155 KB) and new `ChatPanel` (16 KB) chunks stay
  lazy. Verified against a `vite preview` build, not just dev.
- **Fonts**: dropped the render-blocking CSS `@import` for a
  `preconnect` + `<link>` in the HTML head, and trimmed 10 → 7 weights
  (Montserrat 700/800/900, Inter 400/500/600/700).
- **Hero LCP**: `hero-mountain.webp` moved to `/public`, `<link
  rel="preload" as="image" fetchpriority="high">` in the head; it now
  loads as request #3 (before any JS), with `width`/`height` set.
- **Static images**: `scripts/optimize-images.mjs` (sharp, re-runnable)
  re-encoded the four route/expedition images at q75 and resized the
  1600px helderberg-dome to 1280px (−450 KB total); new 96px
  `logo-small.webp` for the 40–48px navbar/header logo (52 KB → 2.5 KB,
  now inlined). Route-detail heroes kept at 1280px so desktop stays crisp.
- **Deferred loads**: `loading="lazy"` on both Facebook page embeds (no
  facebook.com request until scrolled into view); the chat conversation
  UI split into a lazy `ChatPanel` (launcher stays eager). Note: chat
  conversation state now resets on close/reopen (panel unmounts).
- **Viewport units**: `min-h-screen` → `min-h-dvh` and `100vh` → `100dvh`
  site-wide so mobile browser chrome never hides content.
- **Removed dead code**: `recharts` (unused) + six unreferenced shadcn ui
  files (chart, carousel, command, drawer, input-otp, resizable).
- Tests: 23 → 24 (chat-panel split covered); `sharp` + `axe-core` added
  as devDependencies.
- Deferred: Supabase CMS-image `srcset` (bucket is empty — belongs with
  Phase 5 uploads); moderate `heading-order` on route detail (Phase 3).

## Unreleased (v4.0 Phase 1) — Accessibility pass (2026-07-07)

Audit-driven accessibility hardening per `docs/V4-PLAN.md` Phase 1 and the
`ui-ux-pro-max` skill checklist. Local branch `v4/phase-1-a11y`; version
bump deferred until the v4 ship vehicle is decided.

- 404 "Return to Home" link was invisible (dark-navy `primary` token on
  dark background, ~1.1:1) — now `accent` cyan; page gained a `main` landmark.
- ChatWidget: labeled launcher/close, 44px targets, `role="log"`
  + `aria-live="polite"` message log, all emoji replaced with Lucide icons.
- Booking: labels associated (`htmlFor`/`id`), 44px stepper, required
  indicators on Tour/Date, "Select a tour and date to continue" hint under
  the disabled submit.
- Navbar mobile menu: `inert` while closed (was tabbable-invisible), focus
  moves in on open, focus trap, focus returns to hamburger on close.
- Skip-to-content link on every route; `main#main` landmark on all public
  pages; /routes card headings h3 → h2.
- Contrast: removed all opacity-diluted `text-muted-foreground/40|60|70`
  from public surfaces (worst was ~2:1, now ≈6.5:1).
- `prefers-reduced-motion` now also disables `animate-fade-in-up`,
  `animate-bounce`, `animate-pulse`.
- 44px tap areas for "View Details", news links, lightbox arrows, hero
  scroll cue; lightbox dialog gained an sr-only title; gallery images have
  real descriptions instead of numbered filler.
- Tests: 1 → 23 (Vitest + RTL); axe-core gate added (0 serious/critical on
  all public pages, verified with Playwright + system Edge).
- Known deferred: one moderate axe `heading-order` on route detail
  (Phase 3 candidate); admin-area contrast sweep (Phase 5).

## v3.1.1 — What's New moves to /news (2026-07-06)

- Homepage no longer has a What's New section (spacing looked poor with an
  empty announcements column; FB/IG links already live at the page bottom).
- /news (nav → News) is now the What's New page: announcements up top
  (full-width, space reserved when empty), then the Facebook feed —
  centered, 900px tall. Facebook hard-caps its embed at 500px wide, so
  "full page" width is not possible; tall + centered is the max.
- Removed the now-unused WhatsNew homepage component.

## v3.1.0 — Client-friendly sign-in, Facebook in What's New, scroll fix (2026-07-06)

- **Google sign-in for clients requests only basic scopes** (email/profile) —
  no more "unverified app" warning or 100-user cap for normal users. The
  sensitive `calendar.readonly` scope moved to the admin dashboard's
  "Connect Google Calendar" button (`signInWithGoogle(..., { requestCalendar:
  true })`).
- **What's New** now pairs the announcements column (space reserved even
  when empty) with the live Facebook page feed (500px plugin, 600px tall).
  Bottom-of-page social section unchanged.
- **Scroll restoration fix**: SPA navigation now always starts pages at the
  top (`ScrollToTop` on pathname change). Browser back/forward still
  restores position natively.
- Verified end-to-end with Playwright driving system Edge (headless):
  What's New render, routes overview map + attribution, scroll behavior,
  route detail, news, booking pre-select, and the OAuth scope on the real
  Google redirect (`scope=email profile`). `playwright` added as a dev
  dependency for repeatable site drives.

## v3.0.1 — Photos + social section restored (2026-07-05)

- "Meet Ernest" section now uses the real portrait (`meet-ernest.webp`);
  West Peak / Hottentots Holland card and route fallback use
  `helderberg-dome.webp`. Both compressed to ≤1600px WebP q78
  (4.7 MB → 426 KB, 240 KB → 117 KB).
- Restored the Facebook + Instagram social section at the bottom of the
  homepage (it was removed with the What's New work in v2.0.0; the footer
  Facebook link stays too).

## v3.0.0 — Maps (2026-07-05)

Free map stack — no API keys, no billing, no paid services.

- **Stack**: Leaflet via `react-leaflet@4` (React 18 compatible), OpenTopoMap
  terrain tiles, Nominatim geocoding (admin-only), Google Maps *deep links*
  (plain URLs) for turn-by-turn directions.
- **Schema**: `routes` gains `latitude`, `longitude`, `map_zoom`,
  `meeting_latitude`, `meeting_longitude` (+ range CHECK constraints).
  Existing `content_versions` triggers cover the new columns automatically.
- **Public route detail** (`/routes/:slug`): "Location" section with trail
  marker (cyan dot) and optional meeting-point marker (gold diamond) whose
  popup carries the meeting text + "Get directions"; the same directions link
  also renders next to the meeting-point text. Section is omitted entirely
  when coordinates are null. Tap-to-interact overlay prevents scroll hijack.
- **Public routes listing** (`/routes`): overview map above the grid, one
  marker per published route with coordinates, popups with name/difficulty/
  price/link, auto-fit bounds, Cape Town fallback view.
- **Admin route editor**: map picker with draggable trail + meeting pins,
  "Find on map" Nominatim suggestion (admin must confirm/drag — machine
  guesses are never auto-saved), zoom persisted to `map_zoom`, clear buttons
  null the columns.
- **Performance**: all map components are code-split (`React.lazy`) so
  Leaflet JS/CSS loads only on pages that render a map; custom `divIcon`
  markers sidestep Leaflet's broken default-icon bundling entirely.
- Attribution on every map: `© OpenStreetMap contributors, SRTM |
  © OpenTopoMap (CC-BY-SA)`.
- Test coordinates seeded on the two `sample-*` draft routes only.

## v2.0.0 — Content platform (2026-07-05, retroactive)

- Data-driven routes (`routes`, `route_images`), What's New (`updates`),
  generic `price_items`, and `content_versions` audit/versioning with
  restore. RLS: public reads published-only; admin writes via `is_admin()`.
- Public `/routes`, `/routes/:slug` (gallery + lightbox, enquire →
  `/booking?tour=slug`), `/news`, homepage What's New (replaced the Facebook
  feed embed; footer gained a Facebook link).
- Admin Content area: Routes manager (full editor, image upload with
  client-side WebP compression, drag-reorder, cover, alt text, publish/
  schedule/hide, history + restore, draft preview), What's New manager,
  Site Prices manager.
- Supabase Storage bucket `route-images` (public objects, admin-only write).

## v1.0.0 — Foundation (2026-06/07, retroactive)

- Marketing SPA (Vite + React + shadcn/Tailwind) on Vercel.
- Supabase: Google SSO (PKCE), `profiles` with role-based admin, `pricing`,
  `specials`, `guides`, `bookings`; RLS throughout; `is_admin()` helper.
- Admin CRM portal (clients, pricing, specials, bookings, guides) and the
  booking flow. Google Calendar card on the admin dashboard via the OAuth
  `provider_token` (calendar.readonly scope).

---

## Recommendations going forward

1. **One entry per merged change** — add the changelog line in the same
   commit/PR as the code. If it isn't in the changelog, it didn't ship.
2. **Bump before deploy** — Vercel deploys from `main`; treat a version bump
   as the deploy marker. Tag releases in git (`git tag v3.1.0`) so a
   production issue maps straight to a diff.
3. **Schema changes always ship as Supabase migrations** (they already do) —
   name migrations after the version when practical, and note the migration
   name in the changelog entry.
4. **Candidate next features** (rough order of value):
   - Route GPX tracks: store an uploaded GPX per route, draw the trail
     polyline on the detail map (Leaflet supports this natively — still free).
   - Booking availability from Google Calendar (Phase-3 stub exists in
     `src/lib/google-calendar.ts` + `supabase/functions/`).
   - `new-client` marketing-sync edge function (stub written, needs a
     provider key + DB webhook).
   - What's New → Facebook auto-post (the `posted_to_facebook` /
     `facebook_post_id` columns are already reserved for it).
   - Supabase custom domain (`auth.summitfitadventures.com`) at launch so the
     Google consent screen shows your domain (paid add-on, ~$10/mo — the only
     item on this list that costs money).
5. **Before each release**: `npx tsc --noEmit && npm run lint && npm run
   build`, click through /routes, a route detail, /booking, and the admin
   editors, and run the Supabase security advisors after any migration.
