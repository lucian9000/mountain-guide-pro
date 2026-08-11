import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { EventAvailability, EventItem, EventWithSpots } from "@/lib/types/db";

const unwrap = <T>(res: { data: T | null; error: { message: string } | null }): T => {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
};

/**
 * The overbooking trigger (Phase 6) raises `EVENT_FULL: …`. Detect it so the
 * booking UI can show a friendly "this event just filled up" message instead
 * of a raw Postgres error.
 */
export const isEventFullError = (err: unknown): boolean =>
  err instanceof Error && /EVENT_FULL/i.test(err.message);

const todayISO = () => new Date().toISOString().slice(0, 10);

/** Attach spots_left from the availability view to a list of events. */
const withSpots = (events: EventItem[], availability: EventAvailability[]): EventWithSpots[] => {
  const byId = new Map(availability.map((a) => [a.id, a.spots_left]));
  return events.map((e) => ({ ...e, spots_left: byId.get(e.id) ?? null }));
};

/**
 * Published, not-yet-past events with remaining spots — the public list.
 * Returns [] (never throws) when Supabase isn't configured, so the marketing
 * site keeps working with zero config.
 */
export const usePublicEvents = (limit?: number) =>
  useQuery<EventWithSpots[]>({
    queryKey: ["public", "events", limit ?? "all"],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      let q = supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .gte("event_date", todayISO())
        .order("event_date", { ascending: true });
      if (limit) q = q.limit(limit);

      const events = unwrap<EventItem[]>(await q);
      if (events.length === 0) return [];

      const availability = unwrap<EventAvailability[]>(
        await supabase.from("event_availability").select("*")
      );
      return withSpots(events, availability);
    },
  });

/** A single published event (for ?event=<id> deep links). */
export const usePublicEvent = (id: string | null) =>
  useQuery<EventWithSpots | null>({
    queryKey: ["public", "event", id],
    enabled: isSupabaseConfigured && Boolean(id),
    queryFn: async () => {
      const event = unwrap<EventItem | null>(
        await supabase.from("events").select("*").eq("id", id!).maybeSingle()
      );
      if (!event) return null;
      const availability = unwrap<EventAvailability[]>(
        await supabase.from("event_availability").select("*").eq("id", id!)
      );
      return withSpots([event], availability)[0];
    },
  });

/* ─────────────────────────── Admin ─────────────────────────── */

/**
 * Every event (drafts + past included) with booked counts.
 * The public `event_availability` view is deliberately limited to published
 * upcoming rows, so admin counts come straight from `bookings` (admins can
 * read them all via RLS).
 */
export const useAdminEvents = () =>
  useQuery<(EventItem & { booked: number })[]>({
    queryKey: ["admin", "events"],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      const events = unwrap<EventItem[]>(
        await supabase.from("events").select("*").order("event_date", { ascending: false })
      );
      if (events.length === 0) return [];

      const bookings = unwrap<{ event_id: string | null; participants: number; status: string }[]>(
        await supabase
          .from("bookings")
          .select("event_id,participants,status")
          .not("event_id", "is", null)
      );

      const booked = new Map<string, number>();
      for (const b of bookings) {
        if (!b.event_id) continue;
        if (b.status !== "pending" && b.status !== "confirmed") continue;
        booked.set(b.event_id, (booked.get(b.event_id) ?? 0) + b.participants);
      }
      return events.map((e) => ({ ...e, booked: booked.get(e.id) ?? 0 }));
    },
  });

export const useAdminEvent = (id: string | null) =>
  useQuery<EventItem | null>({
    queryKey: ["admin", "event", id],
    enabled: isSupabaseConfigured && Boolean(id),
    queryFn: async () =>
      unwrap(await supabase.from("events").select("*").eq("id", id!).maybeSingle()),
  });

export type EventDraft = Omit<EventItem, "id" | "created_at" | "updated_at">;

const invalidateEvents = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["admin", "events"] });
  qc.invalidateQueries({ queryKey: ["public", "events"] });
  qc.invalidateQueries({ queryKey: ["admin", "stats"] });
};

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (draft: EventDraft) =>
      unwrap<EventItem>(await supabase.from("events").insert(draft).select().single()),
    onSuccess: () => invalidateEvents(qc),
  });
};

export const useUpdateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<EventDraft> & { id: string }) =>
      unwrap<EventItem>(
        await supabase.from("events").update(patch).eq("id", id).select().single()
      ),
    onSuccess: (_data, vars) => {
      invalidateEvents(qc);
      qc.invalidateQueries({ queryKey: ["admin", "event", vars.id] });
    },
  });
};

export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => invalidateEvents(qc),
  });
};
