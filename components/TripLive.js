"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import { todayPT, daysUntil } from "../lib/travelDates";
import { findAirport } from "../lib/airports";
import { PET_RELIEF } from "../lib/petRelief";
import { AIRLINE_GUIDES } from "../lib/airlineGuides";
import { getSignedUrl, SignedImg } from "../lib/storage";
import { PRICES as P } from "../lib/pricing";

// The trip's pet (or the owner's first pet), for names and photos throughout.
export function useTripPet(trip) {
  const [pet, setPet] = useState(null);
  useEffect(() => {
    if (!trip) return;
    (async () => {
      const q = supabase.from("pets").select("id,name,photo_url,animal_type");
      const { data } = trip.pet_id ? await q.eq("id", trip.pet_id).limit(1) : await q.order("created_at").limit(1);
      setPet((data && data[0]) || null);
    })();
  }, [trip?.id]);
  return pet;
}

export function isTravelDay(trip) {
  return !!trip?.travel_date && trip.travel_date === todayPT();
}

function PetAvatar({ pet, size = 56 }) {
  return (
    <div className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ width: size, height: size, background: tokens.gold, border: "3px solid #fff" }}>
      {pet?.photo_url ? (
        <SignedImg value={pet.photo_url} alt={pet.name} className="object-cover" style={{ width: "100%", height: "100%" }} />
      ) : (
        <span style={{ fontSize: size * 0.5 }}>{/cat/i.test(pet?.animal_type || "") ? "🐈" : "🐕"}</span>
      )}
    </div>
  );
}

export function TripCountdown({ trip, pet, done, total }) {
  const name = pet?.name || "Your pet";
  const days = trip.travel_date ? daysUntil(trip.travel_date, todayPT()) : null;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = setTimeout(() => setShown(pct), 150); return () => clearTimeout(t); }, [pct]);
  let headline;
  if (days == null) headline = `${name}'s trip is being planned`;
  else if (days > 1) headline = `${name} flies in ${days} days`;
  else if (days === 1) headline = `${name} flies tomorrow!`;
  else if (days === 0) headline = `${name} flies today!`;
  else headline = `${name}'s trip is done. Welcome home!`;
  const r = 26, c = 2 * Math.PI * r;
  return (
    <div className="rounded-2xl p-5 mb-4 flex items-center gap-4" style={{ background: "#fff", border: `1.5px solid ${tokens.gold}` }}>
      <PetAvatar pet={pet} />
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: font.display, fontSize: 21, fontWeight: 700, color: tokens.navy, lineHeight: 1.2 }}>{headline}</div>
        <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mt-1">
          {total > 0 ? (done === total ? "Every step is checked off. Great job! 🎉" : `${done} of ${total} steps done. Check them off below as you go.`) : "Your checklist is below."}
        </div>
      </div>
      {total > 0 && (
        <svg width="64" height="64" viewBox="0 0 64 64" aria-label={`${pct}% ready`} className="flex-shrink-0">
          <circle cx="32" cy="32" r={r} fill="none" stroke={tokens.line} strokeWidth="6" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={pct === 100 ? tokens.green : tokens.stamp} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c - (c * shown) / 100} transform="rotate(-90 32 32)" style={{ transition: "stroke-dashoffset 900ms ease" }} />
          <text x="32" y="37" textAnchor="middle" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 14, fill: tokens.navy }}>{pct}%</text>
        </svg>
      )}
    </div>
  );
}

export function PetReliefCard({ airportLabel, title }) {
  const a = findAirport(airportLabel);
  const data = a && PET_RELIEF[a.code];
  if (!data) return null;
  const groups = [["before", "Before security"], ["after", "After security"]];
  return (
    <details className="rounded-xl p-5 mb-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <summary style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy, cursor: "pointer" }}>🌿 {title || "Pet relief areas"} at {a.code}</summary>
      {groups.map(([k, label]) => {
        const rows = data.areas.filter((x) => x.where === k);
        if (!rows.length) return null;
        return (
          <div key={k} className="mt-3">
            <div style={{ fontFamily: font.mono, fontSize: 12, letterSpacing: "0.08em", color: tokens.stamp }} className="mb-1">{label.toUpperCase()}</div>
            <ul className="space-y-1">
              {rows.map((x, i) => (
                <li key={i} style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}><b>{x.terminal}:</b> {x.spot}</li>
              ))}
            </ul>
          </div>
        );
      })}
      <div style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.muted }} className="mt-3">
        From the airport's official website (checked {data.checked}). Locations can change, so follow airport signs. <a href={data.source} target="_blank" rel="noopener noreferrer" style={{ color: tokens.primary }}>Airport page</a>
      </div>
    </details>
  );
}

