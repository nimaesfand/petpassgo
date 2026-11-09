"use client";

import { useState } from "react";
import Icon from "../Icon";
import VerdictCard from "../VerdictCard";
import { tokens, font } from "../../lib/theme";

// A real example of the free answer and the paid plan, taken from our verified rules
// (Hawaii Dept. of Agriculture and Alaska Airlines pages, checked Nov 2026).
const EXAMPLES = {
  alaska: {
    tab: "Alaska Airlines",
    route: "Los Angeles → Honolulu · dog in the cabin",
    verdict: { key: "go", title: "Yes, your dog can fly this trip", text: "14 things to do first. Here are a few of them." },
    steps: [
      { cat: "Start 2–3 months ahead", title: "FAVN rabies blood test", body: "Needed for fast release at Honolulu airport. Lab results alone can take 6–8 weeks.", src: "Hawaii Dept. of Agriculture" },
      { cat: "10 days before arrival", title: "Hawaii Dog & Cat Import Form (AQS-279)", body: "One per pet, with two original rabies certificates. You can submit it online.", src: "Hawaii Dept. of Agriculture" },
      { cat: "Within 14 days of arrival", title: "Health certificate from an accredited vet", body: "It must include the New World Screwworm statement.", src: "Hawaii Dept. of Agriculture" },
      { cat: "At booking", title: "$100 each way, soft carrier up to 17\" × 11\" × 9.5\"", body: "Reserve your pet's spot before travel day; space is first come, first served.", src: "Alaska Airlines" },
    ],
  },
  united: {
    tab: "United",
    route: "Los Angeles → Honolulu · dog in the cabin",
    verdict: { key: "no", title: "Your dog can't fly this route on United", text: "United doesn't fly pets to, from or through Hawaii. Alaska Airlines does, so check that route instead." },
    steps: [],
  },
};

export default function SampleAnswer() {
  const [k, setK] = useState("alaska");
  const ex = EXAMPLES[k];
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
      <div>
        <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 800, letterSpacing: ".14em", color: tokens.primary }}>FREE TRIP CHECK</div>
        <h2 style={{ fontFamily: font.display, color: tokens.navy, lineHeight: 1.12 }} className="text-[32px] md:text-[42px] font-bold mt-2">Can your pet fly this trip? Find out free.</h2>
        <p style={{ fontFamily: font.body, fontSize: 18, lineHeight: 1.5, color: tokens.ink }} className="mt-3">
          Answer a few questions and get a straight answer for your airline, route and pet: Can fly, Action needed, Not allowed, or Check with airline. Free, no card.
        </p>
        <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.muted }} className="mt-3">
          The Travel Pass then gives you every step in order, with deadlines, reminders and a link to the official page for each one.
        </p>
        <a href="/assessment" className="inline-flex items-center justify-center rounded-full px-8 py-3.5 min-h-[52px] mt-5" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>Check my trip free</a>
      </div>

      <div className="rounded-3xl p-4 sm:p-6" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 18px 40px rgba(20,33,61,0.10)" }}>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 800, color: tokens.muted, letterSpacing: ".08em" }}>EXAMPLE · {ex.route.toUpperCase()}</div>
        </div>
        <div className="flex gap-2 mb-4" role="tablist" aria-label="Example airline">
          {Object.entries(EXAMPLES).map(([key, e]) => (
            <button key={key} type="button" role="tab" aria-selected={k === key} onClick={() => setK(key)} className="rounded-full px-4 py-2"
              style={{ fontFamily: font.body, fontWeight: 800, fontSize: 14, cursor: "pointer", background: k === key ? tokens.navy : "#fff", color: k === key ? "#fff" : tokens.navy, border: `1.5px solid ${k === key ? tokens.navy : tokens.line}` }}>
              {e.tab}
            </button>
          ))}
        </div>
        <VerdictCard verdict={ex.verdict} compact key={k} />
        {ex.steps.length ? (
          <ol className="grid gap-2" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {ex.steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl p-3 flex gap-3 ppg-rise" style={{ background: tokens.sky, animationDelay: `${i * 60}ms` }}>
                <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 28, height: 28, background: "#fff", color: tokens.primary, fontFamily: font.body, fontWeight: 800, fontSize: 14 }}>{i + 1}</span>
                <div className="min-w-0">
                  <div style={{ fontFamily: font.body, fontSize: 11.5, fontWeight: 800, letterSpacing: ".06em", color: tokens.primary }}>{s.cat.toUpperCase()}</div>
                  <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 15.5, color: tokens.navy }}>{s.title}</div>
                  <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.ink, lineHeight: 1.4 }}>{s.body}</div>
                  <div className="mt-1 inline-flex items-center gap-1" style={{ fontFamily: font.body, fontSize: 12, color: tokens.muted }}><Icon name="check" size={12} /> Source: {s.src} · checked Nov 2026</div>
                </div>
              </li>
            ))}
            <li className="rounded-2xl p-3 text-center" style={{ border: `1.5px dashed ${tokens.line}`, fontFamily: font.body, fontSize: 14, fontWeight: 700, color: tokens.muted }}>+ 10 more steps in the Travel Pass</li>
          </ol>
        ) : (
          <div className="rounded-2xl p-4" style={{ background: tokens.sky, fontFamily: font.body, fontSize: 15, color: tokens.ink }}>
            This is the answer people pay for later, after the airline turns them away. You get it free, before you book.
          </div>
        )}
      </div>
    </div>
  );
}
