import { useEffect, useRef, useState } from "react";
import { CalendarClock, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import type { ContentStatus, UpdateWithRoute } from "@/lib/types/content";
import { publicImageUrl, removeStorageImage, uploadUpdateImage } from "@/lib/images";
import { useAdminRoutes, useUpsertUpdate } from "@/lib/queries/contentAdmin";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NONE = "__none__";

interface UpdateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  update: UpdateWithRoute | null; // null = create
}

/** Create/edit a What's New post: title, body, image, route link, publish. */
const UpdateFormDialog = ({ open, onOpenChange, update }: UpdateFormDialogProps) => {
  const { toast } = useToast();
  const routes = useAdminRoutes();
  const upsert = useUpsertUpdate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [routeId, setRouteId] = useState<string>(NONE);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [status, setStatus] = useState<ContentStatus>("draft");
  const [publishAt, setPublishAt] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(update?.title ?? "");
    setBody(update?.body ?? "");
    setRouteId(update?.route_id ?? NONE);
    setImagePath(update?.image_path ?? null);
    setStatus(update?.status ?? "draft");
    setPublishAt(
      update?.publish_at ? update.publish_at.slice(0, 16) : ""
    );
  }, [open, update]);

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const old = imagePath;
      const { path } = await uploadUpdateImage(file);
      setImagePath(path);
      // Replace: clean up a previously uploaded (but unsaved-over) file.
      if (old && old !== update?.image_path) await removeStorageImage(old);
    } catch (e) {
      toast({
        title: "Image upload failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const save = async () => {
    if (title.trim().length < 2) {
      toast({ title: "Title is required (2–120 characters)", variant: "destructive" });
      return;
    }
    if (status === "published" && publishAt && Number.isNaN(Date.parse(publishAt))) {
      toast({ title: "Invalid schedule date", variant: "destructive" });
      return;
    }
    try {
      await upsert.mutateAsync({
        id: update?.id,
        title: title.trim().slice(0, 120),
        body: body.slice(0, 4000),
        route_id: routeId === NONE ? null : routeId,
        image_path: imagePath,
        status,
        publish_at: publishAt ? new Date(publishAt).toISOString() : null,
      });
      toast({ title: "Saved", description: title });
      onOpenChange(false);
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading tracking-wider uppercase">
            {update ? "Edit Post" : "New Post"}
          </DialogTitle>
          <DialogDescription>
            Published posts appear in "What's New" on the homepage and /news.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Body</Label>
            <Textarea
              value={body}
              maxLength={4000}
              rows={5}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1.5"
            />
            <p className="text-muted-foreground/60 text-xs mt-1">{body.length} / 4000</p>
          </div>

          <div>
            <Label>Image (optional)</Label>
            <div className="mt-1.5 flex items-center gap-3">
              {imagePath ? (
                <img
                  src={publicImageUrl(imagePath)}
                  alt=""
                  className="w-24 h-16 rounded object-cover"
                />
              ) : (
                <div className="w-24 h-16 rounded bg-secondary/40 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInput.current?.click()}
                  className="inline-flex items-center gap-2 border border-accent/50 text-accent hover:bg-accent/10 px-3 py-1.5 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Compressing…
                    </>
                  ) : imagePath ? (
                    "Replace"
                  ) : (
                    "Upload"
                  )}
                </button>
                {imagePath && (
                  <button
                    type="button"
                    onClick={() => setImagePath(null)}
                    className="inline-flex items-center gap-1.5 text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg text-xs font-heading font-bold tracking-wider uppercase transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => void pickImage(e.target.files?.[0])}
              />
            </div>
          </div>

          <div>
            <Label>Linked route (optional)</Label>
            <Select value={routeId} onValueChange={setRouteId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None</SelectItem>
                {routes.data?.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)}>
                <SelectTrigger className="mt-1.5 capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" /> Go live at (optional)
              </Label>
              <Input
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Facebook:
            <Badge variant="secondary">
              {update?.posted_to_facebook ? "Posted" : "Not posted"}
            </Badge>
            <span className="text-muted-foreground/60">
              (automated in Phase 2 — read-only)
            </span>
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={upsert.isPending || uploading}
            onClick={() => void save()}
            className="inline-flex items-center gap-2 bg-accent hover:bg-[hsl(193,100%,42%)] text-accent-foreground px-5 py-2 rounded-lg font-heading font-bold text-xs tracking-wider uppercase shadow-button transition-all disabled:opacity-60"
          >
            {upsert.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateFormDialog;
