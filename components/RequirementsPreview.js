"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tripTypeForRoute, destinationKeywordHit, findAirport } from "../lib/airports";
import { tokens, font } from "../lib/theme";
import Icon from "./Icon";
import VerdictCard from "./VerdictCard";
import { tripVerdict } from "../lib/verdict";
import TripFitCard from "./TripFitCard";
import { tripFitWarnings } from "../lib/tripFit";

// Shown on the last question before payment. Reads the real rule rows for this
// airline, pet and route (titles stay hidden until the pass is bought) so the
// buyer sees how much their trip involves before paying.

function niceCategory(c) {
  const s = String(c || "").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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

export default function RequirementsPreview({ answers }) {
  const [rows, setRows] = useState(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let alive = true;
    const types = tripTypeForRoute(answers.origin, answers.destination) === "international" ? ["international", "domestic"] : ["domestic"];
    supabase
      .rpc("trip_verdict_preview", { p_airline: answers.airline, p_animal: answers.animal, p_role: answers.role, p_trip_types: types, p_second_airline: (answers.connecting && answers.second_airline) || null })
      .then(({ data, error }) => {
        if (!alive) return;
        if (error || !Array.isArray(data)) { setRows([]); return; }
        const fits = data.filter((r) => {
          if (!r.destination_match) return true;
          return String(r.destination_match).split(",").some((k) => destinationKeywordHit(answers.destination, k.trim()));
        });
        setRows(fits);
      });
    return () => { alive = false; };
  }, [answers.airline, answers.second_airline, answers.connecting, answers.animal, answers.role, answers.origin, answers.destination]);

  // Reveal rows one by one so the plan visibly "builds" for this trip.
  useEffect(() => {
    if (!rows || shown >= rows.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), 70);
    return () => clearTimeout(t);
  }, [rows, shown]);

  const days = daysUntil(answers.date);
  const pet = answers.animal === "Other" ? "pet" : String(answers.animal || "pet").toLowerCase();
  const first = answers.airline && !/not sure/i.test(answers.airline) ? answers.airline : "your airline";
  const airline = answers.connecting && answers.second_airline ? `${first} + ${answers.second_airline}` : first;

  const petWord = answers.role === "Service animal" ? "your service animal" : `your ${pet}`;
  const verdict = rows ? tripVerdict({ rows, trip: { ...answers, petName: petWord }, fitWarnings: tripFitWarnings(answers) }) : null;

  if (rows && rows.length === 0) return <><VerdictCard verdict={verdict} /><TripFitCard answers={answers} /></>;

  const action = rows ? rows.filter((r) => r.status === "attention").length : 0;
  const notes = rows ? rows.filter((r) => r.title) : [];
  const locked = rows ? rows.filter((r) => !r.title) : [];

  return (
    <>
    <VerdictCard verdict={verdict} />
    <TripFitCard answers={answers} />
    <div className="rounded-2xl mb-6 overflow-hidden" style={{ border: `1px solid ${tokens.line}`, background: "#fff" }}>
      <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap" style={{ background: tokens.navy, color: "#fff" }}>
        <div>
          <div style={{ fontFamily: font.body, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: tokens.gold, fontWeight: 700 }}>Your full plan</div>
          <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700 }} className="mt-0.5">
            {cityOf(answers.origin)} → {cityOf(answers.destination)} · {airline}
          </div>
        </div>
        {days !== null && days >= 0 && (
          <div className="rounded-full px-3 py-1.5 ppg-pulse" style={{ background: "rgba(255,255,255,0.12)", fontFamily: font.body, fontSize: 14, fontWeight: 700 }}>
            {days === 0 ? "Flying today" : `${days} day${days === 1 ? "" : "s"} to go`}
          </div>
        )}
      </div>

      <div className="px-5 pt-4 pb-5">
        {!rows ? (
          <div className="flex flex-col gap-2" aria-busy="true">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-9 rounded-lg ppg-shimmer" />)}
          </div>
        ) : (
          <>
            <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink, lineHeight: 1.45 }} className="mb-3">
              We found <b>{rows.length} steps</b> for flying your {pet} on {airline}
              {action ? <>, and <b style={{ color: tokens.primary }}>{action} need action before you fly</b></> : null}.
            </p>

            {notes.map((r) => (
              <div key={r.id} className="rounded-xl p-3 mb-2" style={{ background: "#FFF7F2", border: `1px solid #F6D3BF` }}>
                <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, color: tokens.navy }}>{r.title}</div>
                {r.description && <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink, lineHeight: 1.45 }} className="mt-1">{r.description}</div>}
              </div>
            ))}

            <ul className="flex flex-col gap-1.5">
              {locked.slice(0, shown).map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-lg px-3 py-2 ppg-rise" style={{ background: tokens.sky }}>
                  <span className="shrink-0 rounded-full flex items-center justify-center" style={{ width: 22, height: 22, border: `2px solid ${r.status === "attention" ? tokens.primary : tokens.line}` }} />
                  <div className="min-w-0 flex-1">
                    <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: r.status === "attention" ? tokens.primary : tokens.muted }}>{niceCategory(r.category)}</div>
                    <div aria-hidden="true" className="h-2.5 rounded mt-1" style={{ width: `${Math.min(100, 28 + (r.title_len || 40) * 0.7)}%`, background: tokens.line, filter: "blur(1px)" }} />
                  </div>
                  <span style={{ color: tokens.muted }}><Icon name="lock" size={16} /></span>
                </li>
              ))}
            </ul>
            <p style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }} className="mt-3">
              Unlock the full steps, due dates and official sources with your Travel Pass.
            </p>
          </>
        )}
      </div>
    </div>
    </>
  );
}
