import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { usePublicEvents } from "@/lib/queries/events";
import { routeFallbackImage } from "@/components/routes/routeImageFallbacks";

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

/**
 * Homepage section: the next few published group events.
 * Renders nothing at all when Supabase is unconfigured or there are no
 * upcoming events (the marketing site must work with zero config).
 */
const UpcomingAdventures = () => {
  const { data } = usePublicEvents(3);

  if (!data || data.length === 0) return null;

  return (
    <section id="upcoming" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-3 block">
            Join the Group
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-black text-foreground tracking-wider uppercase">
            Upcoming Adventures
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {data.map((event) => {
            const spots = event.spots_left;
            const soldOut = spots === 0;
            return (
              <article
                key={event.id}
                className="glass-card glow-border overflow-hidden flex flex-col"
              >
                <div className="relative h-44 overflow-hidden shrink-0">
                  <img
                    src={event.image_url || routeFallbackImage(event.id)}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span
                    className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-heading font-bold tracking-wider uppercase ${
                      soldOut
                        ? "bg-muted text-muted-foreground"
                        : spots != null && spots <= 5
                        ? "bg-warning text-background"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {soldOut
                      ? "Fully booked"
                      : spots != null
                      ? `${spots} spots left`
                      : "Open"}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-heading text-lg font-bold text-foreground mb-2 tracking-wider uppercase">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm mb-3">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-4 h-4 text-accent" aria-hidden="true" />
                      {formatEventDate(event.event_date)}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1 min-w-0">
                        <MapPin className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
                        <span className="truncate max-w-[12rem]">{event.location}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-accent" aria-hidden="true" />
                      {event.capacity} max
                    </span>
                  </div>

                  <div className="mt-auto pt-2 flex items-center justify-between gap-3">
                    <span className="font-heading text-xl font-black text-accent whitespace-nowrap">
                      R{Number(event.price_per_person)} pp
                    </span>
                    {soldOut ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center min-h-[44px] px-5 rounded-lg bg-muted text-muted-foreground font-heading font-bold text-xs tracking-wider uppercase opacity-60"
                      >
                        Fully booked
                      </button>
                    ) : (
                      <Link
                        to={`/booking?event=${event.id}`}
                        className="inline-flex items-center min-h-[44px] px-5 rounded-lg bg-accent hover:bg-cyan-hover text-accent-foreground font-heading font-bold text-xs tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        Book
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UpcomingAdventures;
