"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import { todayPT } from "../lib/travelDates";
import { buildUrgencyItems, deriveStamps, tripBelongsToPet, SAMPLE_DOG } from "../lib/petExtras";

const h3 = { fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy };
const section = { borderTop: `1px solid ${tokens.line}`, paddingTop: 16, marginTop: 16 };
const btn = { fontFamily: font.body, fontWeight: 700, fontSize: 14.5, borderRadius: 999, padding: "9px 16px", cursor: "pointer" };
const input = { fontFamily: font.body, fontSize: 15.5, border: `2px solid ${tokens.line}`, borderRadius: 10, padding: "9px 12px", width: "100%", background: "#fff" };
const fmtDate = (v) => (v ? new Date(`${v}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");

function useFirstPetId() {
  const [firstId, setFirstId] = useState(null);
  useEffect(() => { supabase.from("pets").select("id").order("created_at", { ascending: true }).limit(1).then(({ data }) => setFirstId(data?.[0]?.id || null)); }, []);
  return firstId;
}

// Clearly fictional sample. Client-side only — never written to any table.
export function SampleDogPreview({ petId, compact = false }) {
  const key = `ppg_sample_dismissed_${petId || "none"}`;
  const [gone, setGone] = useState(false);
  useEffect(() => { try { setGone(localStorage.getItem(key) === "1"); } catch {} }, [key]);
  if (gone) return null;
  return (
    <div className="rounded-xl p-3 mt-3" style={{ background: "#FFF9EC", border: `1.5px dashed ${tokens.gold}`, fontFamily: font.body }} aria-label="Sample preview">
      <div className="flex items-start justify-between gap-2">
        <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: "0.08em", color: tokens.primary }}>SAMPLE · {SAMPLE_DOG.name} · Sample dog</div>
        <button type="button" aria-label="Dismiss sample" onClick={() => { setGone(true); try { localStorage.setItem(key, "1"); } catch {} }} style={{ background: "none", border: "none", color: tokens.muted, fontSize: 16, cursor: "pointer", lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ fontSize: 14.5, color: tokens.ink }} className="mt-1">This is what it looks like once your records are in — {SAMPLE_DOG.breed}:</div>
      {!compact && <div className="mt-2 space-y-1">{SAMPLE_DOG.rows.map((r) => (
        <div key={r.name} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "#fff" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: tokens.navy }}>{r.name}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: r.tone === "bad" ? tokens.stamp : r.tone === "warn" ? "#8A5A00" : tokens.green }}>{r.status}</span>
        </div>))}
      </div>}
      <div style={{ fontSize: 13.5, color: tokens.muted }} className="mt-2">{SAMPLE_DOG.name}'s Care Card would show feeding, walks, meds, quirks, and who to call. Add a real record and this sample goes away.</div>
    </div>
  );
}

// One compact card: overdue (red) -> expiring soon (amber) -> expires before the next trip ends.
export function WhatsNeededNext({ pet }) {
  const firstId = useFirstPetId();
  const [state, setState] = useState(null);
  useEffect(() => { (async () => {
    const today = todayPT();
    const [{ data: health }, { data: docs }, { data: trips }] = await Promise.all([
      supabase.from("pet_health_records").select("id,name,kind,expires_on").eq("pet_id", pet.id),
      supabase.from("documents").select("id,document_type,expires_on").eq("pet_id", pet.id),
      supabase.from("trips").select("id,origin,destination,travel_date,return_date,paid,pet_id").eq("paid", true).gte("travel_date", today).order("travel_date", { ascending: true }),
    ]);
    const nextTrip = (trips || []).find((t) => tripBelongsToPet(t, pet.id, firstId)) || null;
    const items = buildUrgencyItems({ healthRecords: health || [], documents: docs || [], nextTrip, today })
      .map((it) => it.source === "document" ? { ...it, href: `#documents-${pet.id}` } : it);
    setState({ items, hasData: (health || []).length + (docs || []).length > 0, nextTrip });
  })(); }, [pet.id, firstId]);
  if (!state) return null;
  return (
    <section style={section} aria-label="What's needed next">
      <div style={h3}>⏰ What's needed next</div>
      {state.items.length === 0 ? (
        <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mt-1">Nothing is due for {pet.name} right now. 🎉</p>
      ) : (
        <div className="mt-2 space-y-1.5">{state.items.slice(0, 5).map((it) => (
          <a key={it.key} href={it.href || "#health-passport"} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5" style={{ background: it.tone === "bad" ? "#FDE8E2" : it.tone === "warn" ? "#FFF3D6" : tokens.paper, textDecoration: "none" }}>
            <span style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 700, color: tokens.navy }}>{it.name}{it.travelBlocking ? " · before your trip" : ""}</span>
            <span style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 800, color: it.tone === "bad" ? tokens.stamp : "#8A5A00", whiteSpace: "nowrap" }}>{it.label}</span>
          </a>))}
          {state.items.length > 5 && <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>+ {state.items.length - 5} more below</div>}
        </div>
      )}
      {!state.hasData && <SampleDogPreview petId={pet.id} />}
    </section>
  );
}

