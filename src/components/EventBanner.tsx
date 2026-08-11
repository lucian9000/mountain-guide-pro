import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Mountain, X } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { usePublicEvents } from "@/lib/queries/events";
import type { Special } from "@/lib/types/db";

const DISMISS_KEY = "summitfit.eventBanner.dismissed";
const APPEAR_AFTER_MS = 5000;
const EXIT_MS = 200;
/** Look a few events ahead so a sold-out one doesn't hide the next. */
const LOOKAHEAD = 5;
/** Below this, spots-left is styled as urgent. */
const LOW_SPOTS = 5;

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

/** 64px mobile / 72px desktop thumbnail, with the admin preview's placeholder. */
const Thumb = ({ src, alt }: { src: string | null; alt: string }) => (
  <div className="w-16 h-16 md:w-[72px] md:h-[72px] shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
    {src ? (
      <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
    ) : (
      <Mountain className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
    )}
  </div>
);

/**
 * Floating notification card (bottom-LEFT) announcing the next bookable event,
 * else the active special. Deliberately not full-bleed and not the site's cyan:
 * a full-width dark bar read as cookie-consent chrome and vanished into the
 * hero. The warm amber edge contrasts the cool palette and signals urgency.
 *
 * Sits opposite the Book Now FAB (bottom-right); on mobile, where the card
 * spans the width, it is lifted above the FAB rather than behind it.
 */
const EventBannerInner = () => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [dismissed, setDismissed] = useState(() => wasDismissed());

  const events = usePublicEvents(LOOKAHEAD);
  // Skip sold-out events entirely — show the next one that can still be booked.
  const event = events.data?.find((e) => e.spots_left == null || e.spots_left > 0);
  const special = useActiveSpecial(!events.isLoading && !event);

  useEffect(() => {
    if (dismissed) return;
    const t = window.setTimeout(() => setVisible(true), APPEAR_AFTER_MS);
    return () => window.clearTimeout(t);
  }, [dismissed]);

  const persistDismiss = () => {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* storage unavailable (private mode) — banner simply returns next load */
    }
  };

  /** Animate out, then unmount. */
  const dismiss = () => {
    persistDismiss();
    setLeaving(true);
    window.setTimeout(() => setDismissed(true), EXIT_MS);
  };

  if (dismissed || !visible) return null;
  if (!event && !special.data) return null;

  const spots = event?.spots_left ?? null;
  const lowSpots = spots != null && spots <= LOW_SPOTS;

  const title = event ? event.title : special.data!.title;
  const image = event ? event.image_url : special.data!.image_url;
  const href = event ? `/booking?event=${event.id}` : "/booking";

  return (
    <div
      role="region"
      aria-label={event ? "Upcoming event" : "Current special"}
      // Bottom-left on desktop; on mobile full width but lifted clear of the
      // FAB (bottom-6 + h-14 = 80px, so bottom-24 leaves a gap).
      className={`fixed z-40 left-4 right-4 bottom-24 sm:left-6 sm:right-auto sm:bottom-6 sm:max-w-[420px] transition-all duration-200 ${
        leaving ? "opacity-0 translate-y-3" : "animate-slide-in-bottom"
      }`}
    >
      <div className="relative rounded-2xl border border-border/60 border-l-4 border-l-gold bg-raised shadow-2xl p-3 pr-12 flex items-center gap-3">
        <Thumb src={image} alt={title} />

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-heading font-bold tracking-wider uppercase text-muted-foreground">
            {event ? "Upcoming event" : "Special offer"}
          </p>
          <p className="font-heading font-bold text-foreground text-sm truncate">{title}</p>
          <p className="text-xs mt-0.5">
            {event ? (
              <>
                <span className="text-muted-foreground">
                  {formatEventDate(event.event_date)}
                </span>
                {spots != null && (
                  <>
                    <span className="text-muted-foreground"> · </span>
                    <span className={lowSpots ? "text-warning font-semibold" : "text-muted-foreground"}>
                      {lowSpots ? `Only ${spots} spot${spots === 1 ? "" : "s"} left` : `${spots} spots left`}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="text-muted-foreground line-clamp-1">
                {special.data?.description || "Limited-time offer"}
              </span>
            )}
          </p>
        </div>

        <Link
          to={href}
          onClick={persistDismiss}
          className="shrink-0 inline-flex items-center min-h-[44px] px-4 rounded-lg bg-accent hover:bg-cyan-hover text-accent-foreground font-heading font-bold text-xs tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Book
        </Link>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-1 right-1 w-11 h-11 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
