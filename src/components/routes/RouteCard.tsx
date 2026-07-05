import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import type { RouteWithImages } from "@/lib/types/content";
import type { TourPrice } from "@/lib/queries/content";
import { formatDuration, formatRands } from "@/lib/format";
import { publicImageUrl } from "@/lib/images";
import { routeFallbackImage } from "@/components/routes/routeImageFallbacks";
import DifficultyBadge from "@/components/routes/DifficultyBadge";

/** Booking price (existing pricing table) wins; falls back to route.price_cents. */
export const routeDisplayPrice = (
  route: RouteWithImages,
  tourPrice?: TourPrice
): string | null => {
  if (tourPrice) return formatRands(Math.round(Number(tourPrice.price) * 100));
  if (route.price_cents > 0) return formatRands(route.price_cents);
  return null; // contact for pricing
};

export const routeCover = (route: RouteWithImages) => {
  const img = route.images.find((i) => i.is_cover) ?? route.images[0];
  return img
    ? { src: publicImageUrl(img.storage_path), alt: img.alt_text || route.name, width: img.width, height: img.height }
    : { src: routeFallbackImage(route.slug), alt: route.name, width: null, height: null };
};

const RouteCard = ({
  route,
  tourPrice,
}: {
  route: RouteWithImages;
  tourPrice?: TourPrice;
}) => {
  const cover = routeCover(route);
  const price = routeDisplayPrice(route, tourPrice);

  return (
    <Link
      to={`/routes/${route.slug}`}
      className="glass-card glow-border glow-border-hover overflow-hidden transition-all duration-500 hover:-translate-y-2 group flex flex-col"
    >
      <div className="relative h-56 overflow-hidden shrink-0">
        <img
          src={cover.src}
          alt={cover.alt}
          width={cover.width ?? undefined}
          height={cover.height ?? undefined}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <span className="absolute top-3 right-3">
          <DifficultyBadge difficulty={route.difficulty} />
        </span>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-heading text-lg font-bold text-foreground mb-2 tracking-wider uppercase">
          {route.name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm mb-3">
          {route.duration_hours != null && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-accent" /> {formatDuration(route.duration_hours)}
            </span>
          )}
          {route.meeting_point && (
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="w-4 h-4 text-gold shrink-0" />
              <span className="truncate max-w-[14rem]">{route.meeting_point}</span>
            </span>
          )}
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between gap-3">
          <span className="font-heading text-xl font-black text-accent whitespace-nowrap">
            {price ?? "Contact us"}
          </span>
          <span className="text-accent group-hover:text-[hsl(193,100%,70%)] font-heading font-bold text-sm transition-colors tracking-wider uppercase whitespace-nowrap">
            View Route →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RouteCard;
