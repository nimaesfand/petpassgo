"use client";
import { useEffect, useState } from "react";
import { tokens, font } from "../lib/theme";
import { supabase } from "../lib/supabaseClient";
import { serviceFormDeadline, daysUntil, fmt, todayPT } from "../lib/travelDates";

const DOT_AIR_FORM_PAGE = "https://www.transportation.gov/individuals/aviation-consumer-protection/service-animals/Air_Transportation_Form";

function mmddyyyy(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

async function downloadForm(tripId, kind, extra) {
  const { data: s } = await supabase.auth.getSession();
  const r = await fetch("/api/dot-form", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" },
    body: JSON.stringify({ trip_id: tripId, kind, handler: extra.handler, phone: extra.phone, color: extra.color, rabies_exp: extra.rabiesExp, hours: extra.hours }),
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.error || "The form could not be prepared.");
  }
  const blob = await r.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = kind === "relief" ? "DOT-Service-Animal-Relief-Attestation-Form.pdf" : "DOT-Service-Animal-Air-Transportation-Form.pdf";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export default function ServiceAnimalTrack({ trip, embedded = false }) {
  const [pet, setPet] = useState(null);
  const [extra, setExtra] = useState({ handler: "", phone: "", rabiesExp: "", hours: "", color: "" });
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = trip.pet_id
      ? supabase.from("pets").select("name,handler_name,breed,animal_type,weight_lb,vet_name").eq("id", trip.pet_id).maybeSingle()
      : supabase.from("pets").select("name,handler_name,breed,animal_type,weight_lb,vet_name").order("created_at", { ascending: false }).limit(1).maybeSingle();
    load.then(({ data }) => {
      setPet(data || null);
      if (data?.handler_name) setExtra((x) => ({ ...x, handler: x.handler || data.handler_name }));
    });
  }, [trip.pet_id]);

  const deadline = trip.travel_date ? serviceFormDeadline(trip.travel_date) : null;
  const left = deadline ? daysUntil(deadline, todayPT()) : null;
  const longFlight = Number(extra.hours) >= 8;
  const set = (k) => (e) => setExtra((x) => ({ ...x, [k]: e.target.value }));
  const input = { border: `2px solid ${tokens.line}`, borderRadius: 10, padding: "10px 12px", fontSize: 16, width: "100%", fontFamily: font.body };

  async function run(kind) {
    setBusy(kind);
    setErr("");
    try { await downloadForm(trip.id, kind, extra); }
    catch (e) { setErr(e.message || "The form could not be prepared."); }
    finally { setBusy(""); }
  }

  return (
    <div className={embedded ? "" : "rounded-xl p-4 mb-4"} style={embedded ? undefined : { background: "#fff", border: `1.5px solid ${tokens.navy}` }}>
      {!embedded && deadline && (
        <div style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }} className="mb-1">
          DOT form for {trip.airline || "your airline"} · aim by {fmt(deadline)}{left === 0 ? " (due today)" : left > 0 ? ` (${left} day${left === 1 ? "" : "s"} left)` : ""}
        </div>
      )}
      <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink }} className="mb-3">
        This fills the official DOT Service Animal Air Transportation Form with {pet?.name ? `${pet.name}'s saved details` : "the pet details on this pass"} and your account email. Check every box yourself, then sign and date. PetPassGo does not attest for you.
      </p>
      <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
        <label style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>Handler full name<input style={input} value={extra.handler} onChange={set("handler")} autoComplete="name" /></label>
        <label style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>Handler phone<input style={input} value={extra.phone} onChange={set("phone")} autoComplete="tel" /></label>
        <label style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>Color, if you want it on the form<input style={input} value={extra.color} onChange={set("color")} /></label>
        <label style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>Rabies vaccination expires<input type="date" style={input} value={extra.rabiesExp} onChange={set("rabiesExp")} /></label>
        <label style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>Longest flight (hours)<input type="number" min="0" step="0.5" style={input} value={extra.hours} onChange={set("hours")} /></label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!!busy} onClick={() => run("air")} className="rounded-full px-4 py-3" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", minHeight: 48 }}>
          {busy === "air" ? "Preparing…" : "Download Air Transportation Form"}
        </button>
        {longFlight && (
          <button type="button" disabled={!!busy} onClick={() => run("relief")} className="rounded-full px-4 py-3" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", minHeight: 48 }}>
            {busy === "relief" ? "Preparing…" : "Download Relief Attestation Form"}
          </button>
        )}
      </div>
      {err && <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.primary }} className="mt-2">{err}</p>}
      {longFlight && <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }} className="mt-2">You entered 8 hours or more, so the relief attestation is included. Check its boxes and sign it yourself.</p>}
      {extra.rabiesExp && <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-2">Rabies date on the form: {mmddyyyy(extra.rabiesExp)}. A saved rabies record is used when this date is empty.</p>}
      <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-2">Official form, September 20, 2024. <a href={DOT_AIR_FORM_PAGE} target="_blank" rel="noopener noreferrer" style={{ color: tokens.navy, fontWeight: 700 }}>U.S. DOT Service Animal Air Transportation Form</a>.</p>
    </div>
  );
}
