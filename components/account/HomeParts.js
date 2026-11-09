"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { SignedImg } from "../../lib/storage";
import { passportMissing } from "../../lib/petProfile";
import { findAirport } from "../../lib/airports";
import { fmtTripDate } from "../../lib/tripAccess";
import { todayPT } from "../../lib/travelDates";
import { tokens, font } from "../../lib/theme";
import { PetIllustration } from "../PetIdCard";
import Icon from "../Icon";

const city = (label) => findAirport(label)?.city || String(label || "").replace(/\s*\(.*\)$/, "").split(",")[0];
const code = (label) => (String(label || "").match(/\(([A-Z]{3})\)/) || [])[1] || "";
const daysTo = (d) => (d ? Math.round((new Date(`${d}T12:00:00Z`) - new Date(`${todayPT()}T12:00:00Z`)) / 86400000) : null);

export function Greeting({ user }) {
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Los_Angeles" }));
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const first = String(user?.user_metadata?.first_name || "").trim();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Los_Angeles" });
  return (
    <div className="mb-6">
      <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: tokens.muted }}>{today}</div>
      <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 34, color: tokens.navy, lineHeight: 1.08 }} className="mt-1">{part}{first ? `, ${first}` : ""}.</h1>
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3 mt-8">
      <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, color: tokens.navy }}>{children}</h2>
      {action}
    </div>
  );
}

// A saved but not-yet-unlocked trip: show it as the trip it is, with one clear next step.
export function UnpaidTripCard({ trip, petName, onOpen }) {
  const d = daysTo(trip.travel_date);
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: tokens.navy, color: "#fff", boxShadow: "0 18px 40px rgba(20,33,61,.18)" }}>
      <div className="p-6 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", color: tokens.gold }}>YOUR NEXT TRIP</span>
          {d != null && d >= 0 && <span className="rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,.12)", fontFamily: font.body, fontSize: 13, fontWeight: 700 }}>{d === 0 ? "Today" : d === 1 ? "Tomorrow" : `${d} days to go`}</span>}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="min-w-0">
            <div style={{ fontFamily: font.display, fontSize: 34, fontWeight: 800, lineHeight: 1 }}>{code(trip.origin) || city(trip.origin)}</div>
            <div style={{ fontFamily: font.body, fontSize: 13.5, color: "rgba(255,255,255,.7)" }} className="mt-1 truncate">{city(trip.origin)}</div>
          </div>
          <div className="flex-1 flex items-center gap-1.5 px-1" aria-hidden="true">
            <span className="flex-1" style={{ borderTop: "2px dashed rgba(255,255,255,.35)" }} />
            <span style={{ color: tokens.gold }}><Icon name="plane" size={20} /></span>
            <span className="flex-1" style={{ borderTop: "2px dashed rgba(255,255,255,.35)" }} />
          </div>
          <div className="min-w-0 text-right">
            <div style={{ fontFamily: font.display, fontSize: 34, fontWeight: 800, lineHeight: 1 }}>{code(trip.destination) || city(trip.destination)}</div>
            <div style={{ fontFamily: font.body, fontSize: 13.5, color: "rgba(255,255,255,.7)" }} className="mt-1 truncate">{city(trip.destination)}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4" style={{ fontFamily: font.body, fontSize: 14.5, color: "rgba(255,255,255,.85)" }}>
          {trip.travel_date && <span className="inline-flex items-center gap-1.5"><Icon name="calendar" size={15} />{fmtTripDate(trip.travel_date)}</span>}
          {trip.airline && <span className="inline-flex items-center gap-1.5"><Icon name="plane" size={15} />{trip.airline}</span>}
          {petName && <span className="inline-flex items-center gap-1.5"><Icon name="paw" size={15} />{petName}</span>}
        </div>
      </div>
      <div className="px-6 md:px-7 py-4 flex flex-wrap items-center justify-between gap-3" style={{ background: "rgba(255,255,255,.06)", borderTop: "1px solid rgba(255,255,255,.1)" }}>
        <span style={{ fontFamily: font.body, fontSize: 14.5, color: "rgba(255,255,255,.85)" }} className="inline-flex items-center gap-2"><Icon name="lock" size={16} />Your checklist is ready. Unlock it to start.</span>
        <button type="button" onClick={onOpen} className="rounded-full px-5 py-2.5" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>Unlock Travel Pass</button>
      </div>
    </div>
  );
}

export function PlanTripCard() {
  return (
    <a href="/assessment" className="rounded-3xl p-6 md:p-7 flex items-center gap-5 ppg-lift" style={{ background: "#fff", border: `1px solid ${tokens.line}`, textDecoration: "none" }}>
      <span className="rounded-2xl flex items-center justify-center shrink-0" style={{ width: 64, height: 64, background: "#FDE8E2", color: tokens.primary }}><Icon name="plane" size={30} /></span>
      <span className="min-w-0 flex-1">
        <span className="block" style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, color: tokens.navy, lineHeight: 1.15 }}>Where are you flying next?</span>
        <span className="block mt-1" style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink }}>Get the exact steps for your airline and your pet.</span>
      </span>
      <span className="hidden sm:inline-flex rounded-full px-5 py-2.5 shrink-0" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 15 }}>Plan a trip</span>
    </a>
  );
}

