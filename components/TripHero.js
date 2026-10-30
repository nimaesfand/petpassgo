"use client";

import { useState } from "react";
import { tokens, font } from "../lib/theme";
import { PLAN_CTA, JOIN_CTA, LOGIN_CTA } from "../lib/cta";
import { PET_CHOICES, REGION_CHOICES, planTripHref } from "../lib/tripIntent";
import FlightPathMap from "./FlightPathMap";

const D = font.display;
const B = font.body;

function Choice({ name, value, checked, onChange, label, hint }) {
  return (
    <label
      className="ppg-choice rounded-2xl px-4 py-3 min-h-[52px] flex flex-col justify-center cursor-pointer"
      style={{
        background: checked ? tokens.navy : "#fff",
        color: checked ? "#fff" : tokens.navy,
        border: `2px solid ${checked ? tokens.navy : tokens.line}`,
        fontFamily: B,
      }}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{label}</span>
      {hint ? <span style={{ fontSize: 15, lineHeight: 1.35, marginTop: 2, opacity: 0.8 }}>{hint}</span> : null}
    </label>
  );
}

export default function TripHero() {
  const [region, setRegion] = useState("");
  const [pet, setPet] = useState("");
  const href = planTripHref(region, pet);

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)] lg:gap-12 lg:items-center">
      <div className="contents lg:flex lg:flex-col lg:gap-6">
        <div className="order-1 lg:order-none">
          <h1 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05 }} className="text-[32px] sm:text-[48px] lg:text-[60px] font-bold">
            Fly with your pets, skip the guesswork.
          </h1>
          <p style={{ fontFamily: B, color: tokens.ink, fontSize: 16, lineHeight: 1.5 }} className="mt-3 max-w-[36rem]">
            U.S., Canada and Mexico, plus international. Choose the trip and the pet, then plan it.
          </p>
        </div>

        <div className="order-3 lg:order-none grid gap-5">
          <fieldset className="grid gap-2" style={{ border: "none", margin: 0, padding: 0 }}>
            <legend style={{ fontFamily: B, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-2">Where are you flying?</legend>
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
                <Choice key={c.id} name="ppg-pet" value={c.id} checked={pet === c.id} onChange={() => setPet(c.id)} label={c.label} />
              ))}
            </div>
          </fieldset>
        </div>

        <div className="order-4 lg:order-none">
          <a href={href} className="btn-primary inline-flex items-center justify-center rounded-full px-8 py-3.5 min-h-[52px] w-full sm:w-auto" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
            {PLAN_CTA}
          </a>
          {(region || pet) ? (
            <p style={{ fontFamily: B, fontSize: 15, lineHeight: 1.45, color: tokens.muted }} className="mt-3">Your choices are filled in on the next page. You can change any answer.</p>
          ) : null}
          <div className="flex flex-col items-start gap-1 mt-4">
            <a href="/join" className="inline-flex items-center min-h-[44px]" style={{ fontFamily: B, fontWeight: 700, fontSize: 16, color: tokens.navy, textDecoration: "underline", textUnderlineOffset: 3 }}>{JOIN_CTA}</a>
            <a href="/login" className="inline-flex items-center min-h-[44px]" style={{ fontFamily: B, fontWeight: 600, fontSize: 16, color: tokens.navy, textDecoration: "underline", textUnderlineOffset: 3 }}>{LOGIN_CTA}</a>
          </div>
        </div>
      </div>
      <div className="order-2 lg:order-none">
        <FlightPathMap route={region} />
      </div>
    </div>
  );
}
