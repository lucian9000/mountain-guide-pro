import { Link } from "react-router-dom";
import { Pencil, Plus } from "lucide-react";
import { useAdminRoutes } from "@/lib/queries/contentAdmin";
import type { ContentStatus, RouteWithImages } from "@/lib/types/content";
import { routeCover } from "@/components/routes/RouteCard";
import { formatRands, relativeDate } from "@/lib/format";
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

export const StatusPill = ({ status, publishAt }: { status: ContentStatus; publishAt?: string | null }) => {
  const scheduled =
    status === "published" && publishAt && new Date(publishAt) > new Date();
  if (scheduled)
    return <Badge className="bg-gold/20 text-gold border border-gold/30">Scheduled</Badge>;
  if (status === "published")
    return <Badge className="bg-accent/20 text-accent border border-accent/30">Published</Badge>;
  if (status === "hidden")
    return <Badge className="bg-destructive/20 text-destructive border border-destructive/30">Hidden</Badge>;
  return <Badge variant="secondary">Draft</Badge>;
};

const AdminRoutes = () => {
  const routes = useAdminRoutes();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          Public route pages — only <span className="text-accent">published</span>{" "}
          routes appear on the site.
        </p>
        <Link
          to="/admin/routes/new"
          className="inline-flex items-center gap-2 bg-accent hover:bg-[hsl(193,100%,42%)] text-accent-foreground px-4 py-2 rounded-lg font-heading font-bold text-xs tracking-wider uppercase shadow-button transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> New Route
        </Link>
      </div>

      <DataState
        loading={routes.isLoading}
        error={routes.error}
        empty={!routes.data || routes.data.length === 0}
        emptyMessage="No routes yet — create your first one."
      >
        <div className="glass-card glow-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Cover</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.data?.map((route: RouteWithImages) => {
                const cover = routeCover(route);
                return (
                  <TableRow key={route.id}>
                    <TableCell>
                      <img
                        src={cover.src}
                        alt=""
                        className="w-12 h-9 rounded object-cover"
                        loading="lazy"
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/admin/routes/${route.id}`}
                        className="text-sm text-foreground hover:text-accent font-medium transition-colors"
                      >
                        {route.name}
                      </Link>
                      <div className="text-muted-foreground/60 text-xs">/{route.slug}</div>
                    </TableCell>
                    <TableCell>
                      <StatusPill status={route.status} publishAt={route.publish_at} />
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {route.price_cents > 0 ? formatRands(route.price_cents) : "POA"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {route.sort_order}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {relativeDate(route.updated_at)}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/admin/routes/${route.id}`}
                        title="Edit"
                        className="inline-flex p-2 rounded-md text-accent hover:bg-accent/10 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DataState>
    </div>
  );
};

export default AdminRoutes;
