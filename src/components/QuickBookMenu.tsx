import { Link } from "react-router-dom";
import {
  X,
  Phone,
  Dumbbell,
  MapPin,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import logo from "@/assets/logo-small.webp";
import { routes, type Route } from "@/data/routes";

interface QuickBookMenuProps {
  onClose: () => void;
}

const WHATSAPP = "27671301536";
const waHref = (msg: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

const difficultyTone = (d: number) =>
  d <= 2 ? "bg-success/20 text-success" : d <= 3 ? "bg-gold/20 text-gold" : "bg-destructive/20 text-destructive";

const difficultyLabel = (d: number) =>
  d <= 2 ? "Beginner" : d <= 3 ? "Intermediate" : "Advanced";

const priceLabel = (route: Route) =>
  route.logistics.contactForPricing
    ? "Contact for pricing"
    : `From R${route.logistics.price} pp`;

/**
 * Quick-book menu — a plain, honest list of what you can book. Deliberately
 * NOT a chatbot: no simulated conversation, no greeting, no fitness
 * questionnaire gating the list. Every route is visible immediately and one
 * tap from the booking page. Route data is static (src/data/routes.ts), so the
 * panel works with no Supabase configuration at all.
 */
const QuickBookMenu = ({ onClose }: QuickBookMenuProps) => (
  <div
    role="dialog"
    aria-labelledby="quick-book-title"
    className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100dvh-4rem)] bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border glow-border animate-fade-in-up"
  >
    {/* Header — same shell as before, honest framing */}
    <div className="bg-primary px-4 py-3 flex items-center justify-between border-b border-border/30 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-accent/30 shrink-0">
          <img src={logo} alt="" className="w-full h-full object-cover" />
        </div>
        <div>
          <div
            id="quick-book-title"
            className="text-foreground font-heading font-bold text-sm tracking-wider uppercase"
          >
            Book Your Adventure
          </div>
          <div className="text-muted-foreground text-xs">
            Pick a route or programme to get started.
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="p-3 -m-3 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg shrink-0"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      <section aria-labelledby="quick-book-routes">
        <h3
          id="quick-book-routes"
          className="text-xs font-heading font-bold text-muted-foreground tracking-wider uppercase mb-2"
        >
          Guided routes
        </h3>
        <ul className="space-y-2">
          {routes.map((route) => (
            <li key={route.id}>
              <Link
                to={`/booking?tour=${route.id}`}
                onClick={onClose}
                className="block bg-secondary rounded-xl p-3 border-l-4 border-accent hover:bg-secondary/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase leading-tight">
                    {route.name}
                  </h4>
                  <ChevronRight
                    className="w-4 h-4 text-accent shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                </div>

                <p className="text-muted-foreground text-xs mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                  {route.location}
                </p>

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                    {route.specs.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                    {route.specs.elevation}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 mt-2">
                  <span
                    className={`inline-block ${difficultyTone(route.specs.difficulty)} text-xs px-2 py-0.5 rounded-full`}
                  >
                    {difficultyLabel(route.specs.difficulty)}
                  </span>
                  <span className="text-accent font-heading font-bold text-xs">
                    {priceLabel(route)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="quick-book-training">
        <h3
          id="quick-book-training"
          className="text-xs font-heading font-bold text-muted-foreground tracking-wider uppercase mb-2"
        >
          Personal training
        </h3>
        <Link
          to="/#fitness"
          onClick={onClose}
          className="flex items-center gap-3 bg-secondary rounded-xl p-3 border-l-4 border-gold hover:bg-secondary/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Dumbbell className="w-5 h-5 text-gold shrink-0" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block font-heading text-sm font-bold text-foreground tracking-wider uppercase">
              Training programmes
            </span>
            <span className="block text-muted-foreground text-xs">
              Strength, trail fitness and custom 4–12 week plans.
            </span>
          </span>
          <ChevronRight className="w-4 h-4 text-gold shrink-0 ml-auto" aria-hidden="true" />
        </Link>
      </section>
    </div>

    {/* Footer — direct line to Ernest */}
    <div className="p-4 border-t border-border/30 shrink-0">
      <a
        href={waHref("Hi Ernest! I'd like to ask about a SummitFit adventure.")}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full min-h-[44px] bg-accent hover:bg-cyan-hover text-accent-foreground text-xs font-heading font-bold py-3 rounded-lg transition-colors tracking-wider uppercase flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
        Ask Ernest on WhatsApp
      </a>
    </div>
  </div>
);

export default QuickBookMenu;
