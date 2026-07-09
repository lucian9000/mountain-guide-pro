import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useAdminBookings, useUpdateBookingStatus } from "@/lib/queries/admin";
import type { BookingStatus, BookingWithRelations } from "@/lib/types/db";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { useToast } from "@/hooks/use-toast";
import DataState from "@/components/admin/DataState";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TabKey = "upcoming" | "past" | "pending" | "cancelled";

const TABS: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "pending", label: "Pending" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_OPTIONS: BookingStatus[] = ["pending", "confirmed", "cancelled", "completed"];

const statusClasses: Record<BookingStatus, string> = {
  pending: "bg-warning/20 text-warning",
  confirmed: "bg-accent/20 text-accent",
  cancelled: "bg-destructive/20 text-destructive",
  completed: "bg-success/20 text-success",
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const filterByTab = (rows: BookingWithRelations[], tab: TabKey) => {
  const today = todayISO();
  switch (tab) {
    case "upcoming":
      return rows.filter((r) => r.booking_date >= today && r.status !== "cancelled");
    case "past":
      return rows.filter((r) => r.booking_date < today && r.status !== "cancelled");
    case "pending":
      return rows.filter((r) => r.status === "pending");
    case "cancelled":
      return rows.filter((r) => r.status === "cancelled");
  }
};

const AdminBookings = () => {
  const { data, isLoading, error } = useAdminBookings();
  const updateStatus = useUpdateBookingStatus();
  const { toast } = useToast();

  const [tab, setTab] = useState<TabKey>("upcoming");
  const [cancelTarget, setCancelTarget] = useState<BookingWithRelations | null>(null);

  const rows = useMemo(() => (data ? filterByTab(data, tab) : []), [data, tab]);

  const applyStatus = async (b: BookingWithRelations, status: BookingStatus) => {
    try {
      await updateStatus.mutateAsync({ id: b.id, status });
      toast({ title: `Marked ${status}` });
      if (status === "confirmed") {
        // Phase 3 stub — logs for now.
        void sendBookingConfirmationEmail(b.id);
      }
    } catch (e) {
      toast({
        title: "Update failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  const onStatusChange = (b: BookingWithRelations, next: BookingStatus) => {
    if (next === "cancelled") {
      setCancelTarget(b);
      return;
    }
    void applyStatus(b, next);
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Manage reservations. Website bookings sync from Google Calendar every ~10
        minutes and arrive as <span className="text-warning">Pending</span> — set them
        to <span className="text-accent">Confirmed</span> once payment is arranged.
      </p>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => (
          <TabsContent key={t.key} value={t.key}>
            <div className="glass-card glow-border overflow-x-auto">
              <DataState
                loading={isLoading}
                error={error}
                empty={rows.length === 0}
                emptyMessage={`No ${t.label.toLowerCase()} bookings.`}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Tour</TableHead>
                      <TableHead>Guide</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Pax</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Calendar</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <div className="font-medium text-foreground text-sm">
                            {b.client?.full_name ?? "—"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {b.client?.email ?? ""}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{b.tour?.name ?? "—"}</TableCell>
                        <TableCell className="text-sm">{b.guide?.display_name ?? "—"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {(() => {
                            try {
                              return format(new Date(b.booking_date), "d MMM yyyy");
                            } catch {
                              return b.booking_date;
                            }
                          })()}
                          {b.time_slot ? ` · ${b.time_slot}` : ""}
                        </TableCell>
                        <TableCell className="text-sm">{b.participants}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {b.total_price != null ? `R${b.total_price}` : "—"}
                        </TableCell>
                        <TableCell>
                          {b.calendar_synced ? (
                            <Badge variant="secondary" className="bg-success/20 text-success">
                              Synced
                            </Badge>
                          ) : b.notes === "Booked via Google Calendar appointment page" ? (
                            <Badge
                              variant="secondary"
                              className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                            >
                              Via Cal Page
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-muted-foreground">
                              Not synced
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={b.status}
                            onValueChange={(v) => onStatusChange(b, v as BookingStatus)}
                          >
                            <SelectTrigger className="h-8 w-[140px]">
                              <SelectValue>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs ${statusClasses[b.status]}`}
                                >
                                  {b.status}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s} className="capitalize">
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DataState>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the booking as cancelled. You can change it back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cancelTarget) void applyStatus(cancelTarget, "cancelled");
                setCancelTarget(null);
              }}
            >
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBookings;
