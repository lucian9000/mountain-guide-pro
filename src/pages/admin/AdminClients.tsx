import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { useClients } from "@/lib/queries/admin";
import type { Profile } from "@/types/auth";
import { downloadCsv } from "@/lib/csv";
import DataState from "@/components/admin/DataState";
import ClientDetailSheet from "@/components/admin/ClientDetailSheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const splitName = (full: string | null) => {
  const parts = (full ?? "").trim().split(/\s+/);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
};

const AdminClients = () => {
  const { data, isLoading, error } = useClients();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (c) =>
        (c.full_name ?? "").toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [data, query]);

  const exportCsv = () => {
    downloadCsv<Profile>(
      "summitfit-clients.csv",
      [
        ["email", (c) => c.email],
        ["first_name", (c) => splitName(c.full_name).first],
        ["last_name", (c) => splitName(c.full_name).last],
        ["signup_date", (c) => new Date(c.created_at).toISOString().slice(0, 10)],
        ["opt_in", (c) => (c.marketing_opt_in ? "yes" : "no")],
      ],
      filtered
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 border border-accent/40 text-accent px-4 py-2 rounded-lg font-heading font-bold text-xs tracking-wider uppercase hover:bg-accent/10 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="glass-card glow-border overflow-x-auto">
        <DataState
          loading={isLoading}
          error={error}
          empty={filtered.length === 0}
          emptyMessage={query ? "No clients match your search." : "No clients yet."}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Signed up</TableHead>
                <TableHead>Opt-in</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium text-foreground">
                    {c.full_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        c.marketing_opt_in
                          ? "bg-success/20 text-success"
                          : "text-muted-foreground"
                      }
                    >
                      {c.marketing_opt_in ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(c.tags ?? []).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataState>
      </div>

      <p className="text-muted-foreground/50 text-xs">
        {/* TODO Phase 3: on new client signup, sync email to Mailchimp/Loops via an
        Edge Function (see src/lib/marketing-sync.ts). */}
        CSV export is ready for import into your email marketing tool.
      </p>

      <ClientDetailSheet
        client={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
};

export default AdminClients;
