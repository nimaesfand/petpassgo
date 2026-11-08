"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { tokens, font } from "../../../lib/theme";
import BusinessProfile from "../../../components/discover/BusinessProfile";
import { CATEGORIES } from "../../../lib/discover";

async function call(path, opts = {}) {
  const { data: s } = await supabase.auth.getSession();
  const r = await fetch(path, { ...opts, headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" } });
  return { r, j: await r.json().catch(() => ({})) };
}

const TABS = [["pending", "To review"], ["changes_requested", "Waiting on business"], ["published", "Live"], ["rejected", "Not approved"]];

export default function AdminBusinesses() {
  const [tab, setTab] = useState("pending");
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(null);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");

  async function load(t = tab) {
    setData(null);
    const { r, j } = await call(`/api/admin/businesses?status=${t}`);
    if (!r.ok) { setMsg(j.error || "Owner only."); setData({ businesses: [], counts: {} }); return; }
    setData(j);
  }
  useEffect(() => { load(tab); }, [tab]);

  async function act(b, action, extra = {}) {
    setMsg("");
    const { r, j } = await call("/api/admin/businesses", { method: "POST", body: JSON.stringify({ id: b.id, action, note, ...extra }) });
    if (!r.ok) { setMsg(j.error || "Didn't work."); return; }
    setMsg(action === "approve" ? `${b.name} is live. The owner was emailed.` : action === "plan" ? "Plan updated." : "Saved. The owner was emailed.");
    setNote(""); setOpen(null); load();
  }

  const btn = (bg, color = "#fff") => ({ fontFamily: font.body, fontWeight: 700, fontSize: 14, borderRadius: 999, padding: "9px 16px", background: bg, color, border: "none", cursor: "pointer" });

  return (
    <main style={{ background: tokens.sky, minHeight: "100vh", fontFamily: font.body }} className="px-4 py-8">
      <div className="max-w-[1100px] mx-auto">
        <a href="/admin" style={{ color: tokens.navy, fontSize: 14.5, fontWeight: 600 }}>← Owner support</a>
        <h1 style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: tokens.navy }} className="mt-2">Discover listings</h1>
        <p style={{ color: tokens.muted, fontSize: 14.5 }}>Check each listing before approving: real business, matching website or phone, photos they own, a clear pet policy. Every action is logged and the owner is emailed.</p>
        <div className="flex flex-wrap gap-2 mt-5">
          {TABS.map(([k, label]) => (
            <button key={k} onClick={() => { setTab(k); setOpen(null); }} style={{ ...btn(tab === k ? tokens.navy : "#fff", tab === k ? "#fff" : tokens.navy), border: `1px solid ${tokens.line}` }}>
              {label}{data?.counts?.[k] ? ` · ${data.counts[k]}` : ""}
            </button>
          ))}
        </div>
        {msg && <div className="rounded-xl p-3 mt-4" style={{ background: "#FFF9EC", fontSize: 14.5 }}>{msg}</div>}
        <div className="mt-5 flex flex-col gap-3">
          {data === null ? <div className="rounded-2xl ppg-shimmer" style={{ height: 90 }} /> : data.businesses.length === 0 ? <div style={{ color: tokens.muted }}>Nothing here.</div> : data.businesses.map((b) => (
            <div key={b.id} className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: tokens.navy }}>{b.name}</div>
                  <div style={{ fontSize: 14, color: tokens.muted }}>{CATEGORIES.find((c) => c.slug === b.category)?.short_name} · {b.online_only ? "Online" : `${b.city}, ${b.state}`} · {b.plan} · {b.owner_email || "no owner"} · updated {new Date(b.updated_at).toLocaleDateString()}</div>
                </div>
                <button onClick={() => setOpen(open === b.id ? null : b.id)} style={btn(tokens.navy)}>{open === b.id ? "Close" : "Review"}</button>
              </div>
              {open === b.id && (
                <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start">
                  <BusinessProfile b={b} />
                  <div className="rounded-2xl p-4 flex flex-col gap-3 lg:sticky lg:top-4" style={{ background: tokens.sky }}>
                    <div style={{ fontWeight: 700, color: tokens.navy }}>Checks</div>
                    <ul style={{ fontSize: 14, color: tokens.ink, lineHeight: 1.6 }} className="list-disc pl-5">
                      <li>Website and phone belong to this business{b.website ? <> (<a href={/^https?:/.test(b.website) ? b.website : `https://${b.website}`} target="_blank" rel="noopener noreferrer" style={{ color: tokens.primary }}>open site</a>)</> : ""}</li>
                      <li>Address matches a real location (or online only)</li>
                      <li>Photos look like their own, nothing offensive</li>
                      <li>Pet policy is specific and believable</li>
                      <li>No medical claims or guarantees in the description</li>
                    </ul>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Note to the business (needed for 'Ask for a change')" style={{ border: `1px solid ${tokens.line}`, borderRadius: 12, padding: 10, fontSize: 14.5 }} />
                    <div className="flex flex-wrap gap-2">
                      {b.status !== "published" && <button onClick={() => act(b, "approve")} style={btn(tokens.green)}>Approve and publish</button>}
                      <button onClick={() => act(b, "changes")} style={btn("#8A5A00")}>Ask for a change</button>
                      {b.status !== "rejected" && <button onClick={() => act(b, "reject")} style={btn("#B4321C")}>Don&apos;t approve</button>}
                      {b.status === "published" && <button onClick={() => act(b, "unpublish")} style={btn(tokens.muted)}>Unpublish</button>}
                    </div>
                    <div className="mt-2" style={{ fontSize: 13.5, color: tokens.muted }}>Plan (set by hand until paid plans open):</div>
                    <div className="flex gap-2">{["free", "featured", "premium"].map((p) => <button key={p} onClick={() => act(b, "plan", { plan: p })} style={{ ...btn(b.plan === p ? tokens.navy : "#fff", b.plan === p ? "#fff" : tokens.navy), border: `1px solid ${tokens.line}` }}>{p}</button>)}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
