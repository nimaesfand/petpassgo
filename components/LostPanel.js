"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import ShareButtons from "./ShareButtons";
import { fmtDate } from "../lib/lost";
import { US_STATES, stateName, placeFromArea, visitorArea, lostTitle } from "../lib/places";
import { BUCKET, SignedImg } from "../lib/storage";
import { PetIllustration } from "./PetIdCard";

const todayPT = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
const when = (ts) => new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" }) + " PT";
const COMMUNITY_ON = process.env.NEXT_PUBLIC_COMMUNITY_ENABLED === "true";

// Owner-only lost-pet controls for one pet (RLS limits every query to the owner's rows).
// Default: one "Report lost" button. Flow: confirm flyer details -> publish -> live.
export default function LostPanel({ pet, userId, onChanged }) {
  const [report, setReport] = useState(undefined);
  const [messages, setMessages] = useState([]);
  const [scans, setScans] = useState([]);
  const [trip, setTrip] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photo, setPhoto] = useState(pet.photo_url || null);
  const [err, setErr] = useState("");

  async function load() {
    const [r, m, s] = await Promise.all([
      supabase.from("pet_lost_reports").select("*").eq("pet_id", pet.id).eq("status", "lost").maybeSingle(),
      supabase.from("finder_messages").select("*").eq("pet_id", pet.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("pet_scans").select("id,area,scanned_at").eq("pet_id", pet.id).order("scanned_at", { ascending: false }).limit(50),
    ]);
    setReport(r.data || null);
    setMessages(m.data || []);
    setScans(s.data || []);
  }
  useEffect(() => {
    load();
    supabase.from("trips").select("airline,destination,travel_date").eq("pet_id", pet.id).order("created_at", { ascending: false }).limit(1).then(({ data }) => setTrip(data?.[0] || null));
  }, [pet.id]);
  useEffect(() => setPhoto(pet.photo_url || null), [pet.photo_url]);

  async function openForm() {
    setErr("");
    setForm({ area: "", city: "", state: "", date: todayPT(), note: "", useTrip: false, flight: "", showContact: !!pet.show_contact_on_public_id, toBoard: true, cityTouched: false });
    const g = await visitorArea();
    setForm((f) => f && ({ ...f, state: f.state || g?.state || "", city: f.city || g?.city || "" }));
  }
  function setArea(area) {
    setForm((f) => {
      const p = placeFromArea(area);
      return { ...f, area, city: !f.cityTouched && p.city ? p.city : f.city, state: !f.stateTouched && p.state ? p.state : f.state };
    });
  }

  async function changePhoto(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setPhotoBusy(true);
    const path = `${userId}/${pet.id}/profile-photo-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (!error) { await supabase.from("pets").update({ photo_url: path }).eq("id", pet.id).eq("user_id", userId); setPhoto(path); onChanged?.(); }
    setPhotoBusy(false);
  }

  async function publish(e) {
    e.preventDefault();
    if (/\d+\s+\w+\s+(st|street|ave|avenue|rd|road|blvd|dr|drive|ln|lane|ct|court|way)\b/i.test(form.area)) {
      setErr("Please use a neighborhood, park or cross-streets, not a street address.");
      return;
    }
    if (!form.city.trim() || !form.state) { setErr("Add the city and state so the right local board sees it."); return; }
    setBusy(true); setErr("");
    if (form.showContact !== !!pet.show_contact_on_public_id) {
      await supabase.from("pets").update({ show_contact_on_public_id: form.showContact }).eq("id", pet.id).eq("user_id", userId);
    }
    const { error } = await supabase.rpc("publish_lost_report", {
      p_pet_id: pet.id,
      p_area: form.area.trim(),
      p_date: form.date || null,
      p_note: form.note.trim() || null,
      p_state: form.state,
      p_city: form.city.trim(),
      p_trip_airline: form.useTrip && trip ? trip.airline : null,
      p_trip_destination: form.useTrip && trip ? trip.destination : null,
      p_trip_flight: form.useTrip ? form.flight.trim() || null : null,
      p_post_board: COMMUNITY_ON && form.toBoard,
    });
    setBusy(false);
    if (error) return setErr(error.message && !/^\d/.test(error.message) && error.message.length < 120 ? error.message : "Couldn't publish. Please try again.");
    setForm(null);
    onChanged?.();
    load();
  }

  async function reunited() {
    if (!confirm(`Mark ${pet.name} as home safe? The poster comes down right away and scan locations are deleted.`)) return;
    setBusy(true);
    const { error } = await supabase.rpc("mark_pet_reunited", { pet_id: pet.id });
    setBusy(false);
    if (error) return setErr("Couldn't update. Please try again.");
    load();
  }
  async function turnOff() {
    if (!confirm(`Turn off ${pet.name}'s lost report? The poster and board post come down. Use this if it was made by mistake.`)) return;
    setBusy(true);
    const { error } = await supabase.rpc("cancel_lost_report", { p_pet_id: pet.id });
    setBusy(false);
    if (error) return setErr("Couldn't turn it off. Please try again.");
    load();
  }

  async function deleteMessage(id) {
    await supabase.from("finder_messages").delete().eq("id", id);
    setMessages((m) => m.filter((x) => x.id !== id));
  }

  const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, borderRadius: 10, padding: "9px 12px", width: "100%", background: "#fff" };
  const label = { fontFamily: font.body, fontSize: 13.5, fontWeight: 700, color: tokens.navy, display: "grid", gap: 4 };
  if (report === undefined) return null;

  if (!report && !form) {
    return (
      <button data-report-lost onClick={openForm} className="w-full rounded-full px-5 py-3 mt-3" style={{ border: `2px solid ${tokens.primary}`, color: tokens.primary, fontFamily: font.body, fontWeight: 700, fontSize: 16, background: "#fff", cursor: "pointer" }}>
        Report {pet.name} lost
      </button>
    );
  }

  if (!report && form) {
    return (
      <form data-lost-confirm onSubmit={publish} className="mt-3 rounded-2xl p-4 grid gap-3" style={{ border: `2px solid ${tokens.primary}`, background: "#fff" }}>
        <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 21, color: tokens.navy }}>Confirm {pet.name}'s flyer</div>
        <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: tokens.sky }}>
          <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: 64, height: 64, background: "#E8EEF7" }}>
            {photo ? <SignedImg value={photo} alt={pet.name} className="object-cover" style={{ width: "100%", height: "100%" }} /> : <PetIllustration type={pet.animal_type} size={64} />}
          </div>
          <div className="min-w-0 flex-1">
            <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 15, color: tokens.navy }}>{lostTitle(pet.name)}</div>
            <label style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: tokens.primary, cursor: "pointer" }}>
              {photoBusy ? "Uploading…" : photo ? "Change photo" : "Add a photo"}
              <input type="file" accept="image/*" onChange={changePhoto} style={{ display: "none" }} />
            </label>
          </div>
        </div>
        <label style={label}>Last seen (neighborhood, park or cross-streets)
          <input required maxLength={120} style={input} value={form.area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Clark St & Ventura Blvd, Woodland Hills" />
        </label>
        <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 110px" }}>
          <label style={label}>City
            <input required maxLength={80} style={input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value, cityTouched: true })} placeholder="City" />
          </label>
          <label style={label}>State
            <select required style={input} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value, stateTouched: true })}>
              <option value="">State</option>
              {US_STATES.map(([c]) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <label style={label}>Date last seen
          <input type="date" required max={todayPT()} style={input} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </label>
        <label style={label}>Note for finders (optional, public)
          <textarea maxLength={500} rows={2} style={input} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Red collar. Friendly but shy, don't chase." />
        </label>
        <fieldset className="grid gap-2" style={{ border: "none", padding: 0, margin: 0 }}>
          <legend style={{ ...label, marginBottom: 4 }}>How finders reach you</legend>
          {[[false, "Private messages only (recommended)"], [true, `Also show ${pet.emergency_contact_name || "my emergency contact"}${pet.emergency_contact_phone ? "'s phone" : ""}`]].map(([v, l]) => (
            <label key={String(v)} className="flex items-center gap-2" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, opacity: v && !pet.emergency_contact_phone ? 0.5 : 1 }}>
              <input type="radio" name={`contact-${pet.id}`} disabled={v && !pet.emergency_contact_phone} checked={form.showContact === v} onChange={() => setForm({ ...form, showContact: v })} style={{ accentColor: tokens.primary, width: 18, height: 18 }} />
              {l}
            </label>
          ))}
        </fieldset>
        {trip && (
          <label className="flex items-center gap-2" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>
            <input type="checkbox" checked={form.useTrip} onChange={(e) => setForm({ ...form, useTrip: e.target.checked })} style={{ accentColor: tokens.primary, width: 18, height: 18 }} />
            Lost while traveling ({trip.airline} to {trip.destination})
          </label>
        )}
        {form.useTrip && (
          <label style={label}>Flight number (optional)
            <input maxLength={20} style={input} value={form.flight} onChange={(e) => setForm({ ...form, flight: e.target.value })} placeholder="e.g. DL 1234" />
          </label>
        )}
        {COMMUNITY_ON && (
          <label className="flex items-center gap-2" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>
            <input type="checkbox" checked={form.toBoard} onChange={(e) => setForm({ ...form, toBoard: e.target.checked })} style={{ accentColor: tokens.primary, width: 18, height: 18 }} />
            Post to the {form.city.trim() || "local"} Lost &amp; found board
          </label>
        )}
        {err && <div role="alert" style={{ fontFamily: font.body, color: "#B42318", fontSize: 14 }}>{err}</div>}
        <div className="flex gap-2 items-center">
          <button disabled={busy} className="rounded-full px-6 py-3 flex-1" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}>{busy ? "Publishing…" : "Publish lost poster"}</button>
          <button type="button" onClick={() => setForm(null)} className="rounded-full px-4 py-3" style={{ fontFamily: font.body, fontWeight: 600, color: tokens.navy, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
        </div>
      </form>
    );
  }

  const place = [report.city, report.state].filter(Boolean).join(", ");
  const boardHref = `/community/lost-and-found${report.state ? `?state=${encodeURIComponent(report.state)}${report.city ? `&city=${encodeURIComponent(report.city)}` : ""}` : ""}`;
  return (
    <div data-lost-live className="mt-3 rounded-2xl overflow-hidden" style={{ border: `2px solid ${tokens.primary}`, background: "#fff" }}>
      <div className="px-4 py-3 flex items-center justify-between gap-2" style={{ background: tokens.primary }}>
        <div style={{ fontFamily: font.body, fontWeight: 800, letterSpacing: "0.1em", color: "#fff", fontSize: 13.5 }}>LOST · POSTER IS LIVE</div>
        <a href={`/id/${pet.id}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: font.body, fontWeight: 700, color: "#fff", textDecoration: "underline", fontSize: 14.5 }}>View poster</a>
      </div>
      <div className="p-4 grid gap-4">
        <div style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink }}>
          Last seen <b>{report.last_seen_area}</b>{place ? ` · ${place}` : ""}{report.last_seen_date ? ` · ${fmtDate(report.last_seen_date)}` : ""}
          {report.trip_airline ? ` · while traveling with ${report.trip_airline}${report.trip_flight ? ` ${report.trip_flight}` : ""}${report.trip_destination ? ` to ${report.trip_destination}` : ""}` : ""}
        </div>
        {COMMUNITY_ON && report.board_post_id && (
          <a href={boardHref} className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: tokens.sky, textDecoration: "none", fontFamily: font.body }}>
            <span style={{ fontWeight: 700, color: tokens.navy, fontSize: 15 }}>Posted on the {report.city || stateName(report.state)} Lost &amp; found board</span>
            <span style={{ color: tokens.navy, fontWeight: 700 }}>›</span>
          </a>
        )}
        <ShareButtons pet={pet} lost={report} />

        <div>
          <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 17, color: tokens.navy }} className="mb-2">Messages from finders ({messages.length})</div>
          {messages.length === 0 ? (
            <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}>None yet. Finders write to you from the poster.</div>
          ) : messages.map((m) => (
            <div key={m.id} className="rounded-xl p-3 mb-2" style={{ background: tokens.sky, fontFamily: font.body }}>
              <div style={{ fontSize: 13, color: tokens.muted }}>{when(m.created_at)}</div>
              <div style={{ fontSize: 15.5, whiteSpace: "pre-wrap" }}>{m.message}</div>
              <div className="flex justify-between items-center mt-1" style={{ fontSize: 14 }}>
                <span>Contact: <b>{m.finder_contact || "not provided"}</b></span>
                <button onClick={() => deleteMessage(m.id)} style={{ color: tokens.muted, textDecoration: "underline" }}>Delete</button>
              </div>
            </div>
          ))}
          {messages.length > 0 && <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }} className="mt-1">Meet in a public place, and never pay anyone before {pet.name} is back.</div>}
        </div>

        <details>
          <summary style={{ fontFamily: font.display, fontWeight: 700, fontSize: 17, color: tokens.navy, cursor: "pointer" }}>Poster views ({scans.length})</summary>
          {scans.length === 0 ? (
            <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mt-2">No views yet. You'll see the time and approximate city of each view.</div>
          ) : (
            <ul style={{ fontFamily: font.body, fontSize: 14.5 }} className="mt-2">
              {scans.slice(0, 15).map((s) => <li key={s.id}>{when(s.scanned_at)}: {s.area || "area unknown"}</li>)}
            </ul>
          )}
        </details>

        {err && <div role="alert" style={{ color: "#B42318", fontSize: 14 }}>{err}</div>}
        <button disabled={busy} onClick={reunited} className="rounded-full px-6 py-3" style={{ background: tokens.green, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}>
          {pet.name} is home: mark reunited
        </button>
        <button data-turn-off disabled={busy} onClick={turnOff} className="rounded-full px-6 py-2.5" style={{ background: "#fff", color: tokens.navy, border: `2px solid ${tokens.line}`, fontFamily: font.body, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          Turn off report (made by mistake)
        </button>
      </div>
    </div>
  );
}
