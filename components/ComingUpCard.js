"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";

// Real-life dates we remind around: the next grooming/daycare/boarding visit
// (4 days before, with a nudge to send records) and, for ESAs, the lease renewal.
const KINDS = [["grooming", "Grooming"], ["daycare", "Daycare"], ["boarding", "Boarding"], ["training", "Training"], ["vet", "Vet visit"]];
const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "12px 14px", width: "100%", background: "#fff", color: tokens.ink };
const label = { fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy, display: "grid", gap: 6 };
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

export default function ComingUpCard({ pet, onSaved }) {
  const esa = pet.role === "Emotional support animal";
  const [kind, setKind] = useState(pet.next_visit_kind || "");
  const [date, setDate] = useState(pet.next_visit_date || "");
  const [place, setPlace] = useState(pet.next_visit_place || "");
  const [lease, setLease] = useState(pet.lease_renewal_date || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    setKind(pet.next_visit_kind || ""); setDate(pet.next_visit_date || ""); setPlace(pet.next_visit_place || ""); setLease(pet.lease_renewal_date || "");
  }, [pet.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(e) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const patch = { next_visit_kind: date ? kind || null : null, next_visit_date: date || null, next_visit_place: date ? place.trim().slice(0, 80) || null : null };
    if (date !== (pet.next_visit_date || "")) patch.next_visit_reminded_at = null;
    if (esa) {
      patch.lease_renewal_date = lease || null;
      if (lease !== (pet.lease_renewal_date || "")) patch.lease_reminded_at = null;
    }
    const { error } = await supabase.from("pets").update(patch).eq("id", pet.id);
    setBusy(false);
    if (error) { setMsg("Couldn't save. Please try again."); return; }
    setMsg("Saved. We'll remind you before.");
    onSaved?.();
  }

  return (
    <section className="rounded-3xl p-4 sm:p-6 min-w-0" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <h3 style={{ fontFamily: font.display, fontSize: 21, fontWeight: 800, color: tokens.navy }}>Coming up</h3>
      <p className="mt-1" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }}>
        Add {pet.name}&apos;s next visit and we&apos;ll remind you 4 days before, with their records ready to send.
      </p>
      <form onSubmit={save} className="grid gap-3 mt-4 min-w-0">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Kind of visit">
          {KINDS.map(([k, t]) => (
            <button key={k} type="button" onClick={() => setKind(kind === k ? "" : k)} className="ppg-chip-btn" aria-pressed={kind === k} style={kind === k ? { background: tokens.navy, color: "#fff", borderColor: tokens.navy } : undefined}>{t}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
          <label style={label}>Date<input type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value)} style={input} /></label>
          <label style={label}>Where <span style={{ fontWeight: 400, color: tokens.muted, fontSize: 13.5 }}>(optional)</span><input value={place} onChange={(e) => setPlace(e.target.value)} maxLength={80} placeholder="Happy Paws Grooming" style={input} /></label>
        </div>
        {esa ? (
          <label style={label}>Lease renewal date <span style={{ fontWeight: 400, color: tokens.muted, fontSize: 13.5 }}>(we remind you 30 days before, so your housing letter is ready)</span>
            <input type="date" value={lease} onChange={(e) => setLease(e.target.value)} style={input} />
          </label>
        ) : null}
        <div className="flex items-center gap-3 flex-wrap">
          <button type="submit" disabled={busy} className="ppg-btn ppg-btn-primary">{busy ? "Saving…" : "Save"}</button>
          {msg ? <span role="status" style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 700, color: msg.startsWith("Saved") ? tokens.green : tokens.primary }}>{msg}</span> : null}
        </div>
      </form>
    </section>
  );
}
