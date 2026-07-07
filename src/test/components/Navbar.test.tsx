import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "@/components/Navbar";

// UserMenu pulls in @radix-ui/react-menu (truncated ESM build locally, see
// src/test/mocks/radix-stubs.tsx) and is incidental here; stub it out.
vi.mock("@/components/auth/UserMenu", () => ({ default: () => null }));

// Navbar reads auth state via AuthContext; stub the supabase-backed hook.
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

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <Navbar onOpenChat={vi.fn()} />
    </MemoryRouter>
  );

/** The full-screen mobile overlay is the only div carrying aria-hidden. */
const getOverlay = (container: HTMLElement) => {
  const overlay = container.querySelector<HTMLElement>("div[aria-hidden]");
  expect(overlay).not.toBeNull();
  return overlay!;
};

describe("Navbar mobile menu accessibility", () => {
  it("marks the closed overlay inert so its controls leave the tab order", () => {
    const { container } = renderNavbar();
    const overlay = getOverlay(container);
    expect(overlay.hasAttribute("inert")).toBe(true);
  });

  it("removes inert and moves focus into the overlay when opened", async () => {
    const { container } = renderNavbar();
    const overlay = getOverlay(container);

    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

    expect(overlay.hasAttribute("inert")).toBe(false);
    await waitFor(() => {
      expect(overlay.contains(document.activeElement)).toBe(true);
    });
  });

  it("returns focus to the hamburger button when closed via Escape", async () => {
    const { container } = renderNavbar();
    const overlay = getOverlay(container);
    const hamburger = screen.getByRole("button", { name: /open menu/i });

    fireEvent.click(hamburger);
    await waitFor(() => {
      expect(overlay.contains(document.activeElement)).toBe(true);
    });

    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(document.activeElement).toBe(hamburger);
    });
    expect(overlay.hasAttribute("inert")).toBe(true);
  });
});
