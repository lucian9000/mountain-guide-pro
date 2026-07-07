import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RouteDetail from "@/pages/RouteDetail";

// UserMenu pulls in @radix-ui/react-menu (truncated ESM build in local
// node_modules — see radix-stubs.tsx) and is incidental here; stub it.
vi.mock("@/components/auth/UserMenu", () => ({ default: () => null }));

// Keep supabase out of the test: publicImageUrl normally builds a CDN URL
// via the supabase client (which wants real env vars).
vi.mock("@/lib/images", () => ({
  publicImageUrl: (path: string) => `/img/${path}`,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    session: null,
    profile: null,
    role: null,
    loading: false,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  }),
}));

const route = {
  id: "route-1",
  slug: "platteklip-gorge",
  name: "Platteklip Gorge",
  status: "published",
  difficulty: "moderate",
  duration_hours: 3,
  distance_km: 3,
  elevation_m: 700,
  price_cents: 0,
  highlights: ["Table Mountain summit"],
  description: "The classic straight-up route to the top of Table Mountain.",
  meeting_point: null,
  meeting_latitude: null,
  meeting_longitude: null,
  // No coordinates → the lazy Leaflet map never loads in this test.
  latitude: null,
  longitude: null,
  images: [
    {
      id: "img-1",
      storage_path: "routes/platteklip-gorge/one.webp",
      alt_text: "Hikers in the gorge",
      width: 1600,
      height: 1200,
      is_cover: true,
      sort_order: 0,
    },
    {
      id: "img-2",
      storage_path: "routes/platteklip-gorge/two.webp",
      alt_text: "Summit plateau view",
      width: 1600,
      height: 1200,
      is_cover: false,
      sort_order: 1,
    },
  ],
};

vi.mock("@/lib/queries/content", () => ({
  usePublishedRoute: () => ({ data: route, isLoading: false, error: null }),
  usePreviewRoute: () => ({ data: undefined, isLoading: false, error: null }),
  useTourPrices: () => ({ data: undefined, isLoading: false, error: null }),
}));

const renderRouteDetail = () =>
  render(
    <MemoryRouter initialEntries={["/routes/platteklip-gorge"]}>
      <Routes>
        <Route path="/routes/:slug" element={<RouteDetail />} />
      </Routes>
    </MemoryRouter>
  );

describe("RouteDetail lightbox accessibility", () => {
  it("opens the lightbox as a dialog with an accessible name (route name + photo)", () => {
    renderRouteDetail();

    // Open the lightbox from the first gallery thumbnail (named by its img alt).
    fireEvent.click(screen.getByRole("button", { name: /hikers in the gorge/i }));

    // The dialog must be labelled — an unnamed modal is announced as just
    // "dialog" by screen readers (and Radix logs a missing-DialogTitle warning).
    const dialog = screen.getByRole("dialog", {
      name: /platteklip gorge photo/i,
    });
    expect(dialog).toBeInTheDocument();
  });

  it("gives prev/next controls a 44px hit target (p-3, not p-2)", () => {
    renderRouteDetail();
    fireEvent.click(screen.getByRole("button", { name: /hikers in the gorge/i }));

    const prev = screen.getByRole("button", { name: /previous image/i });
    const next = screen.getByRole("button", { name: /next image/i });
    for (const btn of [prev, next]) {
      expect(btn.className).toContain("p-3");
      expect(btn.className).not.toMatch(/\bp-2\b/);
    }
  });
});
