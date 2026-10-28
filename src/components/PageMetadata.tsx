import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePublishedRoute } from "@/lib/queries/content";
import { usePublicEvent } from "@/lib/queries/events";
import { publicImageUrl } from "@/lib/images";
import { routeFallbackImage } from "@/components/routes/routeImageFallbacks";

const ORIGIN = "https://summitfitadventures.com";
const BRAND = "SummitFit Adventures";
const DEFAULT_IMAGE = `${ORIGIN}/logo.jpeg`;
const DEFAULT_DESCRIPTION = "Professional mountain guiding in the Western Cape & beyond. Book your Cape Town hiking adventure with Ernest Carrick.";
const pages: Record<string, [string, string]> = {
  "/": ["Professional Mountain Guiding", DEFAULT_DESCRIPTION],
  "/routes": ["Guided Hiking Routes", "Explore guided summits, scrambles and traverses across Cape Town and the Western Cape. Find your route with SummitFit Adventures."],
  "/news": ["What's New", "Trail updates, announcements and the latest adventures from SummitFit. Follow Ernest's guided hikes across the Western Cape."],
  "/privacy": ["Privacy Policy", "How SummitFit Adventures handles account information, bookings and Google sign-in data."],
  "/booking": ["Book an Adventure", "Choose a guided hike or group event and request your next adventure with SummitFit."],
  "/booking/confirmed": ["Booking Request", "Your SummitFit booking request and next steps."],
  "/login": ["Sign In", "Sign in to book a guided adventure or manage your SummitFit account."],
  "/reset-password": ["Reset Password", "Reset your SummitFit account password securely."],
  "/auth/callback": ["Completing Sign-in", "Completing your secure SummitFit sign-in."],
};

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function metadataImageUrl(source: string) {
  try {
    const url = new URL(source, ORIGIN);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : DEFAULT_IMAGE;
  } catch {
    return DEFAULT_IMAGE;
  }
}

/** Browser metadata; /e/:id continues to supply server-rendered event previews. */
export default function PageMetadata() {
  const { pathname, search } = useLocation();
  const path = pathname.replace(/\/$/, "") || "/";
  const routeSlug = path.match(/^\/routes\/([^/]+)$/)?.[1];
  const eventId = path.match(/^\/events\/([^/]+)$/)?.[1] ?? null;
  const route = usePublishedRoute(routeSlug);
  const event = usePublicEvent(eventId);
  const [pageTitle, pageDescription] = pages[path] ?? [
    routeSlug ? "Hiking Route" : eventId ? "Guided Group Event" : path.startsWith("/admin") ? "Administration" : path.startsWith("/dashboard") ? "Your Account" : "Page Not Found",
    DEFAULT_DESCRIPTION,
  ];
  // React Query retains data after a failed refetch. Match unavailable detail
  // states instead of continuing to advertise that cached content.
  const routeContent = routeSlug && !route.isLoading && !route.error ? route.data : null;
  const eventContent = eventId && !event.isLoading && !event.error ? event.data : null;
  const content = routeContent ?? eventContent;
  const loading = routeSlug ? route.isLoading : eventId ? event.isLoading : false;
  const unavailable = Boolean(routeSlug || eventId) && !content;
  const stateTitle = unavailable
    ? loading ? routeSlug ? "Loading route" : "Loading event" : routeSlug ? "Route not found" : "Event not found"
    : pageTitle;
  const name = content && ("name" in content ? content.name : content.title);
  const title = `${name || stateTitle} | ${BRAND}`;
  const description = (content?.description || pageDescription).replace(/\s+/g, " ").trim().slice(0, 160);
  const cover = routeContent?.images?.find(image => image.is_cover) ?? routeContent?.images?.[0];
  const sourceImage = cover ? publicImageUrl(cover.storage_path) : routeSlug && routeContent ? routeFallbackImage(routeSlug) : eventContent?.image_url || DEFAULT_IMAGE;
  const image = metadataImageUrl(sourceImage);
  const canonical = `${ORIGIN}${path === "/" ? "/" : path}`;
  const privatePage = !["/", "/routes", "/news", "/privacy"].includes(path) && !routeSlug && !eventId;
  const noindex = privatePage || unavailable || new URLSearchParams(search).get("preview") === "1";

  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", image);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [title, description, image, canonical, noindex]);
  return null;
}
