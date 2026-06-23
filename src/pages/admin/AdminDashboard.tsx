import { Link } from "react-router-dom";
import { CalendarRange, Sparkles, TrendingUp, Users } from "lucide-react";
import {
  useAdminStats,
  useRecentBookings,
  useRecentClients,
} from "@/lib/queries/admin";
import DataState from "@/components/admin/DataState";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StatCard = ({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Users;
  label: string;
  value: number | undefined;
  loading: boolean;
}) => (
  <div className="glass-card glow-border p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-muted-foreground text-xs font-heading tracking-wider uppercase">
        {label}
      </span>
      <Icon className="w-5 h-5 text-accent" />
    </div>
    <div className="font-heading text-3xl font-black text-foreground">
      {loading ? "—" : (value ?? 0)}
    </div>
  </div>
);

const AdminDashboard = () => {
  const stats = useAdminStats();
  const recentBookings = useRecentBookings(5);
  const recentClients = useRecentClients(5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Clients" value={stats.data?.totalClients} loading={stats.isLoading} />
        <StatCard icon={CalendarRange} label="Upcoming" value={stats.data?.upcomingBookings} loading={stats.isLoading} />
        <StatCard icon={Sparkles} label="Active Specials" value={stats.data?.activeSpecials} loading={stats.isLoading} />
        <StatCard icon={TrendingUp} label="This Month" value={stats.data?.bookingsThisMonth} loading={stats.isLoading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent bookings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase">
              Recent Bookings
            </h2>
            <Link to="/admin/bookings" className="text-accent text-xs hover:underline">
              View all
            </Link>
          </div>
          <div className="glass-card glow-border overflow-x-auto">
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
                      <TableCell className="text-sm">{b.client?.full_name ?? b.client?.email ?? "—"}</TableCell>
                      <TableCell className="text-sm">{b.tour?.name ?? "—"}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{b.booking_date}</TableCell>
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
        </section>

        {/* Recent clients */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase">
              New Clients
            </h2>
            <Link to="/admin/clients" className="text-accent text-xs hover:underline">
              View all
            </Link>
          </div>
          <div className="glass-card glow-border overflow-x-auto">
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
                      <TableCell className="text-sm text-muted-foreground">{c.email}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DataState>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
