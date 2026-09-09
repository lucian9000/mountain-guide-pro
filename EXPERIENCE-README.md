# SummitFit Experience

Approved cinematic redesign, built separately from the live application.

## Local preview

From this folder, run `npm install` (first setup), then `npm run dev`.
Open http://localhost:8086. `npm run build` creates the production build.

Without Supabase configuration, the site uses bundled route examples with
enquiry-only pricing. These are not live data. Login, live events, specials and
booking submissions require the existing backend configuration.

## What Ernest manages

Use the existing `/admin` panel for routes, prices, route images, events, specials,
guides, bookings, clients and news. Published routes feed the new catalogue and
quick-book menu automatically. Draft/hidden routes do not appear in discovery.
Homepage editorial photographs and text remain fixed in the source.

New route: save a draft first, upload photos, choose a cover, order photos with
the arrow controls, check price/details, then publish. A priced route retains
the existing booking-price sync. A sync warning means the route is saved but its
Pricing entry needs attention. Group pricing and participant limits remain on
the Pricing page. Existing events and event IDs are not migrated or recreated.

Public caches refresh after relevant admin edits in the same session; other
visitors receive new content on subsequent fetches. This is not a realtime CMS.

## Supabase and Vercel

Use the same environment variable names as the existing application. Follow the
preserved `.env.example` and backend setup documentation. Never put a service-role
key into a `VITE_` variable. No credentials were copied into this folder.

For a Vercel preview, select this directory as the project root, use the Vite
build and `dist` output, and retain `vercel.json` plus `api/e/[id].js`. The `/e/:id`
function handles event-specific social metadata and sends human visitors to
`/events/:id`. It must be tested on Vercel, not the Vite development server.

Use a separate Supabase test project for admin/booking tests. A preview connected
to production Supabase still writes to the live database. Do not replay schema,
seed or reset scripts against production.

Review the preview and authenticated workflows before production promotion.
No production deployment or backend mutation was performed during this build.
Keep the current production deployment available for rollback.

## Known inherited administration limitations

Route slug changes can leave an older pricing entry; route deletion/version
restoration do not synchronise pricing; scheduled routes are filtered from public
discovery but pricing activation does not follow the scheduled publication time.
These pre-existing cases need a separate data-consistency change and safe backend
validation before promising fully unattended administration. For now, retain
published slugs, use hide/unhide, and verify Pricing after these operations.

## Checks

`npm run test`, `npm run build`, and `npx tsc --noEmit -p tsconfig.app.json`.
See `docs/VERIFICATION.md` for the local results and remaining release checks.
The copied historical README and admin guides describe the preserved baseline;
this document describes the new experience.
