"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import Icon from "./Icon";

// "Share records": the owner types any email (groomer, daycare, boarding, a new vet)
// and we email the actual files plus a one-page summary. Owner gets a copy.
const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "12px 14px", width: "100%", background: "#fff", color: tokens.ink };
const label = { fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy, display: "grid", gap: 6 };
const fmt = (d) => {
  if (!d) return "";
  const [y, m, day] = String(d).slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
};
const WHO = ["Groomer", "Daycare", "Boarding", "New vet", "Sitter", "Trainer"];

export function RecentShares({ pet, refreshKey }) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    supabase.from("record_sends").select("id,to_name,to_email,sent_at,received_at").eq("pet_id", pet.id).order("sent_at", { ascending: false }).limit(5).then(({ data }) => setRows(data || []));
  }, [pet.id, refreshKey]);
  if (!rows.length) return null;
  return (
    <div className="grid gap-2 mt-1">
      {rows.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5" style={{ background: tokens.paper, border: `1px solid ${tokens.line}` }}>
          <div className="min-w-0">
            <div className="truncate" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>{r.to_name || r.to_email}</div>
            <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>Sent {new Date(r.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
          </div>
          <span className="flex-shrink-0 rounded-full px-2.5 py-1" style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 800, background: r.received_at ? "#EAF6EE" : tokens.sky, color: r.received_at ? tokens.green : tokens.muted }}>{r.received_at ? "Received ✓" : "Sent"}</span>
        </div>
      ))}
    </div>
  );
}

