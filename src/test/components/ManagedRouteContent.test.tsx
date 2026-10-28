import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import QuickBookMenu from "@/components/QuickBookMenu";
import Expeditions from "@/components/Expeditions";
import type { RouteWithImages } from "@/lib/types/content";
import type { Pricing } from "@/lib/types/db";

const state = vi.hoisted(() => ({
  configured: true,
  routes: [] as RouteWithImages[],
  loading: false,
  error: null as Error | null,
  prices: [] as Pricing[],
}));

// Isolate the network boundary; exercise the actual cards and navigation.
vi.mock("@/lib/queries/content", () => ({
  usePublishedRoutes: () => ({ data: state.routes, isLoading: state.loading, error: state.error }),
}));
vi.mock("@/lib/queries/booking", () => ({
  usePublicPricing: () => ({ data: state.prices, isLoading: false, error: null }),
}));
vi.mock("@/lib/queries/events", () => ({
  usePublicEvents: () => ({ data: [], isLoading: false, error: null }),
}));
vi.mock("@/lib/supabase/client", () => ({
  get isSupabaseConfigured() { return state.configured; },
}));
vi.mock("@/lib/images", () => ({
  publicImageUrl: (path: string) => `https://cdn.test/${path}`,
}));

const route = (overrides: Partial<RouteWithImages> = {}): RouteWithImages => ({
  id: "managed-gantouw-id", slug: "gantouw-pass", name: "Old Wagon Trail on Gantouw Pass",
  description: "Walk the historic wagon tracks with a guide.", difficulty: "moderate",
  duration_hours: 5, distance_km: 7, elevation_m: 430, price_cents: 120000,
  highlights: ["Historic wagon tracks"], meeting_point: "Gantouw trailhead",
  status: "published", publish_at: null, sort_order: 0, latitude: null, longitude: null,
  map_zoom: 13, meeting_latitude: null, meeting_longitude: null,
  created_at: "2026-10-01T00:00:00Z", updated_at: "2026-10-28T00:00:00Z", images: [],
  ...overrides,
});
const price = (overrides: Partial<Pricing> = {}): Pricing => ({
  id: "live-gantouw-price", tour_slug: "gantouw-pass", name: "Old tour name",
  description: null, price: 1350, price_group: 1100, group_min_size: 4,
  currency: "ZAR", duration: null, difficulty: null, max_participants: 8,
  display_order: 0, active: true, created_at: "", updated_at: "", ...overrides,
});
const Location = () => {
  const location = useLocation();
  return <div aria-label="Current location">{location.pathname + location.search}</div>;
};
const show = (element: React.ReactNode) => render(
  <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    {element}<Location />
  </MemoryRouter>,
);

beforeEach(() => {
  state.configured = true;
  state.routes = [route()];
  state.prices = [price()];
  state.loading = false;
  state.error = null;
});

