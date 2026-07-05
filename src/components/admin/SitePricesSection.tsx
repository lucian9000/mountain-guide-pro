import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import type { PriceItem } from "@/lib/types/content";
import {
  useAdminPriceItems,
  useDeletePriceItem,
  useUpsertPriceItem,
} from "@/lib/queries/contentAdmin";
import { useToast } from "@/hooks/use-toast";
import DataState from "@/components/admin/DataState";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Draft = Partial<PriceItem> & { _key: string; price_rands?: string };

/**
 * Inline-editable price_items table — generic site prices referenced by a
 * stable item_key (anything that isn't a bookable tour). Rendered inside the
 * existing Pricing admin page.
 */
const SitePricesSection = () => {
  const { data, isLoading, error } = useAdminPriceItems();
  const upsert = useUpsertPriceItem();
  const del = useDeletePriceItem();
  const { toast } = useToast();

  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    if (data)
      setDrafts(
        data.map((p) => ({ ...p, _key: p.id, price_rands: String(p.price_cents / 100) }))
      );
  }, [data]);

  const patch = (key: string, fields: Partial<Draft>) =>
    setDrafts((d) => d.map((row) => (row._key === key ? { ...row, ...fields } : row)));

  const addRow = () =>
    setDrafts((d) => [
      ...d,
      { _key: `new-${Date.now()}`, item_key: "", label: "", price_rands: "", notes: "" },
    ]);

  const save = async (row: Draft) => {
    const key = (row.item_key ?? "").trim();
    if (!/^[a-z0-9]+([._-][a-z0-9]+)*$/.test(key)) {
      toast({
        title: "Invalid key",
        description: "Lowercase letters/numbers with . _ - separators, e.g. training.session",
        variant: "destructive",
      });
      return;
    }
    if (!row.label?.trim()) {
      toast({ title: "Label required", variant: "destructive" });
      return;
    }
    const rands = Number(row.price_rands ?? "");
    if (Number.isNaN(rands) || rands < 0) {
      toast({ title: "Price must be a non-negative number", variant: "destructive" });
      return;
    }
    try {
      await upsert.mutateAsync({
        id: row._key.startsWith("new-") ? undefined : row.id,
        item_key: key,
        label: row.label.trim(),
        price_cents: Math.round(rands * 100),
        notes: row.notes?.trim() || null,
      });
      toast({ title: "Saved", description: key });
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  const remove = async (row: Draft) => {
    if (row._key.startsWith("new-")) {
      setDrafts((d) => d.filter((r) => r._key !== row._key));
      return;
    }
    try {
      await del.mutateAsync(row.id as string);
      toast({ title: "Deleted", description: row.item_key ?? undefined });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase">
            Site Prices
          </h2>
          <p className="text-muted-foreground text-sm">
            Generic prices referenced across the site by a stable key (not
            bookable tours).
          </p>
        </div>
        <button
          onClick={addRow}
          className="inline-flex items-center gap-2 border border-accent/50 text-accent hover:bg-accent/10 px-4 py-2 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Price
        </button>
      </div>

      <div className="glass-card glow-border overflow-x-auto">
        <DataState
          loading={isLoading}
          error={error}
          empty={drafts.length === 0}
          emptyMessage="No site prices yet — tour prices live in the table above."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Key</TableHead>
                <TableHead className="min-w-[200px]">Label</TableHead>
                <TableHead>Price (R)</TableHead>
                <TableHead className="min-w-[200px]">Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drafts.map((row) => (
                <TableRow key={row._key}>
                  <TableCell>
                    <Input
                      value={row.item_key ?? ""}
                      disabled={!row._key.startsWith("new-")}
                      placeholder="e.g. training.session"
                      onChange={(e) => patch(row._key, { item_key: e.target.value })}
                      className="h-8 min-w-[150px] font-mono text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.label ?? ""}
                      maxLength={120}
                      onChange={(e) => patch(row._key, { label: e.target.value })}
                      className="h-8 min-w-[180px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.price_rands ?? ""}
                      inputMode="decimal"
                      onChange={(e) => patch(row._key, { price_rands: e.target.value })}
                      className="h-8 w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.notes ?? ""}
                      maxLength={500}
                      onChange={(e) => patch(row._key, { notes: e.target.value })}
                      className="h-8 min-w-[180px]"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => void save(row)}
                        title="Save"
                        className="p-2 rounded-md text-accent hover:bg-accent/10 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            title="Delete"
                            className="p-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this price?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Anything on the site referencing "{row.item_key}" will
                              stop showing a price.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => void remove(row)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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

export default SitePricesSection;
