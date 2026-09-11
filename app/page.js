"use client";

import React, { useState, useEffect } from "react";

const tokens = {
  navy: "#152238",
  navyDeep: "#0D1626",
  gold: "#C9A227",
  sky: "#EAF0F6",
  paper: "#F6F8FA",
  ink: "#1C2733",
  stamp: "#B23A2E",
  line: "#D9E1E8",
};

function Perforation() {
  return (
    <div className="flex items-center gap-[6px] px-2" aria-hidden="true">
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          style={{ background: tokens.sky, borderColor: tokens.navy }}
          className="w-[7px] h-[7px] rounded-full border"
        />
      ))}
    </div>
  );
}

function Stamp() {
  return (
    <div
      className="absolute -rotate-12 select-none"
      style={{
        top: "18px",
        right: "18px",
        border: `2px solid ${tokens.stamp}`,
        color: tokens.stamp,
        borderRadius: "9999px",
        padding: "6px 14px",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "11px",
        letterSpacing: "0.12em",
        fontWeight: 700,
      }}
    >
      READY TO TRAVEL
    </div>
  );
}

function BoardingCard() {
  return (
    <div
      className="relative rounded-2xl shadow-2xl overflow-hidden w-full max-w-[420px]"
      style={{ background: tokens.paper, border: `1px solid ${tokens.line}` }}
    >
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ background: tokens.navy, color: tokens.sky }}
      >
        <div>
          <div
            style={{ fontFamily: "'Fraunces', serif", fontSize: "20px", fontWeight: 600 }}
          >
            PetPassGo
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.14em",
              color: tokens.gold,
            }}
          >
            TRAVEL PASS
          </div>
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "11px",
            color: tokens.sky,
            opacity: 0.7,
          }}
        >
          NO. PPG-0417
        </div>
      </div>

      <div className="relative px-6 pt-5 pb-4">
        <Stamp />
        <div className="flex gap-4 items-center">
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              width: 56,
              height: 56,
              background: tokens.sky,
              border: `1px solid ${tokens.line}`,
              fontSize: 26,
            }}
          >
            🐾
          </div>
          <div>
            <div
              style={{ fontFamily: "'Fraunces', serif", fontSize: "22px", color: tokens.ink }}
            >
              Mochi
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "11px",
                color: tokens.ink,
                opacity: 0.6,
              }}
            >
              Cavalier King Charles · M
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            ["FROM", "TPA"],
            ["TO", "JFK"],
            ["DATE", "09.14"],
          ].map(([label, val]) => (
            <div key={label}>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  color: tokens.ink,
                  opacity: 0.5,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "17px",
                  color: tokens.navy,
                  fontWeight: 700,
                }}
              >
                {val}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6">
        <Perforation />
      </div>

      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.1em",
              color: tokens.ink,
              opacity: 0.55,
            }}
          >
            TRIP READINESS
          </div>
          <div
            style={{ fontFamily: "'Fraunces', serif", fontSize: "26px", color: tokens.navy }}
          >
            90%
          </div>
        </div>
        <svg viewBox="0 0 29 29" style={{ width: 64, height: 64 }} className="rounded-md">
          <rect width="29" height="29" fill={tokens.ink} />
          {[[1, 1], [22, 1], [1, 22]].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <rect x={x} y={y} width="6" height="6" fill="#fff" />
              <rect x={x + 1.3} y={y + 1.3} width="3.4" height="3.4" fill={tokens.ink} />
              <rect x={x + 2} y={y + 2} width="2" height="2" fill="#fff" />
            </g>
          ))}
          {[
            [10, 2], [13, 3], [16, 1], [19, 4], [10, 5], [15, 6],
            [2, 10], [5, 12], [3, 15], [7, 16], [1, 18], [5, 19],
            [10, 10], [13, 11], [11, 14], [16, 12], [14, 16], [18, 9],
            [22, 10], [25, 12], [23, 15], [26, 17], [21, 18], [24, 20],
            [10, 22], [13, 24], [16, 21], [11, 26], [18, 23], [15, 27],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="1.3" height="1.3" fill="#fff" />
          ))}
        </svg>
      </div>
    </div>
  );
}

const steps = [
  {
    n: "01",
    title: "Know what you need",
    body: "Answer a few questions about your trip. We tell you exactly which requirements apply — not a list of everything that might.",
  },
  {
    n: "02",
    title: "Keep it organized",
    body: "Your pet's medical records, contacts, and identification live in one vault, tied to their profile — not scattered across email and photos.",
  },
  {
    n: "03",
    title: "Be ready to go",
    body: "See what's complete, what's missing, and what's due — then switch to Travel Mode the day you fly.",
  },
];

