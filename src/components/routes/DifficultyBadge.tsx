import type { RouteDifficulty } from "@/lib/types/content";

const STYLES: Record<RouteDifficulty, string> = {
  easy: "bg-success/20 text-success border border-success/30",
  moderate: "bg-accent/20 text-accent border border-accent/30",
  challenging: "bg-gold/20 text-gold border border-gold/30",
  extreme: "bg-destructive/20 text-destructive border border-destructive/30",
};

/** Color-coded difficulty pill, styled like the homepage expedition badges. */
const DifficultyBadge = ({ difficulty }: { difficulty: RouteDifficulty }) => (
  <span
    className={`${STYLES[difficulty]} text-xs font-heading font-bold px-3 py-1 rounded-full tracking-wider uppercase whitespace-nowrap`}
  >
    {difficulty}
  </span>
);

export default DifficultyBadge;
