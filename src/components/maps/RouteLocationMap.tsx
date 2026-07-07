import { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Navigation } from "lucide-react";
import type { RouteRow } from "@/lib/types/content";
import {
  CAPE_TOWN,
  directionsUrl,
  meetingIcon,
  TILE_ATTRIBUTION,
  TILE_MAX_ZOOM,
  TILE_URL,
  trailIcon,
} from "@/components/maps/mapSetup";

/** Flips interaction handlers once the visitor taps the overlay. */
const InteractionGate = ({ active }: { active: boolean }) => {
  const map = useMap();
  if (active) {
    map.dragging.enable();
    map.touchZoom.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
  }
  return null;
};

/**
 * "Location" map on /routes/:slug. Interactions start disabled (no scroll
 * hijack on mobile or desktop) behind a tap-to-interact overlay.
 * Rendered only when the route has trail coordinates — the caller omits the
 * whole section otherwise. Code-split: import lazily.
 */
const RouteLocationMap = ({ route }: { route: RouteRow }) => {
  const [interactive, setInteractive] = useState(false);

  const trail: [number, number] =
    route.latitude != null && route.longitude != null
      ? [route.latitude, route.longitude]
      : CAPE_TOWN;
  const meeting: [number, number] | null =
    route.meeting_latitude != null && route.meeting_longitude != null
      ? [route.meeting_latitude, route.meeting_longitude]
      : null;

  return (
    <div className="relative z-0 h-[320px] md:h-[360px] rounded-xl overflow-hidden glow-border">
      <MapContainer
        center={trail}
        zoom={route.map_zoom}
        className="w-full h-full"
        dragging={false}
        touchZoom={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
      >
        <InteractionGate active={interactive} />
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />

        <Marker position={trail} icon={trailIcon}>
          <Popup>
            <span className="font-heading text-xs font-bold tracking-wider uppercase">
              {route.name}
            </span>
          </Popup>
        </Marker>

        {meeting && (
          <Marker position={meeting} icon={meetingIcon}>
            <Popup>
              <div className="space-y-2 max-w-[220px]">
                <div className="font-heading text-xs font-bold tracking-wider uppercase">
                  Meeting point
                </div>
                {route.meeting_point && (
                  <p className="text-xs text-muted-foreground">{route.meeting_point}</p>
                )}
                <a
                  href={directionsUrl(meeting[0], meeting[1])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded-md font-heading font-bold text-xs tracking-wider uppercase"
                >
                  <Navigation className="w-3 h-3" /> Get directions
                </a>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {!interactive && (
        <button
          type="button"
          onClick={() => setInteractive(true)}
          className="absolute inset-0 z-[500] flex items-end justify-center pb-4 bg-transparent"
          aria-label="Enable map interaction"
        >
          <span className="bg-background/90 backdrop-blur-sm border border-border/60 text-muted-foreground text-xs font-heading font-bold tracking-wider uppercase px-4 py-2 rounded-full shadow-lg">
            Tap to explore map
          </span>
        </button>
      )}
    </div>
  );
};

export default RouteLocationMap;
