// CALENDAR SYNC — Phase 5b (Supabase Edge Function, Deno)
//
// Mirrors bookings from Ernest's Google Calendar (appointment schedule) into
// public.bookings so they appear in the admin CRM and clients' "My Bookings".
//
// Google Appointment Schedules cannot push to us (no webhooks/redirects), so
// this function POLLS the calendar. Schedule it every 10–15 min via the
// Supabase dashboard cron (see docs/PHASE5B-SETUP.md), or hit it manually.
//
// AUTH MODEL: a Google Cloud SERVICE ACCOUNT whose email has been granted
// "See all event details" on the booking calendar (simple calendar sharing —
// no domain-wide delegation, no OAuth consent screens).
//
// Secrets (Supabase dashboard → Edge Functions → Secrets):
//   GOOGLE_SA_EMAIL        service-account email (…@…iam.gserviceaccount.com)
//   GOOGLE_SA_PRIVATE_KEY  the "private_key" field from the SA JSON key (PEM, with \n)
//   GOOGLE_CALENDAR_ID     the calendar the appointment schedule books onto
//   CRON_SECRET            shared secret; callers must send x-cron-secret
//
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.
//
// @ts-nocheck — Deno runtime types are not available in the Vite tsconfig.

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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  try {
    const token = await googleAccessToken(saEmail, saKey);
    const events = await listEvents(token, calendarId);

    // Appointment bookings = events with a non-organizer human attendee.
    const bookings = events.filter((e) =>
      (e.attendees ?? []).some((a) => !a.organizer && !a.resource && !a.self)
    );

    // Existing mirror rows in one query.
    const ids = bookings.map((e) => e.id);
    const { data: existing } = ids.length
      ? await supabase.from("bookings").select("id, google_cal_event_id, status").in("google_cal_event_id", ids)
      : { data: [] };
    const byEventId = new Map((existing ?? []).map((r) => [r.google_cal_event_id, r]));

    // Pricing catalogue for best-effort tour matching against the event title.
    const { data: pricing } = await supabase.from("pricing").select("id, name");

    let inserted = 0,
      updated = 0,
      unmatchedClients = 0;

    for (const e of bookings) {
      const status = e.status === "cancelled" ? "cancelled" : "confirmed";
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
        // Only churn rows when something we mirror actually changed.
        if (prev.status !== status) {
          await supabase
            .from("bookings")
            .update({ status, booking_date: bookingDate, time_slot: timeSlot })
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

      await supabase.from("bookings").insert({
        booking_ref: `GC-${e.id.slice(0, 8).toUpperCase()}`,
        user_id: userId,
        pricing_id: tour?.id ?? null,
        guide_id: null,
        booking_date: bookingDate,
        time_slot: timeSlot,
        participants: 1,
        total_price: null,
        status,
        notes: NOTES_TAG,
        calendar_synced: true,
        google_cal_event_id: e.id,
      });
      inserted++;
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
