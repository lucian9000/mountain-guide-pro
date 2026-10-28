import { describe, it, expect, vi, beforeEach } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import QuickBookPanel from "@/components/QuickBookPanel";
import { routes } from "@/data/routes";
import type { RouteWithImages } from "@/lib/types/content";

// The menu now shares the published catalogue. Keep this interaction suite
// offline with published equivalents of the bundled fixtures.
const managedRoutes: RouteWithImages[] = routes.map((route) => ({
  id: `managed-${route.id}`, slug: route.id, name: route.name,
  description: route.specs.terrain, difficulty: "challenging",
  duration_hours: 3, distance_km: 5, elevation_m: 500,
  price_cents: route.logistics.price * 100, highlights: [],
  meeting_point: route.logistics.meetingPoint, status: "published", publish_at: null,
  sort_order: 0, latitude: null, longitude: null, map_zoom: 13,
  meeting_latitude: null, meeting_longitude: null, created_at: "", updated_at: "", images: [],
}));
vi.mock("@/lib/queries/content", () => ({
  usePublishedRoutes: () => ({ data: managedRoutes, isLoading: false, error: null }),
}));
vi.mock("@/lib/supabase/client", () => ({ isSupabaseConfigured: true }));

// Emoji ranges: symbols/pictographs, misc symbols & dingbats, misc technical
// (covers stopwatch U+23F1), and supplemental arrows/symbols.
const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}]|\u{FE0F}/u;

const navigate = vi.hoisted(() => vi.fn());
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigate };
});

// Pricing comes from the shared public-pricing query. Lion's Head is priced
// and active; the 13 Peaks challenges deliberately have no row, so they must
// fall back to a WhatsApp enquiry.
const pricingState = vi.hoisted(() => ({
  data: [
    {
      id: "pricing-lions-head",
      tour_slug: "lions-head",
      name: "Lion's Head Sunrise Summit",
      price: 1200,
      price_group: 1000,
      group_min_size: 4,
      active: true,
    },
  ] as unknown[],
  isLoading: false,
}));

vi.mock("@/lib/queries/booking", () => ({
  usePublicPricing: () => ({
    data: pricingState.data,
    isLoading: pricingState.isLoading,
    error: null,
  }),
}));

// Ernest's dated group adventures. Empty by default so the existing route and
// training assertions keep describing the same starting tab; the events tests
// populate it.
const eventsState = vi.hoisted(() => ({
  data: [] as unknown[],
  isLoading: false,
}));

vi.mock("@/lib/queries/events", () => ({
  usePublicEvents: () => ({
    data: eventsState.data,
    isLoading: eventsState.isLoading,
    error: null,
  }),
}));

const Harness = () => {
  const [open, setOpen] = useState(false);
  return (
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <button onClick={() => setOpen(true)}>external cta</button>
      <QuickBookPanel
        isOpen={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      />
    </MemoryRouter>
  );
};

// The menu is code-split (React.lazy), so it resolves asynchronously.
const openMenu = async () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole("button", { name: /book now/i }));
  // The lazy chunk can take longer under parallel full-suite contention.
  return screen.findByRole("dialog", {}, { timeout: 5000 });
};

const UNPRICED = routes.find((r) => r.id === "13-peaks-48hr")!;

