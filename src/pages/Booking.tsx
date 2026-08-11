import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  CalendarDays,
  Check,
  Loader2,
  MapPin,
  Minus,
  Plus,
  LogIn,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  usePublicPricing,
  usePublicGuides,
  useCreateBooking,
} from "@/lib/queries/booking";
import { usePublicEvents, usePublicEvent, isEventFullError } from "@/lib/queries/events";
import { perPersonPrice, isGroupRate } from "@/lib/types/db";
import { supabase } from "@/lib/supabase/client";
import { findRoutes, type Route } from "@/data/routes";
import { getGuideAvailability, type TimeSlot } from "@/lib/google-calendar";
import SiteHeader from "@/components/SiteHeader";
import GoogleCalendarBooking from "@/components/booking/GoogleCalendarBooking";
import { Button } from "@/components/ui/button";
import BookingConfirmation, {
  type ConfirmedBooking,
} from "@/components/booking/BookingConfirmation";
import DataState from "@/components/admin/DataState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const makeRef = () => `SF-${Date.now().toString(36).slice(-6).toUpperCase()}`;

const formatEventDate = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

/**
 * The chat's route-recommendation step, reused here (same src/data/routes.ts
 * source — no duplicated route data) so unsure visitors can narrow down a hike
 * without leaving the booking page.
 */
