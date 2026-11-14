"use client";
import { useState } from "react";
import { tokens, font } from "../lib/theme";
import Icon from "./Icon";
import { findAirport } from "../lib/airports";
import { fmt } from "../lib/travelDates";

// Every answer the CDC Dog Import Form will ask for, ready to copy. CDC's form is
// online and only the owner can submit it; this just makes it a two-minute job.
export const CDC_FORM_URL = "https://www.cdc.gov/importation/dogs/index.html";
const COUNTRY = { MX: "Mexico", CA: "Canada", US: "United States" };

function ageOn(born, on) {
  if (!born || !on) return "";
  const a = new Date(`${String(born).slice(0, 10)}T12:00:00`), b = new Date(`${String(on).slice(0, 10)}T12:00:00`);
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  if (m < 0) return "";
  return m >= 24 ? `${Math.floor(m / 12)} years` : `${m} months`;
}

export function needsCdcSheet(trip, cards = []) {
  if ((trip?.animal_type || "Dog") !== "Dog") return false;
  return cards.some((c) => /cdc dog import/i.test(`${c.title || ""} ${c.description || ""}`));
}

function Row({ label, value, hint }) {
  const [copied, setCopied] = useState(false);
  const missing = !value;
  return (
    <li className="flex items-center justify-between gap-3 py-2.5" style={{ borderTop: `1px solid ${tokens.line}` }}>
      <div className="min-w-0">
        <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>{label}</div>
        <div style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: missing ? "#B45309" : tokens.navy, overflowWrap: "anywhere" }}>{missing ? hint || "Add this to your pet's profile" : value}</div>
      </div>
      {!missing ? (
        <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(String(value)); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }} className="ppg-btn ppg-btn-secondary ppg-btn-compact flex-shrink-0" aria-label={`Copy ${label}`}>
          {copied ? "Copied" : "Copy"}
        </button>
      ) : null}
    </li>
  );
}

export default function CdcAnswerSheet({ trip, pet }) {
  const from = findAirport(trip?.destination);
  const home = findAirport(trip?.origin);
  const country = COUNTRY[from?.country] || "";
  const back = trip?.return_date || "";
  const rows = [
    ["Dog's name", pet?.name],
    ["Age on the day you fly home", ageOn(pet?.date_of_birth, back || trip?.travel_date), pet?.date_of_birth ? "Add your return date" : "Add your dog's birthday"],
    ["Sex", pet?.sex],
    ["Breed", pet?.breed],
    ["Color", pet?.color],
    ["Microchip number", String(pet?.microchip_number || "").replace(/\s/g, ""), "Add the microchip number. CDC requires one"],
    ["Country you're flying back from", country],
    ["Countries your dog was in during the last 6 months", country ? `United States, ${country}` : ""],
    ["Date you arrive in the U.S.", back ? fmt(back) : "", "Add your return date"],
    ["U.S. airport you land at", home ? `${home.city} (${home.code})` : trip?.origin],
  ];
  return (
    <section className="rounded-2xl mb-4 px-4 pt-4 pb-2" style={{ background: "#fff", border: `1px solid ${tokens.line}` }} aria-label="CDC Dog Import Form answers">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 style={{ fontFamily: font.display, fontSize: 19, fontWeight: 800, color: tokens.navy, lineHeight: 1.2 }}>CDC Dog Import Form answers</h3>
          <p className="mt-0.5" style={{ fontFamily: font.body, fontSize: 14.5, lineHeight: 1.45, color: tokens.muted }}>
            Needed to bring {pet?.name || "your dog"} home. Fill it in on CDC&apos;s site a few days before your flight back; these are your answers, ready to copy. The receipt works for repeat trips from {country || "the same country"} for 6 months.
          </p>
        </div>
        <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 34, height: 34, background: "#EAF2FB", color: tokens.navy }}><Icon name="file" size={18} /></span>
      </div>
      <ul className="mt-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {rows.map(([label, value, hint]) => <Row key={label} label={label} value={value} hint={hint} />)}
      </ul>
      <div className="py-3" style={{ borderTop: `1px solid ${tokens.line}` }}>
        <a href={CDC_FORM_URL} target="_blank" rel="noopener" className="ppg-btn ppg-btn-primary">Open the CDC form</a>
        <p className="mt-2" style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted, lineHeight: 1.45 }}>The form also asks for your own name and contact details. Only you can submit it, and it&apos;s free on CDC&apos;s site.</p>
      </div>
    </section>
  );
}
