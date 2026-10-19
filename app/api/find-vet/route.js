import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { AIRPORTS, foldAscii } from "../../../lib/airports";
import { AIRPORT_COORDS } from "../../../lib/airportCoords";

export const dynamic = "force-dynamic";
const UA = "PetPassGo/1.0 petpassgo.com support@petpassgo.com";
const OVERPASS = ["https://overpass.kumi.systems/api/interpreter", "https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
const cache = globalThis.__ppgFindVet || (globalThis.__ppgFindVet = new Map());
async function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < ttlMs) return hit.v;
  const v = await fn();
  if (v != null) cache.set(key, { t: Date.now(), v });
  return v ?? hit?.v ?? null;
}

function airportFor(q) {
  const raw = String(q || "").trim();
  const code = (raw.match(/\(([A-Z]{3})\)/) || [])[1] || (/^[A-Za-z]{3}$/.test(raw) ? raw.toUpperCase() : null);
  if (code) { const a = AIRPORTS.find((x) => x.code === code); if (a && AIRPORT_COORDS[a.code]) return { label: `${a.city} (${a.code})`, lat: AIRPORT_COORDS[a.code][0], lon: AIRPORT_COORDS[a.code][1] }; }
  const f = foldAscii(raw);
  if (!f) return null;
  const a = AIRPORTS.find((x) => AIRPORT_COORDS[x.code] && (foldAscii(x.city) === f || foldAscii(x.name) === f || foldAscii(x.city).includes(f) || f.includes(foldAscii(x.city))));
  return a ? { label: `${a.city} (${a.code})`, lat: AIRPORT_COORDS[a.code][0], lon: AIRPORT_COORDS[a.code][1] } : null;
}

async function geocode(q) {
  return cached(`geo:${foldAscii(q)}`, 7 * 24 * 3600e3, async () => {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`, { headers: { "User-Agent": UA }, next: { revalidate: 604800 } }).catch(() => null);
    if (!r?.ok) return null;
    const j = await r.json().catch(() => []);
    const hit = Array.isArray(j) ? j[0] : null;
    return hit ? { label: hit.display_name?.split(",").slice(0, 2).join(",") || q, lat: Number(hit.lat), lon: Number(hit.lon) } : null;
  });
}

const verified24 = (h) => /(^|[;\s])24\/7([;\s]|$)/.test(String(h || "")) || /00:00\s*-\s*24:00/.test(String(h || ""));

async function vets(place, mode) {
  return cached(`vets:${place.lat},${place.lon}:${mode}`, 24 * 3600e3, async () => {
    const q = `[out:json][timeout:25];(nwr[amenity=veterinary](around:20000,${place.lat},${place.lon}););out center tags 200;`;
    for (const url of OVERPASS) {
      try {
        const r = await fetch(`${url}?data=${encodeURIComponent(q)}`, { headers: { "User-Agent": UA }, next: { revalidate: 86400 }, signal: AbortSignal.timeout(25000) });
        if (!r.ok) continue;
        const j = await r.json();
        const items = (j.elements || []).map((e) => {
          const t = e.tags || {}; const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon;
          if (!t.name || lat == null) return null;
          const emergency = t.emergency === "yes" || t["emergency:animal"] === "yes";
          const addr = [t["addr:housenumber"], t["addr:street"], t["addr:city"]].filter(Boolean).join(" ");
          return { name: t.name, type: emergency ? "emergency_vet" : "vet", address: addr || null, phone: t.phone || t["contact:phone"] || null, verified24: verified24(t.opening_hours), lat, lon, map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t.name} ${addr || `${lat},${lon}`}`)}`, d: Math.hypot(lat - place.lat, (lon - place.lon) * Math.cos((place.lat * Math.PI) / 180)) };
        }).filter(Boolean).sort((a, b) => a.d - b.d);
        const filtered = mode === "emergency" ? items.filter((i) => i.type === "emergency_vet") : items;
        return filtered.slice(0, 5).map(({ d, ...rest }) => rest);
      } catch {}
    }
    return null;
  });
}

// Signed-in only (any account, no paid trip required). Returns OSM vets only;
// "24-hour" is claimed solely when opening_hours in the source data says so.
export async function GET(req) {
  const token = req.headers.get("x-sb-token") || "";
  if (!token) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data: u } = await sb.auth.getUser(token);
  if (!u?.user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const sp = new URL(req.url).searchParams;
  const mode = ["nearby", "emergency", "destination"].includes(sp.get("mode")) ? sp.get("mode") : "nearby";
  const lat = Number(sp.get("lat")), lon = Number(sp.get("lon"));
  let place = null;
  if (sp.get("lat") && sp.get("lon") && Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) place = { label: "your location", lat, lon };
  else {
    const q = String(sp.get("q") || "").trim().slice(0, 120);
    if (!q) return NextResponse.json({ error: "Type a town, ZIP, city or airport." }, { status: 400 });
    place = airportFor(q) || await geocode(q);
  }
  if (!place) return NextResponse.json({ error: "We couldn't find that place. Try a city or airport code." }, { status: 404 });
  const spots = await vets(place, mode).catch(() => null);
  if (spots == null) return NextResponse.json({ error: "Vet search is busy right now. Please try again." }, { status: 503 });
  return NextResponse.json({ place, mode, spots });
}
