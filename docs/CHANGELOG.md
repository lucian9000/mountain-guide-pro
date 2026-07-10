# SummitFit Adventures — Changelog

Version scheme: **semantic-ish releases** — `MAJOR.MINOR.PATCH`.

- **MAJOR** — a new feature phase (new subsystem, schema additions, new public pages)
- **MINOR** — features/improvements within the current phase
- **PATCH** — bug fixes, copy, styling tweaks

The version lives in `package.json` (`"version"`) — bump it in the same PR as
the feature, and add an entry here. Versions before 3.0.0 are reconstructed
retroactively; numbering starts for real at 3.0.0.

---

## Unreleased — Google OAuth + favicon fixes (2026-07-10)

- **Added a static `/privacy` page** (`src/pages/Privacy.tsx`), required by
  Google's OAuth verification review — it flagged that the consent
  screen's homepage and privacy policy URLs pointed to the same page.
  Linked from the footer. See `docs/Google OAuth Privacy Policy Page.md`.
- **Google OAuth SSO "unverified app" warning resolved.** Added the Privacy
  Policy link to the OAuth consent screen and promoted publishing status
  from Testing to Production, removing the blocking warning for admin
  Google sign-in. See `docs/Google OAuth SSO Warning Fix.md`.
- **Google Search favicon fix.** Google's crawler requires favicon
  dimensions to be a multiple of 48px; resized `public/favicon.png` from
  512x512 to 192x192 and updated `index.html`, then requested re-indexing
  in Search Console. See `docs/Google Search Favicon Fix.md`.

## Unreleased (v4.0 Phase 5b) — Booking go-live + UI polish (2026-07-09)

Booking backend is now **live end-to-end**. The Google-side setup from the
runbook was completed and verified; see `docs/PHASE5B-SETUP.md` for the
replicable step map.

- **calendar-sync now lands bookings as `pending`, not `confirmed`** (v6). No
  payment gate exists yet, so every newly-synced calendar booking is held as
  `pending` for manual review; the admin flips it to `confirmed` in the CRM
  once payment is received out-of-band. Sync ticks only ever propagate a
  Google-side *cancellation* — they never overwrite a manual confirm — and a
  client reschedule keeps date/time current without touching status.
- **calendar-sync now fires `booking-email`** for each newly-inserted booking
  (client "request received" + admin alert to booking@summitfitadventures.com),
  authenticated server-to-server via the shared `x-cron-secret`.
- **Go-live completed & verified** (via `net.http_post` from SQL): pg_cron +
  pg_net enabled; cron job `calendar-sync-job` runs every 10 min; Google
  Calendar API enabled; booking calendar shared with the service account;
  `calendar-sync` returns `{ ok: true }` reading 228 calendar events. Emails
  confirmed sending.
- **Booking calendar embed fixes:** forced a white iframe background (Google's
  widget has transparent regions that bled the dark theme through, making its
  text unreadable); widened the booking column to `max-w-3xl` so Google renders
  its compact **side-by-side** month + time-slot layout (time slots now show
  beside the chosen date instead of hidden below an internal scroll); collapsed
  the tour/guide pickers into a one-line summary once a tour is chosen.
- **Console cleanup (production-affecting):** lowercase `fetchpriority` on the
  hero image (React 18 didn't recognise the camelCase prop); removed the
  cross-page hero preload (it wasted ~160KB on non-home routes); opted into
  React Router v7 future flags. `/`, `/booking`, `/routes` now log zero
  warnings/errors (remaining `/news` console noise is Facebook's own embed SDK).
- **/news** — Facebook feed no longer floats in dead space: a "Follow the
  Adventure" sidebar (Instagram/Facebook/WhatsApp + Book a tour) fills the
  column beside the 500px-capped feed.

## Unreleased (v4.0 Phase 5b) — Booking backend + SSO fix (2026-07-08)

- **Fixed: first Google sign-in bounced back signed-out.** AuthCallback bailed
  to /login while the PKCE code exchange was still settling (initial
  getSession() resolves null before SIGNED_IN fires). It now waits for the
  session; explicit provider errors and the 10s timeout still fail fast.
  Covered by 4 new tests reproducing the race.
- **Deployed `calendar-sync` Edge Function** (live on Supabase, inert until
  secrets set): polls Ernest's Google Calendar via a service account (calendar
  sharing, no domain-wide delegation) and mirrors appointment bookings into
  `public.bookings` (upsert by `google_cal_event_id`, cancellations tracked,
  client matched by `profiles.email`, tour matched from the event title).
  Guarded by `x-cron-secret`; schedule every 10 min via dashboard cron.
- **Deployed `booking-email` Edge Function** (live, skips until Resend
  configured): for native fallback-form bookings — branded "request received"
  email to the client + notification to booking@summitfitadventures.com.
  Verifies the caller's JWT owns the booking. Auth guards verified live
  (401 without credentials).
- `useCreateBooking` now fire-and-forgets the email function after insert
  (booking never fails because email did — tested).
- Email addresses corrected: notifications → booking@summitfitadventures.com
  (alias); admin account is info@summitfitadventures.com (.env.example +
  confirmed-page mailto updated — align .env.local/Vercel/DB role).
- **`docs/PHASE5B-SETUP.md`** — full runbook: appointment-schedule embed URL,
  GCP service account + calendar sharing + Calendar ID, Supabase secrets,
  cron schedule, Resend DNS verification, verification curl.

## Unreleased (v4.0 Phase 5a) — Google Calendar booking (frontend) (2026-07-08)

Booking pivots to Ernest's Google Calendar Appointment Schedule. Per
`docs/superpowers/plans/2026-07-08-v4-phase5a-booking-integration.md`, after a
recon pass reconciled the original spec with the real codebase/DB. Same local
branch. axe still 0 serious/critical.

- **Auth-gated /booking.** Anonymous visitors get a "Sign in to book your
  adventure" card with a Google button (uses the existing
  `signInWithGoogle('/booking')` + `?redirect=` callback — no localStorage,
  no AuthCallback change).
