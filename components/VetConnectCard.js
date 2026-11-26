"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";

// "Connect my vet": the owner approves, we email the clinic a ready-made request
// (a favour, not a chore) to add the pet's private records address to their file.
// After that, what the clinic sends shows up as a notice the owner confirms.
const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "12px 14px", width: "100%", background: "#fff", color: tokens.ink };
const label = { fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy, display: "grid", gap: 6 };
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");

async function authed(url, opts = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const r = await fetch(url, { ...opts, headers: { "Content-Type": "application/json", "x-sb-token": token || "" } });
  return { status: r.status, body: await r.json().catch(() => ({})) };
}

export default function VetConnectCard({ pet }) {
  const [state, setState] = useState({ ready: null, providers: [] });
  const [open, setOpen] = useState(false);
  const [clinic, setClinic] = useState(pet.vet_name || "");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => authed(`/api/vet-connect?pet_id=${pet.id}`).then(({ body }) => setState({ ready: !!body.ready, providers: body.providers || [] }));
  useEffect(() => { load(); setClinic(pet.vet_name || ""); }, [pet.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function send(e) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const { body } = await authed("/api/vet-connect", { method: "POST", body: JSON.stringify({ pet_id: pet.id, email: email.trim(), clinic: clinic.trim(), kind: "vet", agree }) });
    setBusy(false);
    if (body?.error) { setMsg(body.error); return; }
    setOpen(false); setEmail(""); setAgree(false);
    setMsg(`Request sent to ${clinic.trim() || email.trim()}. You got a copy.`);
    load();
  }

  const vets = state.providers.filter((p) => p.kind === "vet");
  return (
    <section className="rounded-3xl p-4 sm:p-6 min-w-0" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 style={{ fontFamily: font.display, fontSize: 21, fontWeight: 800, color: tokens.navy }}>Never chase your vet again</h3>
          <p className="mt-1" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }}>
            Connect {pet.name}&apos;s vet once, and their records and reminders show up here on their own. You confirm before anything is added.
          </p>
        </div>
        {state.ready !== false && !open && (
          <button type="button" onClick={() => { setOpen(true); setMsg(""); }} className="ppg-btn ppg-btn-primary ppg-btn-compact flex-shrink-0">{vets.length ? "Add another" : "Connect my vet"}</button>
        )}
      </div>

      {state.ready === false && (
        <div className="mt-3 rounded-2xl px-4 py-3" style={{ background: "#F3F5F9", fontFamily: font.body, fontSize: 14.5, color: tokens.navy, fontWeight: 700 }}>Coming soon. We&apos;re switching this on now.</div>
      )}

      {vets.length > 0 && (
        <div className="mt-3 grid gap-2">
          {vets.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5" style={{ background: "#F3F5F9" }}>
              <span className="min-w-0 truncate" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 800, color: tokens.navy }}>{p.name || p.email}</span>
              <span className="flex-shrink-0" style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 700, color: p.last_received_at ? "#2F7A4A" : tokens.muted }}>
                {p.last_received_at ? `Connected ✓ · last sent ${fmt(p.last_received_at)}` : `Request sent ${fmt(p.requested_at)}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {open && (
        <form onSubmit={send} className="grid gap-3 mt-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
            <label style={label}>Clinic name<input value={clinic} onChange={(e) => setClinic(e.target.value)} maxLength={80} placeholder="Westside Animal Hospital" style={input} /></label>
            <label style={label}>Clinic email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="frontdesk@clinic.com" style={input} /></label>
          </div>
          <p style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted, lineHeight: 1.45 }}>
            We send them a short, ready-made note asking to add {pet.name}&apos;s records address to their file. It&apos;s one step for them, and you get a copy.
          </p>
          <label className="flex items-start gap-3" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, cursor: "pointer" }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 18, height: 18, marginTop: 2, accentColor: tokens.navy }} />
            <span>I agree to let {clinic.trim() || "my vet"} send {pet.name}&apos;s records to PetPassGo.</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy || !agree || !email.trim()} className="ppg-btn ppg-btn-primary">{busy ? "Sending…" : "Send request"}</button>
            <button type="button" onClick={() => setOpen(false)} className="ppg-btn ppg-btn-secondary">Cancel</button>
          </div>
        </form>
      )}
      {msg && <div className="mt-3" style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 700, color: /couldn|check|please|too many|isn't|part of/i.test(msg) ? "#B91C1C" : "#2F7A4A" }}>{msg}</div>}
    </section>
  );
}
