import { lazy, Suspense } from "react";
import { CalendarDays } from "lucide-react";

// Conversation UI (state machine, route cards, pricing query) is code-split
// out of the main chunk — it only loads when the visitor opens the chat.
const ChatPanel = lazy(() => import("./ChatPanel"));

interface ChatWidgetProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * Floating "Book Now" button.
 *
 * It is labelled for conversion but behaves as the original assistant: tapping
 * it opens the guided chat, which qualifies the visitor (fitness level → route
 * recommendation) and hands them to /booking. Keeping the bot behind the
 * high-intent label is deliberate — visitors who know what they want are
 * served by the header's "Book Now" link straight to /booking.
 */
const ChatWidget = ({ isOpen, onOpen, onClose }: ChatWidgetProps) => (
  <>
    {!isOpen && (
      <button
        type="button"
        onClick={onOpen}
        aria-label="Book now — chat to find your route"
        aria-expanded={isOpen}
        className="fixed bottom-6 right-6 z-50 min-h-[44px] h-14 px-4 sm:px-5 bg-accent hover:bg-cyan-hover text-accent-foreground rounded-full shadow-button flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <CalendarDays className="w-6 h-6 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline font-heading font-bold text-sm tracking-wider uppercase">
          Book Now
        </span>
      </button>
    )}

    {/* Panel resolves in <100ms locally; no fallback flash needed. */}
    <Suspense fallback={null}>{isOpen && <ChatPanel onClose={onClose} />}</Suspense>
  </>
);

export default ChatWidget;
