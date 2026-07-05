# SummitFit Adventures — Changelog

Version scheme: **semantic-ish releases** — `MAJOR.MINOR.PATCH`.

- **MAJOR** — a new feature phase (new subsystem, schema additions, new public pages)
- **MINOR** — features/improvements within the current phase
- **PATCH** — bug fixes, copy, styling tweaks

The version lives in `package.json` (`"version"`) — bump it in the same PR as
the feature, and add an entry here. Versions before 3.0.0 are reconstructed
retroactively; numbering starts for real at 3.0.0.

---

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
