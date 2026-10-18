"use client";
import { useEffect, useState } from "react";
import { tokens } from "../lib/theme";
import { supabase } from "../lib/supabaseClient";
import { serviceFormDeadline, daysUntil, fmt, todayPT } from "../lib/travelDates";

const AIR_PDF = "/forms/dot-service-animal-air-transportation-form.pdf";
const RELIEF_PDF = "/forms/dot-service-animal-relief-attestation-form.pdf";

function mmddyyyy(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

async function fill(url, values, filename) {
  const { PDFDocument } = await import("pdf-lib");
  const bytes = await fetch(url).then((r) => r.arrayBuffer());
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  for (const [name, val] of Object.entries(values)) {
    if (!val) continue;
    try { form.getTextField(name).setText(String(val)); } catch { /* field missing in this version */ }
  }
  const out = await pdf.save();
  const blob = new Blob([out], { type: "application/pdf" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export default function ServiceAnimalTrack({ trip, embedded = false }) {
  const [pet, setPet] = useState(null);
  const [email, setEmail] = useState("");
  const [extra, setExtra] = useState({ handler: "", phone: "", rabiesExp: "", hours: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data?.user?.email || ""));
    if (trip.pet_id) supabase.from("pets").select("*").eq("id", trip.pet_id).maybeSingle().then(({ data }) => setPet(data));
    else supabase.from("pets").select("*").order("created_at", { ascending: false }).limit(1).then(({ data }) => setPet(data?.[0] || null));
  }, [trip.pet_id]);

  const deadline = trip.travel_date ? serviceFormDeadline(trip.travel_date) : null;
  const left = deadline ? daysUntil(deadline, todayPT()) : null;
  const longFlight = Number(extra.hours) >= 8;
  const set = (k) => (e) => setExtra((x) => ({ ...x, [k]: e.target.value }));

  const desc = pet ? [pet.breed, pet.animal_type, pet.sex].filter(Boolean).join(", ") : "";

  async function airForm() {
    setBusy(true);
    try {
      await fill(AIR_PDF, {
        "Service Animal Handlers full Name": extra.handler,
        Email: email,
        Phone: extra.phone,
        "Animals Name": pet?.name,
        "Animals Description (including weight and color)": desc,
        "Date vaccination expires in the animal": extra.rabiesExp ? mmddyyyy(extra.rabiesExp) : "",
        "Veterinarian's Name": pet?.vet_name,
        "Phone (Veterinarian)": pet?.vet_phone,
      }, "DOT-Service-Animal-Air-Transportation-Form.pdf");
    } finally { setBusy(false); }
  }
  async function reliefForm() {
    setBusy(true);
    try {
      await fill(RELIEF_PDF, {
        "Service Animal Handler's Name": extra.handler,
        "Phone (Handler)": extra.phone,
        Email: email,
        "Animal's Name": pet?.name,
        "[Insert Animal's Name]": pet?.name,
        "Estimated Flight Length": extra.hours ? `${extra.hours} hours` : "",
        "Flight Date": mmddyyyy(trip.travel_date),
        "Departure Airport": trip.origin,
        "Arrival Airport": trip.destination,
      }, "DOT-Service-Animal-Relief-Attestation-Form.pdf");
    } finally { setBusy(false); }
  }

  const input = { border: "1px solid #E5E0D5", borderRadius: 8, padding: "6px 10px", fontSize: 14.5, width: "100%" };
  return (
    <div className={embedded ? "" : "rounded-xl p-4 mb-4"} style={embedded ? undefined : { background: "#fff", border: `1.5px solid ${tokens.navy}` }}>
      {!embedded && <div style={{ fontFamily: "var(--font-body), system-ui, sans-serif", fontSize: 12, letterSpacing: "0.1em", color: tokens.green }} className="mb-1">SERVICE ANIMAL TRACK</div>}
      {!embedded && deadline && (
        <div style={{ fontSize: 15.5, fontWeight: 700 }} className="mb-1">
          Submit your DOT form to {trip.airline || "your airline"} by {fmt(deadline)}{left === 0 ? " (due today)" : left > 0 ? ` (${left} day${left === 1 ? "" : "s"} left)` : " (deadline passed — contact your airline)"}
        </div>
      )}
      <div style={{ fontSize: 14, opacity: 0.7 }} className="mb-3">
        {embedded ? "We pre-fill the official DOT PDF with what we know. Review every field, check each attestation box yourself, then sign and date. PetPassGo will not attest for you." : "US airlines may require the official DOT forms up to 48 hours before departure if you booked more than 48 hours ahead. We pre-fill what we know. Review every field, check each attestation box yourself, then sign and date. Only you can make these attestations. You do not need a separate letter or certificate."}
      </div>
      <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
        <label style={{ fontSize: 13.5 }}>Handler full name<input style={input} value={extra.handler} onChange={set("handler")} /></label>
        <label style={{ fontSize: 13.5 }}>Handler phone<input style={input} value={extra.phone} onChange={set("phone")} /></label>
        <label style={{ fontSize: 13.5 }}>Rabies vaccination expires<input type="date" style={input} value={extra.rabiesExp} onChange={set("rabiesExp")} /></label>
        <label style={{ fontSize: 13.5 }}>Longest flight (hours)<input type="number" min="0" step="0.5" style={input} value={extra.hours} onChange={set("hours")} /></label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button disabled={busy} onClick={airForm} className="rounded-full px-4 py-2" style={{ background: tokens.primary, color: "#fff", fontSize: 14.5, fontWeight: 600 }}>
          Download pre-filled Air Transportation Form
        </button>
        {longFlight && (
          <button disabled={busy} onClick={reliefForm} className="rounded-full px-4 py-2" style={{ background: tokens.primary, color: "#fff", fontSize: 14.5, fontWeight: 600 }}>
            Download pre-filled Relief Attestation Form
          </button>
        )}
      </div>
      {longFlight && <div style={{ fontSize: 13.5, opacity: 0.7 }} className="mt-2">Your flight is 8 hours or longer, so airlines may also require the Relief Attestation Form.</div>}
      <div style={{ fontSize: 12.5, color: tokens.muted }} className="mt-2">Official US DOT forms (September 2024 versions, OMB 2105-0576), from transportation.gov.</div>
    </div>
  );
}
