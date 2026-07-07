import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "@/App";
import Index from "@/pages/Index";

// AuthProvider talks to supabase on mount; replace it with a passthrough and
// stub the hook (same shape as Navbar.test.tsx).
vi.mock("@/contexts/AuthContext", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

// UserMenu pulls in @radix-ui/react-menu (truncated ESM build locally, see
// src/test/mocks/radix-stubs.tsx) and is incidental here; stub it out.
vi.mock("@/components/auth/UserMenu", () => ({ default: () => null }));

// ChatWidget (rendered by Index) reads live tour prices via react-query +
// supabase; stub the query hook out like ChatWidget.test.tsx does.
vi.mock("@/lib/queries/content", () => ({
  useTourPrices: () => ({ data: undefined }),
}));

// Toasters are irrelevant to landmark structure (sonner also has a broken
// local ESM build — vite aliases it for the app, vitest doesn't).
vi.mock("@/components/ui/toaster", () => ({ Toaster: () => null }));
vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));

// @radix-ui/react-tooltip drags in the truncated @floating-ui ESM builds
// (aliased in vite.config.ts for the app, not in vitest) — passthrough stub.
vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("skip navigation link", () => {
  it("renders a 'skip to content' link targeting #main before the nav", () => {
    render(<App />); // App's own BrowserRouter serves "/" (Index) in jsdom

    const skip = screen.getByRole("link", { name: /skip to content/i });
    expect(skip).toHaveAttribute("href", "#main");

    // The skip link must be the first thing keyboard users reach — it has to
    // precede the navigation landmark in DOM order.
    const nav = screen.getAllByRole("navigation")[0];
    expect(
      skip.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});

describe("Index main landmark", () => {
  it("wraps the page sections in a single <main id='main'>", () => {
    const { container } = render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    );

    const mains = container.querySelectorAll("main");
    expect(mains).toHaveLength(1);
    expect(mains[0].id).toBe("main");

    // The hero heading (page h1) lives inside the landmark…
    expect(mains[0]).toContainElement(
      screen.getByRole("heading", { level: 1 })
    );
    // …while the site navigation stays outside it.
    for (const nav of screen.getAllByRole("navigation")) {
      expect(mains[0]).not.toContainElement(nav);
    }
  });
});
