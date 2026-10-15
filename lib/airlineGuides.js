// General, non-paywalled overview per airline. Specific forms, fees, sizes and
// deadlines are intentionally left to the paid Travel Pass.
export const AIRLINE_GUIDES = [
  { slug: "delta", name: "Delta", site: "https://www.delta.com/us/en/pet-travel/overview" },
  { slug: "american-airlines", name: "American Airlines", site: "https://www.aa.com/i18n/travel-info/special-assistance/pets.jsp" },
  { slug: "united", name: "United", site: "https://www.united.com/en/us/fly/travel/traveling-with-pets.html" },
  { slug: "southwest", name: "Southwest", site: "https://support.southwest.com/helpcenter/s/article/pet-policy" },
  { slug: "jetblue", name: "JetBlue", site: "https://www.jetblue.com/help/traveling-with-pets" },
  { slug: "alaska-airlines", name: "Alaska Airlines", site: "https://www.alaskaair.com/content/travel-info/policies/pets-traveling-with-pets" },
  { slug: "hawaiian-airlines", name: "Hawaiian Airlines", site: "https://www.alaskaair.com/content/travel-info/policies/pets-traveling-with-pets",
    note: "Hawaiian Airlines now operates under Alaska Airlines' operating certificate and shares Alaska's pet and service-animal policies." },
  { slug: "frontier", name: "Frontier", site: "https://www.flyfrontier.com/travel/travel-info/family-pets" },
  { slug: "allegiant", name: "Allegiant", site: "https://www.allegiantair.com/traveling-with-pets" },
  { slug: "sun-country", name: "Sun Country", site: "https://www.suncountry.com" },
  { slug: "aeromexico", name: "Aeroméxico", site: "https://www.aeromexico.com/es_mx/vuelos-con-mascotas" },
  { slug: "volaris", name: "Volaris", site: "https://cms.volaris.com/en/travel-info/optional-services/fly-with-your-pet/" },
  { slug: "viva-aerobus", name: "Viva Aerobus", site: "https://www.vivaaerobus.com/es-mx/info/preparate-para-volar/viajando-con-animales/mascotas-en-cabina" },
];
export const guideBySlug = (slug) => AIRLINE_GUIDES.find((a) => a.slug === slug);
