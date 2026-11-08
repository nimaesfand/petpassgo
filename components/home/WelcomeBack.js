"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { findAirport } from "../../lib/airports";
import { tokens, font } from "../../lib/theme";
import Icon from "../Icon";

// Signed-in owners see their own next trip and shortcuts at the top of the homepage.
// Signed-out visitors see nothing here (the trip form below is unchanged).
function city(label) {
  const a = findAirport(label);
  return a ? a.city : String(label || "").split(",")[0];
}
function daysTo(date) {
  if (!date) return null;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  return Math.round((new Date(`${date}T12:00:00Z`) - new Date(`${today}T12:00:00Z`)) / 86400000);
}

export default function WelcomeBack() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const u = s?.session?.user;
      if (!u) return;
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
      const [{ data: trips }, { data: pets }] = await Promise.all([
        supabase.from("trips").select("id,origin,destination,travel_date,paid,pet_id").eq("paid", true).gte("travel_date", today).order("travel_date", { ascending: true }).limit(1),
        supabase.from("pets").select("id,name,passport_issued_at").order("created_at", { ascending: true }),
      ]);
      if (!alive) return;
      const trip = trips?.[0] || null;
      const list = pets || [];
      const pet = (trip && list.find((p) => p.id === trip.pet_id)) || list[0] || null;
      setData({ first: String(u.user_metadata?.first_name || "").trim(), trip, pets: list, pet });
    })().catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!data) return null;
  const { first, trip, pets, pet } = data;
  const petName = pet?.name || "Your pet";
  const d = trip ? daysTo(trip.travel_date) : null;
  const issued = pets.filter((p) => p.passport_issued_at).length;
  const headline = trip
    ? `${petName} flies to ${city(trip.destination)} ${d === 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`}.`
    : pets.length ? `Where is ${petName} flying next?` : "Add your pet to get started.";

  const Tile = ({ href, icon, title, sub }) => (
    <a href={href} className="rounded-2xl p-4 flex flex-col gap-1.5 ppg-lift" style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)", color: "#fff", textDecoration: "none" }}>
      <span style={{ color: tokens.gold }}><Icon name={icon} size={24} /></span>
      <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16 }}>{title}</span>
      <span style={{ fontFamily: font.body, fontSize: 13, color: "rgba(255,255,255,.72)" }}>{sub}</span>
    </a>
  );

  return (
    <div className="rounded-3xl p-6 md:p-8 mb-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center ppg-rise" style={{ background: tokens.navy, color: "#fff" }}>
      <div>
        <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: tokens.gold }}>{first ? `WELCOME BACK, ${first.toUpperCase()}` : "WELCOME BACK"}</div>
        <h2 style={{ fontFamily: font.display, lineHeight: 1.08 }} className="text-[28px] md:text-[36px] font-bold mt-2 mb-5">{headline}</h2>
        <div className="flex flex-wrap gap-2.5">
          {trip ? (
            <a href="/account?tab=trips" className="rounded-full px-5 py-3" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>Open Travel Pass</a>
          ) : null}
          <a href="/assessment" className="rounded-full px-5 py-3" style={{ background: trip ? "rgba(255,255,255,.1)" : tokens.primary, border: trip ? "1px solid rgba(255,255,255,.3)" : "none", color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>{trip ? "Plan another trip" : "Plan a trip"}</a>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Tile href="/account?tab=vault" icon="paw" title="My Pets" sub={pets.length ? `${pets.length} pet${pets.length === 1 ? "" : "s"}${issued ? ` · ${issued} passport${issued === 1 ? "" : "s"}` : ""}` : "Add a pet"} />
        <Tile href="/account?tab=vault&focus=id" icon="tag" title="Pet ID" sub={pets.length ? "QR tag & lost help" : "Set up a QR tag"} />
        <Tile href="/account?tab=trips" icon="plane" title="My Trips" sub={trip ? `${city(trip.origin)} → ${city(trip.destination)}` : "No upcoming trip"} />
      </div>
    </div>
  );
}
