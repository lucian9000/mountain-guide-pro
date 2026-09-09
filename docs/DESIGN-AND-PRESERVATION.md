# SummitFit Experience — design and preservation specification

Date: 2026-09-10
Status: cinematic direction approved; implementation specification ready for review.

## Agreed scope

Create the redesign in C:/SummitFit/SummitFit_Experience. Use the current production
application as the functional foundation, with a new public presentation built in
React, GSAP and Framer Motion. Keep Supabase and Vercel. Do not replace the booking
system or create a separate content-management service.

Homepage editorial photographs and text remain fixed in the application. This
does not freeze the route cards, upcoming events or specials shown on that page:
those sections read Ernest's published content from Supabase.

Ernest continues managing routes, pricing, route galleries, events, specials,
guides, bookings, clients and news through the admin panel. No homepage editor or
page builder is required.

## Verified starting point

- Source: C:/SummitFit/Main/mountain-guide-pro-main.
- Local main HEAD: 1a469a57e4ae0b0e730e274054b4f860b2a8c724.
- Vercel project: summitfit-v2. Latest deployment returned READY / PROMOTED for
  the same commit during this review.
- Existing untracked supabase/.temp/ belongs to the original checkout; leave it there.
- V5_Site is an earlier design experiment, not the verified production baseline.
- Review covered README, SITE-OVERVIEW, ADMIN-GUIDE, HOW-TO-USE, the relevant
  CHANGELOG entries, PHASE5B-SETUP, storage setup, OAuth/privacy notes, and V5's
  PRODUCT.md, cross-checked with the current application code.
- Documentation describes several historical states. In particular, earlier
  sections call auth Google-only and calendar/email unfinished; later entries
  describe email auth and completed calendar/email integration. Preserve the
  implemented flows; do not treat an old setup checklist as current live status.
- This was source and deployment-metadata review, not an authenticated end-to-end
  production test or a full database/security audit.

## Visual direction

Cinematic Cape mountain experience: dramatic local photography, oversized display
type, generous spacing and a clear route-discovery journey. Retain recognizable
SummitFit navy and cyan action colours from the brand documentation; use warm
landscape tones in photography and restrained accents. Avoid invented reviews,
awards, statistics or route facts.

The signature sequence is a mountain opening followed by an immersive 13 Peaks
story. GSAP owns hero sequencing and scroll-linked landscape movement. Framer
Motion owns menu transitions, route-filter layout changes and small interactive
states. Neither library animates the same element's transform simultaneously.

Native scrolling, readable content without animation, reduced-motion support,
keyboard controls and touch-friendly layouts are requirements. No scroll-jacking,
mandatory loading spectacle or motion that delays booking.

Public journey: cinematic opening → discover routes → upcoming events and active
offer → Ernest's story → 13 Peaks and training → contact/booking. The fixed story
sections frame dynamic content; their photography does not become admin-editable.

## Functional contracts to retain

| Area | Required behaviour |
| --- | --- |
| Routes | Existing /routes and /routes/:slug URLs; published/scheduled visibility, admin previews, hide/unhide, ordering and version restoration |
| Route images | Existing route_images records and Storage paths; compression, cover selection, ordering, alt text and gallery viewing |
| Route pricing | Preserve current route-to-pricing sync; cents on routes versus rand values in pricing; group prices and participant limits must survive route edits |
| Booking | Keep /booking?tour= and /booking?event= selection; private and event flows; group-rate threshold; manual request fallback |
| Calendar | Existing Google appointment schedule, desktop embed and mobile external link; background calendar-sync contract |
| Booking status | Requests remain pending until Ernest confirms; no new online payment or automatic payment-confirmation behaviour |
| Events | Existing rows/IDs, draft/publish/duplicate, guide defaults, capacity, sold-out behaviour, attendance list and CSV |
| Sharing | /e/:id server endpoint, /events/:id page, event-specific preview tags, canonical URL and crawler/visitor response behaviour |
| Specials | Single active special, validity dates, and event-banner fallback; expiry hides the offer without deleting it |
| Accounts | Google and email/password auth, reset-password, /auth/callback, customer dashboard, profiles and marketing preference |
| Administration | Existing admin role boundary, client and booking management, routes, images, pricing, events, specials, guides and news |
| Privacy | /privacy, footer access and existing Google data-use disclosure |
| Infrastructure | Existing Vercel API rewrite before SPA fallback; Supabase policies, Storage buckets, functions and cron jobs |
| Resilience | Useful loading/error/empty states; fixed marketing content remains usable when backend configuration or access is unavailable |

