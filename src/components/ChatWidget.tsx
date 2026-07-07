import { lazy, Suspense } from "react";
import { MessageCircle } from "lucide-react";

// Conversation UI (state machine, route cards, pricing query) is code-split
// out of the main chunk — it only loads when the visitor opens the chat.
const ChatPanel = lazy(() => import("./ChatPanel"));

interface ChatWidgetProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const ChatWidget = ({ isOpen, onOpen, onClose }: ChatWidgetProps) => (
  <>
    {!isOpen && (
      <button
        onClick={onOpen}
        aria-label="Open chat"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent hover:bg-cyan-hover text-accent-foreground rounded-full shadow-button flex items-center justify-center transition hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )}

    {/* Launcher already gives feedback; panel resolves in <100ms locally. */}
    <Suspense fallback={null}>{isOpen && <ChatPanel onClose={onClose} />}</Suspense>
  </>
);

export default ChatWidget;
