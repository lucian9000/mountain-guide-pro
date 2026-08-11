import { lazy, Suspense } from "react";
import { CalendarDays } from "lucide-react";

// The menu is code-split out of the main chunk — it only loads when opened.
const QuickBookMenu = lazy(() => import("./QuickBookMenu"));

interface QuickBookPanelProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * Floating "Book Now" button + the quick-book menu it opens.
 *
 * Replaces the former "Adventure Bot" chat widget: the panel is now a plain
 * menu of routes and programmes rather than a simulated conversation, so
 * visitors reach a booking in one tap instead of answering questions.
 */
const QuickBookPanel = ({ isOpen, onOpen, onClose }: QuickBookPanelProps) => (
  <>
    {!isOpen && (
      <button
        type="button"
        onClick={onOpen}
        aria-label="Book now"
        aria-expanded={isOpen}
        className="fixed bottom-6 right-6 z-50 min-h-[44px] h-14 px-4 sm:px-5 bg-accent hover:bg-cyan-hover text-accent-foreground rounded-full shadow-button flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <CalendarDays className="w-6 h-6 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline font-heading font-bold text-sm tracking-wider uppercase">
          Book Now
        </span>
      </button>
    )}

    {/* Menu resolves in <100ms locally; no fallback flash needed. */}
    <Suspense fallback={null}>{isOpen && <QuickBookMenu onClose={onClose} />}</Suspense>
  </>
);

export default QuickBookPanel;
