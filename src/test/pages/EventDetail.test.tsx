import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { EventWithSpots } from "@/lib/types/db";
import EventDetail from "@/pages/EventDetail";

const state = vi.hoisted(() => ({ event: null as EventWithSpots | null }));
vi.mock("@/lib/queries/events", () => ({
  usePublicEvent: () => ({ data: state.event, isLoading: false }),
}));
vi.mock("@/components/SiteHeader", () => ({ default: () => null }));
vi.mock("@/components/Footer", () => ({ default: () => null }));

const renderEvent = () => render(
  <MemoryRouter initialEntries={["/events/event-1"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes><Route path="/events/:id" element={<EventDetail />} /></Routes>
  </MemoryRouter>
);

beforeEach(() => {
  vi.setSystemTime(new Date("2026-10-28T10:00:00Z"));
  state.event = {
    id: "event-1", title: "Palmiet River Trail", description: null,
    location: "Kogelberg", event_date: "2026-10-29", start_time: "07:30:00",
    duration_hours: 4, capacity: 8, price_per_person: 650, image_url: null,
    is_published: true, guide_id: null, created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z", spots_left: 3,
  };
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("EventDetail booking eligibility", () => {
  it.each([null, 8])("does not turn stale ended-event availability (%s) into a booking action", (spots) => {
    state.event = { ...state.event!, event_date: "2026-09-13", spots_left: spots };
    renderEvent();
    expect(screen.queryByRole("link", { name: /book your spot/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/spots left/i)).not.toBeInTheDocument();
    expect(screen.getByText(/already happened/i)).toBeInTheDocument();
  });

  it("does not offer booking for an unpublished event in stale data", () => {
    state.event!.is_published = false;
    renderEvent();
    expect(screen.queryByRole("link", { name: /book your spot/i })).not.toBeInTheDocument();
  });

  it("preserves booking and the existing SAST date/time display for future events", () => {
    renderEvent();
    expect(screen.getByText("3 of 8 spots left")).toBeInTheDocument();
    expect(screen.getByText("Thu, 29 Oct 2026")).toBeInTheDocument();
    expect(screen.getByText("Starts 07:30")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /book your spot/i })).toHaveAttribute("href", "/booking?event=event-1");
  });

  it("continues to show fully booked future events without a booking link", () => {
    state.event!.spots_left = 0;
    renderEvent();
    expect(screen.getAllByText("Fully booked")).toHaveLength(2);
    expect(screen.queryByRole("link", { name: /book your spot/i })).not.toBeInTheDocument();
  });

  it("hides an event from the previous day immediately after South Africa midnight", () => {
    vi.setSystemTime(new Date("2026-10-28T22:30:00Z"));
    state.event!.event_date = "2026-10-28";
    renderEvent();
    expect(screen.queryByRole("link", { name: /book your spot/i })).not.toBeInTheDocument();
  });
});
