"use client";

import { useState } from "react";
import Icon from "../Icon";
import { tokens, font } from "../../lib/theme";
import { fmtTripDate } from "../../lib/tripAccess";

// Calendar export (.ics) for every dated step, plus a script for the airline call.

function icsDate(iso) {
  return String(iso).slice(0, 10).replace(/-/g, "");
}
function esc(s) {
  return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function downloadIcs({ trip, petName, steps }) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PetPassGo//Travel Pass//EN", "CALSCALE:GREGORIAN"];
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const add = (uid, date, title, desc) => {
    const next = new Date(`${String(date).slice(0, 10)}T12:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    lines.push("BEGIN:VEVENT", `UID:${uid}@petpassgo.com`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${icsDate(date)}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, "")}`, `SUMMARY:${esc(title)}`, `DESCRIPTION:${esc(desc)}`,
      "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-PT15H", `DESCRIPTION:${esc(title)}`, "END:VALARM", "END:VEVENT");
  };
  for (const s of steps) if (s.dueDate) add(`step-${trip.id}-${s.id}`, s.dueDate, `🐾 ${petName}: ${s.shortTitle || s.title}`, `${s.title || ""}\nOpen your Travel Pass: https://www.petpassgo.com/account?tab=trips`);
  if (trip.travel_date) add(`fly-${trip.id}`, trip.travel_date, `✈️ ${petName} flies today`, "Documents are in your Travel Pass: https://www.petpassgo.com/account?tab=trips");
  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(petName || "pet").replace(/[^a-z0-9]+/gi, "-")}-trip-deadlines.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export function callScript({ trip, pet, facts, service }) {
  const name = pet?.name || "my pet";
  const kind = (pet?.animal_type || trip.animal_type || "pet").toLowerCase();
  const date = trip.travel_date ? fmtTripDate(trip.travel_date) : "[date]";
  const flight = trip.flight_number ? `flight ${trip.flight_number}` : "my flight";
  const route = [trip.origin, trip.destination].map((x) => String(x || "").replace(/\s*\(.*\)$/, "")).filter(Boolean).join(" to ");
  if (service) {
    return `Hi, I'm booked on ${flight} on ${date}, ${route}. My confirmation number is [ ___ ]. I'm traveling with my trained service dog, ${name}. Do you need the DOT Service Animal Air Transportation Form for this trip, and how should I send it to you? ${name} will be on a leash at my feet. Could you note this on my reservation and send me a confirmation email?`;
  }
  const weight = pet?.weight_lb ? `about ${pet.weight_lb} lb` : "[weight] lb";
  return `Hi, I'm booked on ${flight} on ${date}, ${route}. My confirmation number is [ ___ ]. I'd like to add my ${kind}, ${name}, in the cabin. ${name} is a ${pet?.breed || kind}, ${weight}, in a soft-sided carrier that fits under the seat${facts?.carrier ? ` (${facts.carrier})` : ""}. Is there pet space on this flight? Please confirm the fee${facts?.fee ? ` (${facts.fee})` : ""}, add ${name} to my reservation, and email me a confirmation.`;
}

export default function StepsTools({ trip, pet, facts, service, steps }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const petName = pet?.name || "Your pet";
  const text = callScript({ trip, pet, facts, service });
  const dated = steps.filter((s) => s.dueDate).length;
  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }
  return (
    <div className="grid gap-2 mb-4">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => downloadIcs({ trip, petName, steps })} className="ppg-lift flex items-center gap-2 rounded-2xl px-3 py-3 text-left" style={{ background: "#fff", border: `1px solid ${tokens.line}`, cursor: "pointer" }}>
          <span className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 38, height: 38, background: tokens.sky, color: tokens.navy }}><Icon name="calendar" size={19} /></span>
          <span className="min-w-0">
            <span className="block" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 14.5, color: tokens.navy }}>Add to calendar</span>
            <span className="block" style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.muted }}>{dated} deadline{dated === 1 ? "" : "s"} + travel day</span>
          </span>
        </button>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="ppg-lift flex items-center gap-2 rounded-2xl px-3 py-3 text-left" style={{ background: open ? tokens.navy : "#fff", border: `1px solid ${open ? tokens.navy : tokens.line}`, cursor: "pointer" }}>
          <span className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 38, height: 38, background: open ? "rgba(255,255,255,.15)" : tokens.sky, color: open ? "#fff" : tokens.navy }}><Icon name="phone" size={19} /></span>
          <span className="min-w-0">
            <span className="block" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 14.5, color: open ? "#fff" : tokens.navy }}>Calling {trip.airline || "the airline"}?</span>
            <span className="block" style={{ fontFamily: font.body, fontSize: 12.5, color: open ? tokens.sky : tokens.muted }}>What to say</span>
          </span>
        </button>
      </div>
      {open ? (
        <div className="rounded-2xl p-4 ppg-rise" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.55, color: tokens.ink, margin: 0 }}>"{text}"</p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <button type="button" onClick={copy} className="ppg-btn ppg-btn-secondary">{copied ? "Copied" : "Copy"}</button>
            <span style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>Tip: write down the agent's name and ask for the confirmation by email.</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
