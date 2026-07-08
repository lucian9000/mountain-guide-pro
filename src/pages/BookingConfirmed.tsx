import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Mail, Phone, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Thank-you page after a client books through Ernest's Google Calendar
 * appointment page. Informational ONLY — it deliberately does NOT write a
 * Supabase booking row. Google Workspace already sends the confirmation email,
 * notifies Ernest, and creates the calendar event; the authoritative record
 * lives in his Google Calendar. The Supabase mirror is created by the Phase-5
 * backend Edge Function (see the note at the bottom of this file).
 */
const BookingConfirmed = () => {
  const [params] = useSearchParams();
  const { user } = useAuth();

  // Defensive: a future backend redirect may pass these. Never required.
  const eventTitle = params.get("eventTitle");
  const startTime = params.get("startTime");

  const parsed = startTime ? new Date(startTime) : null;
  const validDate = parsed && !isNaN(parsed.getTime()) ? parsed : null;
  const readableWhen = validDate
    ? validDate.toLocaleString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Best-effort "add to your own calendar" template link.
  const calText = encodeURIComponent(eventTitle || "SummitFit Adventures — Guided Tour");
  let addToCalendar = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calText}`;
  if (validDate) {
    const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const end = new Date(validDate.getTime() + 2 * 60 * 60 * 1000); // assume ~2h
    addToCalendar += `&dates=${stamp(validDate)}/${stamp(end)}`;
  }

  const mailto =
    "mailto:ernest@summitfitadventures.com?subject=Booking%20Enquiry" +
    "&body=Hi%20Ernest%2C%20I%20just%20completed%20a%20booking%20via%20your%20calendar.";

  const steps = [
    {
      icon: Mail,
      text: "Google Calendar has emailed you a confirmation — check your inbox and spam folder.",
    },
    {
      icon: Phone,
      text: "Ernest will reach out on WhatsApp (+27 67 130 1536) to confirm logistics, what to bring, and the meeting point.",
    },
    {
      icon: Calendar,
      text: "Add it to your own calendar:",
      action: (
        <a href={addToCalendar} target="_blank" rel="noreferrer" className="inline-block mt-2">
          <Button
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:text-accent hover:border-accent transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
            Add to my calendar
          </Button>
        </a>
      ),
    },
  ];

  return (
    <main id="main" className="min-h-dvh bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" aria-hidden="true" />

        <h1 className="font-heading text-3xl md:text-4xl font-black text-foreground tracking-wider uppercase mb-3">
          You're booked!
        </h1>
        <p className="text-muted-foreground text-lg mb-1">
          {eventTitle || "Your tour with Ernest is confirmed"}
        </p>
        {readableWhen && <p className="text-accent text-sm mb-8">{readableWhen}</p>}

        <div className="glass-card glow-border rounded-xl p-6 text-left mt-8 mb-8">
          <h2 className="font-heading text-sm font-bold text-foreground tracking-widest uppercase mb-5">
            What happens next
          </h2>
          <ol className="space-y-5">
            {steps.map(({ icon: Icon, text, action }, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="shrink-0 w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
                </span>
                <div className="text-muted-foreground text-sm pt-1.5">
                  {text}
                  {action}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {user && (
            <Link to="/dashboard/bookings">
              <Button className="w-full sm:w-auto bg-accent hover:bg-cyan-hover text-accent-foreground font-heading font-bold tracking-wider uppercase transition-colors">
                View My Bookings
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            </Link>
          )}
          <Link to="/">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-border text-foreground hover:text-accent hover:border-accent font-heading font-bold tracking-wider uppercase transition-colors"
            >
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="mt-8">
          <a
            href={mailto}
            className="text-muted-foreground hover:text-accent text-xs transition-colors underline underline-offset-4"
          >
            Something wrong? Contact Ernest directly →
          </a>
        </p>
      </div>
    </main>
  );
};

export default BookingConfirmed;

/**
 * PHASE 5 BACKEND — Email notifications & Supabase mirror (not yet implemented)
 * When the Supabase Edge Function is ready it — not this page — owns the record:
 * 1. A Google Calendar API watch/poll (using Ernest's admin credentials) detects
 *    the new appointment and creates the matching public.bookings row
 *    (user_id matched by client email, status 'confirmed',
 *    notes 'Booked via Google Calendar appointment page', google_cal_event_id set).
 * 2. Sends a branded confirmation email to the client via Resend.
 * 3. Sends an admin notification to ernest@summitfitadventures.com.
 * Env var for the trigger: VITE_SUPABASE_FUNCTIONS_URL (in .env.example).
 * This page stays purely informational so no unverified client-side rows are written.
 */
