import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RouteCard from "@/components/routes/RouteCard";
import type { RouteWithImages } from "@/lib/types/content";

// publicImageUrl builds CDN URLs through the supabase client; keep the test
// offline by stubbing the module.
vi.mock("@/lib/images", () => ({
  publicImageUrl: (path: string) => `https://cdn.test/${path}`,
}));

const route: RouteWithImages = {
  id: "route-1",
  slug: "lions-head",
  name: "Lions Head Sunrise",
  description: "Sunrise summit above the city.",
  difficulty: "moderate",
  duration_hours: 3,
  distance_km: 5.5,
  elevation_m: 500,
  price_cents: 95000,
  highlights: ["360° views"],
  meeting_point: "Lower cable station",
  status: "published",
  publish_at: null,
  sort_order: 1,
  latitude: null,
  longitude: null,
  map_zoom: 13,
  meeting_latitude: null,
  meeting_longitude: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  images: [],
};

describe("RouteCard heading order", () => {
  it("renders the route name as an h2 (page h1 → card h2, no skipped level)", () => {
    render(
      <MemoryRouter>
        <RouteCard route={route} />
      </MemoryRouter>
    );

    const title = screen.getByRole("heading", {
      level: 2,
      name: /lions head sunrise/i,
    });
    expect(title.tagName).toBe("H2");
    // Visual size must not change: the Tailwind classes travel with the tag.
    expect(title.className).toContain("text-lg");
  });
});
