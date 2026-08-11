import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Sparkles, X } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { usePublicEvents } from "@/lib/queries/events";
import type { Special } from "@/lib/types/db";

const DISMISS_KEY = "summitfit.eventBanner.dismissed";
const APPEAR_AFTER_MS = 5000;

/** Human date for an ISO "yyyy-mm-dd" (no Date parsing surprises). */
const formatEventDate = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const todayISO = () => new Date().toISOString().slice(0, 10);

/** Currently-running special (active + inside its validity window, if set). */
const useActiveSpecial = (enabled: boolean) =>
  useQuery<Special | null>({
    queryKey: ["public", "special", "active"],
    enabled: enabled && isSupabaseConfigured,
    queryFn: async () => {
      const today = todayISO();
      const { data, error } = await supabase
        .from("specials")
        .select("*")
        .eq("active", true)
        .or(`valid_from.is.null,valid_from.lte.${today}`)
        .or(`valid_until.is.null,valid_until.gte.${today}`)
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw new Error(error.message);
      return (data?.[0] as Special | undefined) ?? null;
    },
  });

const wasDismissed = () => {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Bottom slide-in (not a modal) shown 5s after load: the next upcoming event,
 * else the active special, else nothing. Renders nothing without Supabase.
 * Offset left of the Book Now FAB so both stay usable.
 */
const EventBannerInner = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => wasDismissed());

  const events = usePublicEvents(1);
  const event = events.data?.[0];
  const special = useActiveSpecial(!events.isLoading && !event);

  useEffect(() => {
    if (dismissed) return;
    const t = window.setTimeout(() => setVisible(true), APPEAR_AFTER_MS);
    return () => window.clearTimeout(t);
  }, [dismissed]);

  const dismiss = () => {
    setDismissed(true);
    setVisible(false);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* storage unavailable (private mode) — banner simply returns next load */
    }
  };

  if (dismissed || !visible) return null;
  if (!event && !special.data) return null;

  const spots = event?.spots_left;

  return (
    <div
      role="region"
      aria-label={event ? "Upcoming event" : "Current special"}
      className="fixed bottom-4 left-4 right-4 sm:right-28 z-40 animate-slide-in-bottom"
    >
      <div className="relative glass-card glow-border rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        {event ? (
          <>
            <CalendarDays className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />
            <div className="min-w-0 sm:flex-1">
              <span className="font-heading font-bold text-foreground tracking-wider uppercase text-sm">
                {event.title}
              </span>
              <span className="text-muted-foreground text-sm sm:ml-2 block sm:inline">
                {formatEventDate(event.event_date)}
                {spots != null && spots > 0 ? ` — ${spots} spots left` : ""}
                {spots === 0 ? " — fully booked" : ""}
              </span>
            </div>
            <Link
              to={`/booking?event=${event.id}`}
              className="shrink-0 inline-flex items-center min-h-[44px] px-4 rounded-lg bg-accent hover:bg-cyan-hover text-accent-foreground font-heading font-bold text-xs tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Book your spot →
            </Link>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-gold shrink-0" aria-hidden="true" />
            <div className="min-w-0 sm:flex-1">
              <span className="font-heading font-bold text-foreground tracking-wider uppercase text-sm">
                {special.data?.title}
              </span>
              {special.data?.description && (
                <span className="text-muted-foreground text-sm sm:ml-2 block sm:inline truncate">
                  {special.data.description}
                </span>
              )}
            </div>
            <Link
              to="/booking"
              className="shrink-0 inline-flex items-center min-h-[44px] px-4 rounded-lg bg-accent hover:bg-cyan-hover text-accent-foreground font-heading font-bold text-xs tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Book now →
            </Link>
          </>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute top-1 right-1 sm:static w-11 h-11 shrink-0 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

/**
 * Zero-config guard: without Supabase credentials nothing renders and no
 * query hook ever runs.
 */
const EventBanner = () => (isSupabaseConfigured ? <EventBannerInner /> : null);

export default EventBanner;