describe("QuickBookPanel", () => {
  beforeEach(() => {
    navigate.mockClear();
    pricingState.isLoading = false;
    eventsState.data = [];
    eventsState.isLoading = false;
  });

  it("renders the Book Now FAB synchronously (no lazy chunk needed)", () => {
    render(<Harness />);
    expect(screen.getByRole("button", { name: /book now/i })).toBeInTheDocument();
  });

  it("opens the quick-book menu from the FAB", async () => {
    expect(await openMenu()).toBeInTheDocument();
    expect(screen.getByText(/book your adventure/i)).toBeInTheDocument();
  });

  it("shows every tab at once and swaps the list when switching", async () => {
    await openMenu();
    const routesTab = await screen.findByRole("tab", { name: /^routes$/i });
    const trainingTab = screen.getByRole("tab", { name: /^training$/i });
    const eventsTab = screen.getByRole("tab", { name: /events/i });

    // All are visible from the start — not sequential steps.
    expect(routesTab).toBeInTheDocument();
    expect(trainingTab).toBeInTheDocument();
    expect(eventsTab).toBeInTheDocument();

    // With no dated events, Routes leads rather than an empty Events tab.
    expect(routesTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(routes[0].name)).toBeInTheDocument();

    fireEvent.click(trainingTab);
    expect(trainingTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/strength training/i)).toBeInTheDocument();
    expect(screen.queryByText(routes[0].name)).not.toBeInTheDocument();
  });

  // Regression: Ernest's dated events were invisible in this menu, because it
  // only ever listed the hardcoded routes and training programmes.
  it("lists Ernest's upcoming events and opens the Events tab when there are any", async () => {
    eventsState.data = [
      {
        id: "event-palmiet",
        title: "Palmiet River Trail",
        event_date: "2026-09-13",
        location: "Kogelberg",
        capacity: 12,
        spots_left: 8,
        price_per_person: 650,
        image_url: null,
      },
    ];

    await openMenu();

    const eventsTab = await screen.findByRole("tab", { name: /events/i });
    expect(eventsTab).toHaveAttribute("aria-selected", "true");

    expect(screen.getByText("Palmiet River Trail")).toBeInTheDocument();
    expect(screen.getByText(/8 spots left/i)).toBeInTheDocument();
    expect(screen.getByText(/R650 pp/i)).toBeInTheDocument();
  });

  it("deep-links an event to /booking?event=<id>", async () => {
    eventsState.data = [
      {
        id: "event-palmiet",
        title: "Palmiet River Trail",
        event_date: "2026-09-13",
        location: null,
        capacity: 12,
        spots_left: 8,
        price_per_person: 650,
        image_url: null,
      },
    ];

    await openMenu();
    fireEvent.click(await screen.findByRole("button", { name: /book this date/i }));
    expect(navigate).toHaveBeenCalledWith("/booking?event=event-palmiet");
  });

  it("shows a full event as fully booked instead of offering a booking", async () => {
    eventsState.data = [
      {
        id: "event-full",
        title: "Sold Out Summit",
        event_date: "2026-10-01",
        location: null,
        capacity: 10,
        spots_left: 0,
        price_per_person: 900,
        image_url: null,
      },
    ];

    await openMenu();
    expect(await screen.findByText("Sold Out Summit")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /book this date/i })).not.toBeInTheDocument();
    expect(screen.getAllByText(/fully booked/i).length).toBeGreaterThan(0);
  });

  it("lists every route, never filtered by difficulty", async () => {
    await openMenu();
    for (const route of routes) {
      expect(screen.getByText(route.name)).toBeInTheDocument();
    }
  });

  it("a priced route shows Book Now and deep-links to /booking?tour=<pricing id>", async () => {
    await openMenu();
    const card = screen.getByText("Lion's Head Sunrise Summit").closest("div");
    const bookBtn = screen.getAllByRole("button", { name: /^book now$/i })[0];
    expect(card).toBeTruthy();
    fireEvent.click(bookBtn);
    expect(navigate).toHaveBeenCalledWith("/booking?tour=pricing-lions-head");
  });

  it("an unpriced route keeps Enquire via WhatsApp", async () => {
    await openMenu();
    const links = screen.getAllByRole("link", { name: /enquire via whatsapp/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute("href", expect.stringContaining("wa.me/27671301536"));
    // The 48-Hour Purge is one of the unpriced ones.
    expect(screen.getByText(UNPRICED.name)).toBeInTheDocument();
  });

  it("expands the managed route description when the card is tapped", async () => {
    await openMenu();
    const first = routes[0];
    expect(screen.queryByText(first.specs.terrain)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(first.name));
    expect(
      screen.getByText(first.specs.terrain)
    ).toBeInTheDocument();
  });

  it("shows skeletons while pricing is loading", async () => {
    pricingState.isLoading = true;
    await openMenu();
    expect(screen.queryByText(routes[0].name)).not.toBeInTheDocument();
  });

  it("is a menu, not a chatbot: no greeting, bot framing, chat log or fitness gate", async () => {
    await openMenu();
    expect(screen.queryByText(/i'm ernest's virtual guide/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/powered by ernest/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/adventure bot/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("log")).not.toBeInTheDocument();
    expect(screen.queryByText(/fitness level/i)).not.toBeInTheDocument();
    for (const label of [/just starting out/i, /casual hiker/i, /advanced athlete/i]) {
      expect(screen.queryByRole("button", { name: label })).not.toBeInTheDocument();
    }
  });

  it("offers the muted WhatsApp fallback line and a labelled close button", async () => {
    await openMenu();
    expect(screen.getByText(/prefer to chat\?/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /whatsapp ernest/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("renders no emoji anywhere in the menu", async () => {
    await openMenu();
    expect(document.body.textContent).not.toMatch(EMOJI_RE);
  });
});