const features = [
  ["🧭", "Personalized trip plan", "Built from your animal, route, and airline — not a generic checklist."],
  ["📁", "Document vault", "Vaccination records, vet contacts, microchip info, and emergency contacts, all in one place."],
  ["🪪", "Digital Pet ID", "A QR-linked profile for your animal that travels with you."],
  ["✅", "Readiness tracker", "Complete, missing, or needs verification — always visible."],
  ["🛫", "Travel Mode", "The day you fly, PetPassGo shows only what matters right now."],
  ["🗂️", "Saved trips", "Every trip you plan makes the next one faster."],
];

export default function PetPassGoLanding() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: tokens.sky, color: tokens.ink }} className="min-h-screen w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .fade-up { opacity: 0; transform: translateY(14px); transition: opacity .6s ease, transform .6s ease; }
        .fade-up.in { opacity: 1; transform: translateY(0); }
        .step-divider-active { border-left: none; }
        @media (min-width: 768px) {
          .step-divider-active { border-left: 1px dashed ${tokens.gold}55; }
        }
        h1, h2, h3, h4 { font-variant-ligatures: none; -webkit-font-variant-ligatures: none; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up { transition: none; opacity: 1; transform: none; }
        }
      `}</style>

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 md:px-14 py-5 flex-wrap gap-3" style={{ borderBottom: `1px solid ${tokens.line}` }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 26, color: tokens.navy }}>
          PetPassGo
        </div>
        <div className="flex items-center gap-5">
          <a
            href="/login"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: tokens.navy,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Log in
          </a>
          <a
            href="/signup"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: tokens.navy,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Sign up
          </a>
          <a
            href="/assessment"
            style={{
              background: tokens.navy,
              color: tokens.sky,
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
            className="rounded-full px-5 py-2 hover:opacity-90 transition"
          >
            Get your Travel Pass
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 md:px-14 pt-14 pb-20 grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
        <div className={`fade-up ${loaded ? "in" : ""}`}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.14em",
              color: tokens.stamp,
            }}
            className="mb-4"
          >
            TRAVEL WITH CONFIDENCE
          </div>
          <h1
            style={{ fontFamily: "'Fraunces', serif", color: tokens.navy, lineHeight: 1.1 }}
            className="text-[34px] sm:text-[42px] md:text-[56px] font-semibold mb-6"
          >
            Know what your trip needs — before you need it.
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: tokens.ink, opacity: 0.8 }} className="max-w-md mb-8">
            PetPassGo turns scattered airline rules, forms, and deadlines into one
            personalized plan for you and your animal — organized, tracked, and
            ready when you are.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="/assessment"
              style={{ background: tokens.stamp, color: "#fff", fontFamily: "'Inter', sans-serif", fontWeight: 600, textDecoration: "none", display: "inline-block" }}
              className="rounded-full px-7 py-3.5 text-[15px] hover:opacity-90 transition"
            >
              Start your Travel Pass
            </a>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, opacity: 0.55 }}>
              takes ~3 minutes
            </span>
          </div>
        </div>

        <div className={`fade-up flex justify-center md:justify-end ${loaded ? "in" : ""}`} style={{ transitionDelay: "120ms" }}>
          <BoardingCard />
        </div>
      </section>

      {/* STEPS — literal sequence, numbering justified */}
      <section style={{ background: tokens.navy }} className="py-16">
        <div className="max-w-6xl mx-auto px-6 md:px-14">
          <div
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: tokens.gold, fontSize: 12, letterSpacing: "0.14em" }}
            className="mb-10"
          >
            KNOW · ORGANIZE · GO
          </div>
          <div className="grid md:grid-cols-3 gap-0">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className={`step-divider px-0 md:px-8 py-6 md:py-0 ${i > 0 ? "step-divider-active" : ""}`}
              >
                <div style={{ fontFamily: "'Fraunces', serif", color: tokens.gold, fontSize: 34 }}>{s.n}</div>
                <h3 style={{ fontFamily: "'Fraunces', serif", color: "#fff", fontSize: 22 }} className="mt-2 mb-2">
                  {s.title}
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", color: tokens.sky, opacity: 0.75, fontSize: 15 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 md:px-14 py-20">
        <h2 style={{ fontFamily: "'Fraunces', serif", color: tokens.navy, fontSize: 32 }} className="mb-2">
          Everything for the trip, in one place
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", opacity: 0.7 }} className="mb-12 max-w-lg">
          Not a static article. A profile that grows with your animal and gets
          smarter with every trip.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(([icon, title, body]) => (
            <div
              key={title}
              className="rounded-xl p-6"
              style={{ background: tokens.paper, border: `1px solid ${tokens.line}` }}
            >
              <div className="text-2xl mb-3">{icon}</div>
              <h3 style={{ fontFamily: "'Fraunces', serif", color: tokens.navy, fontSize: 18 }} className="mb-2">
                {title}
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, opacity: 0.75 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT WE ACTUALLY TRACK — data points cloud */}
      <section style={{ background: tokens.navy }} className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-14 text-center">
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: tokens.gold, fontSize: 12, letterSpacing: "0.14em" }} className="mb-3">
            WHAT WE ACTUALLY TRACK
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", color: "#fff", fontSize: 30 }} className="mb-3">
            Every detail, verified against the source
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", color: tokens.sky, opacity: 0.8, fontSize: 15 }} className="mb-8 max-w-xl mx-auto">
            Not scraped from blogs. Every requirement below is checked directly against the airline
            and the government agencies that set the rules.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              "in-cabin pet fee", "kennel dimensions", "reservation phone line", "DOT service animal form",
              "relief attestation", "cabin pet limits", "minimum pet age", "combined weight limit",
              "rabies vaccination timing", "breed restrictions", "cargo availability", "submission portal",
              "48-hour deadlines", "health certificate window", "state import rules", "FAVN blood test",
              "quarantine risk", "carrier type", "CDC import form", "ESA eligibility",
            ].map((tag, i) => (
              <span
                key={tag}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: i % 3 === 0 ? 15 : i % 3 === 1 ? 13 : 14,
                  color: i % 4 === 0 ? tokens.gold : tokens.sky,
                  border: `1px solid rgba(234,240,246,0.2)`,
                  borderRadius: 999,
                  padding: "6px 14px",
                  opacity: i % 5 === 0 ? 1 : 0.82,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* AIRLINE COVERAGE GRID */}
      <section className="max-w-5xl mx-auto px-6 md:px-14 py-20">
        <div className="text-center mb-10">
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: tokens.stamp, fontSize: 12, letterSpacing: "0.14em" }} className="mb-3">
            AIRLINE COVERAGE
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", color: tokens.navy, fontSize: 30 }} className="mb-2">
            Researched airline by airline
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", opacity: 0.7, fontSize: 15 }}>
            Each one verified individually — because every airline's rules are genuinely different.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {["Delta", "American Airlines", "United", "Southwest", "JetBlue", "Alaska Airlines"].map((airline) => (
            <div
              key={airline}
              className="rounded-xl px-5 py-4 flex items-center gap-3"
              style={{ background: "#fff", border: `1px solid ${tokens.line}` }}
            >
              <span style={{ color: "#3E7A4B", fontSize: 15 }}>✓</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14.5, color: tokens.navy }}>
                {airline}
              </span>
            </div>
          ))}
          {["Spirit", "Frontier", "Hawaiian", "Allegiant", "Sun Country"].map((airline) => (
            <div
              key={airline}
              className="rounded-xl px-5 py-4 flex items-center gap-3"
              style={{ background: tokens.paper, border: `1px dashed ${tokens.line}`, opacity: 0.6 }}
            >
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: tokens.ink, opacity: 0.6 }}>
                SOON
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14.5, color: tokens.ink, opacity: 0.7 }}>
                {airline}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING STRIP */}
      <section className="px-6 md:px-14 pb-24">
        <div
          className="max-w-6xl mx-auto rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{ background: tokens.navy }}
        >
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: tokens.gold, fontSize: 12, letterSpacing: "0.12em" }} className="mb-3">
              SIMPLE, TRIP-BASED PRICING
            </div>
            <h3 style={{ fontFamily: "'Fraunces', serif", color: "#fff", fontSize: 26 }}>
              Pay for the trip. Keep the profile.
            </h3>
          </div>
          <div className="flex gap-8 text-white">
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28 }}>$49.99</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, opacity: 0.7 }}>Travel Pass</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28 }}>$4.99/mo</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, opacity: 0.7 }}>Profile & vault</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28 }}>$19.99</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, opacity: 0.7 }}>Per-trip refresh</div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <a
            href="/assessment"
            style={{ background: tokens.stamp, color: "#fff", fontFamily: "'Inter', sans-serif", fontWeight: 600, textDecoration: "none", textAlign: "center" }}
            className="rounded-full px-7 py-3.5 text-[15px] hover:opacity-90 transition"
          >
            Start your Travel Pass
          </a>
          <a
            href="/signup"
            style={{ background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}`, fontFamily: "'Inter', sans-serif", fontWeight: 600, textDecoration: "none", textAlign: "center" }}
            className="rounded-full px-7 py-3.5 text-[15px] hover:opacity-90 transition"
          >
            Just create your pet's profile
          </a>
        </div>
      </section>

      <footer className="px-6 md:px-14 py-8 text-center" style={{ borderTop: `1px solid ${tokens.line}`, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, opacity: 0.5 }}>
        PetPassGo is a preparation tool, not a certifying authority. Requirements are set by airlines and government agencies.
      </footer>
    </div>
  );
}
