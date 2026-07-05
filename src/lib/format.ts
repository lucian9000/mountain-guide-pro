import { formatDistanceToNow } from "date-fns";

/** Cents → "R 850" / "R 1 200" (space-grouped thousands, no decimals). */
export const formatRands = (cents: number): string => {
  const rands = Math.round(cents / 100);
  const grouped = String(Math.abs(rands)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `R ${rands < 0 ? "-" : ""}${grouped}`;
};

/** "2 days ago" style relative timestamp. */
export const relativeDate = (iso: string): string =>
  formatDistanceToNow(new Date(iso), { addSuffix: true });

/** duration_hours → "≈ 4 hrs" / "≈ 1 hr" (numeric column, single value). */
export const formatDuration = (hours: number): string =>
  `≈ ${hours % 1 === 0 ? hours : hours.toFixed(1)} ${hours === 1 ? "hr" : "hrs"}`;

/** "My New Route!" → "my-new-route" (matches routes_slug_format check). */
export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