// Every pet as a card: photo, passport status, one-tap shortcuts.
export function PetsStrip({ userId, onOpen }) {
  const [pets, setPets] = useState(null);
  useEffect(() => {
    if (!userId) return;
    supabase.from("pets").select("*").order("created_at", { ascending: true }).then(({ data }) => setPets(data || []));
  }, [userId]);
  if (pets === null) return <div className="rounded-3xl ppg-shimmer" style={{ height: 150 }} />;
  if (!pets.length) return (
    <button type="button" onClick={() => onOpen()} className="w-full rounded-3xl p-6 flex items-center gap-4 text-left ppg-lift" style={{ background: "#fff", border: `2px dashed ${tokens.line}`, cursor: "pointer" }}>
      <span className="rounded-2xl flex items-center justify-center shrink-0" style={{ width: 56, height: 56, background: "#FFF4DB", color: tokens.navy }}><Icon name="plus" size={26} /></span>
      <span><span className="block" style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800, color: tokens.navy }}>Add your pet</span><span className="block" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>Their profile, passport and Pet ID in one place.</span></span>
    </button>
  );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {pets.map((p) => {
        const missing = passportMissing(p);
        const issued = !!p.passport_issued_at;
        return (
          <div key={p.id} className="rounded-3xl p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl overflow-hidden flex items-center justify-center shrink-0" style={{ width: 72, height: 72, background: "#FBF6EC", border: `2px solid ${tokens.gold}` }}>
                {p.photo_url ? <SignedImg value={p.photo_url} alt={p.name} className="object-cover" style={{ width: "100%", height: "100%" }} /> : <PetIllustration type={p.animal_type} size={62} />}
              </div>
              <div className="min-w-0 flex-1">
                <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, color: tokens.navy, lineHeight: 1.1 }}>{p.name}</div>
                <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="truncate">{[p.breed || p.animal_type, p.weight_lb ? `${p.weight_lb} lb` : null].filter(Boolean).join(" · ")}</div>
                {issued ? (
                  <span className="inline-flex items-center gap-1.5 mt-1.5 rounded-full px-2.5 py-0.5" style={{ background: "#E5F4EE", color: tokens.green, fontFamily: font.body, fontSize: 12.5, fontWeight: 800 }}><Icon name="checkCircle" size={13} />Passport issued</span>
                ) : missing.length ? (
                  <button type="button" onClick={() => onOpen(p.id, "passport")} className="inline-flex items-center gap-1.5 mt-1.5 rounded-full px-2.5 py-0.5" style={{ background: "#FFF4DB", color: "#8A5A00", fontFamily: font.body, fontSize: 12.5, fontWeight: 800, border: "none", cursor: "pointer" }}>
                    Add {missing.slice(0, 2).join(" & ").toLowerCase()}{missing.length > 2 ? ` +${missing.length - 2}` : ""} to issue passport →
                  </button>
                ) : null}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[["passport", "Passport", "passport"], ["id", "Pet ID", "tag"], ["health", "Health", "health"]].map(([k, label, icon]) => (
                <button key={k} type="button" onClick={() => onOpen(p.id, k)} className="rounded-2xl py-3 flex flex-col items-center gap-1" style={{ background: tokens.sky, border: "none", cursor: "pointer", color: tokens.navy, fontFamily: font.body, fontSize: 13.5, fontWeight: 700 }}>
                  <Icon name={icon} size={20} />{label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function QuickActions({ onOpen }) {
  const items = [
    { href: "/assessment", icon: "plane", title: "Plan a trip", sub: "Steps for any airline", bg: "#FDE8E2", color: tokens.primary },
    { onClick: () => onOpen(null, "id"), icon: "tag", title: "Pet ID & QR", sub: "Print or share the tag", bg: "#E7F0FF", color: tokens.navy },
    { onClick: () => onOpen(null, "lost"), icon: "alert", title: "Report lost", sub: "Flyer and alerts fast", bg: "#FFF1EE", color: "#B4321C" },
    { onClick: () => onOpen(null, "health"), icon: "health", title: "Add a record", sub: "Vaccines, meds, vet notes", bg: "#E5F4EE", color: tokens.green },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((it) => {
        const body = (
          <>
            <span className="rounded-xl flex items-center justify-center" style={{ width: 44, height: 44, background: it.bg, color: it.color }}><Icon name={it.icon} size={22} /></span>
            <span className="block mt-3" style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }}>{it.title}</span>
            <span className="block" style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>{it.sub}</span>
          </>
        );
        const style = { background: "#fff", border: `1px solid ${tokens.line}`, textDecoration: "none", cursor: "pointer" };
        return it.href
          ? <a key={it.title} href={it.href} className="rounded-2xl p-4 text-left ppg-lift" style={style}>{body}</a>
          : <button key={it.title} type="button" onClick={it.onClick} className="rounded-2xl p-4 text-left ppg-lift" style={style}>{body}</button>;
      })}
    </div>
  );
}
