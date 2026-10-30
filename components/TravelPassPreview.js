"use client";

import { useState } from "react";
import { tokens, font } from "../lib/theme";
import Icon from "./Icon";
import MaskedLine from "./MaskedLine";

const TABS = [
  ["overview", "Overview"],
  ["flight", "Flight & weather"],
  ["checklist", "Checklist"],
  ["reminders", "Reminders"],
];

function Shell({ children }) {
  return (
    <div className="rounded-2xl p-4 sm:p-5 mb-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      {children}
    </div>
  );
}

function Title({ children }) {
  return <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: tokens.navy }} className="mb-2">{children}</div>;
}

function Note({ children }) {
  return <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }} className="mt-2">{children}</p>;
}

export default function TravelPassPreview() {
  const [section, setSection] = useState("overview");
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState(false);

  return (
    <div>
      <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.muted }} className="mb-4">
        This is the Travel Pass layout. It is not a trip. Airline rules, dates, and flight details stay hidden until you pay.
      </p>

      <div className="rounded-xl p-5 mb-4" style={{ background: tokens.navy }}>
        <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", color: tokens.gold }}>YOUR TRAVEL PASS</div>
        <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: "#fff" }} className="mt-1">Your trip</div>
        <div className="flex items-center gap-2 flex-wrap mt-3" style={{ color: "#fff" }}>
          <MaskedLine label="Departure, after you pay" width="88px" />
          <span aria-hidden="true" style={{ fontFamily: font.body, fontSize: 16 }}>→</span>
          <MaskedLine label="Arrival, after you pay" width="88px" />
        </div>
        <div className="mt-3"><MaskedLine label="Airline and date, after you pay" width="180px" /></div>
        <div className="mt-4">
          <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", color: tokens.sky }}>TRIP READINESS</div>
          <div className="w-full h-[6px] rounded-full mt-2" style={{ background: "rgba(255,255,255,0.15)" }} />
          <p style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.45, color: tokens.sky }} className="mt-2">The bar fills as you check steps off, after you pay.</p>
        </div>
      </div>

      <div role="tablist" aria-label="Travel Pass sections" className="flex flex-wrap gap-1 mb-4 p-1 rounded-2xl" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        {TABS.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={section === k} onClick={() => setSection(k)} className="rounded-full px-4 py-2 min-h-[44px]" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, background: section === k ? tokens.navy : "transparent", color: section === k ? "#fff" : tokens.ink, border: "none", cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {section === "overview" && (
        <>
          <Shell>
            <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", color: tokens.muted }}>FLIGHT STATUS</div>
            <div className="mt-2"><MaskedLine label="Flight status, after you pay" width="160px" /></div>
            <Note>Flight-day status shows here when a flight number is on the pass, with your documents and Pet ID on that screen.</Note>
          </Shell>
          <Shell>
            <Title>Needs action</Title>
            <div className="rounded-xl px-4 py-3" style={{ background: tokens.paper }}><MaskedLine label="Checklist step, after you pay" width="78%" /></div>
            <button type="button" onClick={() => setSection("checklist")} className="rounded-full px-5 py-3 mt-3 min-h-[48px]" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}>Open the checklist</button>
          </Shell>
        </>
      )}

      {section === "flight" && (
        <>
          <Shell>
            <Title>Weather on travel day</Title>
            <div className="flex gap-3 flex-wrap">
              {["Depart", "Arrive"].map((label) => (
                <div key={label} className="rounded-xl p-4 flex-1 min-w-[140px]" style={{ background: tokens.sky }}>
                  <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.muted }}>{label}</div>
                  <div className="mt-2"><MaskedLine label={`${label} weather, after you pay`} width="72px" /></div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg p-3" style={{ background: tokens.sky }}>
              <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>Cargo temperature check</div>
              <div className="mt-2"><MaskedLine label="Cargo temperature note, after you pay" width="86%" /></div>
            </div>
            <Note>Weather at both airports, and a cargo temperature check, appear here for the trip. No airline page is linked on this preview.</Note>
          </Shell>
          <Shell>
            <Title>Nearby</Title>
            <div className="flex gap-2 flex-wrap mb-3">
              {["Vets", "Pet stores"].map((label) => (
                <span key={label} className="rounded-full px-3.5 py-2" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, background: tokens.sky, color: tokens.navy }}>{label}</span>
              ))}
            </div>
            {["Vet", "Pet store"].map((label) => (
              <div key={label} className="flex items-center justify-between gap-3 py-3" style={{ borderTop: `1px solid ${tokens.line}` }}>
                <span style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }}>{label}</span>
                <MaskedLine label={`${label} name, after you pay`} width="46%" />
              </div>
            ))}
            <Note>Vets and pet stores near where you land. Names are not shown until the trip is paid.</Note>
          </Shell>
        </>
      )}

      {section === "checklist" && (
        <Shell>
          <Title>Checklist</Title>
          <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }} className="mb-3">
            After you pay, steps split into Do these first and General prep. A ring shows how much is checked. When every step is checked, the pass says Travel Pass complete and keeps the list. The step text is hidden here. Marking this row does not save.
          </p>
          <article className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-2.5 px-3 py-3 text-left" style={{ minHeight: 56, background: "transparent", border: "none", cursor: "pointer" }}>
              <span aria-hidden className="flex items-center justify-center flex-shrink-0 rounded-xl" style={{ width: 36, height: 36, background: tokens.sky, color: tokens.navy }}><Icon name="check" size={20} /></span>
              <span className="flex-1 min-w-0"><MaskedLine label="Checklist step, after you pay" width="80%" /></span>
              <span className="flex-shrink-0 rounded-full px-2.5 py-1" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, background: done ? "#EAF6EE" : tokens.sky, color: done ? tokens.green : tokens.navy }}>{done ? "Done" : "To do"}</span>
            </button>
            {open && (
              <div className="px-3 pb-3">
                <div className="rounded-xl p-3 mb-2" style={{ background: tokens.paper }}>
                  <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", color: tokens.muted }}>WHAT TO DO</div>
                  <div className="mt-2"><MaskedLine label="Step instructions, after you pay" width="92%" /></div>
                </div>
                <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }} className="mb-2">
                  If the pet’s Vault has a weight and carrier size, and the pass has a published limit, the pass says whether they fit. That comparison is hidden here.
                </p>
                <button type="button" onClick={() => setDone((v) => !v)} className="w-full rounded-full py-3.5 min-h-[48px]" style={{ background: done ? "#fff" : tokens.navy, color: done ? tokens.navy : "#fff", border: done ? `2px solid ${tokens.navy}` : "none", fontFamily: font.body, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
                  {done ? "Mark not done" : "Mark done"}
                </button>
              </div>
            )}
          </article>
        </Shell>
      )}

      {section === "reminders" && (
        <Shell>
          <Title>Reminders</Title>
          {["Before the trip", "Flight day"].map((label) => (
            <div key={label} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-2" style={{ background: tokens.paper }}>
              <span style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }}>{label}</span>
              <MaskedLine label="Reminder date, after you pay" width="96px" />
            </div>
          ))}
          <Note>Reminders are timed from the travel date on the pass. Dates are not shown on this preview.</Note>
        </Shell>
      )}
    </div>
  );
}
