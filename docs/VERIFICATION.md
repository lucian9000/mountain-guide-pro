# Local verification

## Results

- Full suite: **96 tests passed in 22 files**.
- TypeScript application check: passed.
- Production build: passed. Separate motion-vendor bundle added.
- Targeted lint across changed public/admin/query files: zero errors; one
  inherited react-refresh export warning in QuickBookMenu.
- Browser: desktop and 390×844 mobile layouts reviewed. Route difficulty
  filtering, search/no-results/clear, route detail navigation, 13 Peaks next
  summit, mobile menu navigation, quick-book opening/closing, and booking
  sign-in gate exercised. No browser error logs in the checked flows.
- DOM checks: no horizontal overflow at desktop or mobile widths; no broken
  loaded homepage images. Lazy images below the viewport are not covered by that
  single image check. Screenshots were reviewed inline during the build.
- Production checkout remains unchanged except its existing untracked
  `supabase/.temp/` directory. The new directory has no production credentials.
- SHA256 comparisons confirm `api/e/[id].js` and `vercel.json` are identical to
  the production baseline.

## Regression work

Added managed route discovery, image ordering, event guide default and public
visibility/cache tests. Independent review found legacy name-matched prices were
not used by the new route/training cards; both were reproduced with failing tests,
then fixed. Existing group-price and booking/auth regression tests still pass.
The baseline generic Supabase published-filter helper caused a TypeScript depth
error; direct typed filter chains fix that without changing the filters.

## Limits and release gates

Browser checks used the unconfigured offline preview, not live Supabase data.
Managed data tests use mocks; no production admin, booking, upload or other write
was performed. No production deployment was made.

Before launch, use an isolated backend and Vercel preview to exercise authenticated
admin/customer flows, actual uploads, event capacity, calendar/email integrations,
special expiry, and crawler HTML on `/e/:id`. Also check reduced-motion preference
switching and full keyboard navigation in the deployed browser. Code gates GSAP
effects and Motion transitions on the user's reduced-motion preference and cleans
up scroll animations on navigation; that is not a substitute for deployed testing.

The inherited pricing consistency limitations described in
`../EXPERIENCE-README.md` remain. Do not promise unattended scheduling, deletion or
slug-renaming until those cases are separately addressed and backend-tested.

Build tooling reports an old Browserslist dataset. This does not prevent the
build; update compatibility data in a maintenance pass with regression checks.
