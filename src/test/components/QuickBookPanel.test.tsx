import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import QuickBookPanel from "@/components/QuickBookPanel";
import { routes } from "@/data/routes";

// Emoji ranges: symbols/pictographs, misc symbols & dingbats, misc technical
// (covers stopwatch U+23F1), and supplemental arrows/symbols.
const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{FE0F}]/u;

// QuickBookPanel is controlled by its parent: the floating "Book Now" FAB and
// the header / section CTAs all open the same menu. The extra button stands in
// for those external CTAs.
const Harness = () => {
  const [open, setOpen] = useState(false);
  return (
    <MemoryRouter>
      <button onClick={() => setOpen(true)}>external cta</button>
      <QuickBookPanel
        isOpen={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      />
    </MemoryRouter>
  );
};

// The menu is code-split (React.lazy), so it resolves asynchronously.
const openMenu = async () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole("button", { name: /book now/i }));
  return screen.findByRole("dialog");
};

describe("QuickBookPanel", () => {
  it("renders the Book Now FAB synchronously (no lazy chunk needed)", () => {
    render(<Harness />);
    expect(screen.getByRole("button", { name: /book now/i })).toBeInTheDocument();
  });

  it("opens the quick-book menu from the FAB", async () => {
    const dialog = await openMenu();
    expect(dialog).toBeInTheDocument();
    expect(
      await screen.findByText(/book your adventure/i)
    ).toBeInTheDocument();
  });

  it("hides the FAB while the menu is open", async () => {
    await openMenu();
    expect(screen.queryByRole("button", { name: /book now/i })).not.toBeInTheDocument();
  });

  it("lists every route immediately, each linking to the booking page", async () => {
    await openMenu();
    for (const route of routes) {
      const link = await screen.findByRole("link", {
        name: new RegExp(route.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      });
      expect(link).toHaveAttribute("href", `/booking?tour=${route.id}`);
    }
  });

  it("is a menu, not a chatbot: no greeting, no bot framing, no chat log", async () => {
    await openMenu();
    expect(screen.queryByText(/i'm ernest's virtual guide/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/powered by ernest/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/adventure bot/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("log")).not.toBeInTheDocument();
  });

  it("no longer gates routes behind a fitness-level question", async () => {
    await openMenu();
    expect(screen.queryByText(/fitness level/i)).not.toBeInTheDocument();
    for (const label of [
      /just starting out/i,
      /casual hiker/i,
      /intermediate \(active\)/i,
      /fit & experienced/i,
      /advanced athlete/i,
    ]) {
      expect(screen.queryByRole("button", { name: label })).not.toBeInTheDocument();
    }
  });

  it("offers training and a WhatsApp contact, and has a labelled close button", async () => {
    await openMenu();
    expect(
      await screen.findByRole("link", { name: /training programmes/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: /ask ernest on whatsapp/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("renders no emoji anywhere in the menu", async () => {
    await openMenu();
    expect(document.body.textContent).not.toMatch(EMOJI_RE);
  });
});
