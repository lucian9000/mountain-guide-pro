# Managed content implementation task

Work only in C:/SummitFit/SummitFit_Experience. The parent is building a cinematic UI and new route explorer. Your job is the existing data/admin reliability slice. Preserve production Supabase schemas and IDs; no live writes or deployment.

Owned files: src/lib/queries/admin.ts, contentAdmin.ts, events.ts, src/components/QuickBookMenu.tsx, src/components/admin/RouteImagesManager.tsx, src/pages/admin/AdminEventEditor.tsx, and focused tests for these changes. Do not edit public experience files, package.json, vite.config.ts or content.ts. Do not change booking/calendar integration.

Requirements:
- QuickBookMenu must list usePublishedRoutes() data when Supabase is configured. Static routes remain only when unconfigured. Do not fall back to static routes on a configured empty/error response. Map managed route facts accurately, don't invent gear. Preserve training tab and matched pricing booking links. Add links to each managed route detail.
- Invalidate public pricing maps/rows and public specials after relevant admin edits, and public single-event detail after editing an event. Existing new route/price sync must retain its intended behaviour. Surface a sync failure to the admin rather than only console.error; do not lose a successfully saved route. Avoid expanding schema or complex scheduling changes; record unresolved preexisting caveats explicitly.
- Explicit published/upcoming filters in usePublicEvent (admins visiting the public page must not see drafts).
- Add accessible Move earlier/Move later buttons to the gallery reordering UI and handle reorder errors visibly; retain drag ordering.
- Ernest default should apply once to a new event and must not reselect when user clears guide. Editing/duplicating must preserve selection.
- Write meaningful focused tests, first reproduce failures where practical; no production data mutation. Run focused tests when node_modules becomes available. Parent is installing dependencies.

Read docs/DESIGN-AND-PRESERVATION.md for context. Use apply_patch to edit. No commits (parent will manage local history), no edits to original Main checkout. Report exact files changed, checks run and any remaining limitations in docs/CONTENT-TASK-REPORT.md; return a short status. If dependency install is still pending, do useful coding and report commands for parent to run.
