"use client";
import { useState } from "react";
import { tokens, font } from "../lib/theme";
import { fmtTripDate } from "../lib/tripAccess";
import FlightLookup from "./FlightLookup";

// Optional add-on. One-way trips never have to open this.
export default function RoundTripAddon({ trip, onSave }) {
  const [open, setOpen] = useState(false);
  const [ret, setRet] = useState(trip?.return_date || "");
  const [flight, setFlight] = useState(trip?.return_flight_number || "");
  const [snap, setSnap] = useState(trip?.return_flight_snapshot || null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (trip?.return_date && !open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-full rounded-2xl px-4 py-3 mb-4 text-left flex items-center justify-between gap-3" style={{ background: "#fff", border: `1px solid ${tokens.line}`, cursor: "pointer" }}>
        <span style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy }}>Back {fmtTripDate(trip.return_date)}</span>
        <span style={{ fontFamily: font.body, fontSize: 14, color: tokens.primary, fontWeight: 700 }}>Edit return</span>
      </button>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-full rounded-2xl px-4 py-3 mb-4 text-left" style={{ background: "#fff", border: `1px dashed ${tokens.line}`, cursor: "pointer" }}>
        <span style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy }}>Round trip?</span>
        <span style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}> Optional. Tap to add a return date. One-way stays as it is.</span>
      </button>
    );
  }

  async function save(clear) {
    setBusy(true); setErr("");
    const patch = clear ? { return_date: null, return_flight_number: null, return_flight_snapshot: null } : {
      return_date: ret || null,
      return_flight_number: flight || null,
      return_flight_snapshot: snap || null,
    };
    if (!clear && ret && trip?.travel_date && ret < trip.travel_date) {
      setErr("Return date should be on or after your outbound date.");
      setBusy(false);
      return;
    }
    const error = await onSave?.(patch);
    setBusy(false);
    if (error) setErr(error);
    else setOpen(false);
  }

  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: "#fff", border: `1px solid ${tokens.gold}` }}>
      <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }}>Add your return</div>
      <p style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }} className="mb-3">We’ll count reminders and Pet ID access through 7 days after this date. Leave it blank to stay one-way.</p>
      <label style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: tokens.navy }}>Return date</label>
      <input type="date" value={ret} min={trip?.travel_date || undefined} onChange={(e) => setRet(e.target.value)} aria-label="Return date" className="rounded-xl px-3 py-3 outline-none w-full mt-1 mb-3" style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }} />
      <FlightLookup
        mode="return"
        date={ret}
        onFill={(f) => {
          setFlight(f.flight_iata || "");
          setSnap(f);
          if (f.date_was_requested && f.flight_date) setRet(f.flight_date);
        }}
      />
      {ret && <p style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy }} className="mb-3">Back {fmtTripDate(ret)}{flight ? ` · ${flight}` : ""}</p>}
      {err && <p style={{ fontFamily: font.body, fontSize: 14, color: tokens.stamp }} className="mb-2">{err}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy || !ret} onClick={() => save(false)} className="rounded-full px-5 py-3" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 700, border: "none", cursor: "pointer" }}>{busy ? "Saving…" : "Save return"}</button>
        <button type="button" disabled={busy} onClick={() => setOpen(false)} className="rounded-full px-5 py-3" style={{ background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}`, fontFamily: font.body, fontWeight: 700, cursor: "pointer" }}>Not now</button>
        {trip?.return_date && <button type="button" disabled={busy} onClick={() => save(true)} className="rounded-full px-5 py-3" style={{ background: "transparent", color: tokens.muted, border: "none", fontFamily: font.body, fontWeight: 700, cursor: "pointer" }}>Remove return</button>}
      </div>
    </div>
  );
}
