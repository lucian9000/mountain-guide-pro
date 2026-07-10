# Google OAuth SSO Warning Fix

## Issue / Warning

Admins attempting to log into the platform using Google Single Sign-On (SSO)
were met with a red warning page stating **"Google hasn't verified this
app."** Additionally, an informational security alert regarding
**Incremental authorization** was flagged within the Google Cloud Console's
project checkup panel.

## Resolution & Changes

The following steps were taken within the Google Cloud Console to clear the
warnings and move the authentication flow into production:

- **OAuth consent screen configuration:** added the mandatory Privacy Policy
  link, pointing to the production domain (`https://summitfitadventures.com`).
  Because this integration only requests basic, non-sensitive identity scopes
  (`email`, `profile`, `openid`), Google does not require a manual brand
  review.
- **Publishing status promotion:** shifted the app's deployment state from
  **Testing** to **In Production** under
  `APIs & Services > OAuth consent screen`. This removes the "unverified app"
  blocking screen for logging-in admins.
- **Incremental authorization:** reviewed the incremental-consent warning.
  The app requests identity scopes upfront and delegates background
  scheduling operations exclusively to a secure **service account JSON key**,
  so it does not use progressive/dynamic OAuth permissions — the alert does
  not apply here.

**Status:** Production deployment active. Google SSO is unblocked for admin
accounts as of 2026-07-10.
