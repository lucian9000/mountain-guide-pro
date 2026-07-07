import { useRef, useState } from "react";
import { GripVertical, Loader2, Star, Trash2, Upload } from "lucide-react";
import type { RouteImage } from "@/lib/types/content";
import { publicImageUrl, uploadRouteImage } from "@/lib/images";
import {
  useAddRouteImage,
  useDeleteRouteImage,
  useUpdateRouteImages,
} from "@/lib/queries/contentAdmin";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RouteImagesManagerProps {
  routeId: string;
  slug: string;
  images: RouteImage[];
}

/**
 * Gallery manager: multi-file upload (compressed client-side to ≤1600px WebP),
 * HTML5 drag-to-reorder, cover selection, per-image alt text, delete.
 */
const RouteImagesManager = ({ routeId, slug, images }: RouteImagesManagerProps) => {
  const { toast } = useToast();
  const addImage = useAddRouteImage();
  const patchImages = useUpdateRouteImages();
  const deleteImage = useDeleteRouteImage();

  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    let nextSort = (sorted.at(-1)?.sort_order ?? 0) + 10;
    // First image on a route with none yet becomes the cover automatically.
    let makeCover = sorted.length === 0;
    for (const file of Array.from(files)) {
      try {
        const { path, width, height } = await uploadRouteImage(slug, file);
        await addImage.mutateAsync({
          route_id: routeId,
          storage_path: path,
          alt_text: "",
          width,
          height,
          is_cover: makeCover,
          sort_order: nextSort,
        });
        makeCover = false;
        nextSort += 10;
      } catch (e) {
        toast({
          title: `Upload failed: ${file.name}`,
          description: e instanceof Error ? e.message : undefined,
          variant: "destructive",
        });
      }
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  };

  const reorder = async (from: number, to: number) => {
    if (from === to) return;
    const next = [...sorted];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    await patchImages.mutateAsync(
      next.map((img, i) => ({ id: img.id, sort_order: (i + 1) * 10 }))
    );
  };

  const setCover = async (id: string) => {
    await patchImages.mutateAsync(
      sorted.map((img) => ({ id: img.id, is_cover: img.id === id }))
    );
  };

  const saveAlt = async (img: RouteImage) => {
    const draft = altDrafts[img.id];
    if (draft === undefined || draft === img.alt_text) return;
    await patchImages.mutateAsync([{ id: img.id, alt_text: draft.slice(0, 200) }]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase">
          Images
        </h2>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 border border-accent/50 text-accent hover:bg-accent/10 px-3 py-1.5 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Compressing…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" /> Add images
            </>
          )}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground text-sm py-6 text-center border border-dashed border-border/60 rounded-lg">
          No images yet. Uploads are compressed in your browser (max 1600px,
          WebP) before they're stored.
        </p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((img, i) => (
            <li
              key={img.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) void reorder(dragIndex, i);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                "glass-card glow-border p-3 flex items-center gap-3",
                dragIndex === i && "opacity-50"
              )}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab shrink-0" />
              <img
                src={publicImageUrl(img.storage_path)}
                alt={img.alt_text}
                className="w-20 h-14 rounded object-cover shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <Input
                  value={altDrafts[img.id] ?? img.alt_text}
                  maxLength={200}
                  placeholder="Alt text (describe the photo)"
                  onChange={(e) =>
                    setAltDrafts((d) => ({ ...d, [img.id]: e.target.value }))
                  }
                  onBlur={() => void saveAlt(img)}
                  className="h-8 text-xs"
                />
                <div className="text-muted-foreground/60 text-xs">
                  {img.width && img.height ? `${img.width}×${img.height} · ` : ""}
                  drag to reorder
                </div>
              </div>
              <button
                type="button"
                title={img.is_cover ? "Cover image" : "Set as cover"}
                onClick={() => void setCover(img.id)}
                className={cn(
                  "p-2 rounded-md transition-colors shrink-0",
                  img.is_cover
                    ? "text-gold"
                    : "text-muted-foreground/40 hover:text-gold hover:bg-gold/10"
                )}
              >
                <Star className="w-4 h-4" fill={img.is_cover ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                title="Delete image"
                onClick={() => void deleteImage.mutateAsync(img)}
                className="p-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RouteImagesManager;
