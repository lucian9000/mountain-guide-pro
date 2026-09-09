import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { usePublicEvents } from "@/lib/queries/events";
import { formatEventDate } from "@/components/admin/eventFormat";

export default function ExperienceEvents() {
  const { data: events, isLoading, error } = usePublicEvents(3);
  if (isLoading || error || !events?.length) return null;
  return (
    <section id="upcoming" className="ex-events ex-section">
      <div className="ex-section-heading">
        <div>
          <span className="ex-eyebrow">
            <span /> PUT SOMETHING WILD IN YOUR CALENDAR
          </span>
          <h2>
            The next
            <br />
            <em>adventure is calling.</em>
          </h2>
        </div>
        <p className="ex-section-aside">
          A shared trail. A new perspective.
          <br />
          Join an upcoming guided adventure.
        </p>
      </div>
      <div className="ex-event-list">
        {events.map((event) => (
          <Link className="ex-event" to={`/events/${event.id}`} key={event.id}>
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} loading="lazy" />
            ) : (
              <CalendarDays size={35} />
            )}
            <div>
              <span className="ex-eyebrow">
                {formatEventDate(event.event_date)}
              </span>
              <h3>{event.title}</h3>
              <p>{event.location}</p>
            </div>
            <span className="ex-event-spots">
              {event.spots_left === 0
                ? "Fully booked"
                : event.spots_left != null
                  ? `${event.spots_left} spots left`
                  : "View availability"}
            </span>
            <ArrowUpRight size={26} />
          </Link>
        ))}
      </div>
    </section>
  );
}
