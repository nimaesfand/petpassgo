"use client";

import React, { useState, useEffect } from "react";
import { tokens, font } from "../lib/theme";
import SiteHeader from "../components/SiteHeader";
import Logo from "../components/Logo";
import { PlanCards } from "../components/PricingPlans";
import { PRICES } from "../lib/pricing";
import { PetIllustration } from "../components/PetIdCard";
import PetQr from "../lib/PetQr";
import { AIRLINE_GUIDES } from "../lib/airlineGuides";
import { FAQ } from "../lib/faq";


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
        fontFamily: "var(--font-body), system-ui, sans-serif",
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
      className="relative rounded-2xl shadow-2xl overflow-hidden w-full max-w-[460px] mx-auto lg:mx-0"
      style={{ background: tokens.paper, border: `1px solid ${tokens.line}` }}
    >
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ background: tokens.navy, color: tokens.sky }}
      >
        <div>
          <div
            style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontSize: "20px", fontWeight: 600 }}
          >
            PetPassGo
          </div>
          <div
            style={{
              fontFamily: "var(--font-body), system-ui, sans-serif",
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
            fontFamily: "var(--font-body), system-ui, sans-serif",
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
              style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontSize: "22px", color: tokens.ink }}
            >
              Mochi
            </div>
            <div
              style={{
                fontFamily: "var(--font-body), system-ui, sans-serif",
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
                  fontFamily: "var(--font-body), system-ui, sans-serif",
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
                  fontFamily: "var(--font-body), system-ui, sans-serif",
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
              fontFamily: "var(--font-body), system-ui, sans-serif",
              fontSize: "10px",
              letterSpacing: "0.1em",
              color: tokens.ink,
              opacity: 0.55,
            }}
          >
            TRIP READINESS
          </div>
          <div
            style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontSize: "26px", color: tokens.navy }}
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

const D = "var(--font-display), system-ui, sans-serif";
const B = "var(--font-body), system-ui, sans-serif";

const STEPS = [
  { n: "1", title: "Answer 6 questions", body: "Airline, route, animal. About 3 minutes.", icon: "M4 6h16M4 12h10M4 18h7" },
  { n: "2", title: "Get your Travel Pass", body: "Every requirement for your exact trip, in order.", icon: "M5 4h14v16H5zM8 9h8M8 13h8M8 17h5" },
  { n: "3", title: "Check it off and fly", body: "Reminders before each deadline. Docs in one vault.", icon: "M5 13l4 4L19 7" },
];

const HOME_FAQ = [FAQ[2], FAQ[6], FAQ[7]];

function Eyebrow({ children, color = tokens.stamp }) {
  return <div style={{ fontFamily: B, color, fontSize: 13, fontWeight: 700, letterSpacing: "0.14em" }} className="mb-3">{children}</div>;
}
function H2({ children, light }) {
  return <h2 style={{ fontFamily: D, color: light ? "#fff" : tokens.navy, lineHeight: 1.1 }} className="text-[32px] md:text-[42px] font-bold mb-4">{children}</h2>;
}
function Cta({ children = "Plan your trip", href = "/assessment" }) {
  return (
    <a href={href} style={{ background: tokens.stamp, color: "#fff", fontFamily: B, fontWeight: 600, textDecoration: "none", display: "inline-block" }} className="btn-primary rounded-full px-8 py-4 text-[16px]">
      {children} →
    </a>
  );
}