// Members-only community pulse for the trip's airline.
export function CommunityPulse({ trip, isMember }) {
  const guide = AIRLINE_GUIDES.find((g) => g.name === trip.airline);
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!guide) return;
    (async () => {
      const since = new Date(Date.now() - 7 * 864e5).toISOString();
      const { count } = await supabase.from("community_posts").select("id", { count: "exact", head: true }).eq("board", guide.slug).is("parent_id", null).gte("created_at", since);
      let newest = null;
      if (isMember) {
        const { data } = await supabase.from("community_posts").select("title,body,author_name,created_at").eq("board", guide.slug).is("parent_id", null).eq("post_type", "tip").order("created_at", { ascending: false }).limit(1);
        newest = data?.[0] || null;
      }
      setState({ count: count || 0, newest });
    })();
  }, [guide?.slug, isMember]);
  if (!guide || !state) return null;
  const n = state.count;
  return (
    <div className="rounded-xl p-5 mb-4" style={{ background: tokens.sky, border: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>
        💬 {n === 0 ? `Be the first to share a tip about ${guide.name} this week` : `${n} traveler${n === 1 ? "" : "s"} posted about ${guide.name} this week`}
      </div>
      {isMember ? (
        <>
          {state.newest && (
            <blockquote className="mt-2 rounded-lg p-3" style={{ background: "#fff", fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}>
              {state.newest.title && <b>{state.newest.title}. </b>}{String(state.newest.body || "").slice(0, 220)}
              <div style={{ fontSize: 12.5, color: tokens.muted }} className="mt-1">— {state.newest.author_name || "A member"}</div>
            </blockquote>
          )}
          <a href={`/community/${guide.slug}`} className="inline-block mt-3 rounded-full px-5 py-2" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 600, fontSize: 14.5, textDecoration: "none" }}>Open the {guide.name} board</a>
        </>
      ) : (
        <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mt-1">Members can read the newest tips and post their own. Membership is {P.member}/mo.</div>
      )}
    </div>
  );
}

export function DayOfMode({ trip, pet, actionItems = [], onShowFull }) {
  const name = pet?.name || "your pet";
  const [docs, setDocs] = useState([]);
  useEffect(() => {
    (async () => {
      let q = supabase.from("documents").select("id,document_type,file_url,pet_id,trip_id");
      q = pet?.id ? q.or(`pet_id.eq.${pet.id},trip_id.eq.${trip.id}`) : q.eq("trip_id", trip.id);
      const { data } = await q;
      setDocs(data || []);
    })();
  }, [trip.id, pet?.id]);
  async function openDoc(d) {
    const u = await getSignedUrl(d.file_url);
    if (u) window.open(u, "_blank", "noopener");
  }
  const origin = findAirport(trip.origin);
  const steps = [
    `Give ${name} a last walk and a small, early meal`,
    "Head to the airport early. Many airlines require pets to be checked in at the counter, so leave extra time",
    origin && PET_RELIEF[origin.code] ? `Use a pet relief area before security (see below)` : "Find a pet relief area before security if your airport has one",
    `At security, carry ${name} through the scanner while the carrier goes through the X-ray`,
    `Keep ${name}'s documents open on your phone (below)`,
  ];
  return (
    <div className="mb-4">
      <div className="rounded-2xl p-6 mb-4 text-center" style={{ background: tokens.navy, color: "#fff" }}>
        <div className="flex justify-center mb-3"><PetAvatar pet={pet} size={72} /></div>
        <div style={{ fontFamily: font.mono, fontSize: 12, color: tokens.gold, letterSpacing: "0.12em" }}>TRAVEL DAY</div>
        <div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 700 }} className="mt-1">Today's the day, {name}! ✈️</div>
        <div style={{ fontFamily: font.body, fontSize: 15, opacity: 0.8 }} className="mt-1">{trip.airline} · {trip.origin} → {trip.destination}</div>
      </div>
      <div className="rounded-xl p-5 mb-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: tokens.navy }} className="mb-2">What to do right now</div>
        <ol className="space-y-2">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3" style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink }}>
              <span className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 26, height: 26, background: tokens.gold, color: tokens.navy, fontWeight: 700, fontSize: 13 }}>{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        {actionItems.length > 0 && (
          <div className="mt-4 rounded-lg p-3" style={{ background: "#FFF9EC", fontFamily: font.body, fontSize: 14.5 }}>
            Still open on your checklist: {actionItems.slice(0, 3).map((r) => r.title).join(" · ")}{actionItems.length > 3 ? ` +${actionItems.length - 3} more` : ""}
          </div>
        )}
      </div>
      <div className="rounded-xl p-5 mb-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: tokens.navy }} className="mb-2">{pet?.name ? `${pet.name}'s documents` : "Documents"}, ready to show</div>
        {docs.length === 0 ? (
          <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}>No documents uploaded yet. Add them under Pet Profile so they're one tap away.</div>
        ) : (
          <div className="grid gap-2">
            {docs.map((d) => (
              <button key={d.id} onClick={() => openDoc(d)} className="w-full text-left rounded-xl px-4 py-3.5 flex items-center justify-between" style={{ background: tokens.sky, fontFamily: font.body, fontSize: 16, fontWeight: 600, color: tokens.navy }}>
                <span>📄 {d.document_type || "Document"}</span><span>Open →</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <PetReliefCard airportLabel={trip.origin} title="Pet relief areas" />
      <PetReliefCard airportLabel={trip.destination} title="When you land: pet relief" />
      <button onClick={onShowFull} className="w-full rounded-full py-3" style={{ background: "#fff", border: `2px solid ${tokens.navy}`, color: tokens.navy, fontFamily: font.body, fontWeight: 600 }}>Show my full checklist</button>
    </div>
  );
}
