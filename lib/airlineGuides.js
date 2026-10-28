// General, non-paywalled overview per airline. Specific forms, fees, sizes and
// deadlines are intentionally left to the paid Travel Pass.
export const AIRLINE_GUIDES = [
  { slug: "delta", name: "Delta", region: "US", site: "https://www.delta.com/us/en/pet-travel/overview" },
  { slug: "american-airlines", name: "American Airlines", region: "US", site: "https://www.aa.com/web/i18n/travel-info/special-assistance/pets.html" },
  { slug: "united", name: "United", region: "US", site: "https://www.united.com/en/us/fly/travel/traveling-with-pets.html" },
  { slug: "southwest", name: "Southwest", region: "US", site: "https://support.southwest.com/helpcenter/article/pet-policy" },
  { slug: "jetblue", name: "JetBlue", region: "US", site: "https://www.jetblue.com/help/traveling-with-pets" },
  { slug: "alaska-airlines", name: "Alaska Airlines", region: "US", site: "https://www.alaskaair.com/content/travel-info/pets" },
  { slug: "hawaiian-airlines", name: "Hawaiian Airlines", region: "US", site: "https://www.alaskaair.com/content/travel-info/pets",
    note: "Hawaiian Airlines now operates under Alaska Airlines' operating certificate and shares Alaska's pet and service-animal policies." },
  { slug: "frontier", name: "Frontier", region: "US", site: "https://www.flyfrontier.com/travel/travel-info/family-pets" },
  { slug: "allegiant", name: "Allegiant", region: "US", site: "https://www.allegiantair.com/traveling-with-pets" },
  { slug: "sun-country", name: "Sun Country", region: "US", site: "https://www.suncountry.com" },
  { slug: "aeromexico", name: "Aeroméxico", region: "Mexico", site: "https://www.aeromexico.com/es_mx/vuelos-con-mascotas" },
  { slug: "volaris", name: "Volaris", region: "Mexico", site: "https://cms.volaris.com/en/travel-info/optional-services/fly-with-your-pet/" },
  { slug: "viva-aerobus", name: "Viva Aerobus", region: "Mexico", site: "https://www.vivaaerobus.com/es-mx/info/preparate-para-volar/viajando-con-animales/mascotas-en-cabina" },
];
export const guideBySlug = (slug) => AIRLINE_GUIDES.find((a) => a.slug === slug);

const REGION_LABEL = { US: "the U.S.", Mexico: "Mexico" };

export function airlineCoverageHeading(guides = AIRLINE_GUIDES) {
  const n = guides.length;
  const regions = [];
  for (const g of guides) {
    const label = REGION_LABEL[g.region] || g.region;
    if (label && !regions.includes(label)) regions.push(label);
  }
  if (regions.length === 1 && regions[0] === "the U.S.") return `${n} U.S. airlines. One place.`;
  const place = regions.length <= 1 ? regions[0] : `${regions.slice(0, -1).join(", ")} and ${regions[regions.length - 1]}`;
  return `${n} airlines across ${place}. One place.`;
}
