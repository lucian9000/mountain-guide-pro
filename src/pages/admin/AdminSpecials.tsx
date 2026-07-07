import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  useSpecials,
  useUpsertSpecial,
  useDeleteSpecial,
  useActivateSpecial,
  useDeactivateSpecial,
} from "@/lib/queries/admin";
import type { Special } from "@/lib/types/db";
import { useToast } from "@/hooks/use-toast";
import DataState from "@/components/admin/DataState";
import SpecialFormDialog, {
  type SpecialDraft,
} from "@/components/admin/SpecialFormDialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

const draftToRow = (d: SpecialDraft) => ({
  id: d.id,
  title: d.title,
  description: d.description || null,
  image_url: d.image_url || null,
  discount_percent: d.discount_percent,
  valid_from: d.valid_from || null,
  valid_until: d.valid_until || null,
  active: d.active,
});

const AdminSpecials = () => {
  const { data, isLoading, error } = useSpecials();
  const upsert = useUpsertSpecial();
  const del = useDeleteSpecial();
  const activate = useActivateSpecial();
  const deactivate = useDeactivateSpecial();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Special | null>(null);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (s: Special) => {
    setEditing(s);
    setDialogOpen(true);
  };

  const handleSave = async (draft: SpecialDraft) => {
    try {
      const row = draftToRow(draft);
      // If marked active, save first (without flipping others) then run the
      // single-active RPC so the deactivate+activate is atomic server-side.
      const saved = await upsert.mutateAsync({ ...row, active: editing ? row.active : false });
      if (draft.active && saved?.id) {
        await activate.mutateAsync(saved.id);
      }
      toast({ title: "Saved", description: draft.title });
      setDialogOpen(false);
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (s: Special, next: boolean) => {
    try {
      if (next) await activate.mutateAsync(s.id);
      else await deactivate.mutateAsync(s.id);
    } catch (e) {
      toast({
        title: "Update failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  const remove = async (s: Special) => {
    try {
      await del.mutateAsync(s.id);
      toast({ title: "Deleted", description: s.title });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Homepage promotions. Only one special can be active at a time.
        </p>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-accent hover:bg-cyan-hover text-accent-foreground px-4 py-2 rounded-lg font-heading font-bold text-xs tracking-wider uppercase shadow-button transition-all"
        >
          <Plus className="w-4 h-4" /> New Special
        </button>
      </div>

      <DataState
        loading={isLoading}
        error={error}
        empty={!data || data.length === 0}
        emptyMessage="No specials yet. Create your first promotion."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((s) => (
            <div key={s.id} className="glass-card glow-border overflow-hidden flex flex-col">
              {s.image_url ? (
                <img
                  src={s.image_url}
                  alt={s.title}
                  className="w-full h-32 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-32 bg-secondary/40 flex items-center justify-center text-muted-foreground text-xs">
                  No image
                </div>
              )}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase">
                    {s.title}
                  </h3>
                  <Badge
                    variant={s.active ? "default" : "secondary"}
                    className={s.active ? "bg-accent text-accent-foreground" : ""}
                  >
                    {s.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {s.description && (
                  <p className="text-muted-foreground text-xs line-clamp-2">{s.description}</p>
                )}
                {s.discount_percent != null && (
                  <p className="text-gold text-xs font-bold">{s.discount_percent}% off</p>
                )}

                <div className="mt-auto pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={s.active}
                      onCheckedChange={(v) => toggleActive(s, v)}
                    />
                    <span className="text-muted-foreground text-xs">Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(s)}
                      title="Edit"
                      className="p-2 rounded-md text-accent hover:bg-accent/10 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
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
                          <AlertDialogTitle>Delete this special?</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{s.title}" will be permanently removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(s)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DataState>

      <SpecialFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        special={editing}
        onSave={handleSave}
        saving={upsert.isPending || activate.isPending}
      />
    </div>
  );
};

export default AdminSpecials;
