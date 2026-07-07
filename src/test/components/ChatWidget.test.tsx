import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ChatWidget from "@/components/ChatWidget";

// The widget reads live tour prices via react-query + supabase; stub it out.
vi.mock("@/lib/queries/content", () => ({
  useTourPrices: () => ({ data: undefined }),
}));

// Emoji ranges: symbols/pictographs, misc symbols & dingbats, misc technical
// (covers stopwatch U+23F1), and supplemental arrows/symbols.
const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{FE0F}]/u;

// ChatWidget is controlled by its parent, so wrap it in a tiny stateful harness.
const Harness = () => {
  const [open, setOpen] = useState(false);
  return (
    <ChatWidget
      isOpen={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    />
  );
};

const openWidget = () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole("button", { name: /open chat/i }));
};

describe("ChatWidget accessibility", () => {
  it("gives the floating launcher an accessible name", () => {
    render(<Harness />);
    expect(
      screen.getByRole("button", { name: /open chat/i })
    ).toBeInTheDocument();
  });

  it("shows a close button with an accessible name after opening", () => {
    openWidget();
    expect(
      screen.getByRole("button", { name: /close chat/i })
    ).toBeInTheDocument();
  });

  it("exposes the message list as a polite live region log", () => {
    openWidget();
    const log = screen.getByRole("log");
    expect(log).toHaveAttribute("aria-live", "polite");
  });

  it("renders no emoji anywhere in the widget (initial options)", () => {
    openWidget();
    // Initial quick-reply options are on screen.
    expect(
      screen.getByRole("button", { name: /mountain routes/i })
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(EMOJI_RE);
  });

  it("renders no emoji in bot replies, level options, or route cards", () => {
    openWidget();
    fireEvent.click(screen.getByRole("button", { name: /mountain routes/i }));
    expect(document.body.textContent).not.toMatch(EMOJI_RE);

    // Pick the highest level so all route cards render (dates, weather, CTAs).
    fireEvent.click(screen.getByRole("button", { name: /advanced athlete/i }));
    expect(document.body.textContent).not.toMatch(EMOJI_RE);
  });

  it("renders no emoji on the personal training path", () => {
    openWidget();
    fireEvent.click(
      screen.getByRole("button", { name: /personal training/i })
    );
    expect(document.body.textContent).not.toMatch(EMOJI_RE);
  });
});
