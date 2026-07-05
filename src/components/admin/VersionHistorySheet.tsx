import { History, RotateCcw } from "lucide-react";
import { useContentVersions } from "@/lib/queries/contentAdmin";
import type { ContentVersion } from "@/lib/types/content";
import { relativeDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

const ACTION_STYLE: Record<string, string> = {
  create: "bg-accent/20 text-accent border border-accent/30",
  update: "bg-secondary text-foreground",
  delete: "bg-destructive/20 text-destructive border border-destructive/30",
};

interface VersionHistorySheetProps {
  entityType: string;
  entityId: string;
  /** Write the chosen snapshot back onto the live row. */
  onRestore: (version: ContentVersion) => Promise<void> | void;
  restoring?: boolean;
}

/**
 * "History" drawer reading content_versions for one entity. Each UPDATE row's
 * snapshot is the state BEFORE that save — restoring it rolls back to then.
 */
const VersionHistorySheet = ({
  entityType,
  entityId,
  onRestore,
  restoring,
}: VersionHistorySheetProps) => {
  const versions = useContentVersions(entityType, entityId);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-accent hover:border-accent/50 px-3 py-2 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors"
        >
          <History className="w-4 h-4" /> History
        </button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading tracking-wider uppercase">
            Version History
          </SheetTitle>
          <SheetDescription>
            Every save is snapshotted. Restore writes that version back onto the
            live record (the restore itself is versioned too, so nothing is lost).
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-2">
          {versions.isLoading && (
            <p className="text-muted-foreground text-sm">Loading history…</p>
          )}
          {versions.data?.length === 0 && (
            <p className="text-muted-foreground text-sm">No history yet.</p>
          )}
          {versions.data?.map((v) => (
            <div
              key={v.id}
              className="glass-card glow-border p-3 flex items-center justify-between gap-3"
            >
              <div>
                <Badge className={ACTION_STYLE[v.action] ?? "bg-secondary"}>
                  {v.action}
                </Badge>
                <div className="text-muted-foreground text-xs mt-1.5">
                  {new Date(v.created_at).toLocaleString()} ·{" "}
                  {relativeDate(v.created_at)}
                </div>
              </div>
              {v.action !== "delete" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      disabled={restoring}
                      className="inline-flex items-center gap-1.5 text-accent hover:bg-accent/10 px-2.5 py-1.5 rounded-md text-xs font-heading font-bold tracking-wider uppercase transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restore
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Restore this version?</AlertDialogTitle>
                      <AlertDialogDescription>
                        The record will be overwritten with the snapshot from{" "}
                        {new Date(v.created_at).toLocaleString()}. The current
                        state is saved to history first.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void onRestore(v)}>
                        Restore
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VersionHistorySheet;
