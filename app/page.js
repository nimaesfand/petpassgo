"use client";

import React, { useState, useEffect } from "react";
import { tokens, font } from "../lib/theme";
import SiteHeader from "../components/SiteHeader";
import Logo from "../components/Logo";
import { PlanCards } from "../components/PricingPlans";
import SamplePass from "../components/SamplePass";
import { JOIN_CTA, PLAN_CTA } from "../lib/cta";
import { PRICES, usd } from "../lib/pricing";
import { PetIllustration } from "../components/PetIdCard";
import PetQr from "../lib/PetQr";
import { AIRLINE_GUIDES, airlineCoverageHeading } from "../lib/airlineGuides";
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
  { n: "1", title: "Answer 6 questions", body: "Tell us about your flight and your pets.", icon: "M4 6h16M4 12h10M4 18h7" },
  { n: "2", title: "Check out", body: "Travel Pass for this trip, or Pet Vault plus this trip. The checklist is in the pass after you pay.", icon: "M5 4h14v16H5zM8 9h8M8 13h8M8 17h5" },
  { n: "3", title: "Check it off and fly", body: "Reminders before each deadline. Documents, forms, and everything you need in one vault.", icon: "M5 13l4 4L19 7" },
];

const HOME_FAQ = [FAQ[2], FAQ[6], FAQ[7]];

function Eyebrow({ children, color = tokens.stamp }) {
  return <div style={{ fontFamily: B, color, fontSize: 13, fontWeight: 700, letterSpacing: "0.14em" }} className="mb-3">{children}</div>;
}
function H2({ children, light }) {
  return <h2 style={{ fontFamily: D, color: light ? "#fff" : tokens.navy, lineHeight: 1.1 }} className="text-[32px] md:text-[42px] font-bold mb-4">{children}</h2>;
}
function Cta({ children = PLAN_CTA, href = "/assessment" }) {
  return (
    <a href={href} style={{ background: tokens.stamp, color: "#fff", fontFamily: B, fontWeight: 600, textDecoration: "none", display: "inline-block" }} className="btn-primary rounded-full px-8 py-4 text-[16px]">
      {children}
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
          <h1 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05 }} className="text-[29px] sm:text-[31px] leading-[1.08] sm:text-[52px] lg:text-[64px] font-bold mb-3 lg:mb-5">Fly with your pets, skip the guesswork.</h1>
          <p style={{ fontFamily: B, color: tokens.muted }} className="text-[16px] lg:text-[19px] mb-5 lg:mb-8 max-w-[640px] mx-auto">A few questions. Then a checklist with dates, sources, and what to pack.</p>
          <Cta />
          <p style={{ fontFamily: B, fontSize: 16, color: tokens.ink, lineHeight: 1.45 }} className="mt-4 max-w-[640px] mx-auto">
            A Travel Pass is {usd(PRICES.pass)}. Join + Pass is {usd(PRICES.joinToday)} today: {usd(PRICES.member)} for Pet Vault plus a {usd(PRICES.memberPass)} pass. Then {usd(PRICES.member)}/mo.
          </p>
          <p className="mt-2"><a href="/join" style={{ fontFamily: B, fontSize: 16, fontWeight: 700, color: tokens.navy }}>{JOIN_CTA}</a></p>
        </div>
        <div className="max-w-[720px] mx-auto mt-8 text-left"><SamplePass /></div>
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
          <H2>{airlineCoverageHeading()}</H2>
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
        <H2>Travel Pass or Pet Vault.</H2>
        <p style={{ fontFamily: B, fontSize: 16, lineHeight: 1.45, color: tokens.ink }} className="max-w-[640px]">Prices are in US dollars (USD). One trip is {usd(PRICES.pass)}. Together today, Pet Vault plus this trip is {usd(PRICES.joinToday)}. After that, Pet Vault is {usd(PRICES.member)}/mo and each new pass is {usd(PRICES.memberPass)}.</p>
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

      <footer className="px-6 md:px-14 py-8 text-center" style={{ borderTop: `1px solid ${tokens.line}`, fontFamily: B, fontSize: 15, lineHeight: 1.5, color: tokens.muted }}>
        <div className="flex justify-center mb-3"><Logo size={30} /></div>
        PetPassGo is a preparation tool, not a certifying authority. Requirements are set by airlines and government agencies.
        <div className="mt-2"><a href="/lost-flyer" style={{ color: tokens.navy, textDecoration: "underline" }}>Free lost pet flyer</a>{" · "}<a href="/guarantee" style={{ color: tokens.navy, textDecoration: "underline" }}>Flight-Ready Guarantee</a>. <a href="/guarantee" style={{ color: tokens.navy, fontWeight: 700 }}>Conditions apply</a>{" · "}<a href="/terms" style={{ color: tokens.navy, textDecoration: "underline" }}>Terms of Service</a>{" · "}<a href="/privacy" style={{ color: tokens.navy, textDecoration: "underline" }}>Privacy Policy</a></div>
      </footer>
    </div>
  );
}
