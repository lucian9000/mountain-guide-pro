import { Link } from "react-router-dom";
import { CalendarDays, Mountain } from "lucide-react";

const DashboardHome = () => (
  <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
    <Link
      to="/dashboard/bookings"
      className="glass-card glow-border glow-border-hover p-6 transition-all hover:-translate-y-1"
    >
      <CalendarDays className="w-7 h-7 text-accent mb-4" />
      <h2 className="font-heading text-lg font-bold text-foreground mb-1 tracking-wider uppercase">
        My Bookings
      </h2>
      <p className="text-muted-foreground text-sm">
        View and manage your upcoming adventures.
      </p>
    </Link>

    <Link
      to="/#expeditions"
      className="glass-card glow-border glow-border-hover p-6 transition-all hover:-translate-y-1"
    >
      <Mountain className="w-7 h-7 text-gold mb-4" />
      <h2 className="font-heading text-lg font-bold text-foreground mb-1 tracking-wider uppercase">
        Explore Routes
      </h2>
      <p className="text-muted-foreground text-sm">
        Browse featured routes and plan your next summit.
      </p>
    </Link>
  </div>
);

export default DashboardHome;
