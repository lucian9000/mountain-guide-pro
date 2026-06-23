/**
 * GOOGLE CALENDAR INTEGRATION — Phase 3
 *
 * The functions that talk to the Google Calendar API (availability, event
 * create/delete) need an OAuth refresh token + client secret. Those are SERVER
 * secrets and must never live in this client bundle, so they are STUBS here.
 * When implemented, they should call a Supabase Edge Function (Deno) that holds
 * the secrets in Function config.
 *
 * Setup steps when ready to implement:
 * 1. Google Cloud Console → enable the Google Calendar API.
 * 2. Create OAuth 2.0 credentials (Web application).
 * 3. Authorized redirect URI: {SITE_URL}/api/auth/google-calendar/callback (Edge Function).
 * 4. Edge Function secrets (NOT VITE_): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
 *    GOOGLE_REDIRECT_URI.
 * 5. Each guide authorizes access once; store the refresh_token in
 *    guides.google_refresh_token (server-side only — never SELECT it from the client).
 * 6. Replace the stubs below with `googleapis` calls inside the Edge Function:
 *      - calendar.freebusy.query()  → availability
 *      - calendar.events.insert()   → create booking event (store id on bookings)
 *      - calendar.events.delete()   → cancel booking event
 *
 * NOTE: buildGoogleCalendarUrl() below is NOT a stub — it builds a public
 * "Add to Google Calendar" link that works with no API key at all.
 */

export interface TimeSlot {
  value: string; // 24h "HH:mm"
  label: string; // human label
}

/** STUB — returns mock availability. Replace with an Edge Function call. */
export async function getGuideAvailability(
  guideId: string,
  date: string
): Promise<TimeSlot[]> {
  console.info(`[google-calendar] (stub) availability for guide ${guideId} on ${date}`);
  return [
    { value: "06:30", label: "06:30 — Early start" },
    { value: "08:00", label: "08:00 — Morning" },
    { value: "10:00", label: "10:00 — Mid-morning" },
    { value: "14:00", label: "14:00 — Afternoon" },
  ];
}

/** STUB — needs an Edge Function (server secret). */
export async function createCalendarEvent(bookingId: string): Promise<string | null> {
  console.info(`[google-calendar] (stub) create event for booking ${bookingId}`);
  return null;
}

/** STUB — needs an Edge Function (server secret). */
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  console.info(`[google-calendar] (stub) delete event ${eventId}`);
  return false;
}

/* ─────────────────── Public "Add to Calendar" link (no API) ─────────────────── */

const pad = (n: number) => String(n).padStart(2, "0");

/** Format a Date as a Google Calendar UTC stamp: YYYYMMDDTHHMMSSZ */
const toGCalStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T` +
  `${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

export interface CalendarLinkInput {
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** "HH:mm" 24h; if omitted the event is treated as starting at 08:00 */
  time?: string | null;
  /** event length in hours (default 4) */
  durationHours?: number;
  details?: string;
  location?: string;
}

/**
 * Build a public Google Calendar "add event" URL. Works without any API key —
 * it just pre-fills the Google Calendar event-create form.
 */
export function buildGoogleCalendarUrl({
  title,
  date,
  time,
  durationHours = 4,
  details = "",
  location = "Cape Town, South Africa",
}: CalendarLinkInput): string {
  const [h, m] = (time ?? "08:00").split(":").map((x) => Number(x) || 0);
  const [y, mo, d] = date.split("-").map(Number);
  const start = new Date(y, (mo || 1) - 1, d || 1, h, m);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toGCalStamp(start)}/${toGCalStamp(end)}`,
    details,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
