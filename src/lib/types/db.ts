/** Database row types — mirror supabase/schema.sql (Phase 2). */

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Pricing {
  id: string;
  tour_slug: string | null;
  name: string;
  description: string | null;
  price: number;
  /** Per-person price for groups of >= group_min_size. null = no group rate. */
  price_group: number | null;
  /** Party size from which price_group applies instead of price (Phase 6). */
  group_min_size: number;
  currency: string;
  duration: string | null;
  difficulty: number | null;
  max_participants: number | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Per-person rate for a party size, applying the group rate once the party
 * reaches `group_min_size`. Single source of truth for booking price maths.
 */
export const perPersonPrice = (tour: Pricing, participants: number): number =>
  tour.price_group != null && participants >= (tour.group_min_size ?? 4)
    ? Number(tour.price_group)
    : Number(tour.price);

/** True when the group rate is what `perPersonPrice` would return. */
export const isGroupRate = (tour: Pricing, participants: number): boolean =>
  tour.price_group != null && participants >= (tour.group_min_size ?? 4);

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

/** A one-off dated group adventure (Phase 6). */
export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  /** ISO date, e.g. "2026-08-14". */
  event_date: string;
  /** "HH:MM:SS" (plain time, SAST) or null. */
  start_time: string | null;
  duration_hours: number | null;
  capacity: number;
  price_per_person: number;
  image_url: string | null;
  is_published: boolean;
  guide_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Row of the public `event_availability` view. */
export interface EventAvailability {
  id: string;
  capacity: number;
  spots_left: number;
}

/** Event plus its remaining spots (joined client-side from the view). */
export interface EventWithSpots extends EventItem {
  spots_left: number | null;
}

export interface Booking {
  id: string;
  booking_ref: string | null;
  user_id: string | null;
  pricing_id: string | null;
  /** Set when this booking is for a group event instead of a private tour. */
  event_id: string | null;
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
