/** Display helpers for events (Phase 6). */

/** "2026-08-14" → "Fri, 14 Aug 2026" (falls back to the raw value). */
export const formatEventDate = (iso: string): string => {
  if (!iso) return "Date to be set";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/** "07:30:00" → "07:30". */
export const formatEventTime = (t: string | null): string | null =>
  t ? t.slice(0, 5) : null;
