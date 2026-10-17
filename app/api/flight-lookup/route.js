import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// AviationStack flight lookup with a Supabase cache (public.flight_lookups).
// Cache every result (including no-results, briefly) to conserve the Basic quota:
//  - past / landed / cancelled flights: 24h
//  - today's live flights: 15 minutes
//  - future flights: 6 hours
//  - not found: 60 minutes
// If AVIATIONSTACK_API_KEY is missing server-side, returns { configured:false }
// with HTTP 200 so the UI can hide the feature and fall back to manual entry.

function serviceClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

function normalizeFlight(raw) {
  const f = String(raw || "").toUpperCase().replace(/[\s-]/g, "");
  return /^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/.test(f) ? f : null;
}

function ttlMs(flight, dateStr) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  if (!flight) return 60 * 60 * 1000;
  if (dateStr < today || ["landed", "cancelled", "incident", "diverted"].includes(flight.flight_status)) return 24 * 3600 * 1000;
  if (dateStr === today) return 15 * 60 * 1000;
  return 6 * 3600 * 1000;
}

function shape(d, requested) {
  if (!d) return null;
  const side = (s) => s && ({
    iata: s.iata || null, airport: s.airport || null, timezone: s.timezone || null,
    scheduled: s.scheduled || null, estimated: s.estimated || null, actual: s.actual || null,
    delay: s.delay ?? null, terminal: s.terminal || null, gate: s.gate || null, baggage: s.baggage || null,
  });
  return {
    flight_iata: d.flight?.iata || requested,
    requested_iata: requested,
    flight_number: d.flight?.number || null,
    flight_date: d.flight_date || null,
    flight_status: d.flight_status || null,
    airline: d.airline?.name || null,
    airline_iata: d.airline?.iata || null,
    departure: side(d.departure),
    arrival: side(d.arrival),
    codeshare: d.flight?.codeshared?.airline_iata ? { airline_iata: d.flight.codeshared.airline_iata, flight_iata: d.flight.codeshared.flight_iata || null } : null,
  };
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const flight = normalizeFlight(body.flight);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date || "") ? body.date : new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
    if (!flight) return NextResponse.json({ configured: true, found: false, error: "Enter a flight number like UA1234." }, { status: 400 });

    const sb = serviceClient();
    // 1) Cache first — a fresh hit never spends API quota.
    if (sb) {
      const { data: hit } = await sb.from("flight_lookups").select("found,payload,fetched_at,expires_at").eq("flight_iata", flight).eq("flight_date", date).maybeSingle();
      if (hit && new Date(hit.expires_at) > new Date()) {
        return NextResponse.json({ configured: true, found: !!hit.found, flight: hit.payload || null, cached: true, fetched_at: hit.fetched_at });
      }
    }

    const key = process.env.AVIATIONSTACK_API_KEY;
    if (!key) return NextResponse.json({ configured: false, found: false, flight: null });

    // 2) Live call. Prefer an exact flight.iata match (AviationStack also returns codeshares).
    const url = `https://api.aviationstack.com/v1/flights?access_key=${encodeURIComponent(key)}&flight_iata=${encodeURIComponent(flight)}&flight_date=${encodeURIComponent(date)}&limit=10`;
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) return NextResponse.json({ configured: true, found: false, flight: null, error: "Flight lookup is unavailable right now. You can enter your trip manually." });
    const rows = Array.isArray(j.data) ? j.data : [];
    const pick = rows.find((d) => (d.flight?.iata || "").toUpperCase() === flight) || rows[0] || null;
    const shaped = shape(pick, flight);
    const fetchedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + ttlMs(shaped, date)).toISOString();

    // 3) Cache every lookup (service-role write; never blocks the response on failure).
    if (sb) {
      await sb.from("flight_lookups").upsert(
        { flight_iata: flight, flight_date: date, found: !!shaped, payload: shaped, fetched_at: fetchedAt, expires_at: expiresAt },
        { onConflict: "flight_iata,flight_date" }
      );
    }

    // 4) Optionally attach to a trip the caller owns.
    if (body.trip_id && shaped) {
      const token = req.headers.get("x-sb-token") || "";
      if (token && sb && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
        const { data: u } = await anon.auth.getUser(token);
        if (u?.user) {
          await sb.from("trips").update({ flight_number: flight, flight_snapshot: shaped, flight_checked_at: fetchedAt }).eq("id", body.trip_id).eq("user_id", u.user.id);
        }
      }
    }

    return NextResponse.json({ configured: true, found: !!shaped, flight: shaped, cached: false, fetched_at: fetchedAt });
  } catch {
    return NextResponse.json({ configured: true, found: false, flight: null, error: "Flight lookup is unavailable right now. You can enter your trip manually." });
  }
}
