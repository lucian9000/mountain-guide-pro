import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Booking, Guide, Pricing } from "@/lib/types/db";

const unwrap = <T>(res: { data: T | null; error: { message: string } | null }): T => {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
};

/** Active tours, public read (RLS returns only active rows to anon). */
export const usePublicPricing = () =>
  useQuery<Pricing[]>({
    queryKey: ["public", "pricing"],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("pricing")
          .select("*")
          .eq("active", true)
          .order("display_order", { ascending: true })
      ),
  });

/** Active guides, public read. Never selects the refresh-token column. */
export const usePublicGuides = () =>
  useQuery<Guide[]>({
    queryKey: ["public", "guides"],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("guides")
          .select(
            "id,profile_id,display_name,bio,photo_url,specialties,google_calendar_id,active,created_at"
          )
          .eq("active", true)
          .order("display_name", { ascending: true })
      ),
  });

export interface NewBooking {
  user_id: string;
  pricing_id: string;
  guide_id: string | null;
  booking_date: string;
  time_slot: string | null;
  participants: number;
  total_price: number;
  booking_ref: string;
}

/** Insert a booking for the current user (owner RLS allows own inserts). */
export const useCreateBooking = () =>
  useMutation({
    mutationFn: async (booking: NewBooking): Promise<Booking> =>
      unwrap(
        await supabase
          .from("bookings")
          .insert({ ...booking, status: "pending" })
          .select()
          .single()
      ),
  });
