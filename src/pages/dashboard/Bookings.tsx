import { CalendarDays } from "lucide-react";

/** Placeholder — real bookings list arrives with Phase 2/3 (bookings table + RLS). */
const Bookings = () => (
  <div className="glass-card glow-border p-10 text-center max-w-2xl">
    <CalendarDays className="w-10 h-10 text-accent mx-auto mb-4" />
    <h1 className="font-heading text-xl font-bold text-foreground mb-2 tracking-wider uppercase">
      Your Bookings
    </h1>
    <p className="text-muted-foreground text-sm">
      Your booked adventures will appear here. Booking goes live in a later
      phase — for now, reach out via the chat or WhatsApp to reserve a route.
    </p>
  </div>
);

export default Bookings;
