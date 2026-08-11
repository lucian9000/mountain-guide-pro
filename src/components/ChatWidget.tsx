import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";

// Conversation UI (state machine, route cards, pricing query) is code-split
// out of the main chunk — it only loads when the visitor opens the chat.
const ChatPanel = lazy(() => import("./ChatPanel"));

interface ChatWidgetProps {
  /** Chat is opened from the header / section CTAs (onOpenChat), not the FAB. */
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Phase 6: the floating launcher is now a "Book Now" FAB pointing at /booking
 * (conversion beats conversation). The chat panel itself is unchanged and is
 * still opened by the header and in-page CTAs via `isOpen`.
 */
const ChatWidget = ({ isOpen, onClose }: ChatWidgetProps) => (
  <>
    {!isOpen && (
      <Link
        to="/booking"
        aria-label="Book now"
        className="fixed bottom-6 right-6 z-50 min-h-[44px] h-14 px-4 sm:px-5 bg-accent hover:bg-cyan-hover text-accent-foreground rounded-full shadow-button flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <CalendarDays className="w-6 h-6 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline font-heading font-bold text-sm tracking-wider uppercase">
          Book Now
        </span>
      </Link>
    )}

    {/* Panel resolves in <100ms locally; no fallback flash needed. */}
    <Suspense fallback={null}>{isOpen && <ChatPanel onClose={onClose} />}</Suspense>
  </>
);

export default ChatWidget;
