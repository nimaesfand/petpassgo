// Short public pages only. No airline pet-policy URLs. The count of airlines
// PetPassGo covers comes from the Plan my trip list (lib/airlines.js).
import { airlineCoverageHeading } from "./airlines";

export { airlineCoverageHeading };

export const AIRLINE_GUIDES = [
  { slug: "delta", name: "Delta", region: "US" },
  { slug: "american-airlines", name: "American Airlines", region: "US" },
  { slug: "united", name: "United", region: "US" },
  { slug: "southwest", name: "Southwest", region: "US" },
  { slug: "jetblue", name: "JetBlue", region: "US" },
  { slug: "alaska-airlines", name: "Alaska Airlines", region: "US" },
  { slug: "hawaiian-airlines", name: "Hawaiian Airlines", region: "US",
    note: "Hawaiian Airlines now operates under Alaska Airlines' operating certificate and shares Alaska's pet and service-animal policies." },
  { slug: "frontier", name: "Frontier", region: "US" },
  { slug: "allegiant", name: "Allegiant", region: "US" },
  { slug: "sun-country", name: "Sun Country", region: "US" },
  { slug: "aeromexico", name: "Aeroméxico", region: "Mexico" },
  { slug: "volaris", name: "Volaris", region: "Mexico" },
  { slug: "viva-aerobus", name: "Viva Aerobus", region: "Mexico" },
];
export const guideBySlug = (slug) => AIRLINE_GUIDES.find((a) => a.slug === slug);
