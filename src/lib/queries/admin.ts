import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types/auth";
import type {
  Booking,
  BookingStatus,
  BookingWithRelations,
  Guide,
  Pricing,
  Special,
} from "@/lib/types/db";

/** Throw on Supabase errors so React Query surfaces them as query errors. */
const unwrap = <T>(res: { data: T | null; error: { message: string } | null }): T => {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const startOfMonthISO = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
};

/* ─────────────────────────── Dashboard ─────────────────────────── */

export interface AdminStats {
  totalClients: number;
  upcomingBookings: number;
  activeSpecials: number;
  bookingsThisMonth: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const countOf = async (table: string, build: (q: any) => any): Promise<number> => {
  const base = supabase.from(table).select("*", { count: "exact", head: true });
  const { count, error } = await build(base);
  if (error) throw new Error(error.message);
  return count ?? 0;
};

export const useAdminStats = () =>
  useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [totalClients, upcomingBookings, activeSpecials, bookingsThisMonth] =
        await Promise.all([
          countOf("profiles", (q) => q.eq("role", "client")),
          countOf("bookings", (q) =>
            q.eq("status", "confirmed").gte("booking_date", todayISO())
          ),
          countOf("specials", (q) => q.eq("active", true)),
          countOf("bookings", (q) => q.gte("created_at", startOfMonthISO())),
        ]);
      return { totalClients, upcomingBookings, activeSpecials, bookingsThisMonth };
    },
  });

export const useRecentBookings = (limit = 5) =>
  useQuery<BookingWithRelations[]>({
    queryKey: ["admin", "bookings", "recent", limit],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("bookings")
          .select(
            "*, client:profiles(full_name,email), tour:pricing(name), guide:guides(display_name)"
          )
          .order("created_at", { ascending: false })
          .limit(limit)
      ),
  });

export const useRecentClients = (limit = 5) =>
  useQuery<Profile[]>({
    queryKey: ["admin", "clients", "recent", limit],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("profiles")
          .select("*")
          .eq("role", "client")
          .order("created_at", { ascending: false })
          .limit(limit)
      ),
  });

/* ─────────────────────────── Clients ─────────────────────────── */

export const useClients = () =>
  useQuery<Profile[]>({
    queryKey: ["admin", "clients"],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("profiles")
          .select("*")
          .eq("role", "client")
          .order("created_at", { ascending: false })
      ),
  });

export const useUpdateClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<Profile, "marketing_opt_in" | "tags">>;
    }) => unwrap(await supabase.from("profiles").update(patch).eq("id", id).select().single()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "clients"] });
    },
  });
};

/* ─────────────────────────── Pricing ─────────────────────────── */

export const usePricing = () =>
  useQuery<Pricing[]>({
    queryKey: ["admin", "pricing"],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("pricing")
          .select("*")
          .order("display_order", { ascending: true })
      ),
  });

export const useUpsertPricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<Pricing>) =>
      unwrap(await supabase.from("pricing").upsert(row).select().single()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "pricing"] }),
  });
};

export const useDeletePricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pricing").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "pricing"] }),
  });
};

/* ─────────────────────────── Specials ─────────────────────────── */

export const useSpecials = () =>
  useQuery<Special[]>({
    queryKey: ["admin", "specials"],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("specials")
          .select("*")
          .order("created_at", { ascending: false })
      ),
  });

export const useUpsertSpecial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<Special>) =>
      unwrap(await supabase.from("specials").upsert(row).select().single()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "specials"] }),
  });
};

export const useDeleteSpecial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("specials").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "specials"] }),
  });
};

/** Activate one special and deactivate the rest, atomically (server RPC). */
export const useActivateSpecial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("set_single_active_special", { target: id });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "specials"] }),
  });
};

export const useDeactivateSpecial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap(
        await supabase.from("specials").update({ active: false }).eq("id", id).select().single()
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "specials"] }),
  });
};

/* ─────────────────────────── Guides ─────────────────────────── */

export const useGuides = () =>
  useQuery<Guide[]>({
    queryKey: ["admin", "guides"],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("guides")
          // explicit columns — never select google_refresh_token client-side
          .select(
            "id,profile_id,display_name,bio,photo_url,specialties,google_calendar_id,active,created_at"
          )
          .order("created_at", { ascending: false })
      ),
  });

export const useUpsertGuide = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<Guide>) =>
      unwrap(await supabase.from("guides").upsert(row).select().single()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "guides"] }),
  });
};

export const useDeleteGuide = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("guides").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "guides"] }),
  });
};

/* ─────────────────────────── Bookings ─────────────────────────── */

export const useAdminBookings = () =>
  useQuery<BookingWithRelations[]>({
    queryKey: ["admin", "bookings"],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("bookings")
          .select(
            "*, client:profiles(full_name,email), tour:pricing(name), guide:guides(display_name)"
          )
          .order("booking_date", { ascending: false })
      ),
  });

export const useUpdateBookingStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) =>
      unwrap(
        await supabase.from("bookings").update({ status }).eq("id", id).select().single()
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
};

/* ─────────────────────── Client self-service ─────────────────────── */

export const useMyBookings = (userId: string | undefined) =>
  useQuery<BookingWithRelations[]>({
    queryKey: ["my", "bookings", userId],
    enabled: !!userId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from("bookings")
          .select("*, tour:pricing(name), guide:guides(display_name)")
          .eq("user_id", userId as string)
          .order("booking_date", { ascending: false })
      ),
  });

export type { Booking };
