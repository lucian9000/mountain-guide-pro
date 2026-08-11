import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Phone,
  Dumbbell,
  Mountain,
  MapPin,
  Clock,
  TrendingUp,
  CloudSun,
  ChevronDown,
} from "lucide-react";
import logo from "@/assets/logo-small.webp";
import { routes, type Route } from "@/data/routes";
import { trainingProgrammes, type TrainingProgramme } from "@/data/training";
import { usePublicPricing } from "@/lib/queries/booking";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { Pricing } from "@/lib/types/db";
import { Skeleton } from "@/components/ui/skeleton";

interface QuickBookMenuProps {
  onClose: () => void;
}

const WHATSAPP = "27671301536";
const waHref = (msg: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

/** Existing colour coding, unchanged. */
const difficultyTone = (d: number) =>
  d <= 2
    ? "bg-success/20 text-success"
    : d <= 3
    ? "bg-gold/20 text-gold"
    : "bg-destructive/20 text-destructive";

const difficultyLabel = (d: number) =>
  d <= 2 ? "Beginner" : d <= 3 ? "Intermediate" : "Advanced";

/**
 * Match an item to its `pricing` row. `tour_slug` is an exact key and mirrors
 * the ids in routes.ts/training.ts, so it wins; the case-insensitive name
 * match is the fallback for rows that never got a slug.
 */
export const matchPricing = (
  item: { id: string; name: string },
  rows: Pricing[] | undefined
): Pricing | undefined => {
  if (!rows?.length) return undefined;
  return (
    rows.find((r) => r.tour_slug && r.tour_slug === item.id) ??
    rows.find((r) => r.name?.toLowerCase() === item.name.toLowerCase())
  );
};

/** A priced, currently-sellable tour can be booked online; everything else asks. */
const isBookable = (row: Pricing | undefined): row is Pricing =>
  Boolean(row && row.active);

const CardShell = ({
  accent,
  children,
}: {
  accent: "accent" | "gold";
  children: React.ReactNode;
}) => (
  <div
    className={`bg-background rounded-xl p-3 border-l-4 ${
      accent === "gold" ? "border-gold" : "border-accent"
    }`}
  >
    {children}
  </div>
);

const ActionButton = ({
  row,
  enquiryMessage,
  onBook,
}: {
  row: Pricing | undefined;
  enquiryMessage: string;
  onBook: (id: string) => void;
}) =>
  isBookable(row) ? (
    <button
      type="button"
      onClick={() => onBook(row.id)}
      className="mt-2 w-full min-h-[44px] bg-accent hover:bg-cyan-hover text-accent-foreground text-xs font-heading font-bold py-3 rounded-lg transition-colors tracking-wider uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      Book Now
    </button>
  ) : (
    <a
      href={waHref(enquiryMessage)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 w-full min-h-[44px] bg-accent hover:bg-cyan-hover text-accent-foreground text-xs font-heading font-bold py-3 rounded-lg transition-colors tracking-wider uppercase flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
      Enquire via WhatsApp
    </a>
  );

const RouteCard = ({
  route,
  row,
  onBook,
}: {
  route: Route;
  row: Pricing | undefined;
  onBook: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const detailId = `qb-detail-${route.id}`;

  return (
    <CardShell accent="accent">
      {/* The card itself expands the detail; the action button is separate. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={detailId}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase leading-tight">
            {route.name}
          </h4>
          <ChevronDown
            className={`w-4 h-4 text-accent shrink-0 mt-0.5 transition-transform ${open ? "rotate-180" : ""}`}
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
            {isBookable(row) ? `From R${row.price} pp` : "Contact for pricing"}
          </span>
        </div>
      </button>

      {open && (
        <div id={detailId} className="mt-2 pt-2 border-t border-border/40 space-y-1">
          <p className="text-xs text-muted-foreground">{route.specs.terrain}</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Gear:</span>{" "}
            {route.gear.mandatory.join(", ")}
          </p>
          <p className="text-xs text-muted-foreground italic flex items-start gap-2">
            <CloudSun className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
            {route.weather.policy}
          </p>
        </div>
      )}

      <ActionButton
        row={row}
        enquiryMessage={`Hi Ernest! I'd like to enquire about the ${route.name} route.`}
        onBook={onBook}
      />
    </CardShell>
  );
};

const ProgrammeCard = ({
  programme,
  row,
  onBook,
}: {
  programme: TrainingProgramme;
  row: Pricing | undefined;
  onBook: (id: string) => void;
}) => {
  const Icon = programme.icon;
  return (
    <CardShell accent="gold">
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-gold shrink-0 mt-0.5" aria-hidden="true" />
        <div className="min-w-0">
          <h4 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase leading-tight">
            {programme.title}
          </h4>
          <p className="text-muted-foreground text-xs mt-1">{programme.description}</p>
          {isBookable(row) && (
            <p className="text-accent font-heading font-bold text-xs mt-1">
              From R{row.price} pp
            </p>
          )}
        </div>
      </div>
      <ActionButton
        row={programme.contactForPricing ? undefined : row}
        enquiryMessage={`Hi Ernest! I'd like to enquire about ${programme.title}.`}
        onBook={onBook}
      />
    </CardShell>
  );
};

const CardSkeleton = () => (
  <div className="bg-background rounded-xl p-3 border-l-4 border-border space-y-2">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
    <Skeleton className="h-11 w-full" />
  </div>
);

/**
 * Quick-book menu — an honest list of what you can book, not a chatbot. Two
 * always-visible tabs swap between routes and training; nothing is gated
 * behind questions. Prices come from the shared `pricing` query; anything
 * unpriced (or the whole panel when Supabase isn't configured) falls back to
 * a WhatsApp enquiry.
 */
const QuickBookMenu = ({ onClose }: QuickBookMenuProps) => {
  const [tab, setTab] = useState<"routes" | "training">("routes");
  const navigate = useNavigate();
  const pricing = usePublicPricing();

  // Without Supabase there is nothing to price against — every card degrades
  // to "Enquire via WhatsApp" rather than showing a broken/blank price.
  const rows = isSupabaseConfigured ? pricing.data : undefined;
  const loading = isSupabaseConfigured && pricing.isLoading;

  const book = (pricingId: string) => {
    onClose();
    navigate(`/booking?tour=${pricingId}`);
  };

  const tabClass = (active: boolean) =>
    `flex-1 min-h-[44px] rounded-lg border-2 text-xs font-heading font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
      active
        ? "border-accent text-accent bg-accent/10"
        : "border-border text-muted-foreground hover:text-accent hover:border-accent"
    }`;

  return (
    <div
      role="dialog"
      aria-labelledby="quick-book-title"
      className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100dvh-4rem)] bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border glow-border animate-fade-in-up"
    >
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

      {/* Both tabs always visible — switching swaps the list, it is not a step. */}
      <div role="tablist" aria-label="What would you like to book?" className="flex gap-2 p-3 shrink-0">
        <button
          role="tab"
          aria-selected={tab === "routes"}
          aria-controls="qb-panel-routes"
          onClick={() => setTab("routes")}
          className={tabClass(tab === "routes")}
        >
          <Mountain className="w-4 h-4 shrink-0" aria-hidden="true" />
          Mountain Routes
        </button>
        <button
          role="tab"
          aria-selected={tab === "training"}
          aria-controls="qb-panel-training"
          onClick={() => setTab("training")}
          className={tabClass(tab === "training")}
        >
          <Dumbbell className="w-4 h-4 shrink-0" aria-hidden="true" />
          Personal Training
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : tab === "routes" ? (
          <div id="qb-panel-routes" role="tabpanel" className="space-y-2">
            {routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                row={route.logistics.contactForPricing ? undefined : matchPricing(route, rows)}
                onBook={book}
              />
            ))}
          </div>
        ) : (
          <div id="qb-panel-training" role="tabpanel" className="space-y-2">
            {trainingProgrammes.map((programme) => (
              <ProgrammeCard
                key={programme.id}
                programme={programme}
                row={matchPricing({ id: programme.id, name: programme.title }, rows)}
                onBook={book}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fallback, not a step — muted secondary text. */}
      <div className="px-4 py-3 border-t border-border/30 shrink-0 text-center">
        <span className="text-muted-foreground text-xs">
          Prefer to chat?{" "}
          <a
            href={waHref("Hi Ernest! I'd like to ask about a SummitFit adventure.")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-cyan-hover underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            WhatsApp Ernest
          </a>
        </span>
      </div>
    </div>
  );
};

export default QuickBookMenu;
