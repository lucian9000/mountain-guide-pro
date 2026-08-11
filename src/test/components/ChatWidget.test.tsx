import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ChatWidget from "@/components/ChatWidget";

// The widget reads live tour prices via react-query + supabase; stub it out.
vi.mock("@/lib/queries/content", () => ({
  useTourPrices: () => ({ data: undefined }),
}));

// Emoji ranges: symbols/pictographs, misc symbols & dingbats, misc technical
// (covers stopwatch U+23F1), and supplemental arrows/symbols.
const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{FE0F}]/u;

// ChatWidget is controlled by its parent (the header / section CTAs open the
// chat); the floating launcher is now a "Book Now" link to /booking. The
// harness exposes a plain button standing in for those external CTAs.
const Harness = () => {
  const [open, setOpen] = useState(false);
  return (
    <MemoryRouter>
      <button onClick={() => setOpen(true)}>open chat</button>
      <ChatWidget isOpen={open} onClose={() => setOpen(false)} />
    </MemoryRouter>
  );
};

// The conversation panel is code-split (React.lazy), so after clicking the
// launcher the panel appears asynchronously — await it before asserting.
const openWidget = async () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole("button", { name: /open chat/i }));
  await screen.findByRole("log");
};

describe("ChatWidget accessibility", () => {
  it("renders the Book Now FAB synchronously (no lazy chunk needed)", () => {
    render(<Harness />);
    const fab = screen.getByRole("link", { name: /book now/i });
    expect(fab).toBeInTheDocument();
    expect(fab).toHaveAttribute("href", "/booking");
  });

  it("hides the FAB while the chat panel is open", async () => {
    await openWidget();
    expect(screen.queryByRole("link", { name: /book now/i })).not.toBeInTheDocument();
  });

  it("shows a close button with an accessible name after opening", async () => {
    await openWidget();
    expect(
      await screen.findByRole("button", { name: /close chat/i })
    ).toBeInTheDocument();
  });

  it("exposes the message list as a polite live region log", async () => {
    await openWidget();
    const log = await screen.findByRole("log");
    expect(log).toHaveAttribute("aria-live", "polite");
  });

  it("renders no emoji anywhere in the widget (initial options)", async () => {
    await openWidget();
    // Initial quick-reply options are on screen.
    expect(
      await screen.findByRole("button", { name: /mountain routes/i })
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(EMOJI_RE);
  });

  it("renders no emoji in bot replies, level options, or route cards", async () => {
    await openWidget();
    fireEvent.click(
      await screen.findByRole("button", { name: /mountain routes/i })
    );
    expect(document.body.textContent).not.toMatch(EMOJI_RE);

    // Pick the highest level so all route cards render (dates, weather, CTAs).
    fireEvent.click(
      await screen.findByRole("button", { name: /advanced athlete/i })
    );
    expect(document.body.textContent).not.toMatch(EMOJI_RE);
  });

  it("renders no emoji on the personal training path", async () => {
    await openWidget();
    fireEvent.click(
      await screen.findByRole("button", { name: /personal training/i })
    );
    expect(document.body.textContent).not.toMatch(EMOJI_RE);
  });
});
