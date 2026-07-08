import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AuthCallback from "@/pages/AuthCallback";

// Mutable auth state: simulates the real-world PKCE race where the code
// exchange completes AFTER AuthContext's initial getSession() resolves null.
const authState = vi.hoisted(() => ({
  user: null as null | { id: string },
  loading: false,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: authState.user,
    session: null,
    profile: null,
    role: null,
    loading: authState.loading,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  }),
}));

const renderCallback = (path = "/auth/callback?redirect=/booking") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/booking" element={<div>BOOKING PAGE</div>} />
        <Route path="/dashboard" element={<div>DASHBOARD PAGE</div>} />
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("AuthCallback PKCE race", () => {
  beforeEach(() => {
    authState.user = null;
    authState.loading = false;
    vi.useRealTimers();
  });

  it("does NOT bounce to /login while the code exchange is still settling", () => {
    // loading=false + user=null is the transient state right after redirect;
    // the SIGNED_IN event arrives a beat later. Must keep waiting, not bail.
    renderCallback();
    expect(screen.queryByText("LOGIN PAGE")).not.toBeInTheDocument();
    expect(screen.getByText(/completing sign-in/i)).toBeInTheDocument();
  });

  it("navigates to the redirect target once the user materializes", () => {
    const view = renderCallback();
    // Session lands (SIGNED_IN fired) → context now has a user.
    act(() => {
      authState.user = { id: "user-1" };
    });
    view.rerender(
      <MemoryRouter initialEntries={["/auth/callback?redirect=/booking"]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/booking" element={<div>BOOKING PAGE</div>} />
          <Route path="/dashboard" element={<div>DASHBOARD PAGE</div>} />
          <Route path="/login" element={<div>LOGIN PAGE</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("BOOKING PAGE")).toBeInTheDocument();
  });

  it("still fails fast on an explicit provider error", () => {
    renderCallback("/auth/callback?error=access_denied");
    expect(screen.getByText("LOGIN PAGE")).toBeInTheDocument();
  });

  it("times out to /login if no session ever arrives", () => {
    vi.useFakeTimers();
    renderCallback();
    act(() => {
      vi.advanceTimersByTime(10_500);
    });
    expect(screen.getByText("LOGIN PAGE")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
