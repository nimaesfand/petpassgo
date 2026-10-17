"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { tokens, font } from "../../lib/theme";

async function call(path, opts = {}) { const { data: s } = await supabase.auth.getSession(); const r = await fetch(path, { ...opts, headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "", ...(opts.headers || {}) } }); return { r, j: await r.json().catch(() => ({})) }; }
const btn = { fontFamily: font.body, fontWeight: 700, fontSize: 14, borderRadius: 999, padding: "8px 14px", background: tokens.navy, color: "#fff" };

export default function AdminPage() {
  const [email, setEmail] = useState(""); const [results, setResults] = useState([]); const [c, setC] = useState(null); const [msg, setMsg] = useState(""); const [days, setDays] = useState(30);
  async function search(e) { e.preventDefault(); setMsg(""); const { r, j } = await call(`/api/admin?email=${encodeURIComponent(email)}`); if (!r.ok) setMsg(j.error || "Owner only."); else setResults(j.results || []); }
  async function load(id) { const { r, j } = await call(`/api/admin?id=${id}`); if (r.ok) setC(j.customer); else setMsg(j.error); }
  async function act(body) { const { r, j } = await call("/api/admin", { method: "POST", body: JSON.stringify(body) }); setMsg(r.ok ? (j.sent === false && body.action === "help_links" ? "Help links ready below (email isn't configured, so nothing was sent)." : "Done ✓") : j.error || "Failed"); if (r.ok && c) load(c.id); if (j.links) setMsg(`Help links: ${j.links.join(" · ")}`); }
  return <main style={{ background: tokens.sky, minHeight: "100vh", fontFamily: font.body }} className="px-4 py-8"><div className="max-w-[860px] mx-auto">
    <h1 style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: tokens.navy }}>Owner support</h1>
    <p style={{ color: tokens.muted, fontSize: 14.5 }} className="mt-1">Private owner view. Passwords are never shown or handled here. Every change is logged.</p>
    <form onSubmit={search} className="flex gap-2 mt-5"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Search customer by email" style={{ flex: 1, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "11px 14px", fontSize: 16 }} /><button style={btn}>Search</button></form>
    {msg && <div className="rounded-xl p-3 mt-3" style={{ background: "#FFF9EC", fontSize: 14.5 }}>{msg}</div>}
    <div className="space-y-2 mt-4">{results.map((x) => <button key={x.id} onClick={() => load(x.id)} className="w-full text-left rounded-xl p-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}><b style={{ color: tokens.navy }}>{x.email}</b><span style={{ color: tokens.muted, fontSize: 13 }}> · joined {new Date(x.created_at).toLocaleDateString()}</span></button>)}</div>
    {c && <div className="rounded-2xl p-5 mt-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: tokens.navy }}>{c.email}</div>
      <section className="mt-4"><h2 style={{ fontWeight: 700, color: tokens.navy }}>Membership</h2><p style={{ fontSize: 14.5, color: tokens.muted }}>{c.membership ? `${c.membership.status}${c.membership.current_period_end ? ` · ends ${new Date(c.membership.current_period_end).toLocaleDateString()}` : ""}` : "No membership row"}</p>
      <div className="flex gap-2 items-center mt-2 flex-wrap"><input type="number" min="1" max="3650" value={days} onChange={(e) => setDays(e.target.value)} style={{ width: 90, border: `2px solid ${tokens.line}`, borderRadius: 10, padding: "8px 10px" }} /><button style={btn} onClick={() => act({ action: "grant_days", user_id: c.id, days: Number(days) })}>Grant / extend days</button><button style={{ ...btn, background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}` }} onClick={() => act({ action: "help_links", user_id: c.id })}>Resend help links</button></div></section>
      <section className="mt-5"><h2 style={{ fontWeight: 700, color: tokens.navy }}>Pets</h2>{c.pets.map((p) => <div key={p.id} style={{ fontSize: 14.5 }} className="py-1 border-t">{p.name} · {p.breed || p.animal_type} {p.microchip_number ? `· chip ${p.microchip_number}` : ""}</div>)}</section>
      <section className="mt-5"><h2 style={{ fontWeight: 700, color: tokens.navy }}>Trips</h2>{c.trips.map((t) => <div key={t.id} className="py-2 border-t flex items-center justify-between gap-2 flex-wrap"><span style={{ fontSize: 14.5 }}>{t.origin} → {t.destination} · {t.airline} · {t.travel_date || "no date"} · <b>{t.paid ? "paid" : "unpaid"}</b></span><button style={{ ...btn, padding: "6px 11px", fontSize: 13 }} onClick={() => act({ action: "trip_paid", user_id: c.id, trip_id: t.id, paid: !t.paid })}>Mark {t.paid ? "unpaid" : "paid"}</button></div>)}</section>
      <section className="mt-5"><h2 style={{ fontWeight: 700, color: tokens.navy }}>Payments</h2>{c.purchases.length ? c.purchases.map((x) => <div key={x.id} style={{ fontSize: 14.5 }} className="py-1 border-t">{new Date(x.created_at).toLocaleDateString()} · {x.kind} · {x.amount_cents != null ? `$${(x.amount_cents/100).toFixed(2)}` : ""}</div>) : <p style={{ fontSize: 14.5, color: tokens.muted }}>No recorded purchases.</p>}</section>
    </div>}
  </div></main>;
}
