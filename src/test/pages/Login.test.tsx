import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "@/pages/Login";

const authState = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUpWithPassword: vi.fn(),
  sendPasswordReset: vi.fn(),
}));
const toastMock = vi.hoisted(() => vi.fn());

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    session: null,
    profile: null,
    role: null,
    loading: false,
    signInWithGoogle: vi.fn(),
    signInWithPassword: authState.signInWithPassword,
    signUpWithPassword: authState.signUpWithPassword,
    sendPasswordReset: authState.sendPasswordReset,
    updatePassword: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {},
  isSupabaseConfigured: true,
}));

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Login />
    </MemoryRouter>
  );

describe("Login email/password auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.signInWithPassword.mockResolvedValue({ error: null });
    authState.signUpWithPassword.mockResolvedValue({
      error: null,
      session: null,
    });
    authState.sendPasswordReset.mockResolvedValue({ error: null });
  });

  it("keeps the Google button and hides sign-up fields in sign-in mode", () => {
    renderLogin();
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
  });

  it("toggling to sign-up reveals Full Name and a checked marketing checkbox", () => {
    renderLogin();
    fireEvent.click(screen.getByText(/new here\? create an account/i));

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    const optIn = screen.getByLabelText(
      /keep me posted on upcoming hikes and specials/i
    ) as HTMLInputElement;
    expect(optIn).toBeChecked();
  });

  it("submitting sign-in calls signInWithPassword with the typed values", async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "climber@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "summit123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() =>
      expect(authState.signInWithPassword).toHaveBeenCalledWith({
        email: "climber@example.com",
        password: "summit123",
      })
    );
  });

  it("forgot password with an empty email toasts instead of sending", async () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /forgot password/i }));

    await waitFor(() => expect(toastMock).toHaveBeenCalled());
    expect(authState.sendPasswordReset).not.toHaveBeenCalled();
  });

  it("forgot password sends a reset for the entered email", async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "climber@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /forgot password/i }));

    await waitFor(() =>
      expect(authState.sendPasswordReset).toHaveBeenCalledWith(
        "climber@example.com"
      )
    );
  });
});