export default function ShareRecordsSheet({ pet, open, onClose, onSent }) {
  const [docs, setDocs] = useState([]);
  const [vax, setVax] = useState(0);
  const [picked, setPicked] = useState([]);
  const [summary, setSummary] = useState(true);
  const [who, setWho] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState("");

  useEffect(() => {
    if (!open) return;
    setErr(""); setSent(""); setAgree(false);
    Promise.all([
      supabase.from("documents").select("id,document_type,expires_on,uploaded_at").eq("pet_id", pet.id).order("uploaded_at", { ascending: false }),
      supabase.from("pet_health_records").select("id", { count: "exact", head: true }).eq("pet_id", pet.id).eq("kind", "vaccine"),
    ]).then(([d, h]) => {
      const list = (d.data || []).filter((x) => x.document_type !== "Airline form");
      setDocs(list);
      setPicked(list.filter((x) => /rabies|vaccine|health/i.test(x.document_type || "")).map((x) => x.id));
      setVax(h.count || 0);
    });
  }, [open, pet.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const nothing = !picked.length && !summary;

  async function send(e) {
    e.preventDefault();
    if (!agree || nothing) return;
    setBusy(true); setErr("");
    try {
      const { data } = await supabase.auth.getSession();
      const r = await fetch("/api/share-records", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-sb-token": data?.session?.access_token || "" },
        body: JSON.stringify({ pet_id: pet.id, to_email: email, to_name: name || who, note, doc_ids: picked, include_summary: summary, agree }),
      });
      const out = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(out.error || "Couldn't send. Please try again.");
      setSent(out.to || email);
      onSent?.();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={`Share ${pet.name}'s records`} className="ppg-kb-aware fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(20,33,61,.45)" }} onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="w-full sm:max-w-[480px] rounded-t-3xl sm:rounded-3xl ppg-rise overflow-hidden" style={{ background: "#fff", maxHeight: "92vh", overflowY: "auto" }}>
        <div className="relative px-5 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${tokens.navy} 0%, #1D3463 100%)`, color: "#fff" }}>
          <button type="button" aria-label="Close" onClick={onClose} disabled={busy} className="absolute" style={{ top: 14, right: 14, background: "rgba(255,255,255,.14)", border: "none", borderRadius: 999, width: 36, height: 36, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={18} /></button>
          <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 800, letterSpacing: ".14em", color: tokens.gold }}>SHARE RECORDS</div>
          <h2 className="mt-1 pr-10" style={{ fontFamily: font.display, fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>Send {pet.name}&apos;s records</h2>
          <p className="mt-1.5" style={{ fontFamily: font.body, fontSize: 15, color: "#D5DEEB", lineHeight: 1.45 }}>Groomer, daycare, boarding or a new vet. We email the actual files for you, and you get a copy.</p>
        </div>

        {sent ? (
          <div className="p-5 text-center">
            <div className="mx-auto flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: "#EAF6EE", color: tokens.green }}><Icon name="check" size={32} /></div>
            <h3 className="mt-3" style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, color: tokens.navy }}>Sent to {sent}</h3>
            <p className="mt-1" style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink, lineHeight: 1.5 }}>A copy is in your inbox. When they tap &ldquo;Got them&rdquo;, you&apos;ll see Received here.</p>
            <button type="button" onClick={onClose} className="ppg-btn ppg-btn-primary mt-5 w-full">Done</button>
          </div>
        ) : (
          <form onSubmit={send} className="grid gap-4 p-5">
            <div>
              <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>Who is it for?</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {WHO.map((w) => (
                  <button key={w} type="button" onClick={() => setWho(who === w ? "" : w)} className="ppg-chip-btn" aria-pressed={who === w} style={who === w ? { background: tokens.navy, color: "#fff", borderColor: tokens.navy } : undefined}>{w}</button>
                ))}
              </div>
            </div>
            <label style={label}>Their name <span style={{ fontWeight: 400, color: tokens.muted, fontSize: 13.5 }}>(optional)</span>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Happy Paws Grooming" style={input} />
            </label>
            <label style={label}>Their email
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} autoComplete="off" placeholder="frontdesk@example.com" style={input} />
            </label>

            <div>
              <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>What to send</div>
              <div className="grid gap-2 mt-2">
                <label className="flex items-center gap-3 rounded-2xl px-3.5 py-3" style={{ border: `2px solid ${summary ? tokens.navy : tokens.line}`, background: summary ? tokens.sky : "#fff", cursor: "pointer" }}>
                  <input type="checkbox" checked={summary} onChange={(e) => setSummary(e.target.checked)} style={{ width: 20, height: 20, flexShrink: 0 }} />
                  <span className="min-w-0">
                    <span className="block" style={{ fontFamily: font.body, fontSize: 15.5, fontWeight: 700, color: tokens.navy }}>One-page summary</span>
                    <span className="block" style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>{vax ? `Their details and ${vax} vaccine${vax === 1 ? "" : "s"} with due dates` : "Their details, microchip and records"}</span>
                  </span>
                </label>
                {docs.map((d) => (
                  <label key={d.id} className="flex items-center gap-3 rounded-2xl px-3.5 py-3" style={{ border: `2px solid ${picked.includes(d.id) ? tokens.navy : tokens.line}`, background: picked.includes(d.id) ? tokens.sky : "#fff", cursor: "pointer" }}>
                    <input type="checkbox" checked={picked.includes(d.id)} onChange={() => toggle(d.id)} style={{ width: 20, height: 20, flexShrink: 0 }} />
                    <span className="min-w-0">
                      <span className="block" style={{ fontFamily: font.body, fontSize: 15.5, fontWeight: 700, color: tokens.navy }}>{d.document_type || "Document"}</span>
                      <span className="block" style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>{d.expires_on ? `Valid until ${fmt(d.expires_on)}` : "Original file"}</span>
                    </span>
                  </label>
                ))}
                {!docs.length ? <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>Tip: upload their rabies certificate in Docs. Groomers and boarding usually ask for it.</p> : null}
              </div>
            </div>

            <label style={label}>Add a note <span style={{ fontWeight: 400, color: tokens.muted, fontSize: 13.5 }}>(optional)</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} placeholder={`For ${pet.name}'s stay on Saturday`} style={{ ...input, resize: "vertical" }} />
            </label>

            <label className="flex items-start gap-3" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45, cursor: "pointer" }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 22, height: 22, marginTop: 1, flexShrink: 0 }} />
              <span>I agree to send these records to {email || "this email"}.</span>
            </label>
            {err ? <p role="alert" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.primary }}>{err}</p> : null}
            <button type="submit" disabled={busy || !agree || nothing || !email} className="ppg-btn ppg-btn-primary w-full" style={{ opacity: busy || !agree || nothing || !email ? 0.6 : 1 }}>
              <Icon name="send" size={18} /><span style={{ marginLeft: 8 }}>{busy ? "Sending…" : "Send records"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
