import { useEffect, useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, RefreshCw, Upload, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import {
  BucketMissingError,
  MAX_UPLOAD_BYTES,
  uploadImage,
  type ImageBucket,
} from "@/lib/image-compress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploadProps {
  bucket: ImageBucket;
  value: string | null;
  onChange: (url: string | null) => void;
  /** Preview box ratio, e.g. "16/9" (default) or "1/1" for avatars. */
  aspectRatio?: string;
  /** Associates the drop zone with an external <Label htmlFor>. */
  id?: string;
}

/**
 * Admin image picker: camera/file upload to Supabase Storage with a pasted-URL
 * fallback. Compression happens client-side before upload (see
 * src/lib/image-compress.ts).
 *
 * Replacing or removing an image orphans the previous object in the bucket —
 * cleaning those up is a future scheduled Edge Function task, deliberately not
 * done here.
 */
const ImageUpload = ({
  bucket,
  value,
  onChange,
  aspectRatio = "16/9",
  id,
}: ImageUploadProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [failedFile, setFailedFile] = useState<File | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [dragging, setDragging] = useState(false);

  // Free the object URL when it's replaced or the component unmounts.
  useEffect(
    () => () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    },
    [localPreview]
  );

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "That file isn't an image", variant: "destructive" });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast({ title: "Please choose an image under 5MB", variant: "destructive" });
      return;
    }

    // Show the pick immediately so the parent's preview updates before upload.
    const preview = URL.createObjectURL(file);
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
    });
    setFailedFile(null);
    setUploading(true);

    try {
      const url = await uploadImage(bucket, file);
      onChange(url);
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      toast({ title: "Photo uploaded ✓" });
    } catch (err) {
      if (err instanceof BucketMissingError) {
        // Retrying can never succeed until the bucket exists, and the URL box
        // only lives in the empty state — so drop the preview and open it,
        // otherwise the "paste a URL instead" advice is unreachable.
        setLocalPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        setFailedFile(null);
        setShowUrlInput(true);
        toast({
          title: "Image upload isn't set up yet — paste a URL instead",
          variant: "destructive",
        });
      } else {
        // Transient failure — keep the selection so it isn't lost.
        setFailedFile(file);
        toast({
          title: "Upload failed — check your connection and try again",
          variant: "destructive",
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const pick = () => fileInput.current?.click();

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const applyUrl = () => {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setUrlDraft("");
    setShowUrlInput(false);
  };

  const shown = localPreview ?? value;

  const hiddenInput = (
    <input
      ref={fileInput}
      type="file"
      accept="image/*"
      capture="environment"
      className="sr-only"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) void handleFile(file);
        // Allow re-picking the same file.
        e.target.value = "";
      }}
    />
  );

  if (shown) {
    return (
      <div className="space-y-2">
        <div
          className="relative w-full overflow-hidden rounded-xl border border-border bg-background"
          style={{ aspectRatio }}
        >
          <img src={shown} alt="" className="w-full h-full object-cover" />

          {uploading && (
            <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-3 px-6">
              <Loader2 className="w-6 h-6 text-accent animate-spin" aria-hidden="true" />
              <span className="text-xs text-foreground font-heading tracking-wider uppercase">
                Uploading…
              </span>
              {/* Supabase JS exposes no upload progress — indeterminate by design. */}
              <div
                role="progressbar"
                aria-label="Uploading"
                className="h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-secondary"
              >
                <div className="h-full w-1/3 rounded-full bg-accent animate-indeterminate" />
              </div>
            </div>
          )}

          {!uploading && (
            <div className="absolute inset-x-0 bottom-0 flex gap-2 p-2 bg-gradient-to-t from-background/90 to-transparent">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={pick}
                className="h-11 flex-1 gap-2 focus-visible:ring-2 focus-visible:ring-accent"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" /> Change photo
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-label="Remove photo"
                onClick={() => {
                  setLocalPreview((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return null;
                  });
                  setFailedFile(null);
                  onChange(null);
                }}
                className="h-11 w-11 p-0 text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>

        {failedFile && !uploading && (
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleFile(failedFile)}
            className="h-11 w-full gap-2 focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" /> Retry upload
          </Button>
        )}

        {hiddenInput}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        id={id}
        onClick={pick}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        disabled={uploading}
        className={`w-full min-h-[180px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 px-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 text-accent animate-spin" aria-hidden="true" />
            <span className="text-xs text-foreground font-heading tracking-wider uppercase">
              Uploading…
            </span>
            <div
              role="progressbar"
              aria-label="Uploading"
              className="h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-secondary"
            >
              <div className="h-full w-1/3 rounded-full bg-accent animate-indeterminate" />
            </div>
          </>
        ) : (
          <>
            <ImagePlus className="w-8 h-8 text-accent" aria-hidden="true" />
            <span className="text-sm text-foreground font-medium">
              {isMobile ? "Tap to add a photo" : "Drag & drop or click to upload"}
            </span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG or WebP · up to 5MB
            </span>
          </>
        )}
      </button>

      {!showUrlInput ? (
        <button
          type="button"
          onClick={() => setShowUrlInput(true)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          <Link2 className="w-3.5 h-3.5" aria-hidden="true" /> or paste an image URL instead
        </button>
      ) : (
        <div className="flex gap-2">
          <Input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyUrl();
              }
            }}
            placeholder="https://example.com/photo.jpg"
            aria-label="Image URL"
            className="h-11"
          />
          <Button
            type="button"
            onClick={applyUrl}
            className="h-11 gap-2 focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Upload className="w-4 h-4" aria-hidden="true" /> Use
          </Button>
        </div>
      )}

      {hiddenInput}
    </div>
  );
};

export default ImageUpload;
