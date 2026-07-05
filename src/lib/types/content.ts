/** Row types for the content platform tables (see supabase migrations
 *  content_platform_schema / seed_content_routes). */

export type ContentStatus = "draft" | "published" | "hidden";
export type RouteDifficulty = "easy" | "moderate" | "challenging" | "extreme";

export interface RouteRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  difficulty: RouteDifficulty;
  duration_hours: number | null;
  distance_km: number | null;
  elevation_m: number | null;
  price_cents: number;
  highlights: string[];
  meeting_point: string | null;
  status: ContentStatus;
  publish_at: string | null;
  sort_order: number;
  latitude: number | null;
  longitude: number | null;
  map_zoom: number;
  meeting_latitude: number | null;
  meeting_longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface RouteImage {
  id: string;
  route_id: string;
  storage_path: string;
  alt_text: string;
  width: number | null;
  height: number | null;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
}

export interface RouteWithImages extends RouteRow {
  images: RouteImage[];
}

export interface UpdateRow {
  id: string;
  title: string;
  body: string;
  route_id: string | null;
  image_path: string | null;
  status: ContentStatus;
  publish_at: string | null;
  posted_to_facebook: boolean;
  facebook_post_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Update joined with its linked route (for cards + admin table). */
export interface UpdateWithRoute extends UpdateRow {
  route?: { slug: string; name: string } | null;
}

export interface PriceItem {
  id: string;
  item_key: string;
  label: string;
  price_cents: number;
  notes: string | null;
  updated_at: string;
}

export interface ContentVersion {
  id: number;
  entity_type: string;
  entity_id: string;
  action: "create" | "update" | "delete";
  snapshot: Record<string, unknown>;
  actor: string;
  created_at: string;
}

/** Editable route columns — what forms submit and what a restore writes. */
export const ROUTE_EDITABLE_FIELDS = [
  "slug",
  "name",
  "description",
  "difficulty",
  "duration_hours",
  "distance_km",
  "elevation_m",
  "price_cents",
  "highlights",
  "meeting_point",
  "status",
  "publish_at",
  "sort_order",
  "latitude",
  "longitude",
  "map_zoom",
  "meeting_latitude",
  "meeting_longitude",
] as const;

/** Editable update columns (posted_to_facebook is Phase-2 automation, read-only). */
export const UPDATE_EDITABLE_FIELDS = [
  "title",
  "body",
  "route_id",
  "image_path",
  "status",
  "publish_at",
] as const;
