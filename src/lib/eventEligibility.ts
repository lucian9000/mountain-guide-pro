import type { EventItem } from "@/lib/types/db";

/** Event dates are calendar dates in South Africa, independent of the viewer. */
export const eventTodayISO = (): string => {
  const parts = new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};

/** Keep today's events eligible, matching the existing date-only convention. */
export const isPublicUpcomingEvent = (
  event: Pick<EventItem, "is_published" | "event_date">
): boolean => event.is_published && event.event_date >= eventTodayISO();
