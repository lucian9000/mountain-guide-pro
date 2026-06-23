import { Link } from "react-router-dom";
import { CalendarPlus, CheckCircle2, LayoutDashboard } from "lucide-react";
import { buildGoogleCalendarUrl } from "@/lib/google-calendar";

export interface ConfirmedBooking {
  ref: string;
  tourName: string;
  guideName: string | null;
  date: string; // YYYY-MM-DD
  time: string | null;
  participants: number;
  total: number;
}

const BookingConfirmation = ({ booking }: { booking: ConfirmedBooking }) => {
  const gcalUrl = buildGoogleCalendarUrl({
    title: `SummitFit — ${booking.tourName}`,
    date: booking.date,
    time: booking.time,
    details: `Booking ref ${booking.ref}. Guide: ${booking.guideName ?? "TBC"}. Participants: ${booking.participants}.`,
  });

  const rows: [string, string][] = [
    ["Reference", booking.ref],
    ["Tour", booking.tourName],
    ["Guide", booking.guideName ?? "To be confirmed"],
    ["Date", booking.date],
    ["Time", booking.time ?? "To be confirmed"],
    ["Participants", String(booking.participants)],
    ["Total", `R${booking.total}`],
  ];

  return (
    <div className="glass-card glow-border p-8 max-w-lg mx-auto text-center">
      <CheckCircle2 className="w-12 h-12 text-[hsl(var(--success))] mx-auto mb-4" />
      <h1 className="font-heading text-2xl font-black text-foreground mb-2 tracking-wider uppercase">
        Booking Requested
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Your reference is <span className="text-accent font-bold">{booking.ref}</span>. We'll
        confirm your spot shortly.
      </p>

      <dl className="text-left divide-y divide-border/40 mb-6">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-2">
            <dt className="text-muted-foreground text-sm">{label}</dt>
            <dd className="text-foreground text-sm font-medium text-right">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={gcalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-[hsl(193,100%,42%)] text-accent-foreground px-6 py-3 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition-all"
        >
          <CalendarPlus className="w-4 h-4" /> Add to Google Calendar
        </a>
        <Link
          to="/dashboard/bookings"
          className="inline-flex items-center justify-center gap-2 border border-foreground/20 text-foreground hover:border-accent hover:text-accent px-6 py-3 rounded-lg font-heading font-bold text-sm tracking-wider uppercase transition-all"
        >
          <LayoutDashboard className="w-4 h-4" /> My Bookings
        </Link>
      </div>

      <p className="text-muted-foreground/60 text-xs mt-6">
        {/* TODO Phase 3: send confirmation email via an Edge Function (src/lib/email.ts). */}
        You'll receive a confirmation email shortly.
      </p>
    </div>
  );
};

export default BookingConfirmation;