export default function PetPassGoLanding() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div style={{ background: tokens.sky, color: tokens.ink }} className="min-h-screen w-full">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        .fade-up { opacity: 0; transform: translateY(14px); transition: opacity .6s ease, transform .6s ease; }
        .fade-up.in { opacity: 1; transform: translateY(0); }
        h1, h2, h3, h4 { font-variant-ligatures: none; -webkit-font-variant-ligatures: none; }
        .airline-tile { transition: border-color .15s ease, transform .15s ease; }
        .airline-tile:hover { border-color: ${tokens.stamp}; transform: translateY(-2px); }
        @media (prefers-reduced-motion: reduce) { .fade-up { transition: none; opacity: 1; transform: none; } .airline-tile:hover { transform: none; } }
      `}</style>

      <SiteHeader />

      {/* 1. HERO — two paths */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-14 pt-7 sm:pt-10 lg:pt-20 pb-10 lg:pb-20 text-center">
        <div className={`fade-up ${loaded ? "in" : ""}`}>
          <h1 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05 }} className="text-[29px] sm:text-[31px] leading-[1.08] sm:text-[52px] lg:text-[64px] font-bold mb-3 lg:mb-5">Fly with your pet. Skip the guesswork.</h1>
          <p style={{ fontFamily: B, color: tokens.muted }} className="text-[16px] lg:text-[19px] mb-5 lg:mb-10">Two simple ways to start. Pick one.</p>
        </div>
        <div className={`fade-up grid md:grid-cols-2 gap-3 lg:gap-5 max-w-[900px] mx-auto text-left ${loaded ? "in" : ""}`} style={{ transitionDelay: "120ms" }}>
          {[
            ["Traveling? Start here.", "Answer a few trip questions. We build your pet's travel plan.", "Plan your trip", "/assessment", "Start free · pay only to unlock your full pass", false],
            ["Pet Vault? Start here.", "Your pet's ID, chip and vet records, all in one place.", "Get your pet's ID", "/signup?plan=member", `Membership · ${PRICES.member}/mo`, true],
          ].map(([t, b, c, href, sub, dark]) => (
            <div key={t} className="rounded-2xl p-4 sm:p-5 lg:p-7 flex flex-col" style={{ background: dark ? tokens.navy : "#fff", border: `1px solid ${dark ? tokens.navy : tokens.line}`, color: dark ? "#fff" : tokens.navy }}>
              <span aria-hidden="true" className="inline-flex items-center justify-center rounded-full mb-3 lg:mb-4" style={{ width: 40, height: 40, background: tokens.gold }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tokens.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{dark ? <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M14 10h4M14 14h3" /><circle cx="8.5" cy="11" r="2" /><path d="M5.5 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4" /></> : <path d="M2 16l20-6-20-6 3 6-3 6zM5 10h7" />}</svg>
              </span>
              <div style={{ fontFamily: D, fontWeight: 700 }} className="text-[22px] lg:text-[25px] mb-1.5 lg:mb-2">{t}</div>
              <p style={{ fontFamily: B, opacity: 0.8, lineHeight: 1.45 }} className="text-[15px] lg:text-[16.5px] mb-4 lg:mb-6 flex-1">{b}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <a href={href} className="btn-primary rounded-full px-6 lg:px-7 py-3 lg:py-3.5 min-h-[44px]" style={{ background: dark ? tokens.gold : tokens.primary, color: dark ? tokens.navy : "#fff", fontFamily: B, fontWeight: 700, textDecoration: "none" }}>{c} →</a>
                <span style={{ fontFamily: B, fontSize: 13.5, opacity: 0.75 }}>{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section style={{ background: tokens.navy }} className="py-12 lg:py-20">
        <div className="max-w-[1240px] mx-auto px-6 md:px-14">
          <Eyebrow color={tokens.gold}>HOW IT WORKS</Eyebrow>
          <H2 light>Three steps to the gate.</H2>
          <div className="grid md:grid-cols-3 gap-5 mt-10">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl p-7" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center justify-center rounded-full" style={{ width: 52, height: 52, background: tokens.gold }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={tokens.navy} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={s.icon} /></svg>
                  </span>
                  <span style={{ fontFamily: D, color: "rgba(255,255,255,0.18)", fontSize: 56, fontWeight: 800, lineHeight: 1 }}>{s.n}</span>
                </div>
                <h3 style={{ fontFamily: D, color: "#fff", fontSize: 23, fontWeight: 700 }} className="mb-2">{s.title}</h3>
                <p style={{ fontFamily: B, color: "#C9D3E3", fontSize: 16, lineHeight: 1.55 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AIRLINES */}
      <section style={{ background: "#fff", borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` }} className="py-12 lg:py-20">
        <div className="max-w-[1240px] mx-auto px-6 md:px-14">
          <Eyebrow>AIRLINES</Eyebrow>
          <H2>10 U.S. airlines. One place.</H2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-10">
            {AIRLINE_GUIDES.map((a) => (
              <a key={a.slug} href={`/airlines/${a.slug}`} className="airline-tile rounded-xl px-5 py-4 min-h-[48px] flex items-center justify-between gap-2" style={{ background: tokens.sky, border: `1px solid ${tokens.line}`, textDecoration: "none" }}>
                <span style={{ fontFamily: B, fontWeight: 600, fontSize: 16, color: tokens.navy }}>{a.name}</span>
                <span style={{ color: tokens.stamp, fontWeight: 700 }} aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRICING */}
      <section id="pricing" className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-14 py-10 lg:py-14">
        <Eyebrow>PRICING</Eyebrow>
        <H2>Start free. Pay when you fly.</H2>
        <div className="mt-10"><PlanCards /></div>
      </section>

      {/* 6. FAQ TEASER */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 md:px-14 pb-12 lg:pb-20">
        <H2>Quick answers</H2>
        <div className="mt-6">
          {HOME_FAQ.map((f) => (
            <details key={f.q} className="mb-3 rounded-xl p-5" style={{ border: `1px solid ${tokens.line}`, background: "#fff" }}>
              <summary className="cursor-pointer" style={{ fontFamily: B, fontWeight: 600, color: tokens.navy, fontSize: 17 }}>{f.q}</summary>
              <p className="mt-3" style={{ fontFamily: B, color: tokens.muted, lineHeight: 1.6 }}>{f.a}</p>
            </details>
          ))}
        </div>
        <a href="/faq" style={{ fontFamily: B, color: tokens.navy, fontWeight: 600 }} className="inline-block mt-3">All questions →</a>
      </section>

      {/* 7. FINAL CTA */}
      <section className="px-4 sm:px-6 md:px-14 pb-14 lg:pb-24">
        <div className="max-w-[1240px] mx-auto rounded-3xl px-8 py-14 md:py-16 text-center" style={{ background: tokens.navy }}>
          <h2 style={{ fontFamily: D, color: "#fff", lineHeight: 1.1 }} className="text-[32px] md:text-[44px] font-bold mb-3">Where are you two flying?</h2>
          <p style={{ fontFamily: B, color: "#C9D3E3", fontSize: 17 }} className="mb-8">A few trip questions. Three minutes. Your plan.</p>
          <Cta>Start planning</Cta>
        </div>
      </section>

      <footer className="px-6 md:px-14 py-8 text-center" style={{ borderTop: `1px solid ${tokens.line}`, fontFamily: B, fontSize: 13, color: tokens.muted }}>
        <div className="flex justify-center mb-3"><Logo size={30} /></div>
        PetPassGo is a preparation tool, not a certifying authority. Requirements are set by airlines and government agencies.
        <div className="mt-2"><a href="/lost-flyer" style={{ color: tokens.navy, textDecoration: "underline" }}>Free lost pet flyer</a>{" · "}<a href="/terms" style={{ color: tokens.navy, textDecoration: "underline" }}>Terms of Service</a>{" · "}<a href="/privacy" style={{ color: tokens.navy, textDecoration: "underline" }}>Privacy Policy</a></div>
      </footer>
    </div>
  );
}
