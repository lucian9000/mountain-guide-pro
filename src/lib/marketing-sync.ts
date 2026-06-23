/**
 * EMAIL MARKETING SYNC — Phase 3 STUB (needs a backend).
 *
 * Syncing a contact to Mailchimp / Loops requires a provider API key, which is
 * a SERVER secret and must never ship in this client bundle. When Phase 3 lands,
 * this should call a Supabase Edge Function (e.g. `new-client`) instead of the
 * provider directly. For now it just logs.
 *
 * See the project plan + docs/ for the Edge Function design and the
 * Supabase Database Webhook that triggers it on new `profiles` rows.
 */
export async function syncContactToMarketing(contact: {
  email: string;
  fullName?: string | null;
  optIn: boolean;
}): Promise<void> {
  console.info(
    `[marketing-sync] (stub) would sync ${contact.email} ` +
      `(opt-in: ${contact.optIn}). Wire to an Edge Function in Phase 3.`
  );
}
