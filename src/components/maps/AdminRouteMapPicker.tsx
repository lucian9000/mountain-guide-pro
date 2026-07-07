import { useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { Crosshair, Loader2, MapPin, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  CAPE_TOWN,
  meetingIcon,
  TILE_ATTRIBUTION,
  TILE_MAX_ZOOM,
  TILE_URL,
  trailIcon,
} from "@/components/maps/mapSetup";

export interface RouteCoords {
  latitude: number | null;
  longitude: number | null;
  map_zoom: number;
  meeting_latitude: number | null;
  meeting_longitude: number | null;
}

interface AdminRouteMapPickerProps {
  routeName: string;
  value: RouteCoords;
  onChange: (patch: Partial<RouteCoords>) => void;
}

/**
 * Admin-only Nominatim geocode (OpenStreetMap). One request per click,
 * limit=1, identifying User-Agent (browsers that disallow overriding it still
 * send our Origin/Referer, which satisfies the usage policy). NEVER call this
 * from public pages.
 */
const geocode = async (query: string) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "SummitFitAdventures/3.0 (admin content editor; info@summitfitadventures.com)",
      },
    }
  );
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const results = (await res.json()) as { lat: string; lon: string }[];
  return results[0] ? { lat: Number(results[0].lat), lng: Number(results[0].lon) } : null;
};

/** Persist the map's final zoom to map_zoom as the admin zooms. */
const ZoomWatcher = ({ onZoom }: { onZoom: (z: number) => void }) => {
  useMapEvents({ zoomend: (e) => onZoom(e.target.getZoom()) });
  return null;
};

/**
 * Map picker for the route editor: draggable Trail + Meeting markers,
 * "Find on map" Nominatim suggestion (admin must confirm by inspecting or
 * dragging — nothing is saved until the form is saved). Code-split: lazy.
 */
const AdminRouteMapPicker = ({ routeName, value, onChange }: AdminRouteMapPickerProps) => {
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);
  const [searching, setSearching] = useState(false);
  const [suggested, setSuggested] = useState(false);

  const trail: [number, number] | null =
    value.latitude != null && value.longitude != null
      ? [value.latitude, value.longitude]
      : null;
  const meeting: [number, number] | null =
    value.meeting_latitude != null && value.meeting_longitude != null
      ? [value.meeting_latitude, value.meeting_longitude]
      : null;

  const findOnMap = async () => {
    if (!routeName.trim()) {
      toast({ title: "Enter a route name first", variant: "destructive" });
      return;
    }
    setSearching(true);
    try {
      const hit = await geocode(`${routeName.trim()}, Cape Town, South Africa`);
      if (!hit) {
        toast({
          title: "No match found",
          description: "Place the pin manually — drop it at the map centre and drag.",
        });
        return;
      }
      onChange({ latitude: hit.lat, longitude: hit.lng });
      setSuggested(true);
      mapRef.current?.flyTo([hit.lat, hit.lng], Math.max(value.map_zoom, 13));
    } catch (e) {
      toast({
        title: "Geocoding failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const centerOfMap = (): [number, number] => {
    const c = mapRef.current?.getCenter();
    return c ? [c.lat, c.lng] : CAPE_TOWN;
  };

  const handleZoom = (z: number) => {
    if (z !== value.map_zoom) onChange({ map_zoom: z });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={searching}
          onClick={() => void findOnMap()}
          className="inline-flex items-center gap-2 border border-accent/50 text-accent hover:bg-accent/10 px-3 py-1.5 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors disabled:opacity-60"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Find on map
        </button>

        {!trail ? (
          <button
            type="button"
            onClick={() => {
              const [lat, lng] = centerOfMap();
              onChange({ latitude: lat, longitude: lng });
              setSuggested(false);
            }}
            className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-accent px-3 py-1.5 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors"
          >
            <Crosshair className="w-4 h-4" /> Place trail pin
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              onChange({ latitude: null, longitude: null });
              setSuggested(false);
            }}
            className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-destructive px-3 py-1.5 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors"
          >
            <X className="w-4 h-4" /> Clear trail pin
          </button>
        )}

        {!meeting ? (
          <button
            type="button"
            onClick={() => {
              const [lat, lng] = centerOfMap();
              onChange({ meeting_latitude: lat, meeting_longitude: lng });
            }}
            className="inline-flex items-center gap-2 border border-gold/50 text-gold hover:bg-gold/10 px-3 py-1.5 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors"
          >
            <MapPin className="w-4 h-4" /> Add meeting pin
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onChange({ meeting_latitude: null, meeting_longitude: null })}
            className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-destructive px-3 py-1.5 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors"
          >
            <X className="w-4 h-4" /> Clear meeting pin
          </button>
        )}

        <span className="text-muted-foreground text-xs ml-auto">
          Zoom saves as the public map's default ({value.map_zoom})
        </span>
      </div>

      {suggested && (
        <p className="text-gold text-xs">
          Suggested location — drag the pin to the exact spot.
        </p>
      )}

      <div className="relative z-0 h-[320px] rounded-xl overflow-hidden glow-border">
        <MapContainer
          center={trail ?? CAPE_TOWN}
          zoom={value.map_zoom}
          className="w-full h-full"
          ref={mapRef}
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
          <ZoomWatcher onZoom={handleZoom} />
          {trail && (
            <Marker
              position={trail}
              icon={trailIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const p = (e.target as L.Marker).getLatLng();
                  onChange({ latitude: p.lat, longitude: p.lng });
                  setSuggested(false);
                },
              }}
            >
              <Popup>Trail location</Popup>
            </Marker>
          )}
          {meeting && (
            <Marker
              position={meeting}
              icon={meetingIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const p = (e.target as L.Marker).getLatLng();
                  onChange({ meeting_latitude: p.lat, meeting_longitude: p.lng });
                },
              }}
            >
              <Popup>Meeting point</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <p className="text-muted-foreground text-xs">
        Drag pins to position them. Coordinates save with the form. Cyan dot =
        trail, gold diamond = meeting point.
      </p>
    </div>
  );
};

export default AdminRouteMapPicker;
