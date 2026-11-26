"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import Icon from "./Icon";

// "Your vet sent a notice": records a connected vet (or groomer, daycare, boarding)
// emailed to the pet's private address. The owner ticks what to add and taps Confirm.
// Nothing is added on its own.
const fmt = (d) => {
  if (!d) return "";
  const [y, m, day] = String(d).slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
};

async function call(method, body, petId) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const url = method === "GET" ? `/api/pet-notices?pet_id=${petId}` : "/api/pet-notices";
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json", "x-sb-token": token || "" }, body: body ? JSON.stringify(body) : undefined });
  return r.json().catch(() => ({}));
}

function Notice({ n, onDone }) {
  const vaccines = n.items?.vaccines || [];
  const files = n.items?.files || [];
  const [keep, setKeep] = useState(() => vaccines.map((_, i) => i));
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const who = n.from_name || n.from_email || "Your vet";

  async function act(action) {
    setBusy(action); setErr("");
    const out = await call("POST", { id: n.id, action, keep }, null);
    setBusy("");
    if (out?.error) { setErr(out.error); return; }
    onDone(action);
  }

  return (
    <section className="rounded-3xl p-4 sm:p-5 min-w-0 ppg-rise" style={{ background: "#fff", border: `2px solid ${tokens.gold || "#F2B84B"}`, boxShadow: "0 10px 24px rgba(20,33,61,0.08)" }}>
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center rounded-2xl flex-shrink-0" style={{ width: 42, height: 42, background: "#FFF4DC", color: "#C2410C" }}><Icon name="send" size={20} /></span>
        <div className="min-w-0">
          <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 800, color: tokens.navy, lineHeight: 1.2 }}>{who} sent a notice</div>
          <p className="mt-1" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }}>{n.summary || n.subject}</p>
        </div>
      </div>

      {vaccines.length > 0 && (
        <div className="mt-3 grid gap-2">
          <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: tokens.muted }}>These are coming up. Add them?</div>
          {vaccines.map((v, i) => {
            const on = keep.includes(i);
            return (
              <label key={i} className="flex items-center gap-3 rounded-2xl px-3 py-2.5" style={{ background: on ? "#F3F5F9" : "#fff", border: `1.5px solid ${on ? tokens.navy : tokens.line}`, cursor: "pointer" }}>
                <input type="checkbox" checked={on} onChange={() => setKeep((k) => (on ? k.filter((x) => x !== i) : [...k, i]))} style={{ width: 18, height: 18, accentColor: tokens.navy }} />
                <span className="min-w-0">
                  <span style={{ fontFamily: font.body, fontSize: 15.5, fontWeight: 800, color: tokens.navy }}>{v.name}</span>
                  <span style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>{v.due_date ? ` · Due ${fmt(v.due_date)}` : v.date_given ? ` · Given ${fmt(v.date_given)}` : ""}</span>
                </span>
              </label>
            );
          })}
        </div>
      )}
      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((f) => (
            <span key={f.path} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "#F3F5F9", fontFamily: font.body, fontSize: 13.5, fontWeight: 700, color: tokens.navy }}>
              <Icon name="file" size={14} /> {f.name}
            </span>
          ))}
        </div>
      )}

      {err && <div className="mt-3" style={{ fontFamily: font.body, fontSize: 14, color: "#B91C1C" }}>{err}</div>}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={!!busy || (!files.length && !keep.length)} onClick={() => act("confirm")} className="ppg-btn ppg-btn-primary">{busy === "confirm" ? "Adding…" : "Confirm"}</button>
        <button type="button" disabled={!!busy} onClick={() => act("dismiss")} className="ppg-btn ppg-btn-secondary">{busy === "dismiss" ? "…" : "Not now"}</button>
      </div>
    </section>
  );
}

export default function PetNotices({ pet, onAdded }) {
  const [notices, setNotices] = useState([]);
  const [done, setDone] = useState("");
  const load = useCallback(() => { call("GET", null, pet.id).then((d) => setNotices(d?.notices || [])); }, [pet.id]);
  useEffect(() => { load(); }, [load]);

  if (!notices.length && !done) return null;
  return (
    <div className="grid gap-3 min-w-0">
      {done && <div className="rounded-2xl px-4 py-3" style={{ background: "#EAF5EE", color: "#2F7A4A", fontFamily: font.body, fontSize: 15, fontWeight: 700 }}>{done}</div>}
      {notices.map((n) => (
        <Notice key={n.id} n={n} onDone={(action) => {
          setNotices((list) => list.filter((x) => x.id !== n.id));
          setDone(action === "confirm" ? `Added to ${pet.name}'s Vault.` : "");
          if (action === "confirm") onAdded?.();
        }} />
      ))}
    </div>
  );
}
