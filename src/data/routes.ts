export interface Route {
  id: string;
  name: string;
  location: string;
  specs: {
    distance: string;
    duration: string;
    elevation: string;
    difficulty: number;
    fitness: string;
    terrain: string;
  };
  logistics: {
    meetingPoint: string;
    startTime: string;
    ratio: string;
    price: number;
    priceGroup: number;
    included: string[];
    excluded: string[];
  };
  gear: {
    mandatory: string[];
    recommended: string[];
    provided: string[];
  };
  weather: {
    policy: string;
  };
}

export const routes: Route[] = [
  {
    id: "lions-head",
    name: "Lion's Head Sunrise Summit",
    location: "Lion's Head / Signal Hill",
    specs: { distance: "±5km", duration: "2–3 hours", elevation: "369m", difficulty: 2, fitness: "Beginner", terrain: "Gravel, Rock Scramble, Ladders" },
    logistics: { meetingPoint: "Lion's Head Parking", startTime: "Sunrise (Varies)", ratio: "1:10", price: 1200, priceGroup: 1000, included: ["Guide", "Safety Briefing"], excluded: ["Transport"] },
    gear: { mandatory: ["Headlamp (if sunrise)", "Water", "Windbreaker"], recommended: ["Camera", "Buff"], provided: ["First Aid Kit"] },
    weather: { policy: "Cancels in high wind or heavy rain." },
  },
  {
    id: "platteklip",
    name: "Platteklip Gorge (The Stairmaster)",
    location: "Table Mountain",
    specs: { distance: "±3km", duration: "1–3 hours", elevation: "700m+", difficulty: 3, fitness: "Intermediate", terrain: "Steep Stone Steps" },
    logistics: { meetingPoint: "Lower Cable Station", startTime: "07:00 AM", ratio: "1:8", price: 1500, priceGroup: 1000, included: ["Guide"], excluded: ["Cable Car Ticket down"] },
    gear: { mandatory: ["2L Water", "Sun Protection"], recommended: ["Trekking Poles"], provided: ["First Aid Kit"] },
    weather: { policy: "Route safe in wind, but Cable Car may close." },
  },
  {
    id: "kasteelspoort",
    name: "Kasteelspoort to Diving Board",
    location: "Camps Bay Side",
    specs: { distance: "±6km", duration: "4–5 hours", elevation: "600m", difficulty: 3, fitness: "Intermediate", terrain: "Rocky Track, Jeep Track" },
    logistics: { meetingPoint: "Theresa Ave, Camps Bay", startTime: "07:00 AM", ratio: "1:8", price: 1500, priceGroup: 1000, included: ["Guide", "Photo Stops"], excluded: ["Transport"] },
    gear: { mandatory: ["2L Water", "Sturdy Shoes"], recommended: ["Camera (Essential for Diving Board)"], provided: ["First Aid Kit"] },
    weather: { policy: "Cancels in heavy mist (no views)." },
  },
  {
    id: "waterworks",
    name: "The Waterworks Hike (Skeleton Gorge)",
    location: "Kirstenbosch to Camps Bay",
    specs: { distance: "±12-14km", duration: "7–8 hours", elevation: "900m+", difficulty: 4, fitness: "Advanced", terrain: "Forest, Ladders, Dams, Ravine Descent" },
    logistics: { meetingPoint: "Kirstenbosch Gate", startTime: "06:30 AM", ratio: "1:6", price: 2000, priceGroup: 1000, included: ["Guide", "Museum Visit"], excluded: ["Kirstenbosch Entry Fee"] },
    gear: { mandatory: ["3L Water", "Lunch/Snacks", "Technical Shell"], recommended: ["Swimwear (for dams)"], provided: ["First Aid Kit"] },
    weather: { policy: "Dangerous in heavy rain (slippery ladders)." },
  },
  {
    id: "india-venster",
    name: "India Venster (The Adventure Route)",
    location: "Table Mountain Face",
    specs: { distance: "4km (Up Only)", duration: "3–4 hours", elevation: "700m", difficulty: 5, fitness: "Advanced", terrain: "Scrambling, Exposed Ledges, Cliffs" },
    logistics: { meetingPoint: "Lower Cable Station", startTime: "07:00 AM", ratio: "1:4", price: 1500, priceGroup: 1000, included: ["Guide", "Scramble Coaching"], excluded: ["Cable Car Fee"] },
    gear: { mandatory: ["Grippy Shoes/Boots", "2L Water"], recommended: ["Gloves", "Head for heights"], provided: ["Safety Ropes (if needed)"] },
    weather: { policy: "Strict cancellation in wet or high wind conditions." },
  },
];

export function findRoutes(userLevel: number): Route[] {
  return routes.filter((route) => route.specs.difficulty <= userLevel);
}
