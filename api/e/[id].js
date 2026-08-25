/**
 * Share endpoint for a single event: `/e/<event-id>`.
 *
 * Facebook, WhatsApp, LinkedIn and friends do NOT run JavaScript, so a
 * client-rendered SPA can never give them a per-event preview. This function
 * answers those crawlers with a tiny HTML document carrying the event's own
 * Open Graph tags (its image, title and description), and sends real people
 * straight on to the event page.
 *
 * Reads the event with the public anon key — RLS already limits anonymous
 * reads to published, not-yet-past events, so nothing private can leak here.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const CRAWLER =
  /facebookexternalhit|facebookcatalog|facebot|instagram|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterest|redditbot|skypeuripreview|embedly|quora link preview|bitlybot|vkshare|googlebot|bingbot|applebot|opengraph/i;

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const originOf = (req) => {
  const site = process.env.VITE_SITE_URL;
  if (site) return site.replace(/\/$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
};

const fetchEvent = async (id) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const params = new URLSearchParams({
    id: `eq.${id}`,
    is_published: "eq.true",
    select: "id,title,description,location,event_date,start_time,price_per_person,image_url",
    limit: "1",
  });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events?${params}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
};

const describe = (event) => {
  if (event.description && event.description.trim()) {
    const text = event.description.trim().replace(/\s+/g, " ");
    return text.length > 200 ? `${text.slice(0, 197)}…` : text;
  }
  const bits = [];
  if (event.event_date) bits.push(event.event_date);
  if (event.location) bits.push(event.location);
  const price = Number(event.price_per_person);
  bits.push(price > 0 ? `R${price.toFixed(0)} per person` : "Free");
  return `${bits.join(" · ")} — book your spot with SummitFit Adventures.`;
};

export default async function handler(req, res) {
  const id = String(req.query.id || "");
  const origin = originOf(req);
  const target = id ? `${origin}/events/${encodeURIComponent(id)}` : `${origin}/#upcoming`;

  const isCrawler = CRAWLER.test(req.headers["user-agent"] || "");

  // Real visitors never need the preview document — send them to the page.
  if (!isCrawler) {
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
    res.writeHead(302, { Location: target });
    res.end();
    return;
  }

  let event = null;
  try {
    if (id) event = await fetchEvent(id);
  } catch {
    event = null;
  }

  const title = event ? `${event.title} — SummitFit Adventures` : "SummitFit Adventures";
  const description = event
    ? describe(event)
    : "Professional mountain guiding in the Western Cape & beyond.";
  const image =
    event && event.image_url
      ? event.image_url.startsWith("http")
        ? event.image_url
        : `${origin}${event.image_url}`
      : `${origin}/logo.jpeg`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Crawlers re-scrape often; a short edge cache keeps the preview fresh when
  // the admin swaps the event image.
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
  res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(target)}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="SummitFit Adventures" />
    <meta property="og:url" content="${escapeHtml(target)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:alt" content="${escapeHtml(event ? event.title : "SummitFit Adventures")}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />

    <meta http-equiv="refresh" content="0; url=${escapeHtml(target)}" />
  </head>
  <body>
    <p><a href="${escapeHtml(target)}">${escapeHtml(title)}</a></p>
  </body>
</html>`);
}
