import { useQuery } from "@tanstack/react-query";
import { CalendarDays, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  htmlLink?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

/** Thrown on 401/403 so the UI can offer a reconnect instead of a raw error. */
class TokenExpiredError extends Error {}

const fetchUpcomingEvents = async (
  token: string
): Promise<GoogleCalendarEvent[]> => {
  const params = new URLSearchParams({
    timeMin: new Date().toISOString(),
    maxResults: "8",
    singleEvents: "true",
    orderBy: "startTime",
  });
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.status === 401 || res.status === 403) throw new TokenExpiredError();
  if (!res.ok) throw new Error(`Google Calendar request failed (${res.status})`);
  const body = await res.json();
  return (body.items ?? []) as GoogleCalendarEvent[];
};

const formatEventTime = (event: GoogleCalendarEvent): string => {
  if (event.start.date) {
    // All-day event — the date string is already local.
    return new Date(`${event.start.date}T00:00:00`).toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }
  const start = new Date(event.start.dateTime!);
  return start.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Upcoming events from the signed-in admin's own Google Calendar.
 *
 * Uses `session.provider_token` — the Google access token Supabase returns
 * from the OAuth sign-in (with the calendar.readonly scope requested in
 * signInWithGoogle). Supabase does NOT refresh this token: it lives ~1 hour
 * and disappears from the stored session after a Supabase token refresh.
 * When it's missing or rejected we show a "reconnect" prompt, which simply
 * re-runs the Google sign-in and lands back on the admin dashboard.
 */
const GoogleCalendarCard = () => {
  const { session, signInWithGoogle } = useAuth();
  const token = session?.provider_token ?? null;

  const events = useQuery({
    queryKey: ["admin", "google-calendar"],
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
    queryFn: () => fetchUpcomingEvents(token!),
  });

  const needsReconnect =
    !token || events.error instanceof TokenExpiredError;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase">
          Your Google Calendar
        </h2>
        <a
          href="https://calendar.google.com"
          target="_blank"
          rel="noreferrer"
          className="text-accent text-xs hover:underline"
        >
          Open Google Calendar
        </a>
      </div>

      <div className="glass-card glow-border p-5">
        {needsReconnect ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CalendarDays className="w-8 h-8 text-accent" />
            <p className="text-sm text-muted-foreground max-w-sm">
              Connect your Google Calendar to see your upcoming events here.
              Google access expires periodically — reconnecting just repeats
              the sign-in.
            </p>
            <Button size="sm" onClick={() => signInWithGoogle("/admin")}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Connect Google Calendar
            </Button>
          </div>
        ) : events.isLoading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Loading your calendar…
          </p>
        ) : events.error ? (
          <p className="text-sm text-destructive py-4 text-center">
            Couldn't load your calendar: {(events.error as Error).message}
          </p>
        ) : !events.data || events.data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No upcoming events.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {events.data.map((event) => (
              <li key={event.id} className="flex items-baseline gap-4 py-2.5">
                <span className="text-xs text-muted-foreground whitespace-nowrap w-40 shrink-0">
                  {formatEventTime(event)}
                </span>
                <a
                  href={event.htmlLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-foreground hover:text-accent truncate"
                >
                  {event.summary ?? "(no title)"}
                </a>
                {event.location && (
                  <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                    {event.location}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default GoogleCalendarCard;
