import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { removeStorageImage } from "@/lib/images";
import type {
  ContentVersion,
  PriceItem,
  RouteImage,
  RouteDifficulty,
  RouteRow,
  RouteWithImages,
  UpdateWithRoute,
} from "@/lib/types/content";
import {
  ROUTE_EDITABLE_FIELDS,
  UPDATE_EDITABLE_FIELDS,
} from "@/lib/types/content";

/** ADMIN content queries — RLS restricts all of these to is_admin() sessions. */

const unwrap = <T>(res: { data: T | null; error: { message: string } | null }): T => {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
};

const invalidate = (qc: ReturnType<typeof useQueryClient>, keys: string[][]) =>
  keys.forEach((key) => qc.invalidateQueries({ queryKey: key }));

/* ─────────────────────────── Routes ─────────────────────────── */

export const useAdminRoutes = () =>
  useQuery<RouteWithImages[]>({
    queryKey: ["admin", "routes"],
    queryFn: async () =>
      unwrap<RouteWithImages[]>(
        await supabase
          .from("routes")
          .select("*, images:route_images(*)")
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true })
      ),
  });

export const useAdminRoute = (id: string | undefined) =>
  useQuery<RouteWithImages | null>({
    queryKey: ["admin", "route", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const rows = unwrap<RouteWithImages[]>(
        await supabase.from("routes").select("*, images:route_images(*)").eq("id", id!).limit(1)
      );
      if (!rows.length) return null;
      const r = rows[0];
      return { ...r, images: [...(r.images ?? [])].sort((a, b) => a.sort_order - b.sort_order) };
    },
  });

export type RoutePayload = Partial<Pick<RouteRow, (typeof ROUTE_EDITABLE_FIELDS)[number]>> & {
  id?: string;
};

/* ───────────────── Routes → bookable tours ─────────────────
 *
 * `routes` are the content pages; `pricing` is the list the booking form
 * offers. They were only ever joined by slug convention, so a route added in
 * the admin was published to the site but stayed unbookable until someone
 * remembered to hand-add a Pricing row. Saving a route now keeps its tour in
 * step, which is what everyone already assumed happened.
 *
 * A route priced at 0 is "price on request" — it never becomes bookable, and
 * an existing tour for it is deactivated rather than offered at R0.
 */

const DIFFICULTY_RANK: Record<RouteDifficulty, number> = {
  easy: 1,
  moderate: 2,
  challenging: 3,
  extreme: 4,
};

export const syncBookableTour = async (route: RouteRow): Promise<void> => {
  const existing = unwrap<{ id: string }[]>(
    await supabase.from("pricing").select("id").eq("tour_slug", route.slug).limit(1)
  );
  const current = existing[0];

  // Enquiry-only routes must never appear as an R0 booking option.
  if (!route.price_cents || route.price_cents <= 0) {
    if (current) {
      unwrap(await supabase.from("pricing").update({ active: false }).eq("id", current.id).select());
    }
    return;
  }

  const shared = {
    name: route.name,
    price: route.price_cents / 100,
    duration: route.duration_hours ? `${route.duration_hours} hours` : null,
    difficulty: DIFFICULTY_RANK[route.difficulty] ?? null,
    // Only a published route is bookable — hiding a route pulls it from the
    // booking form too.
    active: route.status === "published",
  };

  if (current) {
    // Deliberately narrow: `description`, `price_group` and `max_participants`
    // are tuned on the Pricing page for the booking form's benefit, so a route
    // edit must not overwrite them.
    unwrap(await supabase.from("pricing").update(shared).eq("id", current.id).select());
    return;
  }

  unwrap(
    await supabase
      .from("pricing")
      .insert({
        ...shared,
        tour_slug: route.slug,
        description: route.description,
        display_order: route.sort_order,
      })
      .select()
  );
};

export const useUpsertRoute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }: RoutePayload): Promise<RouteRow> => {
      const saved = id
        ? unwrap<RouteRow>(
            await supabase.from("routes").update(fields).eq("id", id).select().single()
          )
        : unwrap<RouteRow>(await supabase.from("routes").insert(fields).select().single());

      // Keep the bookable tour in step. Never let this fail the save — the
      // route itself is already stored, and an unbookable route beats losing
      // the edit.
      try {
        await syncBookableTour(saved);
      } catch (e) {
        console.error("[routes] could not sync the bookable tour", e);
      }
      return saved;
    },
    onSuccess: () =>
      invalidate(qc, [["admin", "routes"], ["admin", "route"], ["public", "routes"], ["public", "route"], ["preview", "route"], ["public", "pricing"], ["admin", "pricing"]]),
  });
};

export const useDeleteRoute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (route: RouteWithImages) => {
      // Best-effort storage cleanup before the cascade removes the rows.
      await Promise.allSettled(route.images.map((i) => removeStorageImage(i.storage_path)));
      unwrap(await supabase.from("routes").delete().eq("id", route.id).select());
    },
    onSuccess: () => invalidate(qc, [["admin", "routes"], ["public", "routes"]]),
  });
};

