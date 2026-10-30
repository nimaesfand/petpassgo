"use client";
import { useEffect, useState } from "react";
import { AIRPORTS, formatAirport } from "../lib/airports";
import { airlinePickerName, OTHER_AIRLINE } from "../lib/airlines";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";

export { airlinePickerName };

export function airportLabel(code, fallbackName) {
  const a = AIRPORTS.find((x) => x.code === (code || "").toUpperCase());
  return a ? formatAirport(a) : fallbackName ? `${fallbackName} (${code})` : code || "";
}
export function airlineFromFlight(f) {
  if (!f) return "";
  const main = airlinePickerName(f.airline, f.airline_iata);
  if (main && main !== OTHER_AIRLINE) return main;
  const operated = airlinePickerName(f.codeshare?.airline_name, f.codeshare?.airline_iata);
  if (operated && operated !== OTHER_AIRLINE) return operated;
  return "";
}
export function fmtTime(iso, tz) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("en-US", { timeZone: tz || "UTC", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); } catch { return iso; }
}

export async function lookupFlight(flight, date, tripId) {
  const { data: s } = await supabase.auth.getSession().catch(() => ({ data: null }));
  const r = await fetch("/api/flight-lookup", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" }, body: JSON.stringify({ flight, date: date || undefined, trip_id: tripId || undefined }) });
  const j = await r.json().catch(() => ({ configured: true, found: false }));
  if (r.status === 401 || r.status === 403 || r.status === 429) return { ...j, configured: true, found: false, error: j.error || "Flight lookup is available on a paid Travel Pass or Pet Vault." };
  return j;
}

export function FlightSummary({ f }) {
  if (!f) return null;
  const delay = f.departure?.delay || f.arrival?.delay;
  return (
    <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}>
      <div style={{ fontWeight: 700, color: tokens.navy }}>{f.airline || ""} {f.flight_iata} · {f.flight_status || "scheduled"}{delay ? ` · delayed ${delay} min` : ""}</div>
      {(f.codeshare?.airline_name || f.codeshare?.airline_iata) && (
        <div style={{ fontWeight: 700, color: tokens.primary }}>Operated by {f.codeshare.airline_name || f.codeshare.airline_iata}{f.codeshare.flight_iata ? ` · ${f.codeshare.flight_iata}` : ""}</div>
      )}
      <div>{f.departure?.iata} {f.departure?.airport || ""} → {f.arrival?.iata} {f.arrival?.airport || ""}</div>
      <div style={{ color: tokens.muted }}>Departs {fmtTime(f.departure?.estimated || f.departure?.scheduled, f.departure?.timezone)}{f.departure?.terminal ? ` · Terminal ${f.departure.terminal}` : ""}{f.departure?.gate ? ` · Gate ${f.departure.gate}` : ""}</div>
      <div style={{ color: tokens.muted }}>Arrives {fmtTime(f.arrival?.estimated || f.arrival?.scheduled, f.arrival?.timezone)}{f.arrival?.terminal ? ` · Terminal ${f.arrival.terminal}` : ""}{f.arrival?.gate ? ` · Gate ${f.arrival.gate}` : ""}</div>
      {!f.departure?.terminal && !f.arrival?.terminal && <div style={{ color: tokens.muted }}>Terminal and gate show here when the airline publishes them.</div>}
    </div>
  );
}

