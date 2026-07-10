# Google OAuth Privacy Policy Page

## Issue / Warning

Google's OAuth app verification review (Trust & Safety) rejected the
"Privacy policy requirements" check, flagging:

> Your privacy policy URL is the same as your homepage URL.

Google requires the OAuth consent screen's **Privacy Policy link** and
**Homepage link** to resolve to two distinct URLs — a policy embedded only
in the homepage (or not published as its own route at all) fails this
check and blocks verification from proceeding.

## Resolution & Changes

- **Added a dedicated `/privacy` route** — `src/pages/Privacy.tsx`,
  registered in `src/App.tsx` as a lazy-loaded public route alongside
  `/news` and `/routes`. Uses the existing `SiteHeader`/`Footer` shell and
  the site's design tokens/fonts, so it matches the rest of the site.
- **Linked from the footer** (`src/components/Footer.tsx`, "Quick Links"
  column) so it's discoverable on every page, not just reachable by direct
  URL.
- **Content** covers the four sections Google's reviewers expect for an
  app that only requests basic identity scopes: what's collected (email,
  name, profile picture URL via Google SSO), how it's used (admin
  authentication + booking/calendar dashboard access), that data isn't
  sold/shared with third parties, and a contact email.
- Verified with `npx tsc --noEmit` and a full `npm run build` — the page
  code-splits into its own chunk and does not affect any other route.

## Follow-up

Once deployed, set the OAuth consent screen's **Privacy Policy URL** in
Google Cloud Console to `https://summitfitadventures.com/privacy` (distinct
from the homepage URL) and reply to the Trust & Safety email thread to
resume verification, per Google's review flow.

**Status:** Page built and routed 2026-07-10. Awaiting production deploy,
then the Cloud Console URL update + reply to Google to resume verification.
