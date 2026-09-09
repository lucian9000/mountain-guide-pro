import { routes } from "@/data/routes";
import type { RouteDifficulty, RouteWithImages } from "@/lib/types/content";

const images: Record<string, string> = {
  "lions-head": "/experience/sunset.webp",
  platteklip: "/experience/plateau.webp",
  kasteelspoort: "/experience/cliff.webp",
  waterworks: "/experience/forest.webp",
  "india-venster": "/experience/venster.webp",
  "west-peak": "/experience/helderberg.webp",
  "13-peaks-48hr": "/experience/peaks.webp",
  "13-peaks-multiday": "/experience/peaks.webp",
};

/** Existing route information for an unconfigured local build, never a fallback
 * for failed or empty live queries. No claim of live pricing or availability. */
export const offlineRoutes: RouteWithImages[] = routes.map((route, index) => ({
  id: route.id,
  slug: route.id,
  name: route.name,
  description: `${route.specs.terrain}.\n\nFitness: ${route.specs.fitness}. Guide ratio: ${route.logistics.ratio}.\n\nBring: ${route.gear.mandatory.join(", ")}.\n\n${route.weather.policy}`,
  difficulty: (
    {
      1: "easy",
      2: "moderate",
      3: "moderate",
      4: "challenging",
      5: "extreme",
    } as Record<number, RouteDifficulty>
  )[route.specs.difficulty],
  duration_hours: null,
  distance_km: null,
  elevation_m: null,
  price_cents: 0,
  highlights: [route.specs.duration, route.specs.distance, route.location],
  meeting_point: route.logistics.meetingPoint,
  status: "published",
  publish_at: null,
  sort_order: index,
  latitude: null,
  longitude: null,
  map_zoom: 12,
  meeting_latitude: null,
  meeting_longitude: null,
  created_at: "",
  updated_at: "",
  images: [
    {
      id: `offline-${route.id}`,
      route_id: route.id,
      storage_path: images[route.id] || "/hero-mountain.webp",
      alt_text: route.name,
      width: null,
      height: null,
      is_cover: true,
      sort_order: 0,
      created_at: "",
    },
  ],
}));
