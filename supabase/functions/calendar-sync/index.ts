// CALENDAR SYNC — Phase 5b (Supabase Edge Function, Deno)
//
// Mirrors bookings from Ernest's Google Calendar (appointment schedule) into
// public.bookings so they appear in the admin CRM and clients' "My Bookings".
//
// Google Appointment Schedules cannot push to us (no webhooks/redirects), so
// this function POLLS the calendar. Scheduled every 10 min via pg_cron (see
// docs/PHASE5B-SETUP.md), or hit it manually.
//
// AUTH MODEL: a Google Cloud SERVICE ACCOUNT whose email has been granted
// "See all event details" on the booking calendar (simple calendar sharing —
// no domain-wide delegation, no OAuth consent screens).
//
// STATUS MODEL (no payment gate yet — added 2026-07-09): every NEWLY synced
// booking lands as 'pending', never auto-'confirmed'. Google has already
// reserved the calendar slot the moment the client picked it — 'pending' here
// is purely our own internal review gate (admin manually flips it to
// 'confirmed' in the CRM once payment is received out-of-band, e.g. via a
// payment link sent by hand until a real payment gate exists). On every later
// sync tick we ONLY EVER propagate a real Google-side CANCELLATION — we never
// push the event's "still active" state back as 'confirmed', so a sync tick
// can never clobber an admin's manual pending → confirmed decision. Date/time
// are still kept in sync if the client reschedules in Google.
//
// Also fires the booking-email notification (client "request received" +
// admin alert to booking@summitfitadventures.com) for each newly-inserted
// pending booking, using CRON_SECRET as a shared server-to-server secret
// (see booking-email's internal-auth path).
//
// Secrets (Supabase dashboard → Edge Functions → Secrets):
//   GOOGLE_SA_EMAIL        service-account email (…@…iam.gserviceaccount.com)
//   GOOGLE_SA_PRIVATE_KEY  the "private_key" field from the SA JSON key (PEM, with \n)
//   GOOGLE_CALENDAR_ID     the calendar the appointment schedule books onto
//   CRON_SECRET            shared secret; callers must send x-cron-secret
//                          (also reused as the internal secret when this
//                          function notifies booking-email)
//
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from "npm:@supabase/supabase-js@2";

const NOTES_TAG = "Booked via Google Calendar appointment page";