export default function FlightLookup({ date, onFill, mode = "outbound" }) {
  const [flight, setFlight] = useState("");
  const [day, setDay] = useState(date || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [result, setResult] = useState(null);
  const [hidden, setHidden] = useState(false);
  async function go() {
    if (!flight.trim()) return;
    const lookupDate = day || date || "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lookupDate)) {
      setMsg("Pick the flight date first. We won't assume today or fill in your travel date.");
      return;
    }
    setBusy(true); setMsg(""); setResult(null);
    try {
      const j = await lookupFlight(flight, lookupDate);
      if (j.configured === false) { setHidden(true); return; }
      if (!j.found || !j.flight) { setMsg(j.error || "We couldn't find that flight — double-check the number and date, or just enter your route manually below. Nothing is lost."); return; }
      const filled = { ...j.flight, date_was_requested: true };
      setResult(filled);
      onFill && onFill(filled);
    } catch { setMsg("Flight lookup isn't responding — enter your route manually below."); }
    finally { setBusy(false); }
  }
  if (hidden) return null;
  return (
    <div className="rounded-xl p-4 mb-4" style={{ background: tokens.sky, border: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy, fontSize: 15 }}>{mode === "return" ? "Optional return flight" : "Have a flight number? Skip the typing"}</div>
      <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }} className="mb-3">{mode === "return" ? "Add a return flight number only if you want. Pick the return date first — we never assume today." : "Pick the date, then we’ll fill in your airports and airline. If you skip the date, nothing is set to today."}</p>
      <div className="flex flex-wrap gap-2">
        <input value={flight} onChange={(e) => setFlight(e.target.value)} placeholder="Flight # e.g. UA1234" aria-label="Flight number" style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15 }} className="rounded-xl px-3 py-2.5 outline-none flex-1 min-w-[150px]" />
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} aria-label="Flight date" style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15 }} className="rounded-xl px-3 py-2.5 outline-none" />
        <button type="button" disabled={busy || !flight.trim()} onClick={go} className="rounded-full px-5 py-2.5 hover:opacity-90 disabled:opacity-50" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 600 }}>{busy ? "Looking up…" : "Look up"}</button>
      </div>
      {msg && <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }} className="mt-2">{msg}</p>}
      {result && <div className="mt-3 rounded-lg p-3" style={{ background: "#fff" }}><FlightSummary f={result} /><div style={{ fontFamily: font.body, fontSize: 13, color: tokens.green, fontWeight: 700 }} className="mt-1">Filled in below — check and change anything you need.</div></div>}
    </div>
  );
}

export function LiveFlightCard({ trip }) {
  const [flightNo, setFlightNo] = useState(trip?.flight_number || "");
  const [data, setData] = useState(trip?.flight_snapshot || null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [hidden, setHidden] = useState(false);
  async function load(no) {
    const f = (no || flightNo || "").trim(); if (!f) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trip?.travel_date || "")) {
      setNote("Add your travel date before looking up this flight. We won’t use today.");
      return;
    }
    setBusy(true); setNote("");
    try {
      const j = await lookupFlight(f, trip.travel_date, trip?.id);
      if (j.configured === false) { setHidden(true); return; }
      if (j.found && j.flight) { setData(j.flight); setNote(j.cached ? `Last checked ${fmtTime(j.fetched_at)} — updates at most every 15 minutes on travel day.` : "Flight details updated just now."); }
      else setNote("We couldn't find live details for that flight yet — your saved trip is unchanged. Try again closer to departure.");
    } catch { setNote("Live flight details aren't responding right now — your trip plan below is unaffected."); }
    finally { setBusy(false); }
  }
  if (hidden) return null;
  return (
    <div className="rounded-xl p-5 mb-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div style={{ fontFamily: font.display, fontSize: 18, color: tokens.navy }}>Live flight</div>
        {data && <button type="button" disabled={busy} onClick={() => load()} className="rounded-full px-4 py-1.5 disabled:opacity-50" style={{ background: tokens.sky, color: tokens.navy, fontFamily: font.body, fontSize: 13.5, fontWeight: 700 }}>{busy ? "Checking…" : "Refresh"}</button>}
      </div>
      {data ? <FlightSummary f={data} /> : (
        <div>
          <p style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }} className="mb-3">Add your flight number to see live status, times, terminal and gate here.</p>
          <div className="flex flex-wrap gap-2">
            <input value={flightNo} onChange={(e) => setFlightNo(e.target.value)} placeholder="Flight # e.g. UA1234" aria-label="Flight number" style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15 }} className="rounded-xl px-3 py-2 outline-none flex-1 min-w-[150px]" />
            <button type="button" disabled={busy || !flightNo.trim()} onClick={() => load()} className="rounded-full px-5 py-2 disabled:opacity-50" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 600 }}>{busy ? "Looking up…" : "Add flight"}</button>
          </div>
        </div>
      )}
      {!data && trip?.flight_number && <AutoLoad onLoad={() => load(trip.flight_number)} />}
      {note && <p style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }} className="mt-2">{note}</p>}
    </div>
  );
}
function AutoLoad({ onLoad }) { useEffect(() => { onLoad(); }, []); return null; }
