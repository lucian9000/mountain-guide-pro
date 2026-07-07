import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Booking from "@/pages/Booking";

// Several @radix-ui packages have truncated ESM builds in the local
// node_modules (vite.config.ts aliases them to CJS for the app, but the
// vitest config doesn't) — stand in minimal prop-forwarding stubs.
vi.mock("@radix-ui/react-select", async () => {
  const { selectStub } = await import("@/test/mocks/radix-stubs");
  return selectStub;
});
vi.mock("@radix-ui/react-popover", async () => {
  const { popoverStub } = await import("@/test/mocks/radix-stubs");
  return popoverStub;
});
// UserMenu pulls in @radix-ui/react-menu (also truncated) and is incidental
// to this page's form; stub the whole component.
vi.mock("@/components/auth/UserMenu", () => ({ default: () => null }));

// Booking talks to supabase via AuthContext + react-query hooks; stub both
// layers out the same way ChatWidget.test.tsx stubs @/lib/queries/content.
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "user-1",
      email: "climber@example.com",
      user_metadata: {},
    },
    session: null,
    profile: null,
    role: null,
    loading: false,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("@/lib/queries/booking", () => ({
  usePublicPricing: () => ({
    data: [
      {
        id: "tour-1",
        name: "Lions Head Sunrise",
        tour_slug: "lions-head",
        price: 950,
        max_participants: 8,
      },
    ],
    isLoading: false,
    error: null,
  }),
  usePublicGuides: () => ({
    data: [{ id: "guide-1", display_name: "Thabo M" }],
    isLoading: false,
    error: null,
  }),
  useCreateBooking: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

vi.mock("@/lib/google-calendar", () => ({
  getGuideAvailability: vi.fn().mockResolvedValue([]),
}));

const renderBooking = () =>
  render(
    <MemoryRouter initialEntries={["/booking"]}>
      <Booking />
    </MemoryRouter>
  );

describe("Booking page accessibility", () => {
  it("associates the Tour label with the tour select trigger", () => {
    renderBooking();
    const trigger = screen.getByLabelText(/tour/i);
    expect(trigger).toBeInTheDocument();
    expect(trigger.tagName).toBe("BUTTON");
  });

  it("associates the Guide label with the guide select trigger", () => {
    renderBooking();
    expect(screen.getByLabelText(/guide/i)).toBeInTheDocument();
  });

  it("associates the Date label with the date picker button", () => {
    renderBooking();
    const dateButton = screen.getByLabelText(/date/i);
    expect(dateButton).toBeInTheDocument();
    expect(dateButton.tagName).toBe("BUTTON");
  });

  it("associates the Participants label with the participant count", () => {
    renderBooking();
    const count = screen.getByLabelText(/^participants$/i);
    expect(count).toBeInTheDocument();
    expect(count).toHaveValue("1");
  });

  it("gives both stepper buttons a 44px (w-11 h-11) hit target", () => {
    renderBooking();
    const fewer = screen.getByRole("button", { name: /fewer participants/i });
    const more = screen.getByRole("button", { name: /more participants/i });
    for (const btn of [fewer, more]) {
      expect(btn.className).toContain("w-11");
      expect(btn.className).toContain("h-11");
      expect(btn.className).not.toContain("w-9");
      expect(btn.className).not.toContain("h-9");
    }
  });

  it("marks Tour and Date as required (visual star + sr-only text + aria-required)", () => {
    const { container } = renderBooking();

    for (const field of ["tour", "date"]) {
      const label = container.querySelector(`label[for="booking-${field}"]`);
      expect(label, `label[for="booking-${field}"]`).not.toBeNull();

      const star = label!.querySelector('[aria-hidden="true"]');
      expect(star?.textContent).toContain("*");

      const srOnly = label!.querySelector(".sr-only");
      expect(srOnly?.textContent).toMatch(/required/i);
    }

    expect(screen.getByLabelText(/tour/i)).toHaveAttribute(
      "aria-required",
      "true"
    );
    // The date control is a plain popover-trigger <button>; ARIA does not
    // allow aria-required on role="button" (axe: aria-allowed-attr), so the
    // required state is conveyed by the label's indicator asserted above.
    expect(screen.getByLabelText(/date/i)).not.toHaveAttribute("aria-required");
  });

  it("explains the disabled submit button when tour/date are missing", () => {
    renderBooking();
    // Nothing selected yet, so submit is disabled — a hint must say why.
    expect(screen.getByRole("button", { name: /book now/i })).toBeDisabled();
    const hint = screen.getByText(/select a tour and date to continue/i);
    expect(hint).toBeInTheDocument();
    // Legibility: no opacity-diluted text tokens on the hint.
    expect(hint.className).not.toMatch(/\/(40|60|70)/);
  });
});
