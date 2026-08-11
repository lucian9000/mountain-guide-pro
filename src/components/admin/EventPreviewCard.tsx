import { CalendarDays, Clock, MapPin, Mountain, Users } from "lucide-react";
import { formatEventDate, formatEventTime } from "@/components/admin/eventFormat";

export interface EventPreview {
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  start_time: string | null;
  capacity: number;
  price_per_person: number;
  image_url: string | null;
}


/**
 * The event exactly as the public site renders it — shown in the wizard's
 * last step so the guide can see what visitors will see before publishing.
 */
const EventPreviewCard = ({ event }: { event: EventPreview }) => {
  const time = formatEventTime(event.start_time);
  return (
    <article className="glass-card glow-border overflow-hidden rounded-xl">
      <div className="aspect-video w-full bg-muted flex items-center justify-center overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Mountain className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="p-5 space-y-3">
        <h3 className="font-heading font-bold text-xl text-foreground leading-tight">
          {event.title || "Untitled event"}
        </h3>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-accent" aria-hidden="true" />
            {formatEventDate(event.event_date)}
          </p>
          {time ? (
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" aria-hidden="true" />
              Starts {time}
            </p>
          ) : null}
          {event.location ? (
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" aria-hidden="true" />
              {event.location}
            </p>
          ) : null}
          <p className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" aria-hidden="true" />
            {event.capacity} spots
          </p>
        </div>
        {event.description ? (
          <p className="text-sm text-foreground/80 whitespace-pre-line">
            {event.description}
          </p>
        ) : null}
        <p className="font-heading text-2xl font-black text-foreground">
          R{Number(event.price_per_person || 0).toLocaleString("en-ZA")}
          <span className="text-muted-foreground text-sm font-normal"> per person</span>
        </p>
      </div>
    </article>
  );
};

export default EventPreviewCard;
