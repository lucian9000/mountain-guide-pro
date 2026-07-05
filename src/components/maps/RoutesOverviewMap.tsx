import { useEffect } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { RouteWithImages } from "@/lib/types/content";
import type { TourPrice } from "@/lib/queries/content";
import { routeDisplayPrice } from "@/components/routes/RouteCard";
import DifficultyBadge from "@/components/routes/DifficultyBadge";
import {
  CAPE_TOWN,
  FALLBACK_ZOOM,
  TILE_ATTRIBUTION,
  TILE_MAX_ZOOM,
  TILE_URL,
  trailIcon,
} from "@/components/maps/mapSetup";

/** Fit the view to all markers (padded); fall back to Cape Town when none. */
const FitBounds = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) {
      map.setView(CAPE_TOWN, FALLBACK_ZOOM);
    } else if (points.length === 1) {
      map.setView(points[0], 12);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  }, [map, points]);
  return null;
};

/**
 * Overview map for /routes — one marker per published route with coordinates.
 * Code-split: import lazily; the card grid never depends on it.
 */
const RoutesOverviewMap = ({
  routes,
  prices,
}: {
  routes: RouteWithImages[];
  prices?: Record<string, TourPrice>;
}) => {
  const located = routes.filter(
    (r) => r.latitude != null && r.longitude != null
  );
  const points = located.map(
    (r) => [r.latitude!, r.longitude!] as [number, number]
  );

  return (
    <div className="relative z-0 h-[300px] md:h-[380px] rounded-xl overflow-hidden glow-border">
      <MapContainer
        center={CAPE_TOWN}
        zoom={FALLBACK_ZOOM}
        className="w-full h-full"
        scrollWheelZoom={false}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
        <FitBounds points={points} />
        {located.map((route) => (
          <Marker
            key={route.id}
            position={[route.latitude!, route.longitude!]}
            icon={trailIcon}
          >
            <Popup>
              <div className="space-y-2 max-w-[220px]">
                <div className="font-heading text-xs font-bold tracking-wider uppercase">
                  {route.name}
                </div>
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={route.difficulty} />
                  <span className="font-heading text-xs font-black text-accent whitespace-nowrap">
                    {routeDisplayPrice(route, prices?.[route.slug]) ?? "Contact us"}
                  </span>
                </div>
                <Link
                  to={`/routes/${route.slug}`}
                  className="inline-flex text-accent font-heading font-bold text-[11px] tracking-wider uppercase hover:underline"
                >
                  View route →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RoutesOverviewMap;
