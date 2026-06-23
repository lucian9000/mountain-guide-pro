import { useState } from "react";
import { MessageCircle, X, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { findRoutes, type Route } from "@/data/routes";

interface ChatWidgetProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

type Stage =
  | "initial"
  | "routes-level"
  | "routes-results"
  | "training"
  | "corporate";

interface Message {
  type: "bot" | "user";
  text: string;
  routes?: Route[];
}

const difficultyColor = (d: number) =>
  d <= 2
    ? "bg-[hsl(var(--success))]"
    : d <= 3
    ? "bg-gold"
    : "bg-destructive";

const difficultyLabel = (d: number) =>
  d <= 2 ? "Beginner" : d <= 3 ? "Intermediate" : "Advanced";

const WHATSAPP = "27671301536";
const wa = (msg: string) =>
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");

const WELCOME: Message = {
  type: "bot",
  text: "Hi! I'm Ernest's virtual guide. What brings you here today?",
};

const ChatWidget = ({ isOpen, onOpen, onClose }: ChatWidgetProps) => {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [stage, setStage] = useState<Stage>("initial");

  const push = (...msgs: Message[]) =>
    setMessages((prev) => [...prev, ...msgs]);

  /* ── Path: Mountain Routes ── */
  const chooseRoutes = () => {
    push(
      { type: "user", text: "Mountain Routes" },
      { type: "bot", text: "Great choice! What's your current fitness level? Be honest — it keeps you safe on the mountain 😄" }
    );
    setStage("routes-level");
  };

  const selectLevel = (level: number, label: string) => {
    const recommendations = findRoutes(level);
    push(
      { type: "user", text: label },
      {
        type: "bot",
        text:
          recommendations.length > 0
            ? `Perfect. Based on your fitness level, here ${recommendations.length === 1 ? "is" : "are"} the best ${recommendations.length === 1 ? "route" : "routes"} for you:`
            : "That level doesn't match our current routes — drop us a WhatsApp and we'll build something custom!",
        routes: recommendations,
      }
    );
    setStage("routes-results");
  };

  const bookRoute = (route: Route) =>
    wa(`Hi Ernest, I'm interested in booking the ${route.name}.`);

  /* ── Path: Personal Training ── */
  const chooseTraining = () => {
    push(
      { type: "user", text: "Personal Training" },
      {
        type: "bot",
        text:
          "We offer three training formats:\n\n💪 Strength Training — personalised programs for all levels\n🏔 Trail Fitness — hybrid gym + outdoor sessions for uphill power\n📋 Custom Programs — 4–12 week plans built around your goals\n\nReady to get started? Chat to Ernest directly on WhatsApp.",
      }
    );
    setStage("training");
  };

  /* ── Path: Corporate Events ── */
  const chooseCorporate = () => {
    push(
      { type: "user", text: "Corporate / Team Events" },
      {
        type: "bot",
        text:
          "We run bespoke team-building experiences that combine mountain guiding with fitness challenges — perfect for energising your team.\n\n✅ Half-day or full-day formats\n✅ All fitness levels catered for\n✅ Safety-briefed & CATHSSETA accredited guide\n✅ Custom route & challenge design\n\nTell Ernest your team size and preferred date on WhatsApp and he'll put together a quote.",
      }
    );
    setStage("corporate");
  };

  const reset = () => {
    setMessages([WELCOME]);
    setStage("initial");
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent hover:bg-[hsl(193,100%,42%)] text-accent-foreground rounded-full shadow-button flex items-center justify-center transition-all hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-4rem)] bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border glow-border animate-fade-in-up">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-accent/30">
                <img src={logo} alt="SummitFit" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-foreground font-heading font-bold text-sm tracking-wider uppercase">
                  Adventure Bot
                </div>
                <div className="text-muted-foreground text-xs">Powered by Ernest</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-line ${
                      msg.type === "user"
                        ? "bg-accent text-accent-foreground rounded-br-sm"
                        : "bg-secondary text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                {msg.routes?.map((route) => (
                  <div
                    key={route.id}
                    className="mt-2 bg-secondary rounded-xl p-3 border-l-4 border-accent"
                  >
                    <h4 className="font-heading text-sm font-bold text-foreground mb-1 tracking-wider uppercase">
                      {route.name}
                    </h4>
                    <p className="text-muted-foreground text-xs mb-1">📍 {route.location}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground mb-1">
                      <span>⏱ {route.specs.duration}</span>
                      <span>⛰ {route.specs.elevation}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{route.specs.terrain}</p>
                    <span
                      className={`inline-block ${difficultyColor(route.specs.difficulty)} text-accent-foreground text-xs px-2 py-0.5 rounded-full mb-2`}
                    >
                      {difficultyLabel(route.specs.difficulty)}
                    </span>
                    <div className="text-xs text-muted-foreground mb-1">
                      <span className="font-semibold text-foreground">Gear:</span>{" "}
                      {route.gear.mandatory.join(", ")}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1 italic">
                      ⛅ {route.weather.policy}
                    </div>
                    <div className="text-accent font-heading font-bold text-sm mb-2">
                      R{route.logistics.price} (Private) / R{route.logistics.priceGroup} (Group)
                    </div>
                    <button
                      onClick={() => bookRoute(route)}
                      className="w-full bg-accent hover:bg-[hsl(193,100%,42%)] text-accent-foreground text-xs font-heading font-bold py-2 rounded-lg transition-colors tracking-wider uppercase"
                    >
                      📱 Book via WhatsApp
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-border/30">
            {stage === "initial" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium mb-2">
                  What are you looking for?
                </p>
                {[
                  { label: "🏔 Mountain Routes", action: chooseRoutes, color: "border-accent text-accent" },
                  { label: "💪 Personal Training", action: chooseTraining, color: "border-gold text-gold" },
                  { label: "🏢 Corporate / Team Events", action: chooseCorporate, color: "border-[hsl(var(--success))] text-[hsl(var(--success))]" },
                ].map(({ label, action, color }) => (
                  <button
                    key={label}
                    onClick={action}
                    className={`w-full border-2 ${color} py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {stage === "routes-level" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium mb-2">
                  Select your fitness level:
                </p>
                {[
                  { level: 1, label: "1 — Just Starting Out", color: "border-[hsl(var(--success))] text-[hsl(var(--success))]" },
                  { level: 2, label: "2 — Casual Hiker", color: "border-[hsl(var(--success))] text-[hsl(var(--success))]" },
                  { level: 3, label: "3 — Intermediate (Active)", color: "border-gold text-gold" },
                  { level: 4, label: "4 — Fit & Experienced", color: "border-destructive text-destructive" },
                  { level: 5, label: "5 — Advanced Athlete", color: "border-destructive text-destructive" },
                ].map(({ level, label, color }) => (
                  <button
                    key={level}
                    onClick={() => selectLevel(level, label)}
                    className={`w-full border-2 ${color} py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {stage === "training" && (
              <div className="space-y-2">
                <button
                  onClick={() => wa("Hi Ernest, I'm interested in your Personal Training programs. Can you tell me more?")}
                  className="w-full bg-gold hover:opacity-90 text-background text-xs font-heading font-bold py-2 rounded-lg transition-opacity tracking-wider uppercase"
                >
                  📱 Chat to Ernest on WhatsApp
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs transition-colors mx-auto"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to menu
                </button>
              </div>
            )}

            {stage === "corporate" && (
              <div className="space-y-2">
                <button
                  onClick={() => wa("Hi Ernest, I'm interested in a Corporate / Team Event. Can you send me more details?")}
                  className="w-full bg-[hsl(var(--success))] hover:opacity-90 text-background text-xs font-heading font-bold py-2 rounded-lg transition-opacity tracking-wider uppercase"
                >
                  📱 Get a Corporate Quote
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs transition-colors mx-auto"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to menu
                </button>
              </div>
            )}

            {stage === "routes-results" && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    push(
                      { type: "user", text: "Show me more options" },
                      { type: "bot", text: "No problem! Let's find a better fit — pick a different level." }
                    );
                    setStage("routes-level");
                  }}
                  className="w-full border border-accent/40 text-accent text-xs font-medium py-2 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  Different difficulty →
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs transition-colors mx-auto"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to menu
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
