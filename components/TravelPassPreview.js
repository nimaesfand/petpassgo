"use client";

import { useState } from "react";
import Icon from "./Icon";
import { tokens, font } from "../lib/theme";
import { PASS_TAB_LIST, PassTabs, RouteLine, SoftCard, StatusChip, TextButton } from "./travelPassUi";

const DEMO_STEPS = [
  "Add your pet",
  "Save the travel date",
  "Check whether your pet will fit",
  "Look up the flight",
  "Pack your documents",
  "Read your reminders",
];

const DEMO_REMINDERS = [
  { icon: "calendar", title: "30 days before you fly", when: "Mar 19 · sample" },
  { icon: "check", title: "A week before you fly", when: "Apr 11 · sample" },
  { icon: "plane", title: "Flight day", when: "Apr 18 · sample" },
];

function CheckMark({ on }) {
  return (
    <span aria-hidden className="flex items-center justify-center flex-shrink-0 rounded-full" style={{ width: 28, height: 28, background: on ? "#EAF6EE" : tokens.sky, color: on ? tokens.green : tokens.muted }}>
      <Icon name={on ? "check" : "clock"} size={16} />
    </span>
  );
}

export default function TravelPassPreview() {
  const [section, setSection] = useState("overview");
  const [done, setDone] = useState(() => DEMO_STEPS.map((_, i) => i < 4));
  const complete = done.filter(Boolean).length;

  function toggle(i) {
    setDone((rows) => rows.map((v, n) => (n === i ? !v : v)));
  }

  return (
    <div className="mt-8">
      <p className="mb-3" style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink }}>
        <span className="rounded-full px-3 py-1 mr-2" style={{ background: tokens.gold, color: tokens.navy, fontWeight: 700 }}>Preview</span>
        Sample trip only. Airline rules, real dates, and flight details stay hidden until you pay.
      </p>

      <div className="rounded-3xl p-5 sm:p-6 mb-4" style={{ background: tokens.navy }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 64, height: 64, background: tokens.gold, color: tokens.navy }}>
              <Icon name="paw" size={30} />
            </div>
            <div className="min-w-0">
              <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", color: tokens.gold }}>YOUR TRIP · SAMPLE</div>
              <div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>Maple</div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span style={{ fontFamily: font.body, fontSize: 16, color: tokens.sky }}>Golden retriever · 64 lb</span>
                <span className="rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 15 }}>Dog</span>
              </div>
            </div>
          </div>
          <div className="sm:text-right">
            <div style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: "#fff" }}>Apr 18 · sample</div>
            <div style={{ fontFamily: font.body, fontSize: 16, color: tokens.sky }}>LAX to JFK · Nonstop · 5h 15m</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.sky }}>Trip readiness</span>
            <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: "#fff" }}>{complete} of {DEMO_STEPS.length} steps complete</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.18)" }}>
            <div className="h-full rounded-full" style={{ width: `${Math.round((complete / DEMO_STEPS.length) * 100)}%`, background: "#7DCEA0" }} />
          </div>
        </div>
        <button type="button" onClick={() => setSection("documents")} className="mt-4 w-full sm:w-auto rounded-full px-5 py-3" style={{ background: "#fff", color: tokens.navy, fontFamily: font.body, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", minHeight: 48 }}>View your Pet ID</button>
      </div>

      <PassTabs tabs={PASS_TAB_LIST} value={section} onChange={setSection} label="Travel Pass preview sections" />

      {section === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SoftCard title="Flight status" action={<StatusChip>On schedule</StatusChip>}>
            <RouteLine from="LAX" to="JFK" />
            <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }} className="mt-3">Apr 18 · 9:10 AM sample · Nonstop · 5h 15m</p>
            <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-1">Sample status. A live flight shows here after you pay and add a flight number.</p>
            <div className="mt-3"><TextButton onClick={() => setSection("flight")}>View full flight details</TextButton></div>
          </SoftCard>
          <SoftCard title="Weather at destination">
            <div className="flex items-center gap-3">
              <span style={{ color: tokens.navy }}><Icon name="cloudSun" size={36} /></span>
              <div>
                <div style={{ fontFamily: font.display, fontSize: 32, fontWeight: 700, color: tokens.navy, lineHeight: 1 }}>68°</div>
                <div style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>New York · Partly cloudy</div>
              </div>
            </div>
            <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }} className="mt-3">High 72° · Low 54° · Wind 9 mph</p>
            <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-1">Sample weather. The paid pass shows live weather at both airports, plus a cargo heat and cold check.</p>
          </SoftCard>
          <SoftCard title="Vets and pet stores" action={null}>
            <div className="flex gap-4">
              {[["stethoscope", "Vets"], ["bag", "Pet stores"]].map(([icon, label]) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <span className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: tokens.sky, color: tokens.navy }}><Icon name={icon} size={28} /></span>
                  <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>{label}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-3">Names stay hidden until you pay. They come from public map data near arrival and departure.</p>
            <div className="mt-3"><TextButton onClick={() => setSection("destination")}>View map & locations</TextButton></div>
          </SoftCard>
          <SoftCard title="Travel checklist">
            <p style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.green }} className="mb-2">{complete} of {DEMO_STEPS.length} complete</p>
            <ul className="space-y-2">
              {DEMO_STEPS.slice(0, 4).map((step, i) => (
                <li key={step} className="flex items-center gap-2">
                  <CheckMark on={done[i]} />
                  <span style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>{step}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3"><TextButton onClick={() => setSection("checklist")}>Open the checklist</TextButton></div>
          </SoftCard>
          <SoftCard title="Important reminders">
            <ul className="space-y-3">
              {DEMO_REMINDERS.map((r) => (
                <li key={r.title} className="flex items-center gap-3">
                  <span className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 40, height: 40, background: tokens.sky, color: tokens.navy }}><Icon name={r.icon} size={20} /></span>
                  <span>
                    <span className="block" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{r.title}</span>
                    <span className="block" style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>{r.when}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-3">Sample dates. On a paid pass, reminders use your travel date and any Vault expiration dates.</p>
          </SoftCard>
          <SoftCard title="Your documents">
            <div className="grid grid-cols-2 gap-2">
              {[["Pet ID", true], ["Vaccination records", true], ["DOT form", false], ["Travel Pass summary", true]].map(([label, on]) => (
                <div key={label} className="rounded-xl p-3" style={{ background: tokens.paper }}>
                  <CheckMark on={on} />
                  <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, color: tokens.navy }} className="mt-2">{label}</div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-3">The DOT form is a PDF for a service-dog trip you mark yourself. PetPassGo does not decide that status.</p>
          </SoftCard>
        </div>
      )}

      {section === "flight" && (
        <SoftCard title="Flight and weather">
          <RouteLine from="LAX" to="JFK" />
          <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }} className="mt-3">After you pay, this screen shows live flight status when you add a flight number, weather at both airports, and a cargo temperature check for heat and cold. No airline page is linked on this preview.</p>
        </SoftCard>
      )}

      {section === "checklist" && (
        <SoftCard title="Checklist">
          <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }} className="mb-3">These rows are a sample of the layout. They are not airline rules, and marking one does not save. After you pay, steps split into Do these first and General prep, with due dates and a progress count.</p>
          <ul className="space-y-2">
            {DEMO_STEPS.map((step, i) => (
              <li key={step}>
                <button type="button" onClick={() => toggle(i)} className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left" style={{ background: tokens.paper, border: "none", cursor: "pointer", minHeight: 52 }}>
                  <CheckMark on={done[i]} />
                  <span className="flex-1" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{step}</span>
                  <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: done[i] ? tokens.green : tokens.navy }}>{done[i] ? "Done" : "To do"}</span>
                </button>
              </li>
            ))}
          </ul>
        </SoftCard>
      )}

      {section === "reminders" && (
        <SoftCard title="Reminders">
          <ul className="space-y-3">
            {DEMO_REMINDERS.map((r) => (
              <li key={r.title} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: tokens.paper }}>
                <span className="flex items-center gap-3">
                  <Icon name={r.icon} size={20} />
                  <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{r.title}</span>
                </span>
                <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>{r.when}</span>
              </li>
            ))}
          </ul>
        </SoftCard>
      )}

      {section === "documents" && (
        <SoftCard title="Documents">
          <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }} className="mb-3">Your Pet ID opens from the paid pass. This preview is not a real ID, and nothing here is verified.</p>
          <ul className="space-y-2">
            {["Pet ID", "Vaccination records", "DOT service animal form, when the trip is a service dog", "Travel Pass summary"].map((label) => (
              <li key={label} className="rounded-xl px-4 py-3" style={{ background: tokens.paper, fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }}>{label}</li>
            ))}
          </ul>
        </SoftCard>
      )}

      {section === "destination" && (
        <SoftCard title="Destination">
          <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>Vets and pet stores near where you land, and near where you leave, from public map data. Place names are not shown until the trip is paid.</p>
          <div className="flex gap-4 mt-4">
            {[["stethoscope", "Vets"], ["bag", "Pet stores"]].map(([icon, label]) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <span className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: tokens.sky, color: tokens.navy }}><Icon name={icon} size={28} /></span>
                <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>{label}</span>
              </div>
            ))}
          </div>
        </SoftCard>
      )}
    </div>
  );
}
