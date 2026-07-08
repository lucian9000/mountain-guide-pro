import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon, Loader2, Minus, Plus, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  usePublicPricing,
  usePublicGuides,
  useCreateBooking,
} from "@/lib/queries/booking";
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

const Booking = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const pricing = usePublicPricing();
  const guides = usePublicGuides();
  const createBooking = useCreateBooking();

  const [params] = useSearchParams();
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
  const total = selectedTour ? Number(selectedTour.price) * participants : 0;
  const maxPax = selectedTour?.max_participants ?? 12;

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

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader variant="solid" />

      <main id="main" className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
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
            <div className="mb-8">
              <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-2 block">
                Book a Tour
              </span>
              <h1 className="font-heading text-3xl md:text-4xl font-black text-foreground tracking-wider uppercase">
                Plan Your Ascent
              </h1>
            </div>

            <DataState
              loading={pricing.isLoading || guides.isLoading}
              error={pricing.error || guides.error}
              empty={!pricing.data || pricing.data.length === 0}
              emptyMessage="No tours are available right now. Please check back soon."
            >
              <div className="glass-card glow-border p-6 md:p-8 space-y-6">
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
                      className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-cyan-hover text-accent-foreground px-8 py-3.5 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
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
          </>
        )}
      </main>
    </div>
  );
};

export default Booking;
