import { Link } from "react-router-dom";
import {
  Banknote,
  CalendarPlus,
  CalendarRange,
  ClipboardList,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  useAdminStats,
  useRecentBookings,
  useRecentClients,
} from "@/lib/queries/admin";
import { useAdminEvents } from "@/lib/queries/events";
import DataState from "@/components/admin/DataState";
import GoogleCalendarCard from "@/components/admin/GoogleCalendarCard";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const todayISO = () => new Date().toISOString().slice(0, 10);

/** The three things the guide actually comes here to do. */
const ACTIONS = [
  { to: "/admin/pricing", label: "Change a price", icon: Banknote },
  { to: "/admin/events/new", label: "Create an event", icon: CalendarPlus },
  { to: "/admin/bookings", label: "View bookings", icon: ClipboardList },
] as const;

const StatTile = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
}) => (
  <div className="glass-card glow-border p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-accent" />
      <span className="text-muted-foreground text-xs font-heading tracking-wider uppercase">
        {label}
      </span>
    </div>
    <div className="font-heading text-xl font-black text-foreground break-words">
      {value}
    </div>
  </div>
);

const AdminDashboard = () => {
  const stats = useAdminStats();
  const recentBookings = useRecentBookings(5);
  const recentClients = useRecentClients(5);
  const events = useAdminEvents();

  const nextEvent = (events.data ?? [])
    .filter((e) => e.event_date >= todayISO() && e.is_published)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))[0];

  const nextEventValue = events.isLoading
    ? "—"
    : nextEvent
      ? `${nextEvent.title} · ${Math.max(0, nextEvent.capacity - nextEvent.booked)} spots left`
      : "No upcoming events";

  return (
    <div className="space-y-8">
      {/* Primary actions — big, thumb-friendly, first thing on the page. */}
      <nav aria-label="Quick actions" className="grid gap-4 sm:grid-cols-3">
        {ACTIONS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="glass-card glow-border min-h-[100px] w-full flex flex-col items-center justify-center gap-3 p-6 text-center rounded-xl border border-border/40 hover:bg-accent/10 hover:border-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Icon className="w-9 h-9 text-accent" aria-hidden="true" />
            <span className="font-heading font-bold text-base text-foreground tracking-wide">
              {label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Compact at-a-glance row. */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={CalendarRange}
          label="Upcoming bookings"
          value={stats.isLoading ? "—" : String(stats.data?.upcomingBookings ?? 0)}
        />
        <StatTile icon={MapPin} label="Next event" value={nextEventValue} />
        <StatTile
          icon={Sparkles}
          label="Active specials"
          value={stats.isLoading ? "—" : String(stats.data?.activeSpecials ?? 0)}
        />
      </div>

      {/* Detail lists — tucked away, collapsed by default. */}
      <Accordion type="multiple" className="glass-card glow-border px-4">
        <AccordionItem value="bookings">
          <AccordionTrigger className="font-heading text-sm font-bold tracking-wider uppercase">
            Recent bookings
          </AccordionTrigger>
          <AccordionContent>
            <div className="overflow-x-auto">
              <DataState
                loading={recentBookings.isLoading}
                error={recentBookings.error}
                empty={!recentBookings.data || recentBookings.data.length === 0}
                emptyMessage="No bookings yet."
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Tour</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.data?.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="text-sm">
                          {b.client?.full_name ?? b.client?.email ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm">{b.tour?.name ?? "—"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {b.booking_date}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {b.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DataState>
            </div>
            <Link
              to="/admin/bookings"
              className="inline-block mt-3 text-accent text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              View all bookings
            </Link>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="clients">
          <AccordionTrigger className="font-heading text-sm font-bold tracking-wider uppercase">
            New clients
          </AccordionTrigger>
          <AccordionContent>
            <div className="overflow-x-auto">
              <DataState
                loading={recentClients.isLoading}
                error={recentClients.error}
                empty={!recentClients.data || recentClients.data.length === 0}
                emptyMessage="No clients yet."
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentClients.data?.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-sm">{c.full_name ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {c.email}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DataState>
            </div>
            <Link
              to="/admin/clients"
              className="inline-block mt-3 text-accent text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              View all clients
            </Link>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <GoogleCalendarCard />
    </div>
  );
};

export default AdminDashboard;
