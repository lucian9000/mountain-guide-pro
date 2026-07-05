import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./maps.css";

/**
 * Shared Leaflet config for the free map stack:
 *  - OpenTopoMap tiles (terrain/contours), no key, CC-BY-SA
 *  - custom divIcon markers (also sidesteps Leaflet's notorious broken
 *    default-icon URLs under bundlers — we never reference those assets)
 */

export const TILE_URL = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";

/** Required attribution, verbatim, on every map. */
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors, SRTM | &copy; <a href="https://opentopomap.org" target="_blank" rel="noreferrer">OpenTopoMap</a> (CC-BY-SA)';

export const TILE_MAX_ZOOM = 17;

/** Fallback view when no coordinates exist: Cape Town. */
export const CAPE_TOWN: [number, number] = [-33.96, 18.46];
export const FALLBACK_ZOOM = 10;

/** Trail location — accent (cyan) dot, site design language. */
export const trailIcon = L.divIcon({
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
  html: '<span class="block w-5 h-5 rounded-full bg-accent border-2 border-background shadow-[0_0_0_6px_hsl(var(--accent)/0.25)]"></span>',
});

/** Meeting point — gold diamond, visually distinct from the trail dot. */
export const meetingIcon = L.divIcon({
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
  html: '<span class="block w-[18px] h-[18px] rotate-45 rounded-[4px] bg-gold border-2 border-background shadow-[0_0_0_6px_hsl(var(--gold)/0.25)]"></span>',
});

/** Free turn-by-turn: deep link into the visitor's own maps app. No key. */
export const directionsUrl = (lat: number, lng: number): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
