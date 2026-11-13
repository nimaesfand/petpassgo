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

async function requestForm(tripId, kind, extra, deliver) {
  const { data: s } = await supabase.auth.getSession();
  const r = await fetch("/api/dot-form", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" },
    body: JSON.stringify({ trip_id: tripId, kind, deliver, handler: extra.handler, phone: extra.phone, color: extra.color, rabies_exp: extra.rabiesExp, hours: extra.hours }),
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.error || "The form could not be prepared.");
  }
  return r;
}

// deliver: "download" saves the PDF, "print" opens it in a new tab to print, "email" sends it to the account email.
async function getForm(tripId, kind, extra, deliver, printWin) {
  const r = await requestForm(tripId, kind, extra, deliver === "email" ? "email" : "file");
  if (deliver === "email") return "sent";
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  if (deliver === "print" && printWin) { printWin.location.href = url; return "opened"; }
  const a = document.createElement("a");
  a.href = url;
  a.download = kind === "relief" ? "DOT-Service-Animal-Relief-Attestation-Form.pdf" : "DOT-Service-Animal-Air-Transportation-Form.pdf";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return "saved";
}

export default function ServiceAnimalTrack({ trip, embedded = false }) {
  const [pet, setPet] = useState(null);
  const [extra, setExtra] = useState({ handler: "", phone: "", rabiesExp: "", hours: "", color: "" });
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");

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

  async function run(kind, deliver = "download") {
    setBusy(`${kind}:${deliver}`);
    setErr("");
    setNote("");
    // Open the print tab now, while the tap still counts, or phones block it.
    const printWin = deliver === "print" ? window.open("", "_blank") : null;
    try {
      const done = await getForm(trip.id, kind, extra, deliver, printWin);
      if (done === "sent") setNote("Sent. Check your email for the PDF.");
      if (done === "opened") setNote("Opened in a new tab. Use your browser's Print or Share to print it.");
      if (done === "saved") setNote("Saved to your downloads.");
    } catch (e) {
      try { printWin?.close(); } catch {}
      setErr(e.message || "The form could not be prepared.");
    } finally { setBusy(""); }
  }

  return (
    <div className={embedded ? "" : "rounded-xl p-4 mb-4"} style={embedded ? undefined : { background: "#fff", border: `1.5px solid ${tokens.navy}` }}>
      {!embedded && deadline && (
        <div style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }} className="mb-1">
          DOT form for {trip.airline || "your airline"} · aim by {fmt(deadline)}{left === 0 ? " (due today)" : left > 0 ? ` (${left} day${left === 1 ? "" : "s"} left)` : ""}
        </div>
      )}
      <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink }} className="mb-3">
        We fill in the official DOT form with {pet?.name ? `${pet.name}'s details` : "your dog's details"} and your email. Add anything missing below, then download, print or email it to yourself. You check the boxes and sign it yourself.
      </p>
      <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
        <label style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>Handler full name<input style={input} value={extra.handler} onChange={set("handler")} autoComplete="name" /></label>
        <label style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>Handler phone<input style={input} value={extra.phone} onChange={set("phone")} autoComplete="tel" /></label>
        <label style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>Color, if you want it on the form<input style={input} value={extra.color} onChange={set("color")} /></label>
        <label style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>Rabies vaccination expires<input type="date" style={input} value={extra.rabiesExp} onChange={set("rabiesExp")} /></label>
        <label style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>Longest flight (hours)<input type="number" min="0" step="0.5" style={input} value={extra.hours} onChange={set("hours")} /></label>
      </div>
      <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }} className="mb-2">Get your filled-in form</div>
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
        {[["download", "Download PDF"], ["print", "Print it"], ["email", "Email it to me"]].map(([d, label], i) => (
          <button key={d} type="button" disabled={!!busy} onClick={() => run("air", d)} className="rounded-full px-4 py-3" style={{ background: i === 0 ? tokens.primary : "#fff", color: i === 0 ? "#fff" : tokens.navy, border: i === 0 ? "none" : `2px solid ${tokens.navy}`, fontFamily: font.body, fontSize: 15.5, fontWeight: 700, cursor: "pointer", minHeight: 48, opacity: busy && busy !== `air:${d}` ? 0.6 : 1 }}>
            {busy === `air:${d}` ? "Preparing…" : label}
          </button>
        ))}
      </div>
      {longFlight && (
        <div className="mt-3">
          <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }} className="mb-2">Relief form (flights of 8+ hours)</div>
          <div className="flex flex-wrap gap-2">
            {[["download", "Download"], ["email", "Email it to me"]].map(([d, label]) => (
              <button key={d} type="button" disabled={!!busy} onClick={() => run("relief", d)} className="rounded-full px-4 py-3" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", minHeight: 46 }}>
                {busy === `relief:${d}` ? "Preparing…" : label}
              </button>
            ))}
          </div>
        </div>
      )}
      {note && <p role="status" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.green }} className="mt-2">{note}</p>}
      {err && <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.primary }} className="mt-2">{err}</p>}
      {longFlight && <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }} className="mt-2">You entered 8 hours or more, so the relief attestation is included. Check its boxes and sign it yourself.</p>}
      {extra.rabiesExp && <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-2">Rabies date on the form: {mmddyyyy(extra.rabiesExp)}. A saved rabies record is used when this date is empty.</p>}
      <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-2">Official form, September 20, 2024. <a href={DOT_AIR_FORM_PAGE} target="_blank" rel="noopener noreferrer" style={{ color: tokens.navy, fontWeight: 700 }}>U.S. DOT Service Animal Air Transportation Form</a>.</p>
    </div>
  );
}