const RouteRecommender = () => {
  const [picked, setPicked] = useState<number | null>(null);
  const results: Route[] = picked ? findRoutes(picked) : [];

  return (
    <details className="border border-border/40 rounded-lg px-4 py-3">
      <summary className="cursor-pointer select-none text-sm font-heading font-bold text-muted-foreground hover:text-accent tracking-wider uppercase transition-colors">
        Not sure which hike? Get a recommendation
      </summary>
      <div className="pt-4 space-y-2">
        <p className="text-xs text-muted-foreground">
          Pick your current fitness level — be honest, it keeps you safe on the
          mountain.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { level: 1, label: "1 — Just starting out" },
            { level: 2, label: "2 — Casual hiker" },
            { level: 3, label: "3 — Intermediate" },
            { level: 4, label: "4 — Fit & experienced" },
            { level: 5, label: "5 — Advanced athlete" },
          ].map(({ level, label }) => (
            <button
              key={level}
              type="button"
              onClick={() => setPicked(level)}
              className={`min-h-[44px] px-4 rounded-lg border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                picked === level
                  ? "border-accent text-accent"
                  : "border-border text-muted-foreground hover:text-accent hover:border-accent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {picked != null && (
          <ul className="space-y-2 pt-2">
            {results.length === 0 && (
              <li className="text-sm text-muted-foreground">
                No standard route matches — pick any tour below and we will
                tailor it with you.
              </li>
            )}
            {results.map((r) => (
              <li key={r.id} className="bg-secondary rounded-lg p-3 border-l-4 border-accent">
                <div className="font-heading text-sm font-bold text-foreground tracking-wider uppercase">
                  {r.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.location} — {r.specs.duration}, {r.specs.elevation}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
};

const Booking = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const pricing = usePublicPricing();
  const guides = usePublicGuides();
  const createBooking = useCreateBooking();

  const [params] = useSearchParams();
  const eventParam = params.get("event");

  const events = usePublicEvents();
  const deepLinkedEvent = usePublicEvent(eventParam);

  const [mode, setMode] = useState<"group" | "private">(eventParam ? "group" : "private");
  const [eventId, setEventId] = useState<string>(eventParam ?? "");
  const [eventPax, setEventPax] = useState(1);
  const [eventPending, setEventPending] = useState(false);

  const [tourId, setTourId] = useState<string>("");
  const [guideId, setGuideId] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState<string>("");
  const [participants, setParticipants] = useState(1);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [confirmed, setConfirmed] = useState<ConfirmedBooking | null>(null);

  // Pre-select the tour when arriving from a route page (?tour=<slug or id>).
  const requestedTour = params.get("tour");
  useEffect(() => {
    if (!requestedTour || tourId || !pricing.data) return;
    const match = pricing.data.find(
      (t) => t.tour_slug === requestedTour || t.id === requestedTour
    );
    if (match) setTourId(match.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedTour, pricing.data]);

  const selectedTour = pricing.data?.find((t) => t.id === tourId);
  const selectedGuide = guides.data?.find((g) => g.id === guideId);
  const perPerson = selectedTour ? perPersonPrice(selectedTour, participants) : 0;
  const groupRateApplied = selectedTour ? isGroupRate(selectedTour, participants) : false;
  const total = perPerson * participants;
  const maxPax = selectedTour?.max_participants ?? 12;

  const selectedEvent =
    events.data?.find((e) => e.id === eventId) ??
    (deepLinkedEvent.data && deepLinkedEvent.data.id === eventId ? deepLinkedEvent.data : undefined);
  const eventSpots = selectedEvent?.spots_left ?? selectedEvent?.capacity ?? 0;
  const eventTotal = selectedEvent ? Number(selectedEvent.price_per_person) * eventPax : 0;

  // Load (mock) availability whenever guide + date are chosen.
  useEffect(() => {
    let alive = true;
    if (guideId && date) {
      getGuideAvailability(guideId, format(date, "yyyy-MM-dd")).then((s) => {
        if (alive) setSlots(s);
      });
    } else {
      setSlots([]);
    }
    setSlot("");
    return () => {
      alive = false;
    };
  }, [guideId, date]);

  const canSubmit = tourId && date && !createBooking.isPending;

  const handleBook = async () => {
    if (!user) {
      navigate("/login?redirect=/booking");
      return;
    }
    if (!selectedTour || !date) return;

    const ref = makeRef();
    try {
      await createBooking.mutateAsync({
        user_id: user.id,
        pricing_id: selectedTour.id,
        guide_id: guideId || null,
        booking_date: format(date, "yyyy-MM-dd"),
        time_slot: slot || null,
        participants,
        total_price: total,
        booking_ref: ref,
      });
      setConfirmed({
        ref,
        tourName: selectedTour.name,
        guideName: guides.data?.find((g) => g.id === guideId)?.display_name ?? null,
        date: format(date, "yyyy-MM-dd"),
        time: slot || null,
        participants,
        total,
      });
    } catch (e) {
      toast({
        title: "Booking failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Event bookings carry `event_id` and NO `pricing_id` (DB constraint: one or
   * the other, never both). The overbooking trigger raises EVENT_FULL when the
   * last spots go while the visitor was deciding.
   */
  const handleBookEvent = async () => {
    if (!user) {
      navigate("/login?redirect=/booking");
      return;
    }
    if (!selectedEvent) return;

    const ref = makeRef();
    setEventPending(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          pricing_id: null,
          event_id: selectedEvent.id,
          guide_id: selectedEvent.guide_id,
          booking_date: selectedEvent.event_date,
          time_slot: selectedEvent.start_time,
          participants: eventPax,
          total_price: eventTotal,
          booking_ref: ref,
          status: "pending",
        })
        .select()
        .single();
      if (error) throw new Error(error.message);

      void Promise.resolve(
        supabase.functions.invoke("booking-email", { body: { booking_id: data.id } })
      ).catch((err) => console.warn("[booking] email notify failed:", err));

      setConfirmed({
        ref,
        tourName: selectedEvent.title,
        guideName: null,
        date: selectedEvent.event_date,
        time: selectedEvent.start_time,
        participants: eventPax,
        total: eventTotal,
      });
    } catch (e) {
      if (isEventFullError(e)) {
        toast({
          title: "This event just filled up",
          description: "Please pick another date.",
          variant: "destructive",
        });
        events.refetch();
        deepLinkedEvent.refetch();
        setEventId("");
      } else {
        toast({
          title: "Booking failed",
          description: e instanceof Error ? e.message : "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setEventPending(false);
    }
  };

  const openEvents = (events.data ?? []).filter((e) => (e.spots_left ?? e.capacity) > 0);

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader variant="solid" />

      {/* max-w-3xl (not 2xl) so the calendar iframe is ~672px wide — above
          Google's ~620px threshold, where it switches to the compact
          side-by-side month + time-slots layout (times appear beside the
          chosen date, never hidden below an internal scroll). */}
      <main id="main" className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>

        {!user ? (
          <div className="max-w-md mx-auto text-center glass-card glow-border rounded-xl p-8 mt-6">
            <h1 className="font-heading text-2xl md:text-3xl font-black text-foreground tracking-wider uppercase mb-3">
              Sign in to book your adventure
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Create a free account or sign in with your existing Google account to
              check availability and book a guided tour with Ernest.
            </p>
            <Button
              onClick={() => signInWithGoogle("/booking")}
              className="w-full bg-accent hover:bg-cyan-hover text-accent-foreground font-heading font-bold tracking-wider uppercase transition-colors"
            >
              <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
              Continue with Google
            </Button>
          </div>
        ) : confirmed ? (
          <BookingConfirmation booking={confirmed} />
        ) : (
          <>
            {/* Full hero heading before a tour is picked; once picked it
                shrinks to a compact title so the calendar fits on-screen
                without scrolling (an h1 stays for accessibility). */}
            {!tourId ? (
              <div className="mb-8">
                <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-2 block">
                  Book a Tour
                </span>
                <h1 className="font-heading text-3xl md:text-4xl font-black text-foreground tracking-wider uppercase">
                  Plan Your Ascent
                </h1>
              </div>
            ) : (
              <h1 className="font-heading text-xl font-black text-foreground tracking-wider uppercase mb-4">
                Book a Tour
              </h1>
            )}

            {/* Mode toggle: scheduled group events vs the private-tour flow. */}
            <div
              role="group"
              aria-label="Booking type"
              className="flex gap-2 mb-6"
            >
              {([
                { value: "group", label: "Join a group event" },
                { value: "private", label: "Book a private tour" },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  aria-pressed={mode === value}
                  className={`flex-1 min-h-[44px] px-4 rounded-lg border font-heading font-bold text-xs tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    mode === value
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border text-muted-foreground hover:text-accent hover:border-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {mode === "group" ? (
              <div className="glass-card glow-border p-6 md:p-8 space-y-6">
                {selectedEvent ? (
                  <>
                    <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-4">
                      <div className="min-w-0">
                        <div className="font-heading font-bold text-foreground tracking-wider uppercase">
                          {selectedEvent.title}
                        </div>
                        <div className="text-muted-foreground text-sm flex flex-wrap gap-x-4">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4 text-accent" aria-hidden="true" />
                            {formatEventDate(selectedEvent.event_date)}
                          </span>
                          {selectedEvent.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gold" aria-hidden="true" />
                              {selectedEvent.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-accent" aria-hidden="true" />
                            {eventSpots} spots left
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEventId("")}
                        className="shrink-0 text-accent hover:text-cyan-hover text-sm font-heading font-bold tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-2 py-1"
                      >
                        Change
                      </button>
                    </div>

                    {selectedEvent.description && (
                      <p className="text-muted-foreground text-sm">
                        {selectedEvent.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <label
                        htmlFor="event-participants"
                        className="text-sm font-heading font-bold text-foreground tracking-wider uppercase"
                      >
                        Participants
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setEventPax((p) => Math.max(1, p - 1))}
                          className="w-11 h-11 rounded-lg border border-border hover:border-accent text-foreground flex items-center justify-center transition-colors"
                          aria-label="Fewer event participants"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          id="event-participants"
                          type="text"
                          readOnly
                          value={eventPax}
                          className="font-heading text-xl font-bold text-foreground w-8 text-center bg-transparent border-0 p-0"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEventPax((p) => Math.min(Math.max(1, eventSpots), p + 1))
                          }
                          className="w-11 h-11 rounded-lg border border-border hover:border-accent text-foreground flex items-center justify-center transition-colors"
                          aria-label="More event participants"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="text-muted-foreground text-xs">
                          max {eventSpots}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border/40 pt-5 flex items-center justify-between">
                      <div>
                        <div className="text-muted-foreground text-xs uppercase tracking-wider">
                          Total
                        </div>
                        <div className="font-heading text-2xl font-black text-accent">
                          R{eventTotal}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleBookEvent}
                        disabled={eventPending || eventSpots < 1}
                        className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-cyan-hover text-accent-foreground px-8 py-3.5 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition-colors disabled:opacity-60"
                      >
                        {eventPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Booking…
                          </>
                        ) : (
                          "Book my spot"
                        )}
                      </button>
                    </div>
                  </>
                ) : openEvents.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No group events are scheduled right now — book a private tour
                    instead and we will find a date that suits you.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {openEvents.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-center justify-between gap-3 border border-border/40 rounded-lg p-4"
                      >
                        <div className="min-w-0">
                          <div className="font-heading font-bold text-foreground tracking-wider uppercase truncate">
                            {e.title}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {formatEventDate(e.event_date)} — R
                            {Number(e.price_per_person)} pp —{" "}
                            {e.spots_left ?? e.capacity} spots left
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEventId(e.id);
                            setEventPax(1);
                          }}
                          className="shrink-0 min-h-[44px] px-4 rounded-lg bg-accent hover:bg-cyan-hover text-accent-foreground font-heading font-bold text-xs tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          Select
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <DataState
                loading={pricing.isLoading || guides.isLoading}
                error={pricing.error || guides.error}
                empty={!pricing.data || pricing.data.length === 0}
                emptyMessage="No tours are available right now. Please check back soon."
              >
                <div className="glass-card glow-border p-6 md:p-8 space-y-6">
                  <RouteRecommender />

                  {/* Tour + Guide pickers. Once a tour is chosen these collapse
                      into a one-line summary so the calendar rises to the top
                      and the whole thing fits without scrolling. */}
                  {!tourId ? (
                  <>
                    {/* Tour */}
                    <div className="space-y-2">
                      <label
                        htmlFor="booking-tour"
                        className="text-sm font-heading font-bold text-foreground tracking-wider uppercase"
                      >
                        Tour
                        <span aria-hidden="true" className="text-accent"> *</span>
                        <span className="sr-only"> (required)</span>
                      </label>
                      <Select value={tourId} onValueChange={setTourId}>
                        <SelectTrigger id="booking-tour" aria-required="true">
                          <SelectValue placeholder="Choose a route" />
                        </SelectTrigger>
                        <SelectContent>
                          {pricing.data?.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name} — R{t.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Guide */}
                    <div className="space-y-2">
                      <label
                        htmlFor="booking-guide"
                        className="text-sm font-heading font-bold text-foreground tracking-wider uppercase"
                      >
                        Guide{" "}
                        <span className="text-muted-foreground font-normal normal-case">
                          (optional)
                        </span>
                      </label>
                      {guides.data && guides.data.length > 0 ? (
                        <Select value={guideId} onValueChange={setGuideId}>
                          <SelectTrigger id="booking-guide">
                            <SelectValue placeholder="Any available guide" />
                          </SelectTrigger>
                          <SelectContent>
                            {guides.data.map((g) => (
                              <SelectItem key={g.id} value={g.id}>
                                {g.display_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          A guide will be assigned to your booking.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-4">
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        Your tour
                      </div>
                      <div className="font-heading font-bold text-foreground truncate">
                        {selectedTour?.name}
                        {selectedTour ? ` — R${selectedTour.price}` : ""}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {selectedGuide ? `with ${selectedGuide.display_name}` : "Any available guide"}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setTourId("");
                        setGuideId("");
                      }}
                      className="shrink-0 text-accent hover:text-cyan-hover text-sm font-heading font-bold tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded px-2 py-1"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* Primary flow: book directly in Ernest's Google Calendar */}
                <GoogleCalendarBooking
                  tourName={selectedTour?.name ?? ""}
                  guideName={selectedGuide?.display_name ?? ""}
                  isVisible={!!tourId}
                />

                {/* Fallback: the native Supabase request form (participants +
                    price capture). Google Calendar is the primary path above. */}
                <details className="border-t border-border/40 pt-5">
                  <summary className="cursor-pointer select-none text-sm font-heading font-bold text-muted-foreground hover:text-accent tracking-wider uppercase transition-colors">
                    Prefer to request manually?
                  </summary>
                  <div className="space-y-6 pt-6">

                {/* Date */}
                <div className="space-y-2">
                  <label
                    htmlFor="booking-date"
                    className="text-sm font-heading font-bold text-foreground tracking-wider uppercase"
                  >
                    Date
                    <span aria-hidden="true" className="text-accent"> *</span>
                    <span className="sr-only"> (required)</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        id="booking-date"
                        className="w-full flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-left hover:border-accent transition-colors"
                      >
                        <CalendarIcon className="w-4 h-4 text-accent" />
                        {date ? format(date, "EEEE, d MMMM yyyy") : (
                          <span className="text-muted-foreground">Pick a date</span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-muted-foreground text-xs">
                    {/* TODO Phase 3: real availability from getGuideAvailability() via Edge Function */}
                    All dates shown as available — live availability arrives with calendar sync.
                  </p>
                </div>

                {/* Time slot */}
                {slots.length > 0 && (
                  <div className="space-y-2">
                    <label
                      htmlFor="booking-time"
                      className="text-sm font-heading font-bold text-foreground tracking-wider uppercase"
                    >
                      Time
                    </label>
                    <Select value={slot} onValueChange={setSlot}>
                      <SelectTrigger id="booking-time">
                        <SelectValue placeholder="Pick a start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {slots.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Participants */}
                <div className="space-y-2">
                  <label
                    htmlFor="booking-participants"
                    className="text-sm font-heading font-bold text-foreground tracking-wider uppercase"
                  >
                    Participants
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setParticipants((p) => Math.max(1, p - 1))}
                      className="w-11 h-11 rounded-lg border border-border hover:border-accent text-foreground flex items-center justify-center transition-colors"
                      aria-label="Fewer participants"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      id="booking-participants"
                      type="text"
                      readOnly
                      value={participants}
                      className="font-heading text-xl font-bold text-foreground w-8 text-center bg-transparent border-0 p-0"
                    />
                    <button
                      onClick={() => setParticipants((p) => Math.min(maxPax, p + 1))}
                      className="w-11 h-11 rounded-lg border border-border hover:border-accent text-foreground flex items-center justify-center transition-colors"
                      aria-label="More participants"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-muted-foreground text-xs">max {maxPax}</span>
                  </div>
                  {selectedTour && groupRateApplied && (
                    <p className="text-sm text-accent font-heading font-bold tracking-wider uppercase">
                      Group rate applied
                      <Check className="w-4 h-4 inline-block mx-1" aria-hidden="true" />{" "}
                      <span className="font-normal normal-case tracking-normal text-muted-foreground">
                        <span className="line-through">R{Number(selectedTour.price)}</span>{" "}
                        R{perPerson} per person
                      </span>
                    </p>
                  )}
                </div>

                {/* Summary + submit */}
                <div className="border-t border-border/40 pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-muted-foreground text-xs uppercase tracking-wider">
                        Total
                      </div>
                      <div className="font-heading text-2xl font-black text-accent">
                        R{total}
                      </div>
                    </div>
                    <button
                      onClick={handleBook}
                      disabled={!canSubmit}
                      className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-cyan-hover text-accent-foreground px-8 py-3.5 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition-colors disabled:opacity-60"
                    >
                      {createBooking.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Booking…
                        </>
                      ) : user ? (
                        "Book Now"
                      ) : (
                        "Sign in to Book"
                      )}
                    </button>
                  </div>
                  {(!tourId || !date) && (
                    <p className="text-sm text-muted-foreground mt-3 text-right">
                      Select a tour and date to continue.
                    </p>
                  )}
                </div>
                  </div>
                </details>
                </div>
              </DataState>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Booking;
