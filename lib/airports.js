// Major U.S. commercial hubs + major Mexico airports (ranked by size/importance).
export const AIRPORTS = [
  { code: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta International', country: 'US', rank: 1 },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International', country: 'US', rank: 2 },
  { code: 'ORD', city: 'Chicago', name: "Chicago O'Hare International", country: 'US', rank: 3 },
  { code: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth International', country: 'US', rank: 4 },
  { code: 'DEN', city: 'Denver', name: 'Denver International', country: 'US', rank: 5 },
  { code: 'JFK', city: 'New York', name: 'John F Kennedy International', country: 'US', rank: 6 },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International', country: 'US', rank: 7 },
  { code: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International', country: 'US', rank: 8 },
  { code: 'LAS', city: 'Las Vegas', name: 'Harry Reid International', country: 'US', rank: 9 },
  { code: 'MCO', city: 'Orlando', name: 'Orlando International', country: 'US', rank: 10 },
  { code: 'CLT', city: 'Charlotte', name: 'Charlotte Douglas International', country: 'US', rank: 11 },
  { code: 'PHX', city: 'Phoenix', name: 'Phoenix Sky Harbor International', country: 'US', rank: 12 },
  { code: 'MIA', city: 'Miami', name: 'Miami International', country: 'US', rank: 13 },
  { code: 'IAH', city: 'Houston', name: 'George Bush Intercontinental', country: 'US', rank: 14 },
  { code: 'EWR', city: 'Newark', name: 'Newark Liberty International', country: 'US', rank: 15 },
  { code: 'MSP', city: 'Minneapolis', name: 'Minneapolis-St Paul International', country: 'US', rank: 16 },
  { code: 'BOS', city: 'Boston', name: 'Logan International', country: 'US', rank: 17 },
  { code: 'DTW', city: 'Detroit', name: 'Detroit Metropolitan Wayne County', country: 'US', rank: 18 },
  { code: 'PHL', city: 'Philadelphia', name: 'Philadelphia International', country: 'US', rank: 19 },
  { code: 'LGA', city: 'New York', name: 'LaGuardia', country: 'US', rank: 20 },
  { code: 'FLL', city: 'Fort Lauderdale', name: 'Fort Lauderdale-Hollywood International', country: 'US', rank: 21 },
  { code: 'BWI', city: 'Baltimore', name: 'Baltimore/Washington International', country: 'US', rank: 22 },
  { code: 'IAD', city: 'Washington', name: 'Washington Dulles International', country: 'US', rank: 23 },
  { code: 'DCA', city: 'Washington', name: 'Ronald Reagan Washington National', country: 'US', rank: 24 },
  { code: 'SLC', city: 'Salt Lake City', name: 'Salt Lake City International', country: 'US', rank: 25 },
  { code: 'SAN', city: 'San Diego', name: 'San Diego International', country: 'US', rank: 26 },
  { code: 'TPA', city: 'Tampa', name: 'Tampa International', country: 'US', rank: 27 },
  { code: 'PDX', city: 'Portland', name: 'Portland International', country: 'US', rank: 28 },
  { code: 'HNL', city: 'Honolulu', name: 'Daniel K Inouye International', country: 'US', rank: 29 },
  { code: 'AUS', city: 'Austin', name: 'Austin-Bergstrom International', country: 'US', rank: 30 },
  { code: 'BNA', city: 'Nashville', name: 'Nashville International', country: 'US', rank: 31 },
  { code: 'RDU', city: 'Raleigh', name: 'Raleigh-Durham International', country: 'US', rank: 32 },
  { code: 'STL', city: 'St. Louis', name: 'St Louis Lambert International', country: 'US', rank: 33 },
  { code: 'MCI', city: 'Kansas City', name: 'Kansas City International', country: 'US', rank: 34 },
  { code: 'IND', city: 'Indianapolis', name: 'Indianapolis International', country: 'US', rank: 35 },
  { code: 'CLE', city: 'Cleveland', name: 'Cleveland Hopkins International', country: 'US', rank: 36 },
  { code: 'PIT', city: 'Pittsburgh', name: 'Pittsburgh International', country: 'US', rank: 37 },
  { code: 'CMH', city: 'Columbus', name: 'John Glenn Columbus International', country: 'US', rank: 38 },
  { code: 'MKE', city: 'Milwaukee', name: 'General Mitchell International', country: 'US', rank: 39 },
  { code: 'SMF', city: 'Sacramento', name: 'Sacramento International', country: 'US', rank: 40 },
  { code: 'SJC', city: 'San Jose', name: 'Norman Y Mineta San Jose International', country: 'US', rank: 41 },
  { code: 'OAK', city: 'Oakland', name: 'San Francisco Bay Oakland International', country: 'US', rank: 42 },
  { code: 'SNA', city: 'Santa Ana', name: 'John Wayne Orange County', country: 'US', rank: 43 },
  { code: 'BUR', city: 'Burbank', name: 'Hollywood Burbank', country: 'US', rank: 44 },
  { code: 'DAL', city: 'Dallas', name: 'Dallas Love Field', country: 'US', rank: 45 },
  { code: 'HOU', city: 'Houston', name: 'William P Hobby', country: 'US', rank: 46 },
  { code: 'MDW', city: 'Chicago', name: 'Chicago Midway International', country: 'US', rank: 47 },
  { code: 'RSW', city: 'Fort Myers', name: 'Southwest Florida International', country: 'US', rank: 48 },
  { code: 'MSY', city: 'New Orleans', name: 'Louis Armstrong New Orleans International', country: 'US', rank: 49 },
  { code: 'SAT', city: 'San Antonio', name: 'San Antonio International', country: 'US', rank: 50 },
  { code: 'SJU', city: 'San Juan', name: 'Luis Munoz Marin International', country: 'US', rank: 51 },
  { code: 'ANC', city: 'Anchorage', name: 'Ted Stevens Anchorage International', country: 'US', rank: 52 },
  { code: 'OGG', city: 'Kahului', name: 'Kahului Airport', country: 'US', rank: 53 },
  { code: 'LIH', city: 'Lihue', name: 'Lihue Airport', country: 'US', rank: 54 },
  { code: 'KOA', city: 'Kailua-Kona', name: 'Ellison Onizuka Kona International', country: 'US', rank: 55 },
  { code: 'ABQ', city: 'Albuquerque', name: 'Albuquerque International Sunport', country: 'US', rank: 56 },
  { code: 'TUS', city: 'Tucson', name: 'Tucson International', country: 'US', rank: 57 },
  { code: 'OKC', city: 'Oklahoma City', name: 'Will Rogers World', country: 'US', rank: 58 },
  { code: 'TUL', city: 'Tulsa', name: 'Tulsa International', country: 'US', rank: 59 },
  { code: 'OMA', city: 'Omaha', name: 'Eppley Airfield', country: 'US', rank: 60 },
  { code: 'MEM', city: 'Memphis', name: 'Memphis International', country: 'US', rank: 61 },
  { code: 'CVG', city: 'Cincinnati', name: 'Cincinnati/Northern Kentucky International', country: 'US', rank: 62 },
  { code: 'JAX', city: 'Jacksonville', name: 'Jacksonville International', country: 'US', rank: 63 },
  { code: 'RIC', city: 'Richmond', name: 'Richmond International', country: 'US', rank: 64 },
  { code: 'BUF', city: 'Buffalo', name: 'Buffalo Niagara International', country: 'US', rank: 65 },
  { code: 'ROC', city: 'Rochester', name: 'Greater Rochester International', country: 'US', rank: 66 },
  { code: 'SYR', city: 'Syracuse', name: 'Syracuse Hancock International', country: 'US', rank: 67 },
  { code: 'ALB', city: 'Albany', name: 'Albany International', country: 'US', rank: 68 },
  { code: 'PVD', city: 'Providence', name: 'Rhode Island T F Green International', country: 'US', rank: 69 },
  { code: 'BDL', city: 'Hartford', name: 'Bradley International', country: 'US', rank: 70 },
  { code: 'PWM', city: 'Portland', name: 'Portland International Jetport', country: 'US', rank: 71 },
  { code: 'CHS', city: 'Charleston', name: 'Charleston International', country: 'US', rank: 72 },
  { code: 'SAV', city: 'Savannah', name: 'Savannah/Hilton Head International', country: 'US', rank: 73 },
  { code: 'GSP', city: 'Greenville', name: 'Greenville-Spartanburg International', country: 'US', rank: 74 },
  { code: 'BHM', city: 'Birmingham', name: 'Birmingham-Shuttlesworth International', country: 'US', rank: 75 },
  { code: 'SDF', city: 'Louisville', name: 'Louisville Muhammad Ali International', country: 'US', rank: 76 },
  { code: 'TYS', city: 'Knoxville', name: 'McGhee Tyson', country: 'US', rank: 77 },
  { code: 'XNA', city: 'Northwest Arkansas', name: 'Northwest Arkansas National', country: 'US', rank: 78 },
  { code: 'LIT', city: 'Little Rock', name: 'Bill and Hillary Clinton National', country: 'US', rank: 79 },
  { code: 'ELP', city: 'El Paso', name: 'El Paso International', country: 'US', rank: 80 },
  { code: 'ONT', city: 'Ontario', name: 'Ontario International', country: 'US', rank: 81 },
  { code: 'PSP', city: 'Palm Springs', name: 'Palm Springs International', country: 'US', rank: 82 },
  { code: 'FAT', city: 'Fresno', name: 'Fresno Yosemite International', country: 'US', rank: 83 },
  { code: 'BOI', city: 'Boise', name: 'Boise Air Terminal', country: 'US', rank: 84 },
  { code: 'GEG', city: 'Spokane', name: 'Spokane International', country: 'US', rank: 85 },
  { code: 'RNO', city: 'Reno', name: 'Reno-Tahoe International', country: 'US', rank: 86 },
  { code: 'COS', city: 'Colorado Springs', name: 'City of Colorado Springs Municipal', country: 'US', rank: 87 },
  { code: 'PBI', city: 'West Palm Beach', name: 'Palm Beach International', country: 'US', rank: 88 },
  { code: 'SRQ', city: 'Sarasota', name: 'Sarasota Bradenton International', country: 'US', rank: 89 },
  { code: 'PIE', city: 'St. Petersburg', name: 'St Pete-Clearwater International', country: 'US', rank: 90 },
  { code: 'SFB', city: 'Orlando', name: 'Orlando Sanford International', country: 'US', rank: 91 },
  { code: 'MFR', city: 'Medford', name: 'Rogue Valley International', country: 'US', rank: 92 },
  { code: 'MEX', city: 'Mexico City', name: 'Aeropuerto Internacional Benito Juárez', country: 'MX', rank: 1 },
  { code: 'CUN', city: 'Cancún', name: 'Cancún International', country: 'MX', rank: 2 },
  { code: 'GDL', city: 'Guadalajara', name: 'Miguel Hidalgo y Costilla International', country: 'MX', rank: 3 },
  { code: 'MTY', city: 'Monterrey', name: 'General Mariano Escobedo International', country: 'MX', rank: 4 },
  { code: 'TIJ', city: 'Tijuana', name: 'General Abelardo L. Rodríguez International', country: 'MX', rank: 5 },
  { code: 'SJD', city: 'Los Cabos', name: 'Los Cabos International', country: 'MX', rank: 6 },
  { code: 'PVR', city: 'Puerto Vallarta', name: 'Licenciado Gustavo Díaz Ordaz International', country: 'MX', rank: 7 },
  { code: 'MID', city: 'Mérida', name: 'Manuel Crescencio Rejón International', country: 'MX', rank: 8 },
  { code: 'BJX', city: 'León/Guanajuato', name: 'Del Bajío International', country: 'MX', rank: 9 },
  { code: 'CUL', city: 'Culiacán', name: 'Federal de Bachigualato International', country: 'MX', rank: 10 },
  { code: 'HMO', city: 'Hermosillo', name: 'General Ignacio Pesqueira García International', country: 'MX', rank: 11 },
  { code: 'CUU', city: 'Chihuahua', name: 'General Roberto Fierro Villalobos International', country: 'MX', rank: 12 },
  { code: 'OAX', city: 'Oaxaca', name: 'Xoxocotlán International', country: 'MX', rank: 13 },
  { code: 'VER', city: 'Veracruz', name: 'General Heriberto Jara International', country: 'MX', rank: 14 },
  { code: 'CZM', city: 'Cozumel', name: 'Cozumel International', country: 'MX', rank: 15 },
  { code: 'ACA', city: 'Acapulco', name: 'General Juan N. Álvarez International', country: 'MX', rank: 16 },
  { code: 'ZIH', city: 'Ixtapa/Zihuatanejo', name: 'Ixtapa-Zihuatanejo International', country: 'MX', rank: 17 },
  { code: 'QRO', city: 'Querétaro', name: 'Querétaro Intercontinental', country: 'MX', rank: 18 },
  { code: 'AGU', city: 'Aguascalientes', name: 'Jesús Terán Peredo International', country: 'MX', rank: 19 },
  { code: 'MLM', city: 'Morelia', name: 'General Francisco J. Mujica International', country: 'MX', rank: 20 },
  { code: 'TGZ', city: 'Tuxtla Gutiérrez', name: 'Angel Albino Corzo International', country: 'MX', rank: 21 },
  { code: 'TAP', city: 'Tapachula', name: 'Tapachula International', country: 'MX', rank: 22 },
  { code: 'VSA', city: 'Villahermosa', name: 'Carlos Rovirosa Pérez International', country: 'MX', rank: 23 },
  { code: 'NLU', city: 'Mexico City', name: 'Felipe Ángeles International', country: 'MX', rank: 24 },
];

export function foldAscii(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function formatAirport(a) {
  const region = a.country === "MX" ? "Mexico" : "US";
  return `${a.city}, ${region} (${a.code})`;
}

export function findAirport(label) {
  if (!label) return null;
  const code = (String(label).match(/\(([A-Z]{3})\)/) || [])[1];
  if (code) return AIRPORTS.find((a) => a.code === code) || null;
  return null;
}

export function isMexicoAirport(label) {
  const a = findAirport(label);
  if (a) return a.country === "MX";
  const s = foldAscii(label);
  return /\bmexico\b|\bcancun\b|\bguadalajara\b|\bmonterrey\b|\bpuerto vallarta\b|\blos cabos\b|\btijuana\b|\bcdmx\b|\bciudad de mexico\b|\bmerida\b|\boaxaca\b/.test(s);
}

export function tripTypeForRoute(origin, destination) {
  return isMexicoAirport(origin) || isMexicoAirport(destination) ? "international" : "domestic";
}