No production data reset, seed replay, bucket replacement or ID regeneration is
part of the redesign. Keep existing URL contracts so saved links remain usable.

## Important findings affecting implementation

1. `Expeditions.tsx` has a fixed featured-route array. `QuickBookMenu.tsx` maps
   routes imported from src/data/routes.ts. The new route-discovery components
   must use published Supabase routes so newly added routes appear automatically.
   Static route information may support an explicitly offline fallback, but must
   not override live route visibility or prices.
2. `contentAdmin.ts` now calls syncBookableTour after saving a route. Preserve
   this recent production fix and examine slug changes, scheduling and deletion:
   the current matching is by slug, and active uses status without publish_at.
   Sync failure is currently logged rather than shown to Ernest. These need
   focused checks before claiming seamless administration.
3. Pricing and specials mutations primarily invalidate admin query caches.
   Public query consumers must refresh after relevant edits in the new UI.
   A database-driven page is not automatically a realtime subscription.
4. Route image upload currently requires an initial draft save. Make this
   sequence clear and retain compression. Add accessible reorder controls where
   drag-only interaction is inadequate on a phone or keyboard.
5. Public route queries explicitly filter publishing state, but usePublicEvent
   relies on RLS. Check the public experience while signed in as an admin too,
   since admin RLS permits drafts. Do not surface drafts in public discovery.
6. Existing social share code sends text/link to the native share sheet, not an
   image file. Do not describe Instagram image attachment or target availability
   as guaranteed. Preserve explicit image retrieval and caption/link actions.
7. Existing image metadata has no crop/focal-point field. Do not promise saved
   crop adjustment as already available. Cover selection and responsive image
   presentation are supported without adding a schema migration.

## Implementation boundaries and validation

Copy the verified application into this folder without .git, .vercel, secret env
files, node_modules, dist or Supabase temporary files. Preserve the original
checkout. Keep public styling and animation scoped so the admin and booking
interfaces remain usable during the public redesign.

Use a Vercel preview for review before changing production. Production Supabase
credentials in a preview would still write to production: admin and booking test
writes must use an isolated test backend or mocked fixtures. No destructive live
testing and no replaying existing schema scripts as an initialization shortcut.

Before release:

- Run the existing build, type checks and tests; record baseline failures
  separately from regressions introduced by the redesign.
- Verify new route discovery with a newly published fixture, not only the
  original hard-coded route set. Check draft, hidden, scheduled and empty states.
- Verify price changes, route-to-tour mapping, group rates and enquiry-only routes.
- Exercise route galleries and mobile admin upload/reorder interactions.
- Check both booking modes, auth redirects, password reset and customer/admin
  access boundaries using safe test data.
- Check event details, sold-out display, sharing URLs and event-specific crawler
  HTML on the Vercel preview. HTTP 200 alone is not sufficient verification.
- Verify specials respect dates, and public views refresh after admin edits.
- Review desktop/mobile screenshots, keyboard/focus behaviour, reduced motion,
  horizontal overflow, navigation cleanup and console errors.
- Keep production cutover and rollback separate from building the local redesign.

## Review outcome

The current architecture is suitable for the requested cinematic redesign.
The main integration work is making all route-discovery surfaces consume managed
content consistently while retaining established booking and sharing contracts.
The design does not require homepage editing or a new CMS.
