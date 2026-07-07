import { describe, it, expect, vi } from "vitest";
import { act } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";

// UserMenu pulls in @radix-ui/react-menu (truncated ESM build locally, see
// src/test/mocks/radix-stubs.tsx) and is incidental here; stub it out.
vi.mock("@/components/auth/UserMenu", () => ({ default: () => null }));

// SiteHeader reads auth state via AuthContext; stub the supabase-backed hook.
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

const renderHeader = (
  props: { variant: "overlay" | "solid"; onOpenChat?: () => void } = {
    variant: "solid",
  },
  initialEntries: string[] = ["/routes"]
) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <SiteHeader {...props} />
    </MemoryRouter>
  );

/** The full-screen mobile overlay is the only div carrying aria-hidden. */
const getOverlay = (container: HTMLElement) => {
  const overlay = container.querySelector<HTMLElement>("div[aria-hidden]");
  expect(overlay).not.toBeNull();
  return overlay!;
};

describe("SiteHeader nav completeness (solid variant)", () => {
  it("renders all 5 nav items including Training and Contact in the desktop nav", () => {
    renderHeader({ variant: "solid" });
    // Desktop nav (first occurrence). getAllByRole in case of desktop+mobile.
    for (const label of ["Routes", "News", "The Guide", "Training", "Contact"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it("renders a Book Now link that is not hidden", () => {
    renderHeader({ variant: "solid" });
    const bookNow = screen
      .getAllByRole("link", { name: /book now/i })
      .find((el) => !el.className.includes("opacity-0"));
    expect(bookNow).toBeTruthy();
    expect(bookNow!.className).not.toMatch(/\bhidden\b/);
  });

  it("renders section links as anchors to /#<section> on a subpage", () => {
    renderHeader({ variant: "solid" });
    const training = screen
      .getAllByRole("link", { name: "Training" })[0] as HTMLAnchorElement;
    expect(training.getAttribute("href")).toBe("/#fitness");
    const contact = screen
      .getAllByRole("link", { name: "Contact" })[0] as HTMLAnchorElement;
    expect(contact.getAttribute("href")).toBe("/#contact");
  });
});

describe("SiteHeader overlay variant scroll background", () => {
  it("starts transparent then gains the solid bg class after a scroll past threshold", () => {
    const { container } = renderHeader({ variant: "overlay" }, ["/"]);
    const nav = container.querySelector("nav")!;
    expect(nav.className).toContain("bg-transparent");
    expect(nav.className).not.toContain("bg-background/95");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 200, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(nav.className).toContain("bg-background/95");
  });
});

describe("SiteHeader mobile menu accessibility", () => {
  it("marks the closed overlay inert so its controls leave the tab order", () => {
    const { container } = renderHeader({ variant: "solid" });
    const overlay = getOverlay(container);
    expect(overlay.hasAttribute("inert")).toBe(true);
  });

  it("removes inert and moves focus into the overlay when opened", async () => {
    const { container } = renderHeader({ variant: "solid" });
    const overlay = getOverlay(container);

    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

    expect(overlay.hasAttribute("inert")).toBe(false);
    await waitFor(() => {
      expect(overlay.contains(document.activeElement)).toBe(true);
    });
  });

  it("returns focus to the hamburger button when closed via Escape", async () => {
    const { container } = renderHeader({ variant: "solid" });
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
