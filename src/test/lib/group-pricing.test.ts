import { describe, it, expect } from "vitest";
import { perPersonPrice, isGroupRate, type Pricing } from "@/lib/types/db";

const tour = (over: Partial<Pricing> = {}): Pricing => ({
  id: "tour-1",
  tour_slug: "lions-head",
  name: "Lions Head Sunrise",
  description: null,
  price: 950,
  price_group: 700,
  group_min_size: 4,
  currency: "ZAR",
  duration: null,
  difficulty: null,
  max_participants: 12,
  display_order: 1,
  active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  ...over,
});

describe("group rate maths", () => {
  it("charges the single rate below group_min_size", () => {
    expect(perPersonPrice(tour(), 3)).toBe(950);
    expect(isGroupRate(tour(), 3)).toBe(false);
    expect(perPersonPrice(tour(), 3) * 3).toBe(2850);
  });

  it("applies the group rate from group_min_size upwards", () => {
    expect(perPersonPrice(tour(), 4)).toBe(700);
    expect(isGroupRate(tour(), 4)).toBe(true);
    expect(perPersonPrice(tour(), 6) * 6).toBe(4200);
  });

  it("respects a custom group_min_size", () => {
    const t = tour({ group_min_size: 6 });
    expect(isGroupRate(t, 5)).toBe(false);
    expect(isGroupRate(t, 6)).toBe(true);
  });

  it("never applies a group rate when price_group is null", () => {
    const t = tour({ price_group: null });
    expect(isGroupRate(t, 10)).toBe(false);
    expect(perPersonPrice(t, 10)).toBe(950);
  });
});
