import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useGuides, useUpsertGuide, useDeleteGuide } from "@/lib/queries/admin";
import type { Guide } from "@/lib/types/db";
import { useToast } from "@/hooks/use-toast";
import DataState from "@/components/admin/DataState";
import GuideFormDialog, { type GuideDraft } from "@/components/admin/GuideFormDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

const parseSpecialties = (s: string) =>
  s.split(",").map((x) => x.trim()).filter(Boolean);

const AdminGuides = () => {
  const { data, isLoading, error } = useGuides();
  const upsert = useUpsertGuide();
  const del = useDeleteGuide();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Guide | null>(null);

  const handleSave = async (draft: GuideDraft) => {
    try {
      await upsert.mutateAsync({
        id: draft.id,
        display_name: draft.display_name,
        bio: draft.bio || null,
        photo_url: draft.photo_url || null,
        specialties: parseSpecialties(draft.specialties),
        active: draft.active,
      });
      toast({ title: "Saved", description: draft.display_name });
      setDialogOpen(false);
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  const remove = async (g: Guide) => {
    try {
      await del.mutateAsync(g.id);
      toast({ title: "Deleted", description: g.display_name });
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
        <p className="text-muted-foreground text-sm">Manage guide profiles.</p>
        <button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-accent hover:bg-cyan-hover text-accent-foreground px-4 py-2 rounded-lg font-heading font-bold text-xs tracking-wider uppercase shadow-button transition-all"
        >
          <Plus className="w-4 h-4" /> Add Guide
        </button>
      </div>

      <DataState
        loading={isLoading}
        error={error}
        empty={!data || data.length === 0}
        emptyMessage="No guides yet. Add your first one."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((g) => (
            <div key={g.id} className="glass-card glow-border p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-accent/30">
                  {g.photo_url && <AvatarImage src={g.photo_url} alt={g.display_name} />}
                  <AvatarFallback className="bg-secondary text-accent font-heading font-bold">
                    {g.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase truncate">
                    {g.display_name}
                  </h3>
                  <Badge
                    variant={g.active ? "default" : "secondary"}
                    className={g.active ? "bg-accent/20 text-accent" : ""}
                  >
                    {g.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {g.bio && <p className="text-muted-foreground text-xs line-clamp-3">{g.bio}</p>}

              {g.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {g.specialties.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-medium text-accent/80 bg-accent/5 border border-accent/20 px-2 py-0.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-2 flex items-center justify-end gap-1">
                <button
                  onClick={() => {
                    setEditing(g);
                    setDialogOpen(true);
                  }}
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
                      <AlertDialogTitle>Delete this guide?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{g.display_name}" will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(g)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </DataState>

      <GuideFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        guide={editing}
        onSave={handleSave}
        saving={upsert.isPending}
      />
    </div>
  );
};

export default AdminGuides;
