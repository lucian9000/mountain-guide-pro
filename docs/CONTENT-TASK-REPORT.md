# Managed content implementation report

## Scope and outcome

Implemented the assigned managed-content slice in `C:/SummitFit/SummitFit_Experience` only. No production checkout edits, live Supabase writes, schema changes, deployment, commits, or booking/calendar integration changes were performed. Parent-owned public experience work and `content.ts` were left untouched.

### Exact files changed

All paths below are relative to `C:/SummitFit/SummitFit_Experience`.

- `src/components/QuickBookMenu.tsx`: configured route list reads `usePublishedRoutes()` through a managed child component. Empty/error results show explicit messages, never static substitutions. Managed cards link to `/routes/:slug`, display actual difficulty, duration, distance, elevation and meeting point when supplied, and do not invent gear/weather facts. Pricing matches the managed slug (not route UUID), then the existing name fallback. Enquiry-only routes remain enquiries; matched active pricing IDs retain `/booking?tour=` links. Unconfigured static routes and the training tab remain supported.
- `src/lib/queries/admin.ts`: pricing saves/deletes invalidate admin pricing, public pricing, tour-price maps and tour-price rows. Every special mutation invalidates admin specials/stats and public special caches, including the existing banner's singular `["public", "special", "active"]` prefix.
- `src/lib/queries/contentAdmin.ts`: route saves also refresh public price maps/rows. Failed pricing sync leaves the saved route result intact and displays a persistent, dismissible Sonner warning with the failure and next action; the route editor's separate success toast does not replace it. Existing cents-to-rand conversion, matching, enquiry-only deactivation, group-rate and participant-limit preservation are unchanged. Gallery mutations invalidate/refetch on settlement, including partial failure, and now refresh the admin route list too.
- `src/lib/queries/events.ts`: public event detail explicitly filters `is_published = true` and `event_date >= today`, independent of admin RLS privileges. Event mutations invalidate public single-event detail as well as lists.
- `src/components/admin/RouteImagesManager.tsx`: accessible Move earlier/Move later buttons, bounded positions, pending-operation guards, retained drag ordering, and an inline alert on reorder failure. Error text acknowledges possible partial saves.
- `src/pages/admin/AdminEventEditor.tsx`: guide default initializes once when guide data first arrives for a new event; manual selection/clearing prevents later defaulting. Edit/duplicate sources retain their guide ID, including null.
- `src/test/lib/managed-content.test.ts`: 13 focused query/mutation contract tests.
- `src/test/components/QuickBookMenu.managed.test.tsx`: 4 managed-route/offline/error/empty/booking tests.
- `src/test/components/RouteImagesManager.managed.test.tsx`: 2 accessible ordering/error tests.
- `src/test/pages/AdminEventEditor.managed.test.tsx`: 3 guide initialization/edit/duplicate tests.
- `src/test/components/QuickBookPanel.test.tsx`: made backend configuration explicit in fixtures; configured pricing/loading tests use a managed route fixture, while offline behavior tests stay unconfigured. Separated the variation-selector alternative in the existing emoji regex to preserve matching while resolving its preexisting lint error.
- `docs/CONTENT-TASK-REPORT.md`: this report.

## Validation

Dependencies became available during implementation. All tests use mocked backend boundaries and fixtures; none mutate a live service.

1. New focused suites initially passed: **22/22 tests across four files**.
2. Existing QuickBookPanel suite initially reproduced **2 failures / 9 passes**: booking and pricing-loading expectations assumed a configured backend although this copied checkout has no credentials. Fixtures now explicitly select configuration and supply managed content.
3. Final combined command: **33/33 tests passed across five files**.

```text
npx vitest run src/test/lib/managed-content.test.ts src/test/components/QuickBookMenu.managed.test.tsx src/test/components/RouteImagesManager.managed.test.tsx src/test/pages/AdminEventEditor.managed.test.tsx src/test/components/QuickBookPanel.test.tsx
```

4. Focused ESLint check on the six implementation files and four new test files: **0 errors**, one existing `react-refresh/only-export-components` warning for exported `matchPricing` in QuickBookMenu. A broader check including the existing QuickBookPanel test exposed its preexisting `no-misleading-character-class` regex error; the equivalent regex correction is included in this change.

```text
npx eslint src/lib/queries/admin.ts src/lib/queries/contentAdmin.ts src/lib/queries/events.ts src/components/QuickBookMenu.tsx src/components/admin/RouteImagesManager.tsx src/pages/admin/AdminEventEditor.tsx src/test/lib/managed-content.test.ts src/test/components/QuickBookMenu.managed.test.tsx src/test/components/RouteImagesManager.managed.test.tsx src/test/pages/AdminEventEditor.managed.test.tsx
```

5. Application type check, run twice: **blocked by the same single diagnostic outside this slice**:

```text
npx tsc --noEmit -p tsconfig.app.json
src/lib/queries/content.ts(38,11): error TS2589: Type instantiation is excessively deep and possibly infinite.
```

Parent owns `content.ts` and was informed; no change was made there. Full build and broad end-to-end validation remain with the parent while the shell/explorer work proceeds. React Router future-flag notices in tests are warnings only. New regression tests were added alongside the fixes; a red-before-green run of every new case was not captured.

After the final regex-only test adjustment, `npx eslint src/test/components/QuickBookPanel.test.tsx` passed with no diagnostics, and `npx vitest run src/test/components/QuickBookPanel.test.tsx -t "renders no emoji"` passed its selected test (10 intentionally skipped).

## Preserved preexisting limitations / follow-up

- **Slug changes:** route-to-pricing sync matches the saved slug. Renaming can leave the old pricing row and create another; no stable foreign-key relationship or old-slug cleanup was introduced.
- **Scheduling:** pricing activation still follows route status, not `publish_at`. A future-scheduled published route can have active pricing before public route visibility. No scheduler/schema changes were made.
- **Deletion/version restore:** route deletion does not remove/deactivate the matching pricing row, and version restoration does not run route-to-pricing sync. These preexisting workflows remain distinct; administrators should review Pricing after either operation.
- **Non-transactional image updates:** reorder/cover changes use sequential updates. A failure can leave partial changes. This implementation surfaces reorder failures and refreshes caches after settlement; it does not introduce a transactional RPC. Existing cover/alt/delete handlers have not been redesigned.
- **Guide UI:** existing active-only guide choices remain; an inactive source guide ID is preserved in the draft but may not have a visible selectable option. Source changes within an already-mounted editor retain the existing editor lifecycle behavior.
- **Cache scope:** invalidation refreshes consumers sharing the current QueryClient; it is not a cross-browser realtime subscription. Existing validity dates and UTC date boundary logic are unchanged.
- Mocked tests verify outgoing publication filters and mutation behavior, not deployed RLS, authenticated production behavior, mobile drag behavior, or transactional guarantees. Preview integration checks should use an isolated backend.

## Parent integration notes

QuickBook's managed query is mounted only when Supabase is configured. Parent may safely keep the announced offline `RouteWithImages` fallback in `content.ts` / `offline-routes.ts`; QuickBook keeps its existing richer static offline cards. Configured empty/error behavior is explicitly tested and never falls back to those cards.
