import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type {
  PriceItem,
  RouteWithImages,
  UpdateWithRoute,
} from "@/lib/types/content";

/**
 * PUBLIC content queries. RLS already restricts anon/authenticated readers to
 * published rows, but every query here ALSO filters explicitly (hard rule) —
 * without it an admin browsing the public site would see drafts.
 */

const unwrap = <T>(res: { data: T | null; error: { message: string } | null }): T => {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
};

const publishedFilter = <T extends { or: (f: string) => T; eq: (c: string, v: string) => T }>(
  q: T
): T => q.eq("status", "published").or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`);

const sortImages = (r: RouteWithImages): RouteWithImages => ({
  ...r,
  images: [...(r.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
});

/** All published routes with their images, for /routes. */
export const usePublishedRoutes = () =>
  useQuery<RouteWithImages[]>({
    queryKey: ["public", "routes"],
    queryFn: async () => {
      const rows = unwrap<RouteWithImages[]>(
        await publishedFilter(
          supabase.from("routes").select("*, images:route_images(*)")
        )
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true })
      );
      return rows.map(sortImages);
    },
  });

/** One published route by slug, for /routes/:slug. Null when not found. */
export const usePublishedRoute = (slug: string | undefined) =>
  useQuery<RouteWithImages | null>({
    queryKey: ["public", "route", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const rows = unwrap<RouteWithImages[]>(
        await publishedFilter(
          supabase.from("routes").select("*, images:route_images(*)").eq("slug", slug!)
        ).limit(1)
      );
      return rows.length ? sortImages(rows[0]) : null;
    },
  });

/**
 * Draft preview for the admin: same shape, NO status filter — RLS only lets
 * admins through, so non-admins get an empty result, not draft data.
 */
export const usePreviewRoute = (slug: string | undefined, enabled: boolean) =>
  useQuery<RouteWithImages | null>({
    queryKey: ["preview", "route", slug],
    enabled: Boolean(slug) && enabled,
    queryFn: async () => {
      const rows = unwrap<RouteWithImages[]>(
        await supabase
          .from("routes")
          .select("*, images:route_images(*)")
          .eq("slug", slug!)
          .limit(1)
      );
      return rows.length ? sortImages(rows[0]) : null;
    },
  });

/** Published What's New posts, newest first. */
export const usePublishedUpdates = (limit?: number) =>
  useQuery<UpdateWithRoute[]>({
    queryKey: ["public", "updates", limit ?? "all"],
    queryFn: async () => {
      let q = publishedFilter(
        supabase.from("updates").select("*, route:routes(slug, name)")
      ).order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      return unwrap<UpdateWithRoute[]>(await q);
    },
  });

/**
 * Booking prices for routes come from the EXISTING pricing table (the /booking
 * flow books against it). Returns a map of tour_slug → pricing row. Route pages
 * show this price when a row matches the route slug, else routes.price_cents.
 */
export interface TourPrice {
  id: string;
  price: number;
  price_group: number | null;
}

export const useTourPrices = () =>
  useQuery<Record<string, TourPrice>>({
    queryKey: ["public", "tour-prices"],
    queryFn: async () => {
      const rows = unwrap<
        { id: string; tour_slug: string | null; price: number; price_group: number | null }[]
      >(
        await supabase
          .from("pricing")
          .select("id, tour_slug, price, price_group")
          .eq("active", true)
      );
      const map: Record<string, TourPrice> = {};
      for (const r of rows) {
        if (r.tour_slug) map[r.tour_slug] = { id: r.id, price: r.price, price_group: r.price_group };
      }
      return map;
    },
  });

/** Site-wide price items (price_items table) keyed by item_key. */
export const usePriceItems = () =>
  useQuery<Record<string, PriceItem>>({
    queryKey: ["public", "price-items"],
    queryFn: async () => {
      const rows = unwrap<PriceItem[]>(
        await supabase.from("price_items").select("*").order("item_key")
      );
      return Object.fromEntries(rows.map((r) => [r.item_key, r]));
    },
  });
