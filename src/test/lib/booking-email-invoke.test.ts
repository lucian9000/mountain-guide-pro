import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

// Mock the supabase singleton: a bookings insert chain + a functions.invoke spy.
const mocks = vi.hoisted(() => ({
  invoke: vi.fn().mockResolvedValue({ data: { ok: true }, error: null }),
  insertedRow: { id: "booking-uuid-1", booking_ref: "SF-TEST01" },
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: () => ({
      insert: () => ({
        select: () => ({
          single: async () => ({ data: mocks.insertedRow, error: null }),
        }),
      }),
    }),
    functions: { invoke: mocks.invoke },
  },
}));

import { useCreateBooking } from "@/lib/queries/booking";

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: new QueryClient() }, children);

describe("useCreateBooking → booking-email", () => {
  beforeEach(() => mocks.invoke.mockClear());

  it("fire-and-forgets the booking-email function after a successful insert", async () => {
    const { result } = renderHook(() => useCreateBooking(), { wrapper });
    await result.current.mutateAsync({
      user_id: "user-1",
      pricing_id: "tour-1",
      guide_id: null,
      booking_date: "2026-08-01",
      time_slot: null,
      participants: 2,
      total_price: 1900,
      booking_ref: "SF-TEST01",
    });
    await waitFor(() =>
      expect(mocks.invoke).toHaveBeenCalledWith("booking-email", {
        body: { booking_id: "booking-uuid-1" },
      })
    );
  });

  it("still resolves the booking even if the email invoke rejects", async () => {
    mocks.invoke.mockRejectedValueOnce(new Error("function down"));
    const { result } = renderHook(() => useCreateBooking(), { wrapper });
    const row = await result.current.mutateAsync({
      user_id: "user-1",
      pricing_id: "tour-1",
      guide_id: null,
      booking_date: "2026-08-01",
      time_slot: null,
      participants: 1,
      total_price: 950,
      booking_ref: "SF-TEST02",
    });
    expect(row.id).toBe("booking-uuid-1");
  });
});
