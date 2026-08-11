import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { EventWithSpots } from "@/lib/types/db";

// The section reads events through react-query + supabase; drive it with a
// mutable stub so each test controls the data (and no provider is needed).
const state = vi.hoisted(() => ({ data: undefined as EventWithSpots[] | undefined }));
vi.mock("@/lib/queries/events", () => ({
  usePublicEvents: () => ({ data: state.data, isLoading: false, error: null }),
}));

const { default: UpcomingAdventures } = await import("@/components/UpcomingAdventures");

const makeEvent = (over: Partial<EventWithSpots> = {}): EventWithSpots => ({
  id: "event-1",
  title: "Sunrise Summit",
  description: null,
  location: "Lion's Head",
  event_date: "2026-09-12",
  start_time: null,
  duration_hours: 4,
  capacity: 12,
  price_per_person: 650,
  image_url: null,
  is_published: true,
  guide_id: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  spots_left: 8,
  ...over,
});

const renderSection = () =>
  render(
    <MemoryRouter>
      <UpcomingAdventures />
    </MemoryRouter>
  );

describe("UpcomingAdventures graceful degradation", () => {
  it("renders nothing when the events query has no data (Supabase unconfigured)", () => {
    state.data = undefined;
    const { container } = renderSection();
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when there are no upcoming events", () => {
    state.data = [];
    const { container } = renderSection();
    expect(container).toBeEmptyDOMElement();
  });
});

describe("UpcomingAdventures cards", () => {
  it("shows the event with a bookable link when spots remain", () => {
    state.data = [makeEvent()];
    renderSection();
    expect(screen.getByText("Sunrise Summit")).toBeInTheDocument();
    expect(screen.getByText(/8 spots left/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^book$/i })).toHaveAttribute(
      "href",
      "/booking?event=event-1"
    );
  });

  it("disables booking and shows 'Fully booked' when no spots are left", () => {
    state.data = [makeEvent({ spots_left: 0 })];
    renderSection();
    expect(screen.queryByRole("link", { name: /^book$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /fully booked/i })).toBeDisabled();
  });

  it("uses the amber warning badge at five or fewer spots", () => {
    state.data = [makeEvent({ spots_left: 3 })];
    renderSection();
    expect(screen.getByText(/3 spots left/i).className).toContain("bg-warning");
  });
});