- **Google Calendar is the primary booking flow.** New
  `GoogleCalendarBooking` component embeds Ernest's appointment schedule
  (iframe on desktop, "open in new tab" on mobile) once a tour is selected.
  Google Workspace sends the client confirmation, notifies Ernest, and
  creates the calendar event automatically — no code. The existing native
  Supabase request form is kept as a collapsible fallback (still captures
  participants + price).
- **New /booking/confirmed** thank-you page (route added, not auth-protected):
  green check, "what happens next" (Google email / Ernest WhatsApp /
  add-to-your-calendar), reads optional query params defensively. It does
  **not** write a Supabase row (no unverified client-side data).
- **Admin:** new "Via Cal Page" booking badge (indigo) for calendar-page
  bookings, alongside Synced / Not synced.
- **Maps hidden** on /routes and /routes/:slug (component files kept) pending
  the Phase-5 route-mapping work.
- New env vars in `.env.example`: `VITE_GOOGLE_BOOKING_URL` (Ernest's embed
  URL — must be pasted in to activate the calendar) and
  `VITE_SUPABASE_FUNCTIONS_URL`.

**Known limitations / deferred to the backend Edge Function (Phase 5b):**
Google Appointment Schedules do NOT support a post-booking redirect or return
booking data as URL params, so calendar bookings do **not** appear in Supabase
/ My Bookings until a backend job reads Ernest's calendar via the Google
Calendar API and creates the mirror rows (+ real branded emails, +
`google_cal_event_id`). The frontend is built to accept that data when it
arrives. Also: the iframe can only be verified end-to-end once Ernest's real
`VITE_GOOGLE_BOOKING_URL` embed value is set.

## Unreleased (v4.0 Phase 3) — Design-system discipline (2026-07-08)

Consistency + snappiness pass per `docs/V4-PLAN.md` Phase 3 and
`docs/superpowers/plans/2026-07-07-v4-phase3-design-system.md`. Same local
branch. The dark midnight/cyan identity is deliberately preserved — this
tightens the system, it is not a redesign. axe still 0 serious/critical.

- **One header everywhere.** Navbar, PublicHeader, and the inline Booking
  header are now a single `SiteHeader` with an `overlay` variant (homepage:
  transparent → solid on scroll) and a `solid` variant (subpages). Every
  page now shows the full nav — **The Guide, Training, and Contact were
  previously unreachable from subpages** — and Book Now no longer clips on
  small screens. Section links (`The Guide`/`Training`/`Contact`) scroll
  in-page on the homepage and navigate to `/#section` from subpages (new
  hash-scroll handler on Index). Phase-1 mobile-menu a11y (inert, focus
  trap, Escape, scroll lock) ported verbatim.
- **Semantic color tokens.** Mapped `cyan-hover`, `cyan-soft`, `success`,
  `warning` in Tailwind; replaced ~40 raw `hsl()` className literals
  (mostly `hsl(193,100%,42%)` hover states) with token classes. Grep gate
  now forbids `hsl()` in className. Only survivors: ErrorBoundary's inline
  fallback styles (must render without CSS) and vendored shadcn.
- **Snappier motion.** Hover/card transitions 500–700ms → 300ms; the
  blanket `transition-all` (~46 spots) scoped to `transition-colors` /
  `transition-transform` / `transition` so the browser only watches what
  actually changes.
- **Type scale.** All `text-[10px]`/`text-[11px]` labels → 12px floor;
  route-detail description body 14px → 16px for mobile reading.
- **Focus + badges.** `focus-visible` cyan rings on all hand-rolled CTAs
  (matching the shadcn pattern); DifficultyBadge "easy" now uses the
  `success` token instead of a raw emerald.
- Tests: 24 → 28 (SiteHeader suite replaced the Navbar suite).

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
