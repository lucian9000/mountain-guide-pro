import { CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyBookings } from "@/lib/queries/admin";
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

const Bookings = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useMyBookings(user?.id);

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-accent" />
        <h1 className="font-heading text-lg font-bold text-foreground tracking-wider uppercase">
          Your Bookings
        </h1>
      </div>

      <div className="glass-card glow-border overflow-x-auto">
        <DataState
          loading={isLoading}
          error={error}
          empty={!data || data.length === 0}
          emptyMessage="No bookings yet. Once booking goes live, your adventures will appear here."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tour</TableHead>
                <TableHead>Guide</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Pax</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="text-sm">{b.tour?.name ?? "—"}</TableCell>
                  <TableCell className="text-sm">{b.guide?.display_name ?? "—"}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{b.booking_date}</TableCell>
                  <TableCell className="text-sm">{b.participants}</TableCell>
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
    </div>
  );
};

export default Bookings;