/** Is this slug taken by a different route? (form-level uniqueness check) */
export const isSlugTaken = async (slug: string, excludeId?: string): Promise<boolean> => {
  let q = supabase.from("routes").select("id").eq("slug", slug).limit(1);
  if (excludeId) q = q.neq("id", excludeId);
  const rows = unwrap<{ id: string }[]>(await q);
  return rows.length > 0;
};

/* ────────────────────────── Route images ────────────────────────── */

export const useAddRouteImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (img: Omit<RouteImage, "id" | "created_at">): Promise<RouteImage> =>
      unwrap<RouteImage>(await supabase.from("route_images").insert(img).select().single()),
    onSuccess: () => invalidate(qc, [["admin", "route"], ["admin", "routes"], ["public", "routes"], ["public", "route"], ["preview", "route"]]),
  });
};

export const useUpdateRouteImages = () => {
  const qc = useQueryClient();
  return useMutation({
    /** Batch update (reorder / cover / alt): array of {id, ...fields}. */
    mutationFn: async (patches: (Partial<RouteImage> & { id: string })[]) => {
      for (const { id, ...fields } of patches) {
        unwrap(await supabase.from("route_images").update(fields).eq("id", id).select());
      }
    },
    onSuccess: () => invalidate(qc, [["admin", "route"], ["public", "routes"], ["public", "route"], ["preview", "route"]]),
  });
};

export const useDeleteRouteImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (img: RouteImage) => {
      unwrap(await supabase.from("route_images").delete().eq("id", img.id).select());
      await removeStorageImage(img.storage_path);
    },
    onSuccess: () => invalidate(qc, [["admin", "route"], ["admin", "routes"], ["public", "routes"], ["public", "route"], ["preview", "route"]]),
  });
};

/* ─────────────────────────── Updates ─────────────────────────── */

export const useAdminUpdates = () =>
  useQuery<UpdateWithRoute[]>({
    queryKey: ["admin", "updates"],
    queryFn: async () =>
      unwrap<UpdateWithRoute[]>(
        await supabase
          .from("updates")
          .select("*, route:routes(slug, name)")
          .order("created_at", { ascending: false })
      ),
  });

export type UpdatePayload = Partial<
  Pick<UpdateWithRoute, (typeof UPDATE_EDITABLE_FIELDS)[number]>
> & { id?: string };

export const useUpsertUpdate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }: UpdatePayload) => {
      if (id) {
        return unwrap(
          await supabase.from("updates").update(fields).eq("id", id).select().single()
        );
      }
      return unwrap(await supabase.from("updates").insert(fields).select().single());
    },
    onSuccess: () => invalidate(qc, [["admin", "updates"], ["public", "updates"]]),
  });
};

export const useDeleteUpdate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (update: UpdateWithRoute) => {
      unwrap(await supabase.from("updates").delete().eq("id", update.id).select());
      if (update.image_path) await removeStorageImage(update.image_path);
    },
    onSuccess: () => invalidate(qc, [["admin", "updates"], ["public", "updates"]]),
  });
};

/* ─────────────────────────── Price items ─────────────────────────── */

export const useAdminPriceItems = () =>
  useQuery<PriceItem[]>({
    queryKey: ["admin", "price-items"],
    queryFn: async () =>
      unwrap<PriceItem[]>(await supabase.from("price_items").select("*").order("item_key")),
  });

export const useUpsertPriceItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...fields
    }: Partial<Omit<PriceItem, "updated_at">> & { id?: string }) => {
      if (id) {
        return unwrap(
          await supabase.from("price_items").update(fields).eq("id", id).select().single()
        );
      }
      return unwrap(await supabase.from("price_items").insert(fields).select().single());
    },
    onSuccess: () => invalidate(qc, [["admin", "price-items"], ["public", "price-items"]]),
  });
};

export const useDeletePriceItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      unwrap(await supabase.from("price_items").delete().eq("id", id).select());
    },
    onSuccess: () => invalidate(qc, [["admin", "price-items"], ["public", "price-items"]]),
  });
};

/* ─────────────────────────── Versions ─────────────────────────── */

export const useContentVersions = (entityType: string, entityId: string | undefined) =>
  useQuery<ContentVersion[]>({
    queryKey: ["admin", "versions", entityType, entityId],
    enabled: Boolean(entityId),
    queryFn: async () =>
      unwrap<ContentVersion[]>(
        await supabase
          .from("content_versions")
          .select("*")
          .eq("entity_type", entityType)
          .eq("entity_id", entityId!)
          .order("created_at", { ascending: false })
          .limit(50)
      ),
  });

/**
 * Restore: write a version snapshot back onto the live row. Only editable
 * columns are written — ids/timestamps/audit fields stay untouched.
 */
export const useRestoreRouteVersion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      routeId,
      snapshot,
    }: {
      routeId: string;
      snapshot: Record<string, unknown>;
    }) => {
      const fields: Record<string, unknown> = {};
      for (const key of ROUTE_EDITABLE_FIELDS) {
        if (key in snapshot) fields[key] = snapshot[key];
      }
      return unwrap(
        await supabase.from("routes").update(fields).eq("id", routeId).select().single()
      );
    },
    onSuccess: () =>
      invalidate(qc, [["admin", "routes"], ["admin", "route"], ["admin", "versions"], ["public", "routes"], ["public", "route"], ["preview", "route"]]),
  });
};
