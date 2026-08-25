import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, MapPin, Mountain, Users } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { usePublicEvent } from "@/lib/queries/events";
import { formatEventDate, formatEventTime } from "@/components/admin/eventFormat";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Public page for a single group event — the landing page a shared Facebook /
 * Instagram link points at. `/e/:id` (the share link) redirects here after the
 * crawler has read its Open Graph tags; see `api/e/[id].js`.
 */
const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading } = usePublicEvent(id ?? null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader variant="solid" />
        <main id="main" className="flex-1 container mx-auto px-4 py-10 space-y-6">
          <Skeleton className="w-full aspect-[16/9] rounded-xl" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader variant="solid" />
        <main id="main" className="flex-1 container mx-auto px-4 py-24 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-black text-foreground tracking-wider uppercase mb-4">
            Event not found
          </h1>
          <p className="text-muted-foreground mb-8">
            This adventure has already happened, or it isn't published yet.
          </p>
          <Link
            to="/#upcoming"
            className="inline-flex items-center gap-2 bg-accent hover:bg-cyan-hover text-accent-foreground px-6 py-3 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> See upcoming adventures
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const time = formatEventTime(event.start_time);
  const price = Number(event.price_per_person);
  const spots = event.spots_left ?? event.capacity;
  const soldOut = spots <= 0;

  const facts = [
    { icon: CalendarDays, label: formatEventDate(event.event_date) },
    time ? { icon: Clock, label: `Starts ${time}` } : null,
    event.location ? { icon: MapPin, label: event.location } : null,
    {
      icon: Users,
      label: soldOut ? "Fully booked" : `${spots} of ${event.capacity} spots left`,
    },
  ].filter(Boolean) as { icon: typeof Users; label: string }[];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader variant="solid" />

      <main id="main" className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl space-y-8">
          <Link
            to="/#upcoming"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All upcoming adventures
          </Link>

          <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-muted flex items-center justify-center">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Mountain className="w-12 h-12 text-muted-foreground" aria-hidden="true" />
            )}
          </div>

          <div className="space-y-4">
            <h1 className="font-heading text-3xl md:text-5xl font-black text-foreground tracking-wider uppercase leading-tight">
              {event.title}
            </h1>

            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {facts.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-muted-foreground">
                  <f.icon className="w-4 h-4 text-accent" aria-hidden="true" />
                  <span className="text-sm">{f.label}</span>
                </li>
              ))}
            </ul>

            {event.description ? (
              <p className="text-foreground/85 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            ) : null}
          </div>

          <div className="glass-card glow-border rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-heading text-2xl font-black text-foreground">
                {price > 0 ? `R${price.toFixed(0)}` : "Free"}
              </p>
              <p className="text-sm text-muted-foreground">
                {price > 0 ? "per person" : "no charge"}
              </p>
            </div>

            {soldOut ? (
              <span className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
                Fully booked
              </span>
            ) : (
              <Link
                to={`/booking?event=${event.id}`}
                className="inline-flex items-center gap-2 bg-accent hover:bg-cyan-hover text-accent-foreground px-6 py-3 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition-colors"
              >
                Book your spot
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetail;
