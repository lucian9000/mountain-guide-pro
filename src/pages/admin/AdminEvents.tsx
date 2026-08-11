import { Link, useNavigate } from "react-router-dom";
import {
  CalendarPlus,
  Copy,
  Mountain,
  Pencil,
  Trash2,
} from "lucide-react";
import type { EventItem } from "@/lib/types/db";
import { useAdminEvents, useDeleteEvent } from "@/lib/queries/events";
import { useToast } from "@/hooks/use-toast";
import DataState from "@/components/admin/DataState";
import { formatEventDate } from "@/components/admin/eventFormat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type EventRow = EventItem & { booked: number };

const todayISO = () => new Date().toISOString().slice(0, 10);

const EventCard = ({
  event,
  onDelete,
}: {
  event: EventRow;
  onDelete: (e: EventRow) => void;
}) => {
  const navigate = useNavigate();
  const pct = event.capacity > 0 ? Math.min(100, (event.booked / event.capacity) * 100) : 0;

  return (
    <article className="glass-card glow-border overflow-hidden rounded-xl flex flex-col">
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

      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading font-bold text-lg text-foreground leading-tight">
            {event.title}
          </h3>
          <Badge
            variant="secondary"
            className={
              event.is_published ? "bg-success/20 text-success" : "text-muted-foreground"
            }
          >
            {event.is_published ? "Published" : "Draft"}
          </Badge>
        </div>

        <p className="text-muted-foreground text-sm">{formatEventDate(event.event_date)}</p>

        <div className="space-y-1.5">
          <Progress value={pct} className="h-2" />
          <p className="text-sm text-foreground/80">
            {event.booked} of {event.capacity} spots booked
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 mt-auto">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/events/${event.id}`)}
            className="h-11 flex-1 gap-2 focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Pencil className="w-4 h-4" /> Edit
          </Button>
          <Button
            variant="ghost"
            aria-label={`Duplicate ${event.title}`}
            onClick={() => navigate(`/admin/events/new?duplicate=${event.id}`)}
            className="h-11 w-11 p-0 focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                aria-label={`Delete ${event.title}`}
                className="h-11 w-11 p-0 text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                <AlertDialogDescription>
                  "{event.title}" will be permanently removed. Bookings already made for
                  it will lose their link to the event. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(event)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </article>
  );
};

const AdminEvents = () => {
  const { data, isLoading, error } = useAdminEvents();
  const del = useDeleteEvent();
  const { toast } = useToast();

  const events = data ?? [];
  const today = todayISO();
  const upcoming = events
    .filter((e) => e.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  const past = events
    .filter((e) => e.event_date < today)
    .sort((a, b) => b.event_date.localeCompare(a.event_date));

  const onDelete = async (event: EventRow) => {
    try {
      await del.mutateAsync(event.id);
      toast({ title: "Event deleted", description: event.title });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Dated group adventures people can book from the website.
        </p>
        <Button
          asChild
          className="h-11 gap-2 bg-accent text-accent-foreground hover:bg-cyan-hover focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Link to="/admin/events/new">
            <CalendarPlus className="w-4 h-4" /> New event
          </Link>
        </Button>
      </div>

      <DataState loading={isLoading} error={error}>
        {events.length === 0 ? (
          <div className="glass-card glow-border p-10 text-center space-y-4">
            <CalendarPlus className="w-10 h-10 text-accent mx-auto" aria-hidden="true" />
            <h2 className="font-heading font-bold text-xl text-foreground">
              No events yet
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Events are one-off dated adventures — a sunrise hike, a full-moon summit.
              Create one and it appears on the website once you publish it.
            </p>
            <Button
              asChild
              className="h-12 gap-2 bg-accent text-accent-foreground hover:bg-cyan-hover focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Link to="/admin/events/new">
                <CalendarPlus className="w-4 h-4" /> Create your first event
              </Link>
            </Button>
          </div>
        ) : null}

        {upcoming.length === 0 && past.length > 0 ? (
          <p className="text-muted-foreground text-sm">No upcoming events.</p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcoming.map((e) => (
            <EventCard key={e.id} event={e} onDelete={onDelete} />
          ))}
        </div>

        {past.length > 0 ? (
          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="past">
              <AccordionTrigger className="font-heading text-sm font-bold tracking-wider uppercase">
                Past events ({past.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 pt-2">
                  {past.map((e) => (
                    <EventCard key={e.id} event={e} onDelete={onDelete} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : null}
      </DataState>
    </div>
  );
};

export default AdminEvents;