describe("quick booking managed routes", () => {
  it("discovers a newly published route with managed facts and expandable description", () => {
    show(<QuickBookMenu onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Old Wagon Trail/ }));
    expect(screen.getByText("≈ 5 hrs")).toBeInTheDocument();
    expect(screen.getByText("430 m")).toBeInTheDocument();
    expect(screen.getByText("Gantouw trailhead")).toBeInTheDocument();
    expect(screen.getByText(state.routes[0].description)).toBeInTheDocument();
    expect(screen.queryByText("Lion's Head Sunrise Summit")).not.toBeInTheDocument();
  });

  it("matches the managed slug before a same-name price and books the live pricing id", () => {
    state.prices.unshift(price({ id: "wrong-price", tour_slug: null, name: state.routes[0].name, price: 99 }));
    const close = vi.fn();
    show(<QuickBookMenu onClose={close} />);
    expect(screen.getByText("From R1350 pp")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Book Now" }));
    expect(screen.getByLabelText("Current location")).toHaveTextContent("/booking?tour=live-gantouw-price");
    expect(close).toHaveBeenCalledOnce();
  });

  it("retains case-insensitive name matching when a pricing slug is absent", () => {
    state.prices = [price({ tour_slug: null, name: state.routes[0].name.toUpperCase() })];
    show(<QuickBookMenu onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Book Now" }));
    expect(screen.getByLabelText("Current location")).toHaveTextContent("/booking?tour=live-gantouw-price");
  });

  it.each([
    ["zero managed price", { price_cents: 0 }, price()],
    ["zero live price", {}, price({ price: 0 })],
    ["inactive price", {}, price({ active: false })],
    ["missing price", {}, null],
  ] as const)("keeps %s as an enquiry", (_name, changes, pricing) => {
    state.routes = [route(changes)];
    state.prices = pricing ? [pricing] : [];
    show(<QuickBookMenu onClose={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Book Now" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Enquire via WhatsApp" })).toHaveAttribute(
      "href", expect.stringContaining(encodeURIComponent(state.routes[0].name)),
    );
  });

  it.each(["empty", "error", "loading"])("does not reveal bundled routes for managed %s", (mode) => {
    state.routes = [];
    state.loading = mode === "loading";
    state.error = mode === "error" ? new Error("Request failed") : null;
    show(<QuickBookMenu onClose={vi.fn()} />);
    expect(screen.queryByText("Lion's Head Sunrise Summit")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Book Now" })).not.toBeInTheDocument();
    if (mode === "empty") expect(screen.getByText(/no routes published/i)).toBeInTheDocument();
    if (mode === "error") expect(screen.getByText(/unable to load routes/i)).toBeInTheDocument();
    if (mode === "loading") expect(screen.getByRole("status")).toHaveTextContent(/loading routes/i);
  });

  it("uses bundled routes with expandable safety details only when unconfigured", () => {
    state.configured = false;
    state.error = new Error("Not configured");
    show(<QuickBookMenu onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("Lion's Head Sunrise Summit"));
    expect(screen.getByText(/Lives are more important than summits/)).toBeInTheDocument();
    expect(screen.queryByText(state.routes[0].name)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Book Now" })).not.toBeInTheDocument();
  });
});

describe("homepage featured managed routes", () => {
  it("uses current names, duration, difficulty, description and uploaded cover photos", () => {
    state.routes = [route({ slug: "india-venster", name: "Updated India Venster", difficulty: "extreme", images: [
      { id: "gallery", route_id: "managed-gantouw-id", storage_path: "gallery.webp", alt_text: "Gallery image", width: 600, height: 400, is_cover: false, sort_order: 0, created_at: "" },
      { id: "cover", route_id: "managed-gantouw-id", storage_path: "india-cover.webp", alt_text: "Managed summit view", width: 1600, height: 900, is_cover: true, sort_order: 1, created_at: "" },
    ] }), route({ id: "skeleton", slug: "waterworks", name: "Updated Skeleton Gorge", duration_hours: 8 })];
    show(<Expeditions onOpenBooking={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Updated India Venster" })).toBeInTheDocument();
    expect(screen.getByText("≈ 5 hrs")).toBeInTheDocument();
    expect(screen.getByText("≈ 8 hrs")).toBeInTheDocument();
    expect(screen.getAllByText("extreme").length).toBeGreaterThan(0);
    expect(screen.getAllByText(state.routes[0].description).length).toBeGreaterThan(0);
    expect(screen.getByAltText("Managed summit view")).toHaveAttribute("src", "https://cdn.test/india-cover.webp");
  });

  it("links each detail action to its managed slug without opening the generic menu", () => {
    const open = vi.fn();
    show(<Expeditions onOpenBooking={open} />);
    const details = screen.getByRole("link", { name: /view details/i });
    expect(details).toHaveAttribute("href", "/routes/gantouw-pass");
    fireEvent.click(details);
    expect(screen.getByLabelText("Current location")).toHaveTextContent("/routes/gantouw-pass");
    expect(open).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /find your adventure/i }));
    expect(open).toHaveBeenCalledOnce();
  });

  it("keeps the incumbent featured selection where published, filling available slots from managed routes", () => {
    state.routes = [route(), route({ id: "other", slug: "another-route", name: "Another Route" }),
      route({ id: "west", slug: "west-peak", name: "Published West Peak" }),
      route({ id: "india", slug: "india-venster", name: "Published India" })];
    show(<Expeditions onOpenBooking={vi.fn()} />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Published India", "Published West Peak", "Old Wagon Trail on Gantouw Pass",
    ]);
    expect(screen.queryByText("Another Route")).not.toBeInTheDocument();
  });

  it.each(["empty", "error", "loading"])("shows an honest managed %s state without static featured cards", (mode) => {
    state.routes = [];
    state.loading = mode === "loading";
    state.error = mode === "error" ? new Error("Request failed") : null;
    show(<Expeditions onOpenBooking={vi.fn()} />);
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
    if (mode === "empty") expect(screen.getByText(/no routes published/i)).toBeInTheDocument();
    if (mode === "error") expect(screen.getByText(/unable to load routes/i)).toBeInTheDocument();
    if (mode === "loading") expect(screen.getByRole("status")).toHaveTextContent(/loading routes/i);
  });

  it("retains three bundled featured cards only when unconfigured, linking their actual slugs", () => {
    state.configured = false;
    show(<Expeditions onOpenBooking={vi.fn()} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(screen.getAllByRole("link", { name: /view details/i }).map((a) => a.getAttribute("href"))).toEqual([
      "/routes/india-venster", "/routes/waterworks", "/routes/west-peak",
    ]);
    expect(screen.queryByText(state.routes[0].name)).not.toBeInTheDocument();
  });

  it("derives offline featured difficulty from the bundled numeric difficulty", () => {
    state.configured = false;
    show(<Expeditions onOpenBooking={vi.fn()} />);
    // Skeleton Gorge is difficulty 4; India Venster and West Peak are 5.
    expect(screen.getAllByText("challenging")).toHaveLength(2);
    expect(screen.getAllByText("extreme")).toHaveLength(4);
  });
});
