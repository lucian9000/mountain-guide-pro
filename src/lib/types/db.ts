/** Database row types — mirror supabase/schema.sql (Phase 2). */

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Pricing {
  id: string;
  tour_slug: string | null;
  name: string;
  description: string | null;
  price: number;
  price_group: number | null;
  currency: string;
  duration: string | null;
  difficulty: number | null;
  max_participants: number | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Special {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  discount_percent: number | null;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Guide {
  id: string;
  profile_id: string | null;
  display_name: string;
  bio: string | null;
  photo_url: string | null;
  specialties: string[];
  google_calendar_id: string | null;
  active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_ref: string | null;
  user_id: string | null;
  pricing_id: string | null;
  guide_id: string | null;
  booking_date: string;
  time_slot: string | null;
  participants: number;
  total_price: number | null;
  status: BookingStatus;
  notes: string | null;
  calendar_synced: boolean;
  google_cal_event_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Booking joined with the related client/tour/guide names for admin tables. */
export interface BookingWithRelations extends Booking {
  client?: { full_name: string | null; email: string } | null;
  tour?: { name: string } | null;
  guide?: { display_name: string } | null;
}
