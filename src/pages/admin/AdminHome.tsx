import { Shield } from "lucide-react";

const features = [
  "Dashboard — stats & recent activity",
  "Clients — list, search, tags, CSV export",
  "Pricing — editable tour prices",
  "Specials — promotional banners",
  "Bookings — manage reservations",
  "Guides — guide profiles",
];

/** Phase 1 admin landing. The full CRM is built in Phase 2 (see project plan). */
const AdminHome = () => (
  <div className="max-w-2xl">
    <div className="glass-card glow-border p-8 md:p-10">
      <Shield className="w-10 h-10 text-accent mb-4" />
      <h1 className="font-heading text-2xl font-black text-foreground mb-2 tracking-wider uppercase">
        Admin Panel
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        You're authenticated as an admin. The CRM modules below are planned for
        Phase 2 and will appear here once built.
      </p>
      <ul className="space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default AdminHome;
