"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tripTypeForRoute, destinationKeywordHit, findAirport } from "../lib/airports";
import { tokens, font } from "../lib/theme";
import Icon from "./Icon";
import VerdictCard from "./VerdictCard";
import { tripVerdict, tripFacts } from "../lib/verdict";
import TripFitCard from "./TripFitCard";
import { tripFitWarnings } from "../lib/tripFit";

// The free answer on the last question before payment: one verdict, the fee
// and carrier, and the step names for this exact trip. The step count comes
// from the same code that builds the paid Travel Pass, so the numbers match.

function daysUntil(date) {
  if (!date) return null;
  const d = new Date(`${date}T12:00:00`);
  const diff = Math.round((d - new Date()) / 86400000);
  return Number.isFinite(diff) ? diff : null;
}

function cityOf(label) {
  const a = findAirport(label);
  return a ? a.city : String(label || "").split(",")[0];
}

const PEEK = 4;

export default function RequirementsPreview({ answers, onVerdict }) {
  const [rows, setRows] = useState(null);
  const [plan, setPlan] = useState(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let alive = true;
    setRows(null); setPlan(null); setShown(0);
    const types = tripTypeForRoute(answers.origin, answers.destination) === "international" ? ["international", "domestic"] : ["domestic"];
    supabase
      .rpc("trip_verdict_preview", { p_airline: answers.airline, p_animal: answers.animal, p_role: answers.role, p_trip_types: types, p_second_airline: (answers.connecting && answers.second_airline) || null })
      .then(({ data, error }) => {
        if (!alive) return;
        if (error || !Array.isArray(data)) { setRows([]); return; }
        setRows(data.filter((r) => !r.destination_match || String(r.destination_match).split(",").some((k) => destinationKeywordHit(answers.destination, k.trim()))));
      });
    fetch("/api/trip-preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(answers) })
      .then((r) => r.json())
      .then((d) => { if (alive) setPlan({ count: Number(d?.count) || 0, steps: Array.isArray(d?.steps) ? d.steps : [] }); })
      .catch(() => { if (alive) setPlan({ count: null, steps: [] }); });
    return () => { alive = false; };
  }, [answers.airline, answers.second_airline, answers.connecting, answers.stop, answers.animal, answers.role, answers.esa, answers.origin, answers.destination, answers.pet_travel, answers.second_mode, answers.pet_count]); // eslint-disable-line react-hooks/exhaustive-deps

  const ready = rows && plan;
  // Step names appear one by one so the plan visibly builds for this trip.
  const peekLen = ready ? Math.min(plan.steps.length, PEEK) : 0;
  useEffect(() => {
    if (!ready || shown >= peekLen) return;
    const t = setTimeout(() => setShown((n) => n + 1), 220);
    return () => clearTimeout(t);
  }, [ready, shown, peekLen]);

  const days = daysUntil(answers.date);
  const pet = answers.animal === "Other" ? "pet" : String(answers.animal || "pet").toLowerCase();
  const first = answers.airline && !/not sure/i.test(answers.airline) ? answers.airline : "your airline";
  const airline = answers.connecting && answers.second_airline && answers.second_airline !== answers.airline ? `${first} + ${answers.second_airline}` : first;
  const petWord = answers.role === "Service animal" ? "your service dog" : `your ${pet}`;

  const verdict = ready ? tripVerdict({ rows, trip: { ...answers, petName: petWord }, fitWarnings: tripFitWarnings(answers), stepCount: plan.count }) : null;
  const vKey = verdict?.key || null;
  useEffect(() => { onVerdict?.(vKey); }, [vKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const blocked = vKey === "no";
  const facts = ready ? tripFacts(rows, answers) : null;
  const count = plan?.count;
  const more = ready ? Math.max(count || 0, plan.steps.length) - Math.min(plan.steps.length, PEEK) : 0;

  return (
    <>
      {!ready ? (
        <div className="rounded-2xl p-5 mb-4 flex flex-col gap-2" aria-busy="true" style={{ border: `1px solid ${tokens.line}` }}>
          <div className="h-6 w-2/3 rounded-lg ppg-shimmer" />
          <div className="h-4 w-full rounded-lg ppg-shimmer" />
          <div className="h-4 w-5/6 rounded-lg ppg-shimmer" />
        </div>
      ) : <VerdictCard verdict={verdict} />}
      <TripFitCard answers={answers} />

      {ready && !blocked && rows.length > 0 ? (
        <div className="rounded-2xl mb-6 overflow-hidden" style={{ border: `1px solid ${tokens.line}`, background: "#fff" }}>
          <div className="px-5 py-3.5 flex items-center justify-between gap-3" style={{ background: tokens.navy, color: "#fff" }}>
            <div className="min-w-0" style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, lineHeight: 1.25 }}>
              {cityOf(answers.origin)} → {cityOf(answers.destination)}
              <div style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 600, color: "rgba(255,255,255,.75)" }}>{airline}</div>
            </div>
            {days !== null && days >= 0 ? (
              <div className="rounded-full px-3 py-1.5 flex-shrink-0" style={{ background: "rgba(255,255,255,0.12)", fontFamily: font.body, fontSize: 13.5, fontWeight: 700 }}>
                {days === 0 ? "Flying today" : `${days} day${days === 1 ? "" : "s"} to go`}
              </div>
            ) : null}
          </div>

          <div className="px-5 pt-4 pb-5">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                ["Pet fee", facts?.fee || "In your pass"],
                ["Carrier", facts?.carrier || "In your pass"],
                ["Steps", Number.isFinite(count) ? String(count) : "In your pass"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl px-2.5 py-2.5 min-w-0" style={{ background: tokens.sky }}>
                  <div style={{ fontFamily: font.body, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", color: tokens.muted }}>{k.toUpperCase()}</div>
                  <div className="mt-0.5" style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 800, color: tokens.navy, lineHeight: 1.25, overflowWrap: "anywhere" }}>{v}</div>
                </div>
              ))}
            </div>

            {plan.steps.length ? (
              <>
                <div className="mb-2" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: tokens.navy }}>Your steps</div>
                <ul className="flex flex-col gap-1.5">
                  {plan.steps.slice(0, shown).map((name, i) => (
                    <li key={name} className="flex items-center gap-3 rounded-lg px-3 py-2.5 ppg-rise" style={{ background: tokens.sky }}>
                      <span className="shrink-0 rounded-full flex items-center justify-center" style={{ width: 24, height: 24, background: "#fff", border: `2px solid ${i === 0 ? tokens.primary : tokens.line}`, fontFamily: font.body, fontSize: 12, fontWeight: 800, color: tokens.navy }}>{i + 1}</span>
                      <span className="flex-1 min-w-0" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>{name}</span>
                      <span aria-label="Details in your Travel Pass" style={{ color: tokens.muted }}><Icon name="lock" size={15} /></span>
                    </li>
                  ))}
                </ul>
                <p style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted, lineHeight: 1.45 }} className="mt-3">
                  {more > 0 ? `+ ${more} more. ` : ""}Your Travel Pass shows how to do each one, when it's due, and the official source.
                </p>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
