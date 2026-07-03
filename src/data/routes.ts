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
    contactForPricing?: boolean;
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
    specs: { distance: "±5km", duration: "2–4 hours", elevation: "669m (±355m gain)", difficulty: 3, fitness: "Moderate", terrain: "Gravel, Rock Scramble, Ladders" },
    logistics: { meetingPoint: "Lion's Head Parking", startTime: "TBC", ratio: "1:10", price: 1200, priceGroup: 1000, included: ["Guide", "Safety Briefing"], excluded: ["Transport"] },
    gear: { mandatory: ["Headlamp (when necessary)", "Proper shoes", "Water", "Windbreaker", "Waterproof Jacket", "Snacks"], recommended: ["Trekking Poles", "Gloves", "Buff"], provided: ["First Aid Kit"] },
    weather: { policy: "All hikes are weather dependent and will be cancelled if safety becomes an issue. Lives are more important than summits." },
  },
  {
    id: "platteklip",
    name: "Platteklip Gorge (The Stairmaster)",
    location: "Table Mountain",
    specs: { distance: "±2.5km", duration: "1–3 hours", elevation: "±1030m (±650–700m gain)", difficulty: 3, fitness: "Moderate", terrain: "Steep Stone Steps" },
    logistics: { meetingPoint: "Lower Cable Station", startTime: "TBC", ratio: "1:8", price: 1500, priceGroup: 1200, included: ["Guide", "Briefing", "Tracking"], excluded: ["Cable Car Ticket down"] },
    gear: { mandatory: ["2L Water", "Proper Shoes", "Sun Protection", "Snacks", "Windbreaker/Waterproof Jacket"], recommended: ["Trekking Poles"], provided: ["First Aid Kit"] },
    weather: { policy: "All Routes are weather dependent. Keep in mind that the Cable Car might close when the wind picks up, in which case you might have to hike back down again." },
  },
  {
    id: "kasteelspoort",
    name: "Kasteelspoort to Diving Board",
    location: "Camps Bay Side",
    specs: { distance: "±6km", duration: "4–6 hours", elevation: "±720m", difficulty: 3, fitness: "Moderate", terrain: "Rocky Track, Jeep Track" },
    logistics: { meetingPoint: "Theresa Ave, Camps Bay OR Lower Cable Parking (adds ±3km)", startTime: "TBC", ratio: "1:8", price: 1500, priceGroup: 1200, included: ["Guide", "Photo Stops"], excluded: ["Transport"] },
    gear: { mandatory: ["2L Water", "Sturdy Shoes"], recommended: ["Camera (Essential for Diving Board)"], provided: ["First Aid Kit"] },
    weather: { policy: "All Hikes are weather dependant." },
  },
  {
    id: "waterworks",
    name: "Skeleton Gorge / Nursery Ravine Loop",
    location: "Kirstenbosch to Camps Bay",
    specs: { distance: "±12-14km", duration: "7–8 hours", elevation: "900m+", difficulty: 4, fitness: "Moderate to Hard", terrain: "Forest, Ladders, Dams, Ravine Descent" },
    logistics: { meetingPoint: "Kirstenbosch Gate", startTime: "06:30 AM", ratio: "1:6", price: 2000, priceGroup: 1300, included: ["Guide", "Museum Visit"], excluded: ["Kirstenbosch Entry Fee"] },
    gear: { mandatory: ["2L Water", "Proper Shoes", "Lunch/Snacks", "Sunblock", "Hat"], recommended: ["Trekking Poles", "Gloves", "Buff"], provided: ["First Aid Kit"] },
    weather: { policy: "All hikes are weather dependent." },
  },
  {
    id: "india-venster",
    name: "India Venster (The Adventure Route)",
    location: "Table Mountain Face",
    specs: { distance: "4km (Up Only)", duration: "3–5 hours", elevation: "1030m (700m gain)", difficulty: 5, fitness: "Hard", terrain: "Scrambling, Exposed Ledges, Cliffs" },
    logistics: { meetingPoint: "Table Mountain above the Cable Way Station", startTime: "07:00 AM", ratio: "1:4", price: 1500, priceGroup: 1200, included: ["Guide", "Scramble Coaching"], excluded: ["Cable Car Fee"] },
    gear: { mandatory: ["Grippy Shoes/Boots", "2L Water"], recommended: ["Gloves", "Head for heights"], provided: ["Safety Ropes (if needed)"] },
    weather: { policy: "Strict cancellation in wet or high wind conditions." },
  },
  {
    id: "west-peak",
    name: "West Peak, Helderberg Reserve",
    location: "Hottentots Holland — Helderberg Reserve, Somerset West",
    specs: { distance: "±13km", duration: "5–7 hours", elevation: "1003m (±920m gain)", difficulty: 5, fitness: "Hard", terrain: "Gravel, Rock Scramble, single trail, steep ascents" },
    logistics: { meetingPoint: "Helderberg Reserve Main, Verster Avenue, Somerset West", startTime: "TBC", ratio: "1:8", price: 1200, priceGroup: 1000, included: ["Guide", "Safety Briefing"], excluded: ["Transport"] },
    gear: { mandatory: ["Headlamp (when necessary)", "Proper shoes", "Water", "Windbreaker", "Waterproof Jacket", "Snacks"], recommended: ["Trekking Poles", "Gloves", "Buff"], provided: ["First Aid Kit"] },
    weather: { policy: "All hikes are weather dependent and will be cancelled if safety becomes an issue. Lives are more important than summits." },
  },
  {
    id: "13-peaks-48hr",
    name: "13 Peaks Challenge — The 48-Hour Purge",
    location: "Cape Peninsula — Table Mountain National Park (Signal Hill to Devil's Peak)",
    specs: { distance: "106km", duration: "48 Hours (Non-Stop Clock)", elevation: "6,300m gain (Kilimanjaro from sea level)", difficulty: 4, fitness: "Extreme / Elite", terrain: "Full peninsula spine traverse — technical, exposed, relentless vertical gain" },
    logistics: { meetingPoint: "Signal Hill (Start Point)", startTime: "TBC", ratio: "1:4", price: 0, priceGroup: 0, contactForPricing: true, included: ["Route Briefing", "Checkpoint Tracking", "Safety Support"], excluded: ["Personal Gear", "Nutrition", "Transport"] },
    gear: { mandatory: ["Headlamp + Spare Batteries", "Trail Shoes", "3L+ Water Capacity", "Waterproof Jacket", "Nutrition for Full Duration", "Emergency Blanket"], recommended: ["Trekking Poles", "GPS Watch", "Blister Kit"], provided: ["First Aid Kit", "Tracking Support"] },
    weather: { policy: "This is an extreme, multi-day exposure challenge — routes and checkpoints may be adjusted for safety in severe weather. Lives are more important than summits." },
  },
  {
    id: "13-peaks-multiday",
    name: "13 Peaks Challenge — The Multi-Day Mission",
    location: "Cape Peninsula — Table Mountain National Park (Signal Hill to Devil's Peak)",
    specs: { distance: "106km", duration: "Multi-Day (Self-Paced)", elevation: "6,300m gain (Kilimanjaro from sea level)", difficulty: 4, fitness: "Extreme / Elite", terrain: "Full peninsula spine traverse, broken into stages — technical, exposed, relentless vertical gain" },
    logistics: { meetingPoint: "Signal Hill (Start Point)", startTime: "TBC", ratio: "1:4", price: 0, priceGroup: 0, contactForPricing: true, included: ["Stage-by-Stage Route Planning", "Guiding", "Tracking"], excluded: ["Accommodation", "Personal Gear", "Transport"] },
    gear: { mandatory: ["Headlamp + Spare Batteries", "Trail Shoes", "3L+ Water Capacity", "Waterproof Jacket", "Nutrition per Stage", "Emergency Blanket"], recommended: ["Trekking Poles", "GPS Watch", "Blister Kit"], provided: ["First Aid Kit", "Tracking Support"] },
    weather: { policy: "This is an extreme, multi-day exposure challenge — stages may be rescheduled for safety in severe weather. Lives are more important than summits." },
  },
];

export function findRoutes(userLevel: number): Route[] {
  return routes.filter((route) => route.specs.difficulty <= userLevel);
}
