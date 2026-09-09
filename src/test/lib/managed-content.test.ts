import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ invalidateQueries: vi.fn(), from: vi.fn(), warning: vi.fn() }));
vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: unknown) => options,
  useMutation: (options: unknown) => options,
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
}));
vi.mock("@/lib/supabase/client", () => ({ isSupabaseConfigured: true, supabase: { from: mocks.from } }));
vi.mock("@/lib/images", () => ({ removeStorageImage: vi.fn() }));
vi.mock("sonner", () => ({ toast: { warning: mocks.warning } }));
import * as admin from "@/lib/queries/admin";
import { usePublicEvent, useUpdateEvent } from "@/lib/queries/events";
import { syncBookableTour, useUpsertRoute, useUpdateRouteImages } from "@/lib/queries/contentAdmin";
import type { RouteRow } from "@/lib/types/content";

// Expose the options captured by the mocked React Query boundary.
type Options = { queryFn: () => Promise<unknown>; mutationFn: (value: unknown) => Promise<unknown>; onSuccess: (...args: unknown[]) => unknown; onSettled: () => unknown };
const options = (value: unknown) => value as Options;
const builder = (data: unknown, error: { message: string } | null = null) => {
  const q = { select: vi.fn(), eq: vi.fn(), gte: vi.fn(), limit: vi.fn(), update: vi.fn(), insert: vi.fn(), single: vi.fn(), maybeSingle: vi.fn(), then: vi.fn() };
  for (const key of ["select", "eq", "gte", "limit", "update", "insert", "single", "maybeSingle"] as const) q[key].mockReturnValue(q);
  q.then.mockImplementation((resolve) => Promise.resolve({ data, error }).then(resolve));
  return q;
};
const route = { id: "route-id", slug: "new-route", name: "New route", price_cents: 125000, difficulty: "moderate", duration_hours: 3, status: "published", description: "A walk", sort_order: 10 } as RouteRow;
beforeEach(() => vi.clearAllMocks());

describe("public cache refresh", () => {
  it.each([admin.useUpsertPricing, admin.useDeletePricing])("refreshes all pricing consumers after %s", async (hook) => {
    await options(hook()).onSuccess();
    for (const key of ["pricing", "tour-prices", "tour-price-rows"]) expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["public", key] });
  });
  it.each([admin.useUpsertSpecial, admin.useDeleteSpecial, admin.useActivateSpecial, admin.useDeactivateSpecial])("refreshes the active public special after %s", async (hook) => {
    await options(hook()).onSuccess();
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["public", "special"] });
  });
  it("refreshes event details after unpublishing", () => {
    options(useUpdateEvent()).onSuccess({}, { id: "event-id", is_published: false });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["public", "event"] });
  });
  it("refreshes galleries even after a partial reorder fails", () => {
    options(useUpdateRouteImages()).onSettled();
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["admin", "route"] });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["public", "route"] });
  });
});

it("explicitly restricts public event detail to published upcoming events, even for admins", async () => {
  const q = builder(null);
  mocks.from.mockReturnValue(q);
  expect(await options(usePublicEvent("draft-id")).queryFn()).toBeNull();
  expect(q.eq).toHaveBeenCalledWith("is_published", true);
  expect(q.gte).toHaveBeenCalledWith("event_date", new Date().toISOString().slice(0, 10));
  expect(mocks.from).toHaveBeenCalledTimes(1);
});

describe("route to pricing sync", () => {
  it("converts cents to rand without overwriting group pricing or participant limits", async () => {
    const lookup = builder([{ id: "existing-price" }]);
    const update = builder([]);
    mocks.from.mockReturnValueOnce(lookup).mockReturnValueOnce(update);
    await syncBookableTour(route);
    expect(update.update).toHaveBeenCalledWith({ name: "New route", price: 1250, duration: "3 hours", difficulty: 2, active: true });
    expect(update.eq).toHaveBeenCalledWith("id", "existing-price");
  });
  it("creates a matching tour for a newly saved priced route", async () => {
    const lookup = builder([]), insert = builder([]);
    mocks.from.mockReturnValueOnce(lookup).mockReturnValueOnce(insert);
    await syncBookableTour(route);
    expect(insert.insert).toHaveBeenCalledWith(expect.objectContaining({ tour_slug: "new-route", price: 1250, active: true }));
  });
  it("deactivates enquiry-only routes instead of offering free bookings", async () => {
    const lookup = builder([{ id: "existing-price" }]), update = builder([]);
    mocks.from.mockReturnValueOnce(lookup).mockReturnValueOnce(update);
    await syncBookableTour({ ...route, price_cents: 0 });
    expect(update.update).toHaveBeenCalledWith({ active: false });
  });
  it("keeps the successfully saved route and visibly warns when pricing sync fails", async () => {
    mocks.from.mockReturnValueOnce(builder(route)).mockReturnValueOnce(builder(null, { message: "Sync unavailable" }));
    const mutation = options(useUpsertRoute());
    expect(await mutation.mutationFn(route)).toEqual(route);
    expect(mocks.warning).toHaveBeenCalledWith(expect.stringContaining("Route saved"), expect.objectContaining({ description: expect.stringContaining("Sync unavailable") }));
    mutation.onSuccess();
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["public", "tour-prices"] });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["public", "tour-price-rows"] });
  });
});
