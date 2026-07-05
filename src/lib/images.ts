import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase/client";

export const ROUTE_IMAGES_BUCKET = "route-images";

export interface UploadedImage {
  path: string;
  width: number;
  height: number;
}

const readDimensions = (blob: Blob): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions"));
    };
    img.src = url;
  });

/** Browser-side compression per spec: max 1600px, WebP, quality ~0.78. */
export const compressImage = async (
  file: File
): Promise<{ blob: Blob; width: number; height: number }> => {
  const blob = await imageCompression(file, {
    maxWidthOrHeight: 1600,
    fileType: "image/webp",
    initialQuality: 0.78,
    maxSizeMB: 1.5,
    useWebWorker: true,
  });
  const { width, height } = await readDimensions(blob);
  return { blob, width, height };
};

const uploadTo = async (path: string, blob: Blob): Promise<void> => {
  const { error } = await supabase.storage
    .from(ROUTE_IMAGES_BUCKET)
    .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw new Error(error.message);
};

/** Compress + upload a route gallery image → routes/{slug}/{uuid}.webp */
export const uploadRouteImage = async (
  slug: string,
  file: File
): Promise<UploadedImage> => {
  const { blob, width, height } = await compressImage(file);
  const path = `routes/${slug}/${crypto.randomUUID()}.webp`;
  await uploadTo(path, blob);
  return { path, width, height };
};

/** Compress + upload a What's New image → updates/{uuid}.webp */
export const uploadUpdateImage = async (file: File): Promise<UploadedImage> => {
  const { blob, width, height } = await compressImage(file);
  const path = `updates/${crypto.randomUUID()}.webp`;
  await uploadTo(path, blob);
  return { path, width, height };
};

/** Public CDN URL for a storage path in the route-images bucket. */
export const publicImageUrl = (path: string): string =>
  supabase.storage.from(ROUTE_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;

/** Best-effort storage cleanup (row deletes should not fail on missing files). */
export const removeStorageImage = async (path: string): Promise<void> => {
  await supabase.storage.from(ROUTE_IMAGES_BUCKET).remove([path]);
};
