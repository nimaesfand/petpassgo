// Pet/animal relief areas, ONLY as published on each airport's official website.
// Airports not listed here are intentionally omitted (never guessed).
// where: "after" = after security (airside), "before" = before security / outside.
export const PET_RELIEF = {
  LAX: {
    source: "https://www.flylax.com/flight-detail/animal-relief--station/animal-relief-station-t1",
    checked: "2026-10-16",
    areas: [
      { terminal: "Terminal 1", where: "after", spot: "Room near Gate 13 (behind California Pizza Kitchen), Level 3 Departures" },
      { terminal: "Terminals 1 & 2", where: "before", spot: "Outside between T1 and T2, Level 1 Baggage Claim" },
      { terminal: "Terminal 2", where: "after", spot: "Room near Gate 21, Level 3 Departures" },
      { terminal: "Tom Bradley International", where: "after", spot: "Near the Great Hall, Level 4 Departures" },
      { terminal: "Tom Bradley International", where: "after", spot: "West Gates, near Gate 205, Level 4 Departures" },
      { terminal: "Terminal 5", where: "before", spot: "Near curbside, Level 1 Baggage Claim" },
    ],
  },
  SFO: {
    source: "https://www.flysfo.com/passengers/services/traveling-with-pets",
    checked: "2026-10-16",
    areas: [
      { terminal: "Harvey Milk Terminal 1", where: "after", spot: "B Gates" },
      { terminal: "Harvey Milk Terminal 1", where: "after", spot: "C Gates, near Gate C5" },
      { terminal: "Terminal 2", where: "after", spot: "D Gates" },
      { terminal: "Terminal 3", where: "after", spot: "F Gates, at the entrance to Gates F11–F22" },
      { terminal: "International Terminal", where: "after", spot: "A Gates" },
      { terminal: "International Terminal", where: "after", spot: "G Gates" },
      { terminal: "Harvey Milk Terminal 1", where: "before", spot: "Outdoors, Courtyard 2, Arrivals/Baggage Claim level" },
      { terminal: "Terminal 3", where: "before", spot: "Outdoors near Courtyard 4, Arrivals/Baggage Claim level" },
    ],
  },
  SEA: {
    source: "https://www.portseattle.org/services-amenities/traveling-pets",
    checked: "2026-10-16",
    areas: [
      { terminal: "A Concourse", where: "after", spot: "Near Gate A10" },
      { terminal: "C Concourse", where: "after", spot: "At the restrooms near C3" },
      { terminal: "D Concourse", where: "after", spot: "At the restrooms near D1" },
      { terminal: "S Concourse", where: "after", spot: "S SEA Underground train station" },
      { terminal: "N Concourse", where: "after", spot: "N SEA Underground train station" },
      { terminal: "Main Terminal (north)", where: "before", spot: "Outside door #33, Ticketing level / Departures Drive" },
      { terminal: "Main Terminal (north)", where: "before", spot: "Outside door #26, Baggage claim level / Arrivals Drive" },
      { terminal: "Main Terminal (south)", where: "before", spot: "Near door #00/02, baggage claim level past Carousel 1" },
    ],
  },
  ATL: {
    source: "https://www.atl.com/about-atl/airport-amenities/",
    checked: "2026-10-16",
    areas: [
      { terminal: "Concourse T", where: "after", spot: "Near Gate T7" },
      { terminal: "Concourse A", where: "after", spot: "Near Gate A10" },
      { terminal: "Concourse B", where: "after", spot: "Near Gate B33" },
      { terminal: "Concourse D", where: "after", spot: "D Centerpoint" },
      { terminal: "Concourse F", where: "after", spot: "Near Gate F7" },
      { terminal: "Domestic Terminal South", where: "before", spot: "Dog park outside doors W1 and W2 (Ground Transportation)" },
      { terminal: "International Terminal", where: "before", spot: "Arrivals level, outside door A1" },
    ],
  },
  DFW: {
    source: "https://www.dfwairport.com/explore/terminals/pettravel/",
    checked: "2026-10-16",
    areas: [
      { terminal: "Terminal A", where: "after", spot: "A29" },
      { terminal: "Terminal B", where: "after", spot: "B28" },
      { terminal: "Terminal D", where: "after", spot: "D18" },
      { terminal: "Terminal E", where: "after", spot: "E31" },
      { terminal: "Terminal A", where: "before", spot: "Outside lower-level door A8" },
      { terminal: "Terminal D", where: "before", spot: "Outside lower-level doors D15 and D29" },
      { terminal: "Terminal E", where: "before", spot: "Outside lower-level doors E2 and E38" },
    ],
  },
};
