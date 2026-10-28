# Live audit fixes — local implementation

Branch: fix/live-site-audit-2026-10-28. Baseline: 39f225f.

## Changes

- Quick booking reads the published route catalogue, including newly added routes,
  rather than the bundled list. Existing slug-first/name-fallback pricing, training
  bookings and enquiry-only cases are preserved. Bundled route fallback is only
  used when the backend is unconfigured; managed loading/error/empty states do
  not reveal static routes.
- Featured homepage cards retain the existing featured choices where published,
  but read current route names, facts, cover images and descriptions. Detail links
  open their own route pages. Other homepage editorial content is unchanged.
- Footer guide/training links target the homepage sections from every page.
- Public single-event queries explicitly require published, upcoming events.
  Cached ineligible rows are rejected and event detail pages guard against past
  or unpublished content. Future/full events and admin queries are preserved.
  Date cutoffs use Africa/Johannesburg calendar dates, including today's events.
- Browser page metadata now provides distinct titles/descriptions, canonical
  production URLs without tracking queries/hashes, Open Graph/Twitter images and
  private-page noindex tags. Published route/event metadata resets on navigation.
- Two pre-existing type-check blockers were corrected without changing behaviour:
  direct typed publication filters replace a recursive generic helper, and the
  last-image lookup remains compatible with ES2020.

## Verification

- Full suite: 137 tests passed in 21 files (`npm run test -- --reporter=dot --maxWorkers=2`).
- Application TypeScript check passed (`npx tsc --noEmit -p tsconfig.app.json`).
- Production build passed (`npm run build`).
- Independent final re-review approved all five scoped fixes after metadata edge
  cases were corrected; no important findings remained.
- Targeted lint passed with no errors and the existing QuickBookMenu fast-refresh
  export warning. Build reports an old Browserslist database.
- Regression failures were reproduced before the fixes. Managed route fixtures
  cover new routes, changed facts/photos, pricing matches, enquiry-only cases and
  error/empty states. Event fixtures cover privileged browsing, stale caches,
  booking deep links, future/full events and South Africa date boundaries.
- Metadata review regressions cover persistent navigation, asynchronous results,
  cached-data refetch failures and malformed/non-HTTP image URLs. Unavailable
  pages suppress stale content and use noindex; invalid images fall back safely.
- Local browser checks confirmed Gantouw Pass in quick booking, managed featured
  durations (India Venster 5h and Skeleton Gorge 8h), correct detail navigation,
  footer navigation from a route page, route/news metadata, and no booking action
  on the checked past-event page. Mobile quick booking fits at 390×844.
- Local browser read existing public backend content. No booking, auth, database
  or admin writes were performed. Screenshot evidence is saved outside the repo
  at C:/SummitFit/audit-fixed-quick-book-2026-10-28.jpg.

## Deployment and remaining external checks

These changes are local only. They have not been pushed or deployed.

Browser metadata is client-rendered. This does not add SSR/prerendering, a sitemap,
or guarantee ordinary route-link previews in crawlers that do not execute JS.
The existing /e/:id server-rendered event-sharing endpoint and Vercel rewrites are
unchanged. Facebook's Sharing Debugger and firewall behaviour still need their
own deployed verification; the earlier automated check received a security challenge.

The existing Facebook embed emitted third-party fbcdn element errors during the
local news-page check. Main page content remained usable. This is not resolved by
the five scoped fixes and should be assessed separately if the feed is unreliable.
