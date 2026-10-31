"use client";

import React, { useState, useEffect } from "react";
import { tokens } from "../lib/theme";
import SiteHeader from "../components/SiteHeader";
import Logo from "../components/Logo";
import { PlanCards } from "../components/PricingPlans";
import TripHero from "../components/TripHero";
import { US_AIRLINES, INTERNATIONAL_AIRLINES } from "../lib/airlines";
import { FAQ } from "../lib/faq";



const D = "var(--font-display), system-ui, sans-serif";
const B = "var(--font-body), system-ui, sans-serif";

const STEPS = [
  { n: "1", title: "Answer 6 quick questions", body: "Tell us about your flight and your pet.", icon: "M4 6h16M4 12h10M4 18h7" },
  { n: "2", title: "Get your Travel Pass", body: "Your step-by-step checklist built for your airline, route and pet.", icon: "M5 4h14v16H5zM8 9h8M8 13h8M8 17h5" },
  { n: "3", title: "Check it off and fly", body: "Follow the steps and keep your pet's ID and documents ready in your Pet Vault.", icon: "M5 13l4 4L19 7" },
];

const HOME_FAQ = [FAQ[2], FAQ[6], FAQ[7]];

// Same carriers as Plan my trip, in the same groups. Count comes from that list.
const HOME_AIRLINE_GROUPS = [
  { title: "U.S.", names: US_AIRLINES },
  { title: "International", names: INTERNATIONAL_AIRLINES },
];
function Eyebrow({ children, color = tokens.stamp }) {
  return <div style={{ fontFamily: B, color, fontSize: 15, fontWeight: 700, letterSpacing: "0.08em" }} className="mb-3">{children}</div>;
}

const PASS_BENEFITS = [
  ["Your step-by-step checklist", "Everything your pet needs for this trip, in order. Check things off as you go and watch your progress fill up."],
  ["Will your pet fit?", "Enter your pet's weight and carrier size, and we'll tell you if they meet your airline's limits."],
  ["Weather and cargo safety", "Live weather at both airports, plus a heads-up if it's too hot or cold for pets flying in cargo."],
  ["Vets and pet stores where you land", "Find vets and pet stores near you the moment you arrive."],
  ["Everything in one place on travel day", "Flight status, your pet's documents and Pet ID, ready to show at the counter."],
];

const VAULT_BENEFITS = [
  ["Digital Pet ID", "Your pet's profile in one place: name, breed, weight, and whether they're a pet or a service animal, plus your contact info. Show the Pet ID from your phone, or share it with a QR code scan."],
  ["Lost pet help", "If your pet goes missing, report them lost and get a printable flyer to share. Anyone who scans your pet's QR code can message you right away, and that message does not show your phone number."],
  ["Documents", "Keep vaccination records, health records and vet records ready whenever you need them."],
  ["Reminders", "We'll remind you before something expires, like a rabies vaccine or a health certificate, so you're never caught off guard."],
];

function BenefitList({ items, card = "#fff" }) {
  return (
    <ul className="grid gap-3">
      {items.map(([title, body]) => (
        <li key={title} className="rounded-2xl p-4 sm:p-5 flex gap-3" style={{ background: card, border: `1px solid ${tokens.line}` }}>
          <span aria-hidden="true" className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 28, height: 28, marginTop: 2, background: "#EAF6EE", color: tokens.green, fontFamily: B, fontWeight: 800, fontSize: 16 }}>✓</span>
          <span>
            <span style={{ display: "block", fontFamily: D, fontWeight: 700, fontSize: 18, color: tokens.navy, lineHeight: 1.3 }}>{title}</span>
            <span style={{ display: "block", fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink, marginTop: 4 }}>{body}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
function H2({ children, light }) {
  return <h2 style={{ fontFamily: D, color: light ? "#fff" : tokens.navy, lineHeight: 1.1 }} className="text-[32px] md:text-[42px] font-bold mb-4">{children}</h2>;
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

      <section className={`fade-up max-w-[1240px] mx-auto px-4 sm:px-6 md:px-14 pt-7 sm:pt-10 lg:pt-16 pb-8 lg:pb-14 ${loaded ? "in" : ""}`}>
        <TripHero />
      </section>

      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-14 py-10 lg:py-14">
        <Eyebrow>TRAVEL PASS</Eyebrow>
        <H2>What's included in your Travel Pass</H2>
        <BenefitList items={PASS_BENEFITS} />
      </section>

      <section style={{ background: "#fff", borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` }} className="py-10 lg:py-14">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-14">
          <Eyebrow>PET VAULT</Eyebrow>
          <H2>What's in your Pet Vault</H2>
          <BenefitList items={VAULT_BENEFITS} card={tokens.sky} />
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section style={{ background: tokens.navy }} className="py-12 lg:py-20">
        <div className="max-w-[1240px] mx-auto px-6 md:px-14">
          <Eyebrow color={tokens.gold}>HOW IT WORKS</Eyebrow>
          <H2 light>3 easy steps to takeoff</H2>
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
          <H2>Wherever you're flying, we've got you covered.</H2>
          <div className="mt-10 space-y-8">
            {HOME_AIRLINE_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 style={{ fontFamily: B, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-3">{group.title}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {group.names.map((name) => (
                    <a key={name} href="/assessment" className="airline-tile rounded-xl px-5 py-4 min-h-[48px] h-full flex items-center" style={{ background: tokens.sky, border: `1px solid ${tokens.line}`, textDecoration: "none" }}>
                      <span style={{ fontFamily: B, fontWeight: 600, fontSize: 16, color: tokens.navy }}>{name}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRICING */}
      <section id="pricing" className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-14 py-10 lg:py-14">
        <Eyebrow>PRICING</Eyebrow>
        <H2>Travel Pass or Pet Vault.</H2>
        <p style={{ fontFamily: B, fontSize: 16, lineHeight: 1.45, color: tokens.muted }} className="mb-2">Prices are in US dollars (USD).</p>
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
        <div className="mt-2"><a href="/lost-flyer" style={{ color: tokens.navy, textDecoration: "underline" }}>Free lost pet flyer</a>{" · "}<a href="mailto:support@petpassgo.com" style={{ color: tokens.navy, textDecoration: "underline" }}>support@petpassgo.com</a>{" · "}<a href="/guarantee" style={{ color: tokens.navy, textDecoration: "underline" }}>Flight-Ready Guarantee</a>. <a href="/guarantee" style={{ color: tokens.navy, fontWeight: 700 }}>Conditions apply</a>{" · "}<a href="/terms" style={{ color: tokens.navy, textDecoration: "underline" }}>Terms of Service</a>{" · "}<a href="/privacy" style={{ color: tokens.navy, textDecoration: "underline" }}>Privacy Policy</a></div>
      </footer>
    </div>
  );
}
