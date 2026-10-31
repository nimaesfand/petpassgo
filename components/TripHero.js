"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { tokens, font } from "../lib/theme";
import { PLAN_CTA } from "../lib/cta";
import { PET_CHOICES, REGION_CHOICES, planTripHref, writeHomeIntent } from "../lib/tripIntent";
import FlightPathMap from "./FlightPathMap";

const D = font.display;
const B = font.body;
const HERO_ALT = "A golden retriever in a black travel harness lies beside an airport window, with a plane on the tarmac outside.";

function Choice({ name, value, checked, onChange, label, hint, scale }) {
  return (
    <label
      className={`ppg-choice rounded-2xl py-3 min-h-[52px] min-w-0 h-full flex flex-col justify-center cursor-pointer ${scale ? "px-3 sm:px-4" : "px-4"}`}
      style={{
        background: checked ? tokens.navy : "#fff",
        color: checked ? "#fff" : tokens.navy,
        border: `2px solid ${checked ? tokens.navy : tokens.line}`,
        fontFamily: B,
        containerType: scale ? "inline-size" : undefined,
      }}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span style={{ fontWeight: 700, fontSize: scale ? "clamp(14px, 11cqi, 16px)" : 16, lineHeight: scale ? 1.25 : 1.3, textWrap: scale ? "balance" : undefined, minWidth: 0 }}>{label}</span>
      {hint ? <span style={{ fontSize: 15, lineHeight: 1.35, marginTop: 2, opacity: 0.8 }}>{hint}</span> : null}
    </label>
  );
}

export default function TripHero() {
  const [region, setRegion] = useState("");
  const [pet, setPet] = useState("");
  const href = planTripHref(region, pet);
  useEffect(() => { writeHomeIntent(region, pet); }, [region, pet]);

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] lg:gap-x-12 lg:gap-y-0 lg:items-stretch">
        <div className="order-1 lg:col-start-1 lg:row-start-1">
          <h1 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05, textWrap: "balance" }} className="text-[32px] sm:text-[48px] lg:text-[56px] font-bold">
            <span className="block">Travel with your pet.</span>
            <span className="block" style={{ color: tokens.primary }}>Without the stress.</span>
          </h1>
          <p style={{ fontFamily: B, color: tokens.ink, fontSize: 18, lineHeight: 1.5 }} className="mt-4 max-w-[36rem]">
            Get the exact steps for your trip, your airline, and your pet.
          </p>
        </div>

        <div className="order-2 relative min-h-[240px] sm:min-h-[320px] lg:h-full lg:min-h-[520px] lg:col-start-2 lg:row-start-1 lg:row-span-2 rounded-3xl overflow-hidden" style={{ boxShadow: "0 18px 40px rgba(20,33,61,0.12)" }}>
          <Image
            src="/images/hero-golden-retriever.jpg"
            alt={HERO_ALT}
            fill
            priority
            sizes="(min-width: 1024px) 46vw, 100vw"
            className="object-cover object-[72%_40%]"
          />
          <div
            className="absolute inset-0 lg:hidden pointer-events-none"
            style={{ background: "linear-gradient(to top, #F3F5F9 0%, rgba(243,245,249,0.55) 12%, rgba(243,245,249,0) 36%), linear-gradient(to right, rgba(243,245,249,0.4) 0%, rgba(243,245,249,0) 32%)" }}
            aria-hidden="true"
          />
        </div>

        <div className="order-3 lg:col-start-1 lg:row-start-2 grid gap-5 lg:mt-6 lg:self-end">
          <fieldset className="grid gap-2" style={{ border: "none", margin: 0, padding: 0 }}>
            <legend style={{ fontFamily: B, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-2">Where are you flying to?</legend>
            <div className="grid gap-2">
              {REGION_CHOICES.map((c) => (
                <Choice key={c.id} name="ppg-region" value={c.id} checked={region === c.id} onChange={() => setRegion(c.id)} label={c.label} hint={c.hint} />
              ))}
            </div>
          </fieldset>
          <fieldset className="grid gap-2" style={{ border: "none", margin: 0, padding: 0 }}>
            <legend style={{ fontFamily: B, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-2">Who’s flying?</legend>
            <div className="grid grid-cols-2 gap-2">
              {PET_CHOICES.map((c) => (
                <Choice key={c.id} name="ppg-pet" value={c.id} checked={pet === c.id} onChange={() => setPet(c.id)} label={c.label} scale />
              ))}
            </div>
          </fieldset>
          <div>
            <a href={href} data-testid="hero-plan" className="btn-primary inline-flex items-center justify-center rounded-full px-8 py-3.5 min-h-[52px] w-full sm:w-auto" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
              {PLAN_CTA}
            </a>
            {(region || pet) ? (
              <p style={{ fontFamily: B, fontSize: 15, lineHeight: 1.45, color: tokens.muted }} className="mt-3">Your choices are filled in on the next page. You can change any answer.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <FlightPathMap route={region} />
        <p style={{ fontFamily: B, fontSize: 15, lineHeight: 1.45, color: tokens.muted }} className="mt-3">
          Example routes. Not a live flight.
        </p>
      </div>
    </div>
  );
}
