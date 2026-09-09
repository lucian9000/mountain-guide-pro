import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import QuickBookMenu from "@/components/QuickBookMenu";
import { routes } from "@/data/routes";
const state = vi.hoisted(() => ({ configured: true, data: [] as unknown[], isError: false, isLoading: false, navigate: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({ get isSupabaseConfigured() { return state.configured; } }));
vi.mock("@/lib/queries/content", () => ({ usePublishedRoutes: () => state }));
vi.mock("@/lib/queries/booking", () => ({ usePublicPricing: () => ({ data: [{ id: "price-id", tour_slug: "fresh-route", name: "Other name", price: 750, active: true }], isLoading: false }) }));
vi.mock("react-router-dom", async () => ({ ...await vi.importActual("react-router-dom"), useNavigate: () => state.navigate }));
const draw = () => render(<MemoryRouter><QuickBookMenu onClose={vi.fn()} /></MemoryRouter>);
beforeEach(() => { state.configured = true; state.data = []; state.isError = false; state.isLoading = false; state.navigate.mockClear(); });
it("shows new managed route facts and matches booking by slug, not database id", () => {
  state.data = [{ id: "uuid", slug: "fresh-route", name: "Fresh managed route", description: "Managed description", difficulty: "challenging", duration_hours: 4, distance_km: 8, elevation_m: 900, meeting_point: "Trail gate", price_cents: 75000 }];
  draw();
  expect(screen.getByRole("link", { name: "Fresh managed route" })).toHaveAttribute("href", "/routes/fresh-route");
  for (const fact of ["challenging", "4 hours", "8 km", "900 m", "Trail gate"]) expect(screen.getByText(fact)).toBeInTheDocument();
  expect(screen.queryByText(/Gear:/)).not.toBeInTheDocument();
  expect(screen.queryByText(routes[0].name)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Book Now" }));
  expect(state.navigate).toHaveBeenCalledWith("/booking?tour=price-id");
});
it.each([false, true])("never substitutes static routes for configured empty/error data (%s)", (error) => {
  state.isError = error; draw();
  expect(screen.queryByText(routes[0].name)).not.toBeInTheDocument();
  expect(screen.getByText(error ? /Routes could not be loaded/ : /No routes are currently published/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: /Personal Training/ }));
  expect(screen.getByText(/Strength Training/i)).toBeInTheDocument();
});
it("retains static routes when unconfigured", () => {
  state.configured = false; draw();
  expect(screen.getByText(routes[0].name)).toBeInTheDocument();
});
