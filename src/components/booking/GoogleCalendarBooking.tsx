import { Link } from "react-router-dom";
import { CalendarDays, ExternalLink, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface GoogleCalendarBookingProps {
  tourName: string;
  guideName: string;
  isVisible: boolean;
}

/**
 * Primary booking flow: embeds Ernest's Google Calendar Appointment Schedule.
 * Google Workspace handles the client confirmation email, Ernest's notification,
 * and the calendar event automatically — no code. Clients do NOT need their own
 * Google Calendar; they just use this embedded page.
 */
const GoogleCalendarBooking = ({ tourName, guideName, isVisible }: GoogleCalendarBookingProps) => {
  const isMobile = useIsMobile();
  const bookingUrl = import.meta.env.VITE_GOOGLE_BOOKING_URL as string | undefined;

  if (!isVisible) return null;

  // Fail-safe: configured only once Ernest pastes his appointment-schedule
  // embed URL into VITE_GOOGLE_BOOKING_URL. Keeps dev/preview from breaking.
  if (!bookingUrl) {
    return (
      <div className="glass-card border border-border/40 rounded-xl p-6 text-center">
        <Info className="w-6 h-6 text-accent mx-auto mb-3" aria-hidden="true" />
        <p className="text-muted-foreground text-sm">
          Booking calendar not configured yet. Please use the manual request form below,
          or contact Ernest directly.
        </p>
      </div>
    );
  }

  // Appointment Schedules currently ignore gv_successUrl; harmless + future-proof.
  // The reliable path to the thank-you page is the manual button below.
  const successUrl = encodeURIComponent(
    `${import.meta.env.VITE_SITE_URL || window.location.origin}/booking/confirmed`
  );
  const url = `${bookingUrl}?gv_successUrl=${successUrl}`;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-xl font-bold text-foreground tracking-wider uppercase mb-2">
          Select your date &amp; time
        </h3>
        <p className="text-muted-foreground text-sm">
          You're booking: <span className="text-foreground font-medium">{tourName}</span>
          {guideName ? (
            <>
              {" "}with <span className="text-foreground font-medium">{guideName}</span>
            </>
          ) : null}
        </p>
        <p className="text-muted-foreground text-sm">
          Pick an available slot from Ernest's calendar below.
        </p>
      </div>

      {isMobile ? (
        <a href={url} target="_blank" rel="noreferrer" className="block">
          <Button className="w-full bg-accent hover:bg-cyan-hover text-accent-foreground font-heading font-bold tracking-wider uppercase transition-colors">
            <CalendarDays className="w-4 h-4 mr-2" aria-hidden="true" />
            Open booking calendar
            <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
          </Button>
          <p className="text-muted-foreground text-xs text-center mt-2">
            Tap to open Ernest's booking calendar in a new tab.
          </p>
        </a>
      ) : (
        <iframe
          src={url}
          style={{ width: "100%", minHeight: "700px", border: "none", borderRadius: "12px" }}
          title="Book your tour with Ernest"
        />
      )}

      <div className="glass-card border border-border/40 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Google will email you a confirmation once you book, and Ernest is notified
            automatically. He'll follow up on WhatsApp to confirm the details.
          </p>
          <Link
            to="/booking/confirmed"
            className="inline-flex items-center gap-1 text-accent hover:text-cyan-hover text-sm font-heading font-bold tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
          >
            I've completed my booking
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarBooking;
