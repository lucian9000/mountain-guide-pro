import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAdminUpdates, useDeleteUpdate } from "@/lib/queries/contentAdmin";
import type { UpdateWithRoute } from "@/lib/types/content";
import { relativeDate } from "@/lib/format";
import { publicImageUrl } from "@/lib/images";
import { useToast } from "@/hooks/use-toast";
import DataState from "@/components/admin/DataState";
import UpdateFormDialog from "@/components/admin/UpdateFormDialog";
import { StatusPill } from "@/pages/admin/AdminRoutes";
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

/** /admin/updates — "What's New" manager. */
const AdminUpdates = () => {
  const updates = useAdminUpdates();
  const del = useDeleteUpdate();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UpdateWithRoute | null>(null);

  const remove = async (u: UpdateWithRoute) => {
    try {
      await del.mutateAsync(u);
      toast({ title: "Deleted", description: u.title });
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
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          News posts — the latest 3 published show in "What's New" on the
          homepage.
        </p>
        <button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-accent hover:bg-[hsl(193,100%,42%)] text-accent-foreground px-4 py-2 rounded-lg font-heading font-bold text-xs tracking-wider uppercase shadow-button transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <DataState
        loading={updates.isLoading}
        error={updates.error}
        empty={!updates.data || updates.data.length === 0}
        emptyMessage="No posts yet — share your first update."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {updates.data?.map((u) => (
            <div key={u.id} className="glass-card glow-border overflow-hidden flex flex-col">
              {u.image_path ? (
                <img
                  src={publicImageUrl(u.image_path)}
                  alt={u.title}
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
                    {u.title}
                  </h3>
                  <StatusPill status={u.status} publishAt={u.publish_at} />
                </div>
                {u.body && (
                  <p className="text-muted-foreground text-xs line-clamp-2">{u.body}</p>
                )}
                <div className="text-muted-foreground/60 text-xs">
                  {relativeDate(u.created_at)}
                  {u.route ? ` · ${u.route.name}` : ""}
                </div>

                <div className="mt-auto pt-3 flex items-center justify-end gap-1">
                  <button
                    onClick={() => {
                      setEditing(u);
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
                        <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{u.title}" will be removed from the site.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => void remove(u)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DataState>

      <UpdateFormDialog open={dialogOpen} onOpenChange={setDialogOpen} update={editing} />
    </div>
  );
};

export default AdminUpdates;
