"use client";
import { useEffect, useState } from "react";
import { tokens, font } from "../lib/theme";
import Icon from "./Icon";
import { findAirport } from "../lib/airports";

// "Haven't booked yet": every airline for this kind of route, side by side.
// Picking one continues the trip check with that airline.
const LOOK = {
  easy: { label: "No extra steps", bg: "#EAF6EE", fg: "#15803D" },
  go: { label: "Can fly", bg: "#EAF2FB", fg: "#1D4E89" },
  action: { label: "Extra steps", bg: "#FEF3C7", fg: "#92400E" },
  no: { label: "Not allowed", bg: "#FDECEC", fg: "#B91C1C" },
  check: { label: "Check with airline", bg: "#EEF2F6", fg: "#475569" },
};
const CARGO = { yes: "Cargo option for big pets", no: "Cabin only", restricted: "Cabin only for most pets" };

// "$125 each way ($35 between Hawaiian Islands)" -> "$125 each way"; long notes -> a short line.
function shortFee(f) {
  let x = String(f || "").replace(/\s*\(.*?\)\s*/g, " ").replace(/^(cabin pet fee|pet on board|in-cabin pet fee|international in-cabin pet fee|pet fare):\s*/i, "").trim();
  if (!x) return "";
  x = x.split(/\s*(?:,|;| — | - charged)\s*/)[0];
  return x.length > 34 || !/\$|usd|cad/i.test(x) ? "Fee: confirm when booking" : x;
}

function city(label) { return findAirport(label)?.city || String(label || "").split(",")[0]; }

const SEARCH_NAMES = ["Alaska Airlines", "American Airlines", "Delta", "United", "Southwest", "JetBlue", "Hawaiian Airlines", "Frontier", "Spirit", "Allegiant", "Sun Country"];

// While results load, show each airline being checked, so people see the work.
function Searching({ names, from, to, total }) {
  const [n, setN] = useState(0);
  useEffect(() => { const t = setInterval(() => setN((x) => Math.min(x + 1, total)), 150); return () => clearInterval(t); }, [total]);
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }} aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="ppg-search-ring" aria-hidden="true" />
        <div>
          <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 16.5, color: tokens.navy }}>Checking pet rules for {from} → {to}</div>
          <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>{Math.min(n, names.length)} of {names.length} airlines checked</div>
        </div>
      </div>
      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: tokens.sky }}>
        <div className="h-full rounded-full" style={{ width: `${Math.round((Math.min(n, names.length) / names.length) * 100)}%`, background: tokens.primary, transition: "width .15s linear" }} />
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {names.map((name, i) => {
          const done = i < n, now = i === n;
          return (
            <li key={name} className="flex items-center gap-2" style={{ fontFamily: font.body, fontSize: 14, color: done ? tokens.navy : tokens.muted, fontWeight: done ? 700 : 500, opacity: done || now ? 1 : 0.55 }}>
              <span aria-hidden="true" className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 16, height: 16, background: done ? tokens.green : "transparent", border: done ? "none" : `1.5px solid ${now ? tokens.primary : tokens.line}`, color: "#fff", fontSize: 10, fontWeight: 900 }}>{done ? "✓" : ""}</span>
              {name}
            </li>
          );
        })}
      </ul>
      <style>{`.ppg-search-ring{width:30px;height:30px;border-radius:50%;border:3px solid ${tokens.sky};border-top-color:${tokens.primary};animation:ppgSpin .8s linear infinite;flex-shrink:0}@keyframes ppgSpin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion: reduce){.ppg-search-ring{animation:none}}`}</style>
    </div>
  );
}

export default function AirlineCompare({ answers, selected, onPick }) {
  const [list, setList] = useState(null);
  const [meta, setMeta] = useState({});
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let alive = true;
    setList(null); setShown(false);
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const minWait = new Promise((r) => setTimeout(r, reduce ? 300 : 2000));
    const load = fetch("/api/compare-airlines", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(answers) })
      .then((r) => r.json()).then((j) => { if (alive) { setList(Array.isArray(j.airlines) ? j.airlines : []); setMeta({ checkedAt: j.checkedAt, rules: j.rulesChecked }); } })
      .catch(() => { if (alive) setList([]); });
    Promise.all([minWait, load]).then(() => { if (alive) setShown(true); });
    return () => { alive = false; };
  }, [answers.origin, answers.destination, answers.animal, answers.role, answers.esa, answers.date, answers.pet_count]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!list || !shown) {
    const names = list && list.length ? list.map((a) => a.name) : SEARCH_NAMES;
    return <Searching names={names} from={city(answers.origin)} to={city(answers.destination)} total={names.length + 1} />;
  }
  if (!list.length) return <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>We couldn't compare airlines for this route. Pick one from the list below.</p>;

  const pet = answers.role === "Service animal" ? "service dog" : answers.animal === "Cat" ? "cat" : answers.animal === "Dog" ? "dog" : "pet";
  return (
    <div>
      <p className="mb-3" style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted, lineHeight: 1.45 }}>
        What each airline charges to bring your {pet} in the cabin from {city(answers.origin)} to {city(answers.destination)}, and the carrier size they allow. Easiest and cheapest at the top. Pick one to get your checklist.
      </p>
      {meta.checkedAt ? <p className="mb-3 -mt-1 flex items-center gap-1.5" style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.green, fontWeight: 700 }}><span aria-hidden="true">●</span>Rules checked against each airline&apos;s own pages, most recently {new Date(`${String(meta.checkedAt).slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p> : null}
      <div className="flex flex-col gap-2">
        {list.map((a, i) => {
          const look = a.easy ? LOOK.easy : LOOK[a.key] || LOOK.check;
          const blocked = a.key === "no";
          const sel = selected === a.name;
          return (
            <button key={a.name} type="button" disabled={blocked} onClick={() => onPick(a.name)} className="w-full text-left rounded-2xl px-4 py-3 ppg-rise" style={{ animationDelay: `${Math.min(i, 8) * 40}ms`, border: `2px solid ${sel ? tokens.navy : tokens.line}`, background: blocked ? "#FAFAFB" : "#fff", cursor: blocked ? "default" : "pointer", opacity: blocked ? 0.7 : 1 }}>
              <div className="flex items-center justify-between gap-3">
                <span style={{ fontFamily: font.body, fontWeight: 800, fontSize: 17, color: tokens.navy }}>{a.name}</span>
                <span className="rounded-full px-2.5 py-1 whitespace-nowrap" style={{ background: look.bg, color: look.fg, fontFamily: font.body, fontSize: 12.5, fontWeight: 800 }}>{look.label}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5" style={{ fontFamily: font.body, fontSize: 14, color: tokens.ink }}>
                {blocked ? <span>{a.title}</span> : <>
                  {a.fee ? <span><b>{shortFee(a.fee)}</b></span> : null}
                  {a.carrier ? <span style={{ color: tokens.muted }}>{a.carrier}</span> : null}
                  {a.cargo && pet !== "service dog" ? <span style={{ color: tokens.muted }}>{CARGO[a.cargo]}</span> : null}
                  {!a.fee && !a.carrier && a.key === "check" ? <span style={{ color: tokens.muted }}>{a.title}</span> : null}
                </>}
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-3 flex items-start gap-1.5" style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted, lineHeight: 1.45 }}>
        <span style={{ marginTop: 1 }}><Icon name="help" size={15} /></span>
        These are pet rules for each airline. Not every airline flies every route, so check your flight is available when you book.
      </p>
    </div>
  );
}
