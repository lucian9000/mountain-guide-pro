/**
 * TRANSACTIONAL EMAIL — Phase 3 STUB (needs a backend).
 *
 * Sending email (e.g. via Resend/Postmark/SendGrid) requires a server API key
 * and must not run in the browser. When Phase 3 lands, replace this with a call
 * to a Supabase Edge Function (e.g. `send-confirmation`). For now it just logs.
 */
export async function sendBookingConfirmationEmail(bookingId: string): Promise<void> {
  console.info(
    `[email] (stub) would send confirmation for booking ${bookingId}. ` +
      `Wire to an Edge Function in Phase 3.`
  );
}
