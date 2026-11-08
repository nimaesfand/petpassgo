// Discover: shared constants for the directory and the business pages.

export const STATES = [
  ["AL", "Alabama", ["Birmingham", "Huntsville"]], ["AK", "Alaska", ["Anchorage", "Fairbanks"]], ["AZ", "Arizona", ["Phoenix", "Tucson"]],
  ["AR", "Arkansas", ["Little Rock", "Fayetteville"]], ["CA", "California", ["Los Angeles", "San Diego"]], ["CO", "Colorado", ["Denver", "Colorado Springs"]],
  ["CT", "Connecticut", ["Hartford", "New Haven"]], ["DE", "Delaware", ["Wilmington", "Dover"]], ["DC", "District of Columbia", ["Washington"]],
  ["FL", "Florida", ["Miami", "Orlando"]], ["GA", "Georgia", ["Atlanta", "Savannah"]], ["HI", "Hawaii", ["Honolulu", "Hilo"]],
  ["ID", "Idaho", ["Boise", "Idaho Falls"]], ["IL", "Illinois", ["Chicago", "Springfield"]], ["IN", "Indiana", ["Indianapolis", "Fort Wayne"]],
  ["IA", "Iowa", ["Des Moines", "Cedar Rapids"]], ["KS", "Kansas", ["Wichita", "Overland Park"]], ["KY", "Kentucky", ["Louisville", "Lexington"]],
  ["LA", "Louisiana", ["New Orleans", "Baton Rouge"]], ["ME", "Maine", ["Portland", "Bangor"]], ["MD", "Maryland", ["Baltimore", "Frederick"]],
  ["MA", "Massachusetts", ["Boston", "Worcester"]], ["MI", "Michigan", ["Detroit", "Grand Rapids"]], ["MN", "Minnesota", ["Minneapolis", "Rochester"]],
  ["MS", "Mississippi", ["Jackson", "Gulfport"]], ["MO", "Missouri", ["Kansas City", "St. Louis"]], ["MT", "Montana", ["Billings", "Bozeman"]],
  ["NE", "Nebraska", ["Omaha", "Lincoln"]], ["NV", "Nevada", ["Las Vegas", "Reno"]], ["NH", "New Hampshire", ["Manchester", "Nashua"]],
  ["NJ", "New Jersey", ["Newark", "Jersey City"]], ["NM", "New Mexico", ["Albuquerque", "Santa Fe"]], ["NY", "New York", ["New York City", "Buffalo"]],
  ["NC", "North Carolina", ["Charlotte", "Raleigh"]], ["ND", "North Dakota", ["Fargo", "Bismarck"]], ["OH", "Ohio", ["Columbus", "Cleveland"]],
  ["OK", "Oklahoma", ["Oklahoma City", "Tulsa"]], ["OR", "Oregon", ["Portland", "Bend"]], ["PA", "Pennsylvania", ["Philadelphia", "Pittsburgh"]],
  ["RI", "Rhode Island", ["Providence", "Warwick"]], ["SC", "South Carolina", ["Charleston", "Greenville"]], ["SD", "South Dakota", ["Sioux Falls", "Rapid City"]],
  ["TN", "Tennessee", ["Nashville", "Memphis"]], ["TX", "Texas", ["Dallas", "Austin"]], ["UT", "Utah", ["Salt Lake City", "St. George"]],
  ["VT", "Vermont", ["Burlington", "Montpelier"]], ["VA", "Virginia", ["Richmond", "Virginia Beach"]], ["WA", "Washington", ["Seattle", "Spokane"]],
  ["WV", "West Virginia", ["Charleston", "Morgantown"]], ["WI", "Wisconsin", ["Milwaukee", "Madison"]], ["WY", "Wyoming", ["Cheyenne", "Casper"]],
];
export const STATE_NAME = Object.fromEntries(STATES.map(([c, n]) => [c, n]));

// Mirrors the business_categories table (the table is the source of truth; this is the offline fallback).
export const CATEGORIES = [
  { slug: "vet", name: "Veterinary & Pet Healthcare", short_name: "Vets & health", icon: "stethoscope" },
  { slug: "grooming", name: "Grooming & Personal Care", short_name: "Grooming", icon: "scissors" },
  { slug: "care", name: "Boarding & Pet Care", short_name: "Boarding & sitting", icon: "home" },
  { slug: "training", name: "Training & Behavior", short_name: "Training", icon: "award" },
  { slug: "travel", name: "Pet Travel & Pet-Friendly Places", short_name: "Pet-friendly places", icon: "plane" },
  { slug: "stores", name: "Pet Food, Products & Stores", short_name: "Food & stores", icon: "bag" },
  { slug: "rescue", name: "Adoption & Rescue", short_name: "Adoption & rescue", icon: "heart" },
  { slug: "memorial", name: "Pet Memorial Services", short_name: "Memorial", icon: "flower" },
];

export const PLANS = [
  {
    id: "free", name: "Free listing", price: "$0", note: "Always free",
    points: ["Your business in Discover search", "Name, category, description and pet policy", "Up to 3 photos", "Phone, website, hours and directions", "Edit your listing any time"],
  },
  {
    id: "featured", name: "Featured", price: "$149", per: "/mo", note: "Founding rate $99/mo when you join by Dec 31, 2026, kept while you stay subscribed",
    points: ["Everything in Free", "Top of your category in your city, labeled Featured", "No competitor ads on your page", "Book, Call and Directions buttons", "A member offer for PetPassGo owners", "Monthly report of real views and clicks"],
  },
  {
    id: "premium", name: "Premium", price: "$249", per: "/mo", note: "Limited spots per category per city",
    points: ["Everything in Featured", "Recommended inside Travel Passes for your city", "Recommended in Pet Vault care suggestions", "Premium partner badge"],
  },
];

export const CHECKED_LINE = "Details confirmed by the business, checked by PetPassGo";

export function slugify(name, city) {
  const base = `${name} ${city}`.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return `${base || "business"}-${Math.random().toString(36).slice(2, 6)}`;
}

export function photoUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/business-photos/${path}`;
}

export function safeUrl(u) {
  const s = String(u || "").trim();
  if (!s) return "";
  const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try { const x = new URL(withProto); return x.protocol === "https:" || x.protocol === "http:" ? x.toString() : ""; } catch { return ""; }
}

export function telHref(p) {
  const d = String(p || "").replace(/[^\d+]/g, "");
  return d.length >= 7 ? `tel:${d}` : "";
}

export function mapsHref(b) {
  if (b.online_only || !b.city) return "";
  const q = [b.address, b.city, b.state, b.zip].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name}, ${q}`)}`;
}

// Paid placement order: Premium, then Featured, then everyone else by name. Sponsored listings are always labeled.
export function rankBusinesses(list) {
  const w = { premium: 0, featured: 1, free: 2 };
  return [...list].sort((a, b) => (w[a.plan] ?? 2) - (w[b.plan] ?? 2) || a.name.localeCompare(b.name));
}

export const PUBLIC_FIELDS = "id,slug,name,category,subcategories,tagline,description,pet_policy,address,city,state,zip,online_only,service_area,phone,website,booking_url,hours,photos,plan,confirmed_by_business_at,checked_by_petpassgo_at";