/** Base64url-encode an ArrayBuffer or string. */
const b64url = (data) => {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/** Import the service-account PEM private key for RS256 signing. */
async function importPrivateKey(pem) {
  const body = pem
    .replace(/\\n/g, "\n") // secrets often store literal \n
    .replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    der.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

/** Mint a Google API access token via the SA JWT grant. */
async function googleAccessToken(saEmail, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: saEmail,
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const key = await importPrivateKey(privateKeyPem);
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(`${header}.${claims}`)
  );
  const jwt = `${header}.${claims}.${b64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`google token: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

/** List events in the sync window (past 30d → next 180d), incl. cancellations. */
async function listEvents(token, calendarId) {
  const timeMin = new Date(Date.now() - 30 * 864e5).toISOString();
  const timeMax = new Date(Date.now() + 180 * 864e5).toISOString();
  const events = [];
  let pageToken;
  do {
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
    );
    url.search = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      showDeleted: "true",
      maxResults: "250",
      ...(pageToken ? { pageToken } : {}),
    }).toString();
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`events.list: ${res.status} ${await res.text()}`);
    const page = await res.json();
    events.push(...(page.items ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return events;
}

/** Fire-and-await the booking-email notification for a freshly inserted booking.
 * Never throws — a notification failure must not break the sync loop. */
async function notifyBookingEmail(supabaseUrl, cronSecret, bookingId) {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/booking-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Satisfies the platform-level verify_jwt gate on booking-email (any
        // Supabase-signed JWT does); the function's OWN internal-secret check
        // (x-cron-secret) is what actually authorizes this as a trusted
        // server-to-server call, bypassing the normal owner-JWT requirement.
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "x-cron-secret": cronSecret,
      },
      body: JSON.stringify({ booking_id: bookingId }),
    });
    if (!res.ok) {
      console.error(`[calendar-sync] booking-email notify failed: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error("[calendar-sync] booking-email notify errored:", err);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || req.headers.get("x-cron-secret") !== cronSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const saEmail = Deno.env.get("GOOGLE_SA_EMAIL");
  const saKey = Deno.env.get("GOOGLE_SA_PRIVATE_KEY");
  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!saEmail || !saKey || !calendarId) {
    console.log("[calendar-sync] Google secrets not configured — skipping");
    return Response.json({ skipped: true, reason: "google secrets not configured" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

  try {
    const token = await googleAccessToken(saEmail, saKey);
    const events = await listEvents(token, calendarId);

    // Appointment bookings = events with a non-organizer human attendee.
    const bookings = events.filter((e) =>
      (e.attendees ?? []).some((a) => !a.organizer && !a.resource && !a.self)
    );

    // Existing mirror rows in one query (date/time included so we can detect
    // a client-side reschedule in Google without touching status).
    const ids = bookings.map((e) => e.id);
    const { data: existing } = ids.length
      ? await supabase
          .from("bookings")
          .select("id, google_cal_event_id, status, booking_date, time_slot")
          .in("google_cal_event_id", ids)
      : { data: [] };
    const byEventId = new Map((existing ?? []).map((r) => [r.google_cal_event_id, r]));

    // Pricing catalogue for best-effort tour matching against the event title.
    const { data: pricing } = await supabase.from("pricing").select("id, name");

    let inserted = 0,
      updated = 0,
      unmatchedClients = 0;

    for (const e of bookings) {
      const cancelled = e.status === "cancelled";
      const startIso = e.start?.dateTime ?? (e.start?.date ? `${e.start.date}T00:00:00Z` : null);
      if (!startIso) continue;
      const start = new Date(startIso);
      const bookingDate = startIso.slice(0, 10);
      const timeSlot = e.start?.dateTime
        ? start.toISOString().slice(11, 16) // HH:mm UTC; display layer localises
        : null;

      const attendee = (e.attendees ?? []).find((a) => !a.organizer && !a.resource && !a.self);
      const clientEmail = attendee?.email?.toLowerCase() ?? null;

      const prev = byEventId.get(e.id);
      if (prev) {
        // Only ever push a CANCELLATION from Google. Never re-derive
        // 'confirmed' from "event still active" — that would silently
        // overwrite an admin's manual pending → confirmed approval on the
        // very next sync tick. If the event is still active but the client
        // rescheduled, keep the mirrored date/time current without touching
        // status either way.
        if (cancelled && prev.status !== "cancelled") {
          await supabase
            .from("bookings")
            .update({ status: "cancelled", booking_date: bookingDate, time_slot: timeSlot })
            .eq("id", prev.id);
          updated++;
        } else if (!cancelled && (prev.booking_date !== bookingDate || prev.time_slot !== timeSlot)) {
          await supabase
            .from("bookings")
            .update({ booking_date: bookingDate, time_slot: timeSlot })
            .eq("id", prev.id);
          updated++;
        }
        continue;
      }

      // Match the client to a profile (they sign in with Google before booking,
      // so the attendee email usually matches a profile row).
      let userId = null;
      if (clientEmail) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id")
          .ilike("email", clientEmail)
          .maybeSingle();
        userId = prof?.id ?? null;
        if (!userId) unmatchedClients++;
      }

      // Best-effort tour match: pricing name contained in the event summary.
      const summary = (e.summary ?? "").toLowerCase();
      const tour = (pricing ?? []).find((p) => summary.includes(p.name.toLowerCase()));

      const { data: newRow, error: insertErr } = await supabase
        .from("bookings")
        .insert({
          booking_ref: `GC-${e.id.slice(0, 8).toUpperCase()}`,
          user_id: userId,
          pricing_id: tour?.id ?? null,
          guide_id: null,
          booking_date: bookingDate,
          time_slot: timeSlot,
          participants: 1,
          total_price: null,
          // No payment gate yet — every new calendar booking starts 'pending'
          // (matches the column's own DB default) until an admin manually
          // confirms payment was received. If Google itself already shows the
          // event cancelled on first sight, mirror that instead.
          status: cancelled ? "cancelled" : "pending",
          notes: NOTES_TAG,
          calendar_synced: true,
          google_cal_event_id: e.id,
        })
        .select("id")
        .single();

      if (insertErr) {
        console.error(`[calendar-sync] insert failed for event ${e.id}:`, insertErr);
        continue;
      }
      inserted++;

      if (!cancelled && newRow?.id) {
        await notifyBookingEmail(supabaseUrl, cronSecret, newRow.id);
      }
    }

    console.log(
      `[calendar-sync] events=${events.length} bookings=${bookings.length} inserted=${inserted} updated=${updated} unmatched=${unmatchedClients}`
    );
    return Response.json({ ok: true, events: events.length, inserted, updated, unmatchedClients });
  } catch (err) {
    console.error("[calendar-sync] failed:", err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
});
