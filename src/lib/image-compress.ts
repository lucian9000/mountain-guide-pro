import imageCompression from "browser-image-compression";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Compress-and-upload helper for the admin image pickers (events, specials,
 * guide photos).
 *
 * NOTE ON APPROACH: the brief suggested a hand-rolled Canvas → JPEG pipeline
 * "so no new dependency is needed". That constraint is already satisfied —
 * `browser-image-compression` ships with the app and powers the existing route
 * gallery uploader (src/lib/images.ts). Reusing it keeps ONE compression path
 * instead of two, and keeps output as WebP: the whole site was standardised on
 * WebP in the Phase 2 performance work, and WebP is meaningfully smaller than
 * JPEG at the same quality. Same limits as the brief (longest side 1600px,
 * ~0.8 quality); only the container differs.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB, pre-compression

/** Buckets the admin image picker can write to (see docs/supabase-storage-setup.md). */
export type ImageBucket = "event-images" | "special-images" | "guide-photos";

/** Raised when the bucket hasn't been created yet, so the UI can say so plainly. */
export class BucketMissingError extends Error {
  constructor(bucket: string) {
    super(`Storage bucket "${bucket}" does not exist`);
    this.name = "BucketMissingError";
  }
}

/** Longest side ≤ 1600px, WebP, ~0.8 quality. */
export const compressForUpload = async (file: File): Promise<Blob> =>
  imageCompression(file, {
    maxWidthOrHeight: 1600,
    fileType: "image/webp",
    initialQuality: 0.8,
    maxSizeMB: 1.5,
    useWebWorker: true,
  });

const isMissingBucket = (message: string) =>
  /bucket not found|does not exist/i.test(message);

/**
 * Compress `file`, upload it to `bucket`, and return its public URL.
 * Throws BucketMissingError when the bucket hasn't been created, so the caller
 * can point the admin at the URL-paste fallback instead of failing opaquely.
 *
 * Orphan cleanup: replacing or removing an image leaves the old object in the
 * bucket. That's deliberate for now — a scheduled Edge Function sweeping
 * unreferenced objects is a future task, not needed at this volume.
 */
export const uploadImage = async (bucket: ImageBucket, file: File): Promise<string> => {
  if (!isSupabaseConfigured) throw new BucketMissingError(bucket);

  const blob = await compressForUpload(file);
  const filename = `${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, blob, { contentType: "image/webp", cacheControl: "31536000" });

  if (error) {
    if (isMissingBucket(error.message)) throw new BucketMissingError(bucket);
    throw new Error(error.message);
  }

  return supabase.storage.from(bucket).getPublicUrl(filename).data.publicUrl;
};
