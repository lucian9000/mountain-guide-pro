import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import {
  usePricing,
  useUpsertPricing,
  useDeletePricing,
} from "@/lib/queries/admin";
import type { Pricing } from "@/lib/types/db";
import { useToast } from "@/hooks/use-toast";
import DataState from "@/components/admin/DataState";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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

type Draft = Partial<Pricing> & { _key: string };

const toDraft = (p: Pricing): Draft => ({ ...p, _key: p.id });

const AdminPricing = () => {
  const { data, isLoading, error } = usePricing();
  const upsert = useUpsertPricing();
  const del = useDeletePricing();
  const { toast } = useToast();

  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    if (data) setDrafts(data.map(toDraft));
  }, [data]);

  const patch = (key: string, field: keyof Pricing, value: unknown) =>
    setDrafts((d) => d.map((row) => (row._key === key ? { ...row, [field]: value } : row)));

  const addRow = () =>
    setDrafts((d) => [
      ...d,
      {
        _key: `new-${d.length}-${d.reduce((a, r) => a + r._key.length, 0)}`,
        name: "",
        price: 0,
        price_group: 0,
        currency: "ZAR",
        duration: "",
        difficulty: 1,
        max_participants: 1,
        display_order: d.length + 1,
        active: true,
      },
    ]);

  const save = async (row: Draft) => {
    const { _key, ...rest } = row;
    if (!rest.name?.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    try {
      // Drop the synthetic id for new rows so the DB generates one.
      const payload = _key.startsWith("new-") ? { ...rest, id: undefined } : rest;
      await upsert.mutateAsync(payload);
      toast({ title: "Saved", description: rest.name });
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (row: Draft, next: boolean) => {
    patch(row._key, "active", next);
    if (row._key.startsWith("new-")) return; // not persisted yet
    try {
      await upsert.mutateAsync({ id: row.id, active: next });
    } catch (e) {
      patch(row._key, "active", !next);
      toast({
        title: "Update failed",
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
      toast({ title: "Deleted", description: row.name ?? undefined });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  const numInput = (key: string, field: keyof Pricing, value: number | null | undefined) => (
    <Input
      type="number"
      value={value ?? ""}
      onChange={(e) =>
        patch(key, field, e.target.value === "" ? null : Number(e.target.value))
      }
      className="h-8 w-20"
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Edit tour prices shown on the public site. Changes apply immediately.
        </p>
        <button
          onClick={addRow}
          className="inline-flex items-center gap-2 bg-accent hover:bg-[hsl(193,100%,42%)] text-accent-foreground px-4 py-2 rounded-lg font-heading font-bold text-xs tracking-wider uppercase shadow-button transition-all"
        >
          <Plus className="w-4 h-4" /> Add Tour
        </button>
      </div>

      <div className="glass-card glow-border overflow-x-auto">
        <DataState
          loading={isLoading}
          error={error}
          empty={drafts.length === 0}
          emptyMessage="No tours yet. Add your first one."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Name</TableHead>
                <TableHead className="min-w-[220px]">Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="min-w-[120px]">Duration</TableHead>
                <TableHead>Diff.</TableHead>
                <TableHead>Max</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drafts.map((row) => (
                <TableRow key={row._key}>
                  <TableCell>
                    <Input
                      value={row.name ?? ""}
                      onChange={(e) => patch(row._key, "name", e.target.value)}
                      className="h-8 min-w-[160px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.description ?? ""}
                      onChange={(e) => patch(row._key, "description", e.target.value)}
                      className="h-8 min-w-[200px]"
                    />
                  </TableCell>
                  <TableCell>{numInput(row._key, "price", row.price)}</TableCell>
                  <TableCell>{numInput(row._key, "price_group", row.price_group)}</TableCell>
                  <TableCell>
                    <Input
                      value={row.duration ?? ""}
                      onChange={(e) => patch(row._key, "duration", e.target.value)}
                      className="h-8 w-28"
                    />
                  </TableCell>
                  <TableCell>{numInput(row._key, "difficulty", row.difficulty)}</TableCell>
                  <TableCell>
                    {numInput(row._key, "max_participants", row.max_participants)}
                  </TableCell>
                  <TableCell>{numInput(row._key, "display_order", row.display_order)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={!!row.active}
                      onCheckedChange={(v) => toggleActive(row, v)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => save(row)}
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
                            <AlertDialogTitle>Delete this tour?</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{row.name}" will be permanently removed. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(row)}>
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

export default AdminPricing;
