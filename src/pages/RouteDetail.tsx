import { lazy, Suspense, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  MapPin,
  MessageCircle,
  Mountain,
  Navigation,
  Route as RouteIcon,
  TrendingUp,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import DifficultyBadge from "@/components/routes/DifficultyBadge";
import { routeCover, routeDisplayPrice } from "@/components/routes/RouteCard";
import { useAuth } from "@/contexts/AuthContext";
import {
  usePreviewRoute,
  usePublishedRoute,
  useTourPrices,
} from "@/lib/queries/content";
import { formatDuration } from "@/lib/format";
import { publicImageUrl } from "@/lib/images";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

// Code-split: Leaflet's JS/CSS loads only when a route has coordinates.
const RouteLocationMap = lazy(() => import("@/components/maps/RouteLocationMap"));

const mapsDirectionsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

const NotFoundPanel = () => (
  <main id="main" className="flex-1 container mx-auto px-4 py-24 text-center">
    <h1 className="font-heading text-3xl md:text-4xl font-black text-foreground tracking-wider uppercase mb-4">
      Route not found
    </h1>
    <p className="text-muted-foreground mb-8">
      That route doesn't exist or isn't published yet.
    </p>
    <Link
      to="/routes"
      className="inline-flex items-center gap-2 bg-accent hover:bg-cyan-hover text-accent-foreground px-6 py-3 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition-all"
    >
      <ArrowLeft className="w-4 h-4" /> Browse all routes
    </Link>
  </main>
);

/** /routes/:slug — public detail page; ?preview=1 lets an admin view drafts. */
const RouteDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const { role } = useAuth();
  const isPreview = params.get("preview") === "1" && role === "admin";

  const published = usePublishedRoute(isPreview ? undefined : slug);
  const preview = usePreviewRoute(slug, isPreview);
  const { data: route, isLoading, error } = isPreview ? preview : published;

  const prices = useTourPrices();
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background flex flex-col">
        <PublicHeader />
        <main id="main" className="flex-1 container mx-auto px-4 py-10 space-y-6">
          <Skeleton className="w-full h-[40vh] rounded-xl" />
          <Skeleton className="w-2/3 h-10" />
          <Skeleton className="w-full h-32" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="min-h-dvh bg-background flex flex-col">
        <PublicHeader />
        <NotFoundPanel />
        <Footer />
      </div>
    );
  }

  const cover = routeCover(route);
  const tourPrice = prices.data?.[route.slug];
  const price = routeDisplayPrice(route, tourPrice);
  const gallery = route.images;
  const stats = [
    { icon: TrendingUp, label: "Difficulty", value: route.difficulty },
    {
      icon: Clock,
      label: "Duration",
      value: route.duration_hours != null ? formatDuration(route.duration_hours) : null,
    },
    {
      icon: RouteIcon,
      label: "Distance",
      value: route.distance_km != null ? `${route.distance_km} km` : null,
    },
    {
      icon: Mountain,
      label: "Elevation",
      value: route.elevation_m != null ? `${route.elevation_m} m gain` : null,
    },
  ].filter((s) => s.value != null);

  const whatsappHref = `https://wa.me/27671301536?text=${encodeURIComponent(
    `Hi! I'd like to enquire about the "${route.name}" route.`
  )}`;

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <PublicHeader />

      {isPreview && (
        <div className="bg-gold/15 border-b border-gold/30 text-gold text-center text-xs font-heading font-bold tracking-wider uppercase py-2 px-4 flex items-center justify-center gap-2">
          <Eye className="w-3.5 h-3.5" /> Draft preview — this route is not
          visible to the public ({route.status})
        </div>
      )}

      <main id="main" className="flex-1">
        {/* Hero */}
        <div className="relative h-[40vh] md:h-[52vh] overflow-hidden">
          <img
            src={cover.src}
            alt={cover.alt}
            width={cover.width ?? undefined}
            height={cover.height ?? undefined}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-6 md:pb-10">
            <Link
              to="/routes"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent text-sm mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> All routes
            </Link>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h1 className="font-heading text-3xl md:text-5xl font-black text-foreground tracking-wider uppercase max-w-3xl">
                {route.name}
              </h1>
              <DifficultyBadge difficulty={route.difficulty} />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Stat row */}
          <div className="flex flex-wrap gap-3 mb-8">
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="glass-card glow-border px-4 py-3 flex items-center gap-3"
              >
                <Icon className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <div className="text-muted-foreground text-[10px] tracking-widest uppercase">
                    {label}
                  </div>
                  <div className="font-heading text-sm font-bold text-foreground capitalize">
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr,340px] gap-8 lg:gap-12 items-start">
            <div className="min-w-0">
              {/* Highlights */}
              {route.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {route.highlights.map((h) => (
                    <span
                      key={h}
                      className="bg-secondary/60 border border-border/50 text-foreground text-xs px-3 py-1.5 rounded-full"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}

              {/* Description (preserve line breaks) */}
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed whitespace-pre-line mb-8">
                {route.description}
              </p>

              {route.meeting_point && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground mb-8">
                  <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  <span>
                    <span className="text-foreground font-heading font-bold tracking-wider uppercase text-xs block mb-0.5">
                      Meeting Point
                    </span>
                    {route.meeting_point}
                    {route.meeting_latitude != null && route.meeting_longitude != null && (
                      <a
                        href={mapsDirectionsUrl(route.meeting_latitude, route.meeting_longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-accent hover:text-cyan-soft font-heading font-bold text-xs tracking-wider uppercase transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Get directions
                      </a>
                    )}
                  </span>
                </div>
              )}

              {/* Location map — omitted entirely when no coordinates */}
              {route.latitude != null && route.longitude != null && (
                <div className="mb-8">
                  <h2 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase mb-3">
                    Location
                  </h2>
                  <Suspense fallback={<Skeleton className="w-full h-[320px] md:h-[360px] rounded-xl" />}>
                    <RouteLocationMap route={route} />
                  </Suspense>
                </div>
              )}

              {/* Gallery */}
              {gallery.length > 1 && (
                <div>
                  <h2 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase mb-3">
                    Gallery
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {gallery.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setLightbox(i)}
                        className="relative aspect-[4/3] overflow-hidden rounded-lg group"
                      >
                        <img
                          src={publicImageUrl(img.storage_path)}
                          alt={img.alt_text || route.name}
                          width={img.width ?? undefined}
                          height={img.height ?? undefined}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price / enquire card */}
            <aside className="glass-card glow-border p-6 lg:sticky lg:top-24">
              <div className="text-muted-foreground text-xs tracking-widest uppercase mb-1">
                {price ? "From" : "Pricing"}
              </div>
              <div className="font-heading text-3xl font-black text-accent mb-1">
                {price ?? "Contact us"}
              </div>
              {tourPrice?.price_group != null && (
                <div className="text-muted-foreground text-xs mb-4">
                  R {Number(tourPrice.price_group)} p.p. for groups
                </div>
              )}

              {tourPrice ? (
                <Link
                  to={`/booking?tour=${route.slug}`}
                  className="w-full inline-flex items-center justify-center bg-accent hover:bg-cyan-hover text-accent-foreground px-6 py-3.5 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition-all hover:scale-[1.02] mt-2"
                >
                  Enquire / Book
                </Link>
              ) : (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-cyan-hover text-accent-foreground px-6 py-3.5 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition-all hover:scale-[1.02] mt-2"
                >
                  <MessageCircle className="w-4 h-4" /> Enquire
                </a>
              )}
              <p className="text-muted-foreground text-xs mt-3 text-center">
                Weather dependent — safety first, always.
              </p>
            </aside>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      <Dialog open={lightbox !== null} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-4xl p-2 bg-background/95" aria-describedby={undefined}>
          <DialogTitle className="sr-only">{route.name} photo gallery</DialogTitle>
          {lightbox !== null && gallery[lightbox] && (
            <div className="relative">
              <img
                src={publicImageUrl(gallery[lightbox].storage_path)}
                alt={gallery[lightbox].alt_text || route.name}
                className="w-full max-h-[80vh] object-contain rounded-lg"
              />
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setLightbox((lightbox - 1 + gallery.length) % gallery.length)
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/70 text-foreground hover:text-accent transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setLightbox((lightbox + 1) % gallery.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/70 text-foreground hover:text-accent transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default RouteDetail;
