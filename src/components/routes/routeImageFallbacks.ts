import expedition1 from "@/assets/expedition-1.webp";
import expedition2 from "@/assets/expedition-2.webp";
import expedition3 from "@/assets/expedition-3.webp";
import helderbergDome from "@/assets/helderberg-dome.webp";
import gallery13Peaks1 from "@/assets/gallery-13peaks-1.webp";
import gallery13Peaks2 from "@/assets/gallery-13peaks-2.webp";
import galleryChallenge from "@/assets/gallery-challenge.webp";

// Served from /public at a stable URL (moved there so index.html can preload
// it as the homepage LCP image).
const heroMountain = "/hero-mountain.webp";

/**
 * Bundled cover images for the seeded routes until real photos are uploaded
 * through the admin portal. Any route with uploaded images ignores this.
 */
const FALLBACKS: Record<string, string> = {
  "lions-head": expedition3,
  platteklip: expedition1,
  kasteelspoort: expedition2,
  waterworks: expedition2,
  "india-venster": expedition1,
  "west-peak": helderbergDome,
  "13-peaks-48hr": gallery13Peaks1,
  "13-peaks-multiday": gallery13Peaks2,
  "sample-coastal-traverse": galleryChallenge,
  "sample-night-summit": galleryChallenge,
};

export const routeFallbackImage = (slug: string): string =>
  FALLBACKS[slug] ?? heroMountain;
