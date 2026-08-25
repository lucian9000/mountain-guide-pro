/**
 * Social sharing helpers for group events (additive — nothing existing depends
 * on these).
 *
 * Why it works the way it does:
 *  - Facebook has a public share dialog (`sharer.php?u=`) that needs no app,
 *    no token and no review. One click, done.
 *  - Instagram has NO web-post API for personal accounts, so a "post to
 *    Instagram" button is impossible without a Meta Business app + reviewed
 *    Graph API access. The simple, reliable path is: copy the caption, grab
 *    the image, paste in the Instagram app. On a phone, `navigator.share`
 *    hands both to Instagram natively.
 */
import type { EventItem } from "@/lib/types/db";
import { formatEventDate, formatEventTime } from "@/components/admin/eventFormat";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "");

const siteOrigin = (): string =>
  SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");

/**
 * Public link for one event.
 *
 * `/e/<id>` is the share endpoint: social crawlers get that event's own image
 * and title as Open Graph tags (see `api/e/[id].js`), and real visitors are
 * forwarded to the event page at `/events/<id>`.
 */
export const eventShareUrl = (event: Pick<EventItem, "id">): string =>
  `${siteOrigin()}/e/${event.id}`;

/** The page a shared link lands on — used when we link internally. */
export const eventPageUrl = (event: Pick<EventItem, "id">): string =>
  `${siteOrigin()}/events/${event.id}`;

const rand = (n: number) => n.toFixed(0);

/** Ready-to-paste caption for Facebook / Instagram. */
export const buildEventCaption = (event: EventItem): string => {
  const when = formatEventDate(event.event_date);
  const time = formatEventTime(event.start_time);
  const lines = [
    `⛰️ ${event.title}`,
    "",
    event.description?.trim() || "",
    "",
    `📅 ${when}${time ? ` · ${time}` : ""}`,
    event.location?.trim() ? `📍 ${event.location.trim()}` : "",
    `👥 ${event.capacity} spots`,
    Number(event.price_per_person) > 0
      ? `💰 R${rand(Number(event.price_per_person))} per person`
      : "💰 Free",
    "",
    `Book your spot: ${eventShareUrl(event)}`,
    "",
    "#SummitFitAdventures #Hiking #Mountains #CapeTown #Adventure #Outdoors",
  ];
  return lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n").trim();
};

/** Facebook's public share dialog — no app or token required. */
export const facebookShareUrl = (event: EventItem): string =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventShareUrl(event))}`;

/** Copy text to the clipboard, with a textarea fallback for older browsers. */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
};

/** True when the device can share natively (phones — lets you pick Instagram). */
export const canNativeShare = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";

/** Native share sheet (mobile): caption + link, so Instagram appears as a target. */
export const nativeShareEvent = async (event: EventItem): Promise<boolean> => {
  if (!canNativeShare()) return false;
  try {
    await navigator.share({
      title: event.title,
      text: buildEventCaption(event),
      url: eventShareUrl(event),
    });
    return true;
  } catch {
    return false;
  }
};
