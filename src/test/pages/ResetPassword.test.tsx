import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResetPassword from "@/pages/ResetPassword";

const authState = vi.hoisted(() => ({
  session: null as null | { user: { id: string } },
  updatePassword: vi.fn(),
}));
const toastMock = vi.hoisted(() => vi.fn());

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: authState.session?.user ?? null,
    session: authState.session,
    profile: null,
    role: null,
    loading: false,
    signInWithGoogle: vi.fn(),
    signInWithPassword: vi.fn(),
    signUpWithPassword: vi.fn(),
    sendPasswordReset: vi.fn(),
    updatePassword: authState.updatePassword,
    signOut: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/reset-password"]}>
      <ResetPassword />
    </MemoryRouter>
  );

describe("ResetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.session = { user: { id: "user-1" } };
    authState.updatePassword.mockResolvedValue({ error: null });
  });

  it("shows an expired-link message when there is no recovery session", () => {
    authState.session = null;
    renderPage();
    expect(screen.getByText(/invalid or has expired/i)).toBeInTheDocument();
  });

  it("mismatched passwords show a validation error and skip updatePassword", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "summit123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "summit456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /passwords don't match/i
    );
    expect(authState.updatePassword).not.toHaveBeenCalled();
  });

  it("rejects passwords shorter than 6 characters", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /at least 6 characters/i
    );
    expect(authState.updatePassword).not.toHaveBeenCalled();
  });

  it("matching valid passwords call updatePassword", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "summit123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "summit123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() =>
      expect(authState.updatePassword).toHaveBeenCalledWith("summit123")
    );
  });
});
