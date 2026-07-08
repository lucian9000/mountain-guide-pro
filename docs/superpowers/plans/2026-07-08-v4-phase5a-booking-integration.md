# v4.0 Phase 5a — Google Calendar booking integration (frontend slice)

**Source:** user's Phase-5 spec (2026-07-08), reconciled against the real codebase/DB after a recon pass. Same branch `v4/phase-1-a11y`; NEVER push. No Co-Authored-By trailers. `npm run build` must be clean (zero TS errors) before done.
**Approved design decisions (user, 2026-07-08):**
1. Maps: comment out on `/routes` (RoutesOverviewMap) AND `/routes/:slug` (RouteLocationMap); keep component files. (Homepage has NO map — the spec's premise was wrong.)
2. Calendar is source of truth. Google Workspace auto-sends client confirmation + Ernest notification + calendar event (no code). **We do NOT insert Supabase booking rows client-side** — the Supabase mirror is deferred to the backend Edge Function. `/booking/confirmed` is an informational thank-you page only.
3. Keep the existing native Supabase booking form as a FALLBACK alongside the calendar embed.

**Recon facts (authoritative — override the spec where they differ):**
- Supabase client singleton: `src/lib/supabase/client.ts` (import `supabase` from there).
- bookings columns: `id, booking_ref, user_id (NOT client_id), pricing_id, guide_id, booking_date (date, NOT NULL), time_slot, participants, total_price, status (default 'pending', CHECK in pending|confirmed|cancelled|completed), notes, calendar_synced (bool default false), google_cal_event_id (text), created_at, updated_at`.
- bookings RLS: INSERT allowed only when `auth.uid() = user_id`; owner/admin select; admin update.
- Routes are in `src/App.tsx` (NOT main.tsx). Admin bookings page: `src/pages/admin/AdminBookings.tsx` (badge currently keys off `calendar_synced`, shows "Synced"/"Not synced" at ~L173-178).
- Auth: use `signInWithGoogle(redirectTo?)` from `useAuth()` (AuthContext). It builds `/auth/callback?redirect=<to>`; `AuthCallback.tsx` already honors `?redirect=`. So NO localStorage, NO AuthCallback edit (spec's approach conflicts — do not use it).
- `use-mobile` hook: `src/hooks/use-mobile.tsx` (`useIsMobile()`).
- Admin email is `ernest@summitfitadventures.com` (VITE_ADMIN_EMAIL) — use this, NOT the spec's `summitfit.co.za`.
- `.env.example` exists; does NOT currently contain VITE_GOOGLE_BOOKING_URL or VITE_SUPABASE_FUNCTIONS_URL — add both.
- Do NOT touch: AuthContext.tsx, supabase/client.ts, ProtectedRoute.tsx, AdminRoute.tsx, schema. Booking.tsx native flow logic (pricing/guides/createBooking) stays intact.

**Google Calendar reality (why the design is what it is):** Appointment Schedules support an official iframe embed, but do NOT support `gv_successUrl` / post-booking redirects / returning booking data as query params. So there is no automatic round-trip. `/booking/confirmed` is reached via a manual "I've completed my booking" button, and reads any query params defensively (for a future backend) but never depends on them.

---

## Task 1 — Hide maps on /routes pages
**Files:** `src/pages/RoutesIndex.tsx`, `src/pages/RouteDetail.tsx`.
1. In each, replace the map render with `{/* MAP REMOVED — Phase 5: will be re-added when route mapping is ready */}`.
2. Maps are `React.lazy` imports — comment out the now-unused lazy import lines too (and their `<Suspense>`/fallback wrappers if they wrap ONLY the map) to avoid unused-var / dead Suspense. Keep the component files (`src/components/maps/*`) and any `Route...Map` usage elsewhere untouched. Leaflet stays a dep.
3. Verify the pages still render (skeletons/sections intact), `npm test` green, `npm run build` clean.
4. Commit: `feat(routes): hide maps pending Phase 5 route mapping`.

## Task 2 — New files: env, GoogleCalendarBooking, BookingConfirmed, route
**Files:** `.env.example`, new `src/components/booking/GoogleCalendarBooking.tsx`, new `src/pages/BookingConfirmed.tsx`, `src/App.tsx`.

**2a. .env.example** — append:
```
# Google Calendar Appointment Schedule EMBED URL (admin/Ernest's booking page)
# Google Calendar → appointment schedule → Share → "</> Embed" → copy the src URL.
# Clients do NOT need Google Calendar; they just use this embedded page.
VITE_GOOGLE_BOOKING_URL=https://calendar.google.com/calendar/appointments/schedules/YOUR_SCHEDULE_ID

# Supabase Edge Functions base URL (Phase 5 backend — email + calendar sync). Not used yet.
VITE_SUPABASE_FUNCTIONS_URL=https://YOUR-PROJECT-ref.functions.supabase.co
```

**2b. GoogleCalendarBooking.tsx** — props `{ tourName: string; guideName: string; isVisible: boolean }`. Return null unless `isVisible` AND `VITE_GOOGLE_BOOKING_URL` set (if visible but unset, render a small muted "Booking calendar not configured yet" notice so it fails safe in dev). Use existing shadcn Card/Button + lucide icons, dark/cyan style.
- Build `bookingUrl = VITE_GOOGLE_BOOKING_URL`. Compute `successUrl = ${VITE_SITE_URL}/booking/confirmed` and append it as `?gv_successUrl=<enc>` to the iframe/link URL — with a code comment: "Appointment Schedules currently ignore this; harmless + future-proof. Reliable path to the thank-you page is the manual button below."
- Heading "Select your date & time"; subtext "You're booking: {tourName} with {guideName}"; "Pick an available slot from Ernest's calendar below."
- Desktop (`!useIsMobile()`): `<iframe src={urlWithSuccess} style={{width:'100%',minHeight:'700px',border:'none',borderRadius:'12px'}} title="Book your tour with Ernest" />`.
- Mobile (`useIsMobile()`): a Button "Open booking calendar →" opening `urlWithSuccess` in a new tab (`window.open(url,'_blank','noopener')` or an `<a target=_blank rel=noreferrer>`); helper line "Tap to open Ernest's booking calendar in a new tab."
- Below: subtle info Card — "Google will email you a confirmation once you book, and Ernest will be notified automatically. He'll follow up on WhatsApp to confirm the details." + a Link/Button "I've completed my booking →" to `/booking/confirmed` (this is the reliable route to the thank-you page). Do NOT promise "appears in My Bookings" (backend not built).

**2c. BookingConfirmed.tsx** — informational only, NO Supabase insert.
- Read optional `useSearchParams()`: `eventTitle, startTime, name` — use if present, else generic fallbacks. (Defensive for a future backend redirect; never required.)
- Render: large green `CheckCircle`; "You're booked!"; subheading = eventTitle or "Your tour with Ernest is confirmed"; formatted startTime if parseable.
- "What happens next" vertical list, 3 items with icons: (1) `Mail` — "Google Calendar has emailed you a confirmation — check your inbox and spam folder." (2) `Phone` — "Ernest will reach out on WhatsApp (+27 67 130 1536) to confirm logistics, what to bring, and the meeting point." (3) `Calendar` — "Add it to your own calendar:" + a Button opening a `https://calendar.google.com/calendar/render?action=TEMPLATE&text=<eventTitle>&dates=<...>` link built from params (best-effort; if no startTime, link just prefills the title).
- Buttons: primary "View My Bookings" → `/dashboard/bookings` (ONLY if `useAuth().user`); secondary "Back to Home" → `/`.
- Low-key text link (not a button): "Something wrong? Contact Ernest directly →" → `mailto:ernest@summitfitadventures.com?subject=Booking%20Enquiry&body=...`. (Correct domain.)
- Bottom comment block: the PHASE 5 BACKEND note from the spec (Edge Function will send emails + write google_cal_event_id + create the Supabase mirror row), adjusted to note the record is created by the backend, not this page.
- Match dark/cyan style; wrap content in a `<main id="main">` landmark (a11y parity with other pages).

**2d. App.tsx** — add `<Route path="/booking/confirmed" element={<BookingConfirmed />} />` (lazy-import it like the other pages; NOT wrapped in ProtectedRoute/AdminRoute).

Commit (after 2b/2c/2d/2a together): `feat(booking): GoogleCalendarBooking embed + BookingConfirmed thank-you page + route`.

## Task 3 — Booking.tsx: auth gate + wire calendar + keep native fallback (TDD)
**File:** `src/pages/Booking.tsx` + `src/test/pages/Booking.test.tsx`.
1. **Auth gate:** if `!user` (from `useAuth()`), render a centered shadcn Card instead of the form: heading "Sign in to book your adventure"; subtext "Create a free account or sign in with your existing Google account to check availability and book a guided tour with Ernest."; a prominent "Continue with Google" Button calling `signInWithGoogle('/booking')`. Keep the existing SiteHeader/layout.
2. **Signed-in:** keep tour + guide selectors exactly as-is. Render `<GoogleCalendarBooking tourName={selectedTour?.name ?? ''} guideName={selectedGuide?.display_name ?? ''} isVisible={!!(tourId && guideId)} />` as the PRIMARY flow. Keep the existing native date/participants/Book Now section but present it as a clearly-labelled FALLBACK (e.g. a divider "Prefer to request manually?" / collapsible below the calendar) — its createBooking logic and participant/price capture stay intact.
3. **TDD** (extend Booking.test.tsx; auth is mocked there): (a) logged-out (`user: null`) renders "Sign in to book" card + a "Continue with Google" button, and does NOT render the tour `<select>`; (b) logged-in renders selectors; GoogleCalendarBooking hidden until both tour+guide chosen (assert the "Select your date & time" heading absent, then present after selecting) — if driving the Radix selects in jsdom is impractical, instead unit-test GoogleCalendarBooking's `isVisible` prop directly in its own test file. Preserve the existing 7 booking tests (they mock a signed-in user — confirm still green). Red first.
4. Verify: new + existing tests green; `npx tsc --noEmit -p tsconfig.app.json` (no NEW errors beyond the 2 known); `npm run build` clean.
5. Commit: `feat(booking): auth gate + Google Calendar primary flow, native form as fallback`.

## Task 4 — AdminBookings "Via Cal Page" badge
**File:** `src/pages/admin/AdminBookings.tsx` (~L173-178).
1. Add a third badge state (blue/indigo, e.g. `bg-indigo-500/20 text-indigo-300 border-indigo-500/30` or a semantic token if one fits): "Via Cal Page" when `notes === 'Booked via Google Calendar appointment page' && !b.calendar_synced`. Else keep existing Synced / Not synced. (These rows won't exist until the backend creates them — the badge is future-proofing; harmless now.)
2. `npm test` green; `npm run build` clean.
3. Commit: `feat(admin): 'Via Cal Page' booking badge for calendar-page bookings`.

## Task 5 — Gate
1. `npm run build` clean; `npm test` green; `a11y-gate.cjs` re-run — booking page is now auth-gated, so the axe check on `/booking` will see the sign-in card (still must be 0 serious/critical); the keyboard/skip-link checks unaffected. (2 runs for the map-attribution flake — though maps are now hidden, so /routes should be cleaner.)
2. Playwright: logged-out `/booking` shows sign-in card; `/booking/confirmed` renders thank-you (with and without query params); `/routes` + `/routes/:slug` render with maps gone and no console errors / no leftover empty map box. Screenshots to scratchpad.
3. CHANGELOG entry (Unreleased v4.0 — Phase 5a). Note clearly: emails/calendar handled by Google Workspace; Supabase mirror + real email templates pending the backend Edge Function.
4. Commit: `feat(gate): phase 5a evidence + changelog`.

**Definition of done:** maps hidden on /routes pages (files kept); auth-gated /booking with Google Calendar embed primary + native fallback; /booking/confirmed thank-you page + route; admin badge ready; no client-side Supabase booking inserts from the calendar path; build clean; tests green; axe 0 serious/critical. Backend (emails, calendar→Supabase sync) explicitly deferred and documented.
