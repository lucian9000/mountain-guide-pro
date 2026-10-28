import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, renderHook, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import type { EventAvailability, EventWithSpots } from "@/lib/types/db";
import { useAdminEvent, usePublicEvent, usePublicEvents } from "@/lib/queries/events";
import Booking from "@/pages/Booking";

const api = vi.hoisted(() => ({
  events: [] as EventWithSpots[],
  availability: [] as EventAvailability[],
  fetch: vi.fn(),
}));

// Keep the real Supabase query builder; replace only its HTTP transport. The
// fixture exposes every row, like an admin session, with no public RLS safety net.
vi.mock("@/lib/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  return {
    isSupabaseConfigured: true,
    supabase: createClient("https://events.test.supabase.co", "test-key", {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: (...args) => api.fetch(...args) },
    }),
  };
});

// Isolate unrelated navigation/auth/private-tour UI while exercising Booking's
// actual group-event selection with the real public event hooks.
vi.mock("@/components/SiteHeader", () => ({ default: () => null }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "admin-1" }, signInWithGoogle: vi.fn() }),
}));
vi.mock("@/lib/queries/booking", () => ({
  usePublicPricing: () => ({ data: [], isLoading: false, error: null }),
  usePublicGuides: () => ({ data: [], isLoading: false, error: null }),
  useCreateBooking: () => ({ isPending: false }),
}));
vi.mock("@radix-ui/react-select", async () => {
  const { selectStub } = await import("@/test/mocks/radix-stubs");
  return selectStub;
});
vi.mock("@radix-ui/react-popover", async () => {
  const { popoverStub } = await import("@/test/mocks/radix-stubs");
  return popoverStub;
});

const makeEvent = (over: Partial<EventWithSpots> = {}): EventWithSpots => ({
  id: "event-1", title: "Palmiet River Trail", description: null,
  location: "Kogelberg", event_date: "2026-10-29", start_time: "07:30:00",
  duration_hours: 4, capacity: 8, price_per_person: 650, image_url: null,
  is_published: true, guide_id: null, created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z", spots_left: null, ...over,
});

const clients: QueryClient[] = [];
const setup = (cached?: EventWithSpots) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  if (cached) client.setQueryData(["public", "event", cached.id], cached);
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { wrapper, client };
};

beforeEach(() => {
  vi.setSystemTime(new Date("2026-10-28T10:00:00Z"));
  api.events = [makeEvent()];
  api.availability = [{ id: "event-1", capacity: 8, spots_left: 3 }];
  api.fetch.mockReset().mockImplementation(async (input: string | URL | Request) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    let rows: Record<string, unknown>[] = url.pathname.endsWith("/events")
      ? api.events.map(({ spots_left, ...event }) => event)
      : api.availability.map((row) => ({ ...row }));
    for (const [column, filter] of url.searchParams) {
      if (filter.startsWith("eq.")) rows = rows.filter((row) => String(row[column]) === filter.slice(3));
      if (filter.startsWith("gte.")) rows = rows.filter((row) => String(row[column]) >= filter.slice(4));
    }
    return new Response(JSON.stringify(rows), { headers: { "Content-Type": "application/json" } });
  });
});

afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
  vi.useRealTimers();
});

describe("public single-event eligibility with privileged row access", () => {
  it.each([
    ["past", { event_date: "2026-09-13" }],
    ["unpublished", { is_published: false }],
  ])("returns null for a %s event without consulting availability", async (_label, over) => {
    api.events = [makeEvent(over)];
    const { wrapper } = setup();
    const { result } = renderHook(() => usePublicEvent("event-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
    expect(api.fetch).toHaveBeenCalledTimes(1);
  });

  it.each([3, 0])("retains a future published event with %i spots", async (spots) => {
    api.availability[0].spots_left = spots;
    const { wrapper } = setup();
    const { result } = renderHook(() => usePublicEvent("event-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({ id: "event-1", spots_left: spots });
    const request = new URL(String(api.fetch.mock.calls[0][0]));
    expect(request.searchParams.get("is_published")).toBe("eq.true");
    expect(request.searchParams.get("event_date")).toBe("gte.2026-10-28");
  });

  it.each([
    { event_date: "2026-09-13" },
    { is_published: false },
  ])("never exposes an ineligible cached deep-linked event before refetch", (over) => {
    const { wrapper } = setup(makeEvent(over));
    const { result } = renderHook(() => usePublicEvent("event-1"), { wrapper });
    expect(result.current.data).toBeNull();
  });

  it("uses the South Africa calendar day after SAST midnight for both public queries", async () => {
    vi.setSystemTime(new Date("2026-10-28T22:30:00Z")); // 29 Oct, 00:30 SAST
    api.events = [makeEvent({ event_date: "2026-10-28" })];
    const { wrapper } = setup();
    const { result } = renderHook(() => ({ single: usePublicEvent("event-1"), list: usePublicEvents() }), { wrapper });
    await waitFor(() => expect(result.current.single.isSuccess && result.current.list.isSuccess).toBe(true));
    expect(result.current.single.data).toBeNull();
    expect(result.current.list.data).toEqual([]);
  });

  it("keeps today's South Africa event eligible until the next calendar day", async () => {
    vi.setSystemTime(new Date("2026-10-28T21:59:00Z"));
    api.events = [makeEvent({ event_date: "2026-10-28" })];
    const { wrapper } = setup();
    const { result } = renderHook(() => usePublicEvent("event-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("event-1");
  });

  it("filters a stale public list before Booking can select an ended event", () => {
    const { wrapper, client } = setup();
    client.setQueryData(["public", "events", "all"], [makeEvent({ event_date: "2026-09-13" })]);
    const { result } = renderHook(() => usePublicEvents(), { wrapper });
    expect(result.current.data).toEqual([]);
  });

  it("retains admin editor access to unpublished past events", async () => {
    api.events = [makeEvent({ event_date: "2026-09-13", is_published: false })];
    const { wrapper } = setup();
    const { result } = renderHook(() => useAdminEvent("event-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({ id: "event-1", is_published: false, event_date: "2026-09-13" });
  });
});

describe("Booking event deep links with real public hooks", () => {
  const renderBooking = (cached?: EventWithSpots) => {
    const { client } = setup(cached);
    return render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={["/booking?event=event-1"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Booking />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it.each([
    { event_date: "2026-09-13" },
    { is_published: false },
  ])("cannot book an ineligible event even when its deep link is cached", async (over) => {
    api.events = [makeEvent(over)];
    api.availability = [];
    renderBooking(makeEvent(over));
    expect(screen.queryByRole("button", { name: /book my spot/i })).not.toBeInTheDocument();
    await waitFor(() => expect(api.fetch).toHaveBeenCalledTimes(2));
    expect(screen.queryByText("Palmiet River Trail")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /book my spot/i })).not.toBeInTheDocument();
  });

  it.each([3, 0])("preserves a future deep link with %i available spots", async (spots) => {
    api.availability[0].spots_left = spots;
    renderBooking();
    const book = await screen.findByRole("button", { name: /book my spot/i });
    if (spots === 0) expect(book).toBeDisabled();
    else expect(book).toBeEnabled();
    expect(screen.getByText(`${spots} spots left`)).toBeInTheDocument();
  });
});
