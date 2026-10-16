import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { findAirport } from "../../../lib/airports";
import { AIRPORT_COORDS } from "../../../lib/airportCoords";

export const dynamic = "force-dynamic";
const UA = "PetPassGo/1.0 petpassgo.com support@petpassgo.com";
const cache = globalThis.__ppgExtras || (globalThis.__ppgExtras = new Map());
async function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < ttlMs) return hit.v;
  const v = await fn();
  if (v != null) cache.set(key, { t: Date.now(), v });
  return v ?? hit?.v ?? null;
}

// MET Norway Locationforecast (CC BY 4.0, commercial use allowed). Times are UTC;
// we approximate local day from longitude, so the day's high/low is approximate.
async function weather(code, date) {
  const c = AIRPORT_COORDS[code];
  if (!c || !date) return null;
  const data = await cached(`met:${code}`, 60 * 60 * 1000, async () => {
    const r = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${c[0]}&lon=${c[1]}`, { headers: { "User-Agent": UA }, next: { revalidate: 3600 } });
    return r.ok ? r.json() : null;
  });
  const ts = data?.properties?.timeseries;
  if (!ts) return { status: "unavailable" };
  const offH = Math.round(c[1] / 15);
  const rows = ts.filter((t) => new Date(new Date(t.time).getTime() + offH * 3600e3).toISOString().slice(0, 10) === date);
  if (rows.length < 3) return { status: "later" };
  const temps = rows.map((t) => t.data.instant.details.air_temperature);
  const sym = rows.map((t) => t.data.next_6_hours?.summary?.symbol_code || t.data.next_1_hours?.summary?.symbol_code).filter(Boolean);
  const midday = sym[Math.floor(sym.length / 2)] || sym[0] || "";
  const f = (x) => Math.round(x * 9 / 5 + 32);
  return { status: "ok", highF: f(Math.max(...temps)), lowF: f(Math.min(...temps)), symbol: midday.replace(/_(day|night|polartwilight)$/, "") };
}

// OpenStreetMap via Overpass (ODbL). Names/types only, nothing invented.
const OVERPASS = ["https://overpass.kumi.systems/api/interpreter", "https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
async function spots(code) {
  const c = AIRPORT_COORDS[code];
  if (!c) return null;
  return cached(`osm:${code}`, 7 * 24 * 3600 * 1000, async () => {
    const q = `[out:json][timeout:25];(nwr[amenity=veterinary](around:20000,${c[0]},${c[1]});nwr[leisure=dog_park](around:20000,${c[0]},${c[1]});nwr[shop=pet](around:20000,${c[0]},${c[1]}););out center tags 200;`;
    for (const url of OVERPASS) {
      try {
        // GET so Next's data cache (shared across server instances) keeps results for a week.
        const r = await fetch(`${url}?data=${encodeURIComponent(q)}`, { headers: { "User-Agent": UA }, next: { revalidate: 604800 }, signal: AbortSignal.timeout(25000) });
        if (!r.ok) continue;
        const j = await r.json();
        const dist = (la, lo) => Math.hypot(la - c[0], (lo - c[1]) * Math.cos((c[0] * Math.PI) / 180));
        const items = (j.elements || []).map((e) => {
          const t = e.tags || {};
          const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon;
          if (!t.name || lat == null) return null;
          const type = t.amenity === "veterinary" ? (t.emergency === "yes" ? "emergency_vet" : "vet") : t.leisure === "dog_park" ? "dog_park" : "pet_store";
          return { name: t.name, type, map: `https://www.openstreetmap.org/${e.type}/${e.id}`, d: dist(lat, lon) };
        }).filter(Boolean).sort((a, b) => a.d - b.d);
        const pick = (ty, n) => items.filter((i) => i.type === ty).slice(0, n).map(({ d, ...rest }) => rest);
        return [...pick("emergency_vet", 3), ...pick("vet", 4), ...pick("dog_park", 4), ...pick("pet_store", 3)];
      } catch {}
    }
    return null;
  });
}

export async function GET(req) {
  const token = req.headers.get("x-sb-token") || "";
  const tripId = new URL(req.url).searchParams.get("trip_id");
  if (!token || !tripId) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: trip } = await sb.from("trips").select("id,paid,origin,destination,travel_date").eq("id", tripId).maybeSingle();
  if (!trip?.paid) return NextResponse.json({ error: "Paid trips only" }, { status: 403 });
  const o = findAirport(trip.origin), d = findAirport(trip.destination);
  if (new URL(req.url).searchParams.get("part") === "spots") {
    return NextResponse.json({ destination: d && { code: d.code, city: d.city }, spots: d ? await spots(d.code).catch(() => null) : null });
  }
  const [wo, wd] = await Promise.all([
    o ? weather(o.code, trip.travel_date).catch(() => ({ status: "unavailable" })) : null,
    d ? weather(d.code, trip.travel_date).catch(() => ({ status: "unavailable" })) : null,
  ]);
  return NextResponse.json({ origin: o && { code: o.code, city: o.city, weather: wo }, destination: d && { code: d.code, city: d.city, weather: wd } });
}