// Private by default. Earned only from paid trips already flown; share is an opt-in image download.
export function TravelStamps({ pet }) {
  const firstId = useFirstPetId();
  const [stamps, setStamps] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { (async () => {
    const { data } = await supabase.from("trips").select("id,origin,destination,airline,travel_date,return_date,paid,pet_id").eq("paid", true).order("travel_date", { ascending: false });
    setStamps(deriveStamps((data || []).filter((t) => tripBelongsToPet(t, pet.id, firstId)), todayPT()));
  })(); }, [pet.id, firstId]);
  async function shareImage() {
    if (!stamps?.length) return; setBusy(true);
    try {
      const canvas = document.createElement("canvas"); canvas.width = 900; canvas.height = 560; const c = canvas.getContext("2d");
      c.fillStyle = "#14213D"; c.fillRect(0, 0, 900, 560); c.fillStyle = "#F2B84B"; c.font = "700 24px system-ui"; c.fillText("PETPASSGO · TRAVEL STAMPS", 44, 62);
      c.fillStyle = "#fff"; c.font = "700 44px system-ui"; c.fillText(`${pet.name}'s trips`, 44, 122);
      c.font = "24px system-ui"; let y = 180;
      for (const s of stamps.slice(0, 6)) { c.fillText(`✈  ${s.origin} → ${s.destination} · ${fmtDate(s.travelDate)}`, 44, y); y += 44; }
      c.fillStyle = "#B9C4D6"; c.font = "20px system-ui"; c.fillText("Private keepsake from PetPassGo", 44, 520);
      const a = document.createElement("a"); a.download = `${(pet.name || "pet").replace(/[^a-z0-9]+/gi, "-")}-travel-stamps.png`; a.href = canvas.toDataURL("image/png"); a.click();
    } finally { setBusy(false); }
  }
  if (stamps === null) return null;
  return (
    <section style={section} aria-label="Travel stamps">
      <details>
        <summary style={{ ...h3, cursor: "pointer" }}>✈️ {pet.name}'s travel stamps{stamps.length ? ` (${stamps.length})` : ""}</summary>
        {stamps.length === 0 ? (
          <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mt-2">No travel stamps yet — they appear here after a Travel Pass trip.</p>
        ) : <>
          <div className="flex flex-wrap gap-2 mt-3">{stamps.map((s) => (
            <span key={s.id} className="rounded-full px-3.5 py-2" style={{ background: tokens.sky, border: `1.5px dashed ${tokens.navy}`, fontFamily: font.body, fontSize: 13.5, fontWeight: 700, color: tokens.navy }}>✈ {s.origin} → {s.destination} · {fmtDate(s.travelDate)}</span>
          ))}</div>
          <button type="button" disabled={busy} onClick={shareImage} style={{ ...btn, background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}` }} className="mt-3">{busy ? "Making image…" : "Download stamps image"}</button>
        </>}
      </details>
    </section>
  );
}

const VET_MODES = [["nearby", "📍 Nearby"], ["emergency", "🚑 Emergency"], ["destination", "✈️ At a destination"]];

export function FindAVet({ pet }) {
  const [mode, setMode] = useState("nearby");
  const [q, setQ] = useState("");
  const [spots, setSpots] = useState(null);
  const [place, setPlace] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function run(extra = {}) {
    setLoading(true); setMsg(""); setSpots(null);
    try {
      const { data: s } = await supabase.auth.getSession();
      const params = new URLSearchParams({ mode, ...(extra.lat != null ? { lat: String(extra.lat), lon: String(extra.lon) } : { q: extra.q ?? q }) });
      const r = await fetch(`/api/find-vet?${params}`, { headers: { "x-sb-token": s?.session?.access_token || "" } });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Couldn't search right now.");
      setSpots(j.spots || []); setPlace(j.place?.label || "");
      if ((j.spots || []).length === 0) setMsg(mode === "emergency" ? "No emergency vets found nearby. Call your vet or an animal hospital directly if this is urgent." : "No vets found there. Try a nearby city or airport.");
    } catch (e) { setMsg(e.message || "Couldn't search right now."); }
    setLoading(false);
  }
  function useLocation() {
    if (!navigator.geolocation) return setMsg("Location isn't available on this device — type a town or ZIP instead.");
    navigator.geolocation.getCurrentPosition((p) => run({ lat: p.coords.latitude, lon: p.coords.longitude }), () => setMsg("Couldn't get your location — type a town or ZIP instead."), { timeout: 10000 });
  }
  return (
    <section id="find-a-vet" style={section} aria-label="Find a vet">
      <details>
        <summary style={{ ...h3, cursor: "pointer" }}>🩺 Find a vet for {pet.name}</summary>
        <div className="flex gap-2 flex-wrap mt-3" role="tablist" aria-label="Vet search mode">
          {VET_MODES.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => { setMode(k); setSpots(null); setMsg(""); }} className="rounded-full px-4 py-2" style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 700, background: mode === k ? tokens.navy : tokens.sky, color: mode === k ? "#fff" : tokens.navy, border: "none", cursor: "pointer" }}>{l}</button>)}
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); run(); } }} placeholder={mode === "destination" ? "City or airport — e.g. Cancún or CUN" : "Town or ZIP"} style={{ ...input, flex: "1 1 200px" }} aria-label="Place" />
          <button type="button" disabled={loading} onClick={() => run()} style={{ ...btn, background: tokens.primary, color: "#fff", border: "none" }}>{loading ? "Searching…" : "Search"}</button>
          {mode !== "destination" && <button type="button" disabled={loading} onClick={useLocation} style={{ ...btn, background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}` }}>Use my location</button>}
        </div>
        {mode === "emergency" && <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }} className="mt-2">If {pet.name} is hurt or very sick, call ahead while you travel.</p>}
        {place && spots && <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }} className="mt-2">Near {place}</div>}
        {msg && <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.stamp }} className="mt-2">{msg}</div>}
        {spots && spots.length > 0 && <ul className="mt-2 divide-y" style={{ borderColor: tokens.line }}>{spots.map((s, i) => (
          <li key={`${s.name}-${i}`} className="py-2.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div style={{ fontFamily: font.body, fontSize: 15.5, fontWeight: 700, color: tokens.navy }}>{s.name}</div>
              <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>{s.type === "emergency_vet" ? (s.verified24 ? "24-hour · hours listed on OpenStreetMap" : "Emergency vet — call ahead, hours not verified") : "Vet"}{s.address ? ` · ${s.address}` : ""}{s.phone ? ` · ${s.phone}` : ""}</div>
            </div>
            <a href={s.map} target="_blank" rel="noopener noreferrer" className="rounded-full px-3.5 py-1.5 flex-shrink-0" style={{ background: tokens.sky, color: tokens.navy, fontFamily: font.body, fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}>Map</a>
          </li>))}
        </ul>}
        <div style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.muted }} className="mt-3">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color: tokens.primary }}>OpenStreetMap contributors</a></div>
      </details>
    </section>
  );
}
