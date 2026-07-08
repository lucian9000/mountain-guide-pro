// BOOKING EMAIL — Phase 5b (Supabase Edge Function, Deno)
//
// Sends emails for NATIVE bookings made through the site's fallback form.
// (Bookings made through the Google Calendar appointment page already get
// Google Workspace's own confirmation + notification emails — not our job.)
//
// Called fire-and-forget by the app right after a successful insert, with the
// signed-in user's JWT. The function verifies the caller owns the booking, so
// it cannot be used to spam arbitrary emails.
//
// Secrets (Supabase dashboard → Edge Functions → Secrets):
//   RESEND_API_KEY        Resend API key (domain summitfitadventures.com must
//                         be verified in Resend before FROM works)
//   EMAIL_FROM            e.g. "SummitFit Adventures <booking@summitfitadventures.com>"
//   BOOKING_NOTIFY_EMAIL  where admin notifications go: booking@summitfitadventures.com
//
// Missing RESEND_API_KEY → responds { skipped: true } and does nothing, so the
// function is safe to deploy before Resend is set up.
//
// @ts-nocheck — Deno runtime types are not available in the Vite tsconfig.

import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Minimal branded (midnight/cyan) email shell. */
const shell = (title, bodyHtml) => `
<div style="background:#0a1d2e;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#0e2438;border:1px solid #1d3a52;border-radius:12px;padding:32px">
    <h1 style="color:#f1f6fa;font-size:20px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px">${esc(title)}</h1>
    ${bodyHtml}
    <p style="color:#7b93a8;font-size:12px;margin:24px 0 0">SummitFit Adventures · Cape Town<br/>
    WhatsApp +27 67 130 1536 · booking@summitfitadventures.com</p>
  </div>
</div>`;

const row = (label, value) =>
  `<tr><td style="color:#7b93a8;font-size:13px;padding:4px 12px 4px 0;vertical-align:top">${esc(label)}</td>
   <td style="color:#f1f6fa;font-size:13px;padding:4px 0">${esc(value)}</td></tr>`;

async function sendEmail(apiKey, payload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`resend: ${res.status} ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  try {
    // 1) Identify the caller from their JWT.
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401, headers: cors });
    }
    const caller = userData.user;

    // 2) Load the booking and verify ownership.
    const { booking_id } = await req.json().catch(() => ({}));
    if (!booking_id) {
      return Response.json({ ok: false, error: "booking_id required" }, { status: 400, headers: cors });
    }
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, booking_ref, user_id, booking_date, time_slot, participants, total_price, status, pricing:pricing_id(name, price), guide:guide_id(display_name)")
      .eq("id", booking_id)
      .maybeSingle();
    if (!booking || booking.user_id !== caller.id) {
      return Response.json({ ok: false, error: "not found" }, { status: 404, headers: cors });
    }

    // 3) Graceful no-op until Resend is configured.
    const apiKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("EMAIL_FROM") ?? "SummitFit Adventures <booking@summitfitadventures.com>";
    const notify = Deno.env.get("BOOKING_NOTIFY_EMAIL") ?? "booking@summitfitadventures.com";
    if (!apiKey) {
      console.log(`[booking-email] RESEND_API_KEY not set — skipping (booking ${booking.booking_ref})`);
      return Response.json({ ok: true, skipped: true }, { headers: cors });
    }

    const clientEmail = caller.email;
    const clientName = caller.user_metadata?.full_name ?? clientEmail;
    const tourName = booking.pricing?.name ?? "Guided tour";
    const details = `<table style="border-collapse:collapse;margin:8px 0 0">
      ${row("Reference", booking.booking_ref ?? booking.id.slice(0, 8).toUpperCase())}
      ${row("Tour", tourName)}
      ${row("Date", booking.booking_date)}
      ${booking.time_slot ? row("Time", booking.time_slot) : ""}
      ${row("Participants", booking.participants)}
      ${booking.guide?.display_name ? row("Guide", booking.guide.display_name) : ""}
      ${booking.total_price != null ? row("Total", `R${booking.total_price}`) : ""}
    </table>`;

    // 4) Client confirmation (booking request — Ernest still confirms).
    await sendEmail(apiKey, {
      from,
      to: [clientEmail],
      subject: `Booking request received — ${tourName}`,
      html: shell(
        "Request received",
        `<p style="color:#c7d6e2;font-size:14px;line-height:1.6">Hi ${esc(clientName)},<br/><br/>
         Thanks for your booking request! Ernest will confirm availability and reach out on
         WhatsApp to finalise logistics, what to bring, and the meeting point.</p>${details}`
      ),
    });

    // 5) Admin notification to the booking alias.
    await sendEmail(apiKey, {
      from,
      to: [notify],
      subject: `New booking request: ${tourName} — ${booking.booking_date}`,
      html: shell(
        "New booking request",
        `<p style="color:#c7d6e2;font-size:14px;line-height:1.6">${esc(clientName)} (${esc(clientEmail)})
         requested a booking via the website form.</p>${details}
         <p style="color:#c7d6e2;font-size:14px;margin-top:16px">Manage it in the
         <a href="https://summitfitadventures.com/admin/bookings" style="color:#22c9f5">admin dashboard</a>.</p>`
      ),
    });

    console.log(`[booking-email] sent for ${booking.booking_ref} → ${clientEmail} + ${notify}`);
    return Response.json({ ok: true }, { headers: cors });
  } catch (err) {
    console.error("[booking-email] failed:", err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500, headers: cors });
  }
});
