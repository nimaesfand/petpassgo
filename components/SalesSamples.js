"use client";
import { useState } from "react";
import { tokens, font } from "../lib/theme";

// Sales samples. EVERYTHING here is fictional and labelled EXAMPLE/SAMPLE:
// sample pet "Buddy", sample route, generic steps only. No real airline
// requirements, forms, deadlines or business listings are shown pre-payment.

const badge = { fontFamily: font.mono, fontSize: 11, letterSpacing: "0.12em", color: tokens.navy, background: tokens.gold, borderRadius: 999, padding: "3px 10px", fontWeight: 700 };

function FakeQr() {
  const cells = [0,1,2,4,6,8,10,11,14,17,20,21,24,27,30,33,36,39,42,45,48,50,53,56,59,62,65,68,71,74,77,80];
  return (
    <svg width="86" height="86" viewBox="0 0 86 86" role="img" aria-label="Sample QR code (not a real code)" style={{ background: "#fff", borderRadius: 8 }}>
      {Array.from({ length: 81 }, (_, i) => cells.includes(i) ? <rect key={i} x={6 + (i % 9) * 8.2} y={6 + Math.floor(i / 9) * 8.2} width="6.4" height="6.4" rx="1.4" fill={tokens.navy} /> : null)}
    </svg>
  );
}

export function SamplePetIdCard() {
  const [back, setBack] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setBack((b) => !b)} aria-pressed={back} className="w-full text-left rounded-3xl p-5 min-h-[44px]" style={{ background: tokens.navy, border: "none", cursor: "pointer", boxShadow: "0 18px 40px rgba(20,33,61,.28)" }}>
        {!back ? (
          <div className="flex items-center gap-4">
            <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 72, height: 72, background: tokens.gold, fontFamily: font.display, fontSize: 28, fontWeight: 700, color: tokens.navy }}>B</div>
            <div className="flex-1 min-w-0">
              <span style={badge}>EXAMPLE PET ID</span>
              <div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 700, color: "#fff" }} className="mt-2">Buddy</div>
              <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.sky, opacity: 0.9 }}>Sample dog · Mixed breed · Friendly, loves people</div>
              <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.gold }} className="mt-1">Tap to see what a finder sees →</div>
            </div>
            <FakeQr />
          </div>
        ) : (
          <div>
            <span style={badge}>EXAMPLE — FINDER’S VIEW</span>
            <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: "#fff" }} className="mt-3 mb-2">Found Buddy? You’re in the right place.</div>
            <ul style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.sky, lineHeight: 1.7, paddingLeft: 18 }}>
              <li>Message Buddy’s owner right from this page — no phone number shown</li>
              <li>Chip number on file (sample: ••••0000) and vet clinic listed</li>
              <li>Allergies & meds shown only if the owner chose to share them</li>
            </ul>
            <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.gold }} className="mt-2">Tap to flip back →</div>
          </div>
        )}
      </button>
      <p style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.muted }} className="mt-2">Buddy is a fictional sample pet. This QR is a drawing, not a real code — yours is generated for your pet when you join.</p>
    </div>
  );
}

const SAMPLE_TABS = [["checklist", "Checklist"], ["flight", "Flight"], ["weather", "Weather & spots"], ["reminders", "Reminders"]];

export function SampleTravelPass() {
  const [tab, setTab] = useState("checklist");
  const row = (title, meta, done) => (
    <li key={title} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: tokens.paper }}>
      <span style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}>{done ? "✓ " : ""}{title}</span>
      <span style={{ fontFamily: font.mono, fontSize: 11, color: tokens.stamp, whiteSpace: "nowrap" }}>{meta}</span>
    </li>
  );
  return (
    <div className="rounded-3xl p-5 sm:p-6" style={{ background: "#fff", border: `1.5px solid ${tokens.gold}` }}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <span style={badge}>EXAMPLE TRAVEL PASS</span>
        <span style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>Buddy · Sample City → Sample City</span>
      </div>
      <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }} className="mb-4">This is a sample with made-up details so you can see everything inside. Your pass is built for your real trip — airline-specific steps stay locked until you unlock.</p>
      <div role="tablist" aria-label="Sample Travel Pass sections" className="flex flex-wrap gap-1 mb-4 p-1 rounded-full" style={{ background: tokens.sky }}>
        {SAMPLE_TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="rounded-full px-4 py-2 min-h-[40px]" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, background: tab === k ? tokens.navy : "transparent", color: tab === k ? "#fff" : tokens.ink, border: "none", cursor: "pointer" }}>{l}</button>
        ))}
      </div>
      {tab === "checklist" && (
        <ul className="space-y-2">
          {row("Reserve your pet’s spot with the airline", "30 DAYS BEFORE", true)}
          {row("Vet visit & health documents in the vault", "2 WEEKS BEFORE", false)}
          {row("Check the carrier fits and is airline-approved size", "1 WEEK BEFORE", false)}
          {row("Pack documents, food and a familiar blanket", "DAY BEFORE", false)}
        </ul>
      )}
      {tab === "flight" && (
        <div className="rounded-2xl p-4" style={{ background: tokens.navy }}>
          <div style={{ fontFamily: font.mono, fontSize: 11.5, color: tokens.gold, letterSpacing: "0.1em" }}>LIVE FLIGHT — SAMPLE</div>
          <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: "#fff" }} className="mt-1">Sample flight XX123 · On time</div>
          <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.sky }}>Departs 9:05 AM · Terminal A · Gate 7 → Arrives 12:40 PM</div>
          <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.sky, opacity: 0.8 }} className="mt-1">On your real pass this updates live, with delays, terminal and gate.</div>
        </div>
      )}
      {tab === "weather" && (
        <div>
          <div className="flex gap-3 flex-wrap mb-3">
            {[["DEPART · SAMPLE", "72° / 54°F", "Mild — good flying weather"], ["ARRIVE · SAMPLE", "85° / 66°F", "Warm — keep water handy"]].map(([l, t, s]) => (
              <div key={l} className="rounded-xl p-4 flex-1 min-w-[150px]" style={{ background: tokens.sky }}>
                <div style={{ fontFamily: font.mono, fontSize: 11, color: tokens.muted }}>{l}</div>
                <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: tokens.navy }}>{t}</div>
                <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.ink }}>{s}</div>
              </div>
            ))}
          </div>
          <ul className="space-y-2">
            {row("Pet relief areas at both airports, mapped", "IN YOUR PASS", false)}
            {row("Sample Veterinary Clinic — near your arrival airport", "SAMPLE LISTING", false)}
            {row("Sample Dog Park & Sample Pet Store nearby", "SAMPLE LISTING", false)}
          </ul>
          <p style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }} className="mt-2">We also check your airline’s checked-pet temperature rules for you when a forecast runs hot or cold.</p>
        </div>
      )}
      {tab === "reminders" && (
        <ul className="space-y-2">
          {row("30 days before — start documents", "EMAIL + IN-APP", false)}
          {row("7 days before — confirm reservations & carrier", "EMAIL + IN-APP", false)}
          {row("1 day before — pack & print copies", "EMAIL + IN-APP", false)}
          {row("Travel day — one calm morning checklist", "DAY-OF MODE", false)}
        </ul>
      )}
      <p style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }} className="mt-4">Plus: tips from other travelers on your airline’s community board, and a calm day-of-travel mode on flight day.</p>
    </div>
  );
}
