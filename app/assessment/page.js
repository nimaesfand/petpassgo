"use client";

import React, { useState, useEffect, useRef } from "react";
import { PRICES as P } from "../../lib/pricing";
import { supabase } from "../../lib/supabaseClient";
import { AIRLINES, requirementAirline } from "../../lib/airlines";
import { tripTypeForRoute, isMexicoAirport } from "../../lib/airports";
import AirportField from "../../components/AirportField";
import FlightLookup, { airportLabel, airlinePickerName } from "../../components/FlightLookup";
import { PassEdge, PassIncluded, PlanPoints } from "../../components/TravelPassOffer";
import { JOIN_PASS_POINTS, JOIN_PASS_NOTE, passOnlyPoints } from "../../lib/travelPassOffer";
import { tripAccessCopy, fmtTripDate } from "../../lib/tripAccess";
import { trackEvent, trackBeginCheckout, getAttribution } from "../../lib/analytics";
import { GuestEmailSheet } from "../../components/GuestEmailStep";
import LinkText from "../../components/LinkText";
import { isTel, prettyPhone } from "../../lib/linkify";
import SiteHeader from "../../components/SiteHeader";
import { tokens, font } from "../../lib/theme";





const TOTAL_STEPS = 6;

function ProgressStub({ step }) {
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2" style={{ fontFamily: font.mono, fontSize: 12.5, color: tokens.ink, opacity: 0.6, letterSpacing: "0.08em" }}>
        <span>STEP {Math.min(step + 1, TOTAL_STEPS)} OF {TOTAL_STEPS}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: tokens.line }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: tokens.stamp }} />
      </div>
    </div>
  );
}

function OptionCard({ label, sub, selected, onClick, icon, compact }) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl transition flex items-center gap-3 ${compact ? "px-4 py-3.5 min-h-[64px]" : "px-5 py-4"} w-full`}
      style={{
        border: `2px solid ${selected ? tokens.navy : tokens.line}`,
        background: selected ? tokens.navy : "#fff",
        color: selected ? "#fff" : tokens.ink,
      }}
    >
      {icon && <span className="text-xl flex-shrink-0">{icon}</span>}
      <div>
        <div style={{ fontFamily: font.body, fontWeight: 600, fontSize: 16, lineHeight: 1.3 }}>{label}</div>
        {sub && <div style={{ fontFamily: font.body, fontSize: 14, opacity: 0.7 }}>{sub}</div>}
      </div>
    </button>
  );
}

function NavRow({ onBack, onNext, nextLabel = "Continue", nextDisabled }) {
  return (
    <div className="flex items-center justify-between mt-8">
      {onBack ? (
        <button onClick={onBack} style={{ fontFamily: font.body, color: tokens.ink, opacity: 0.6, fontSize: 15.5 }} className="hover:opacity-90">
          ← Back
        </button>
      ) : (
        <span />
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        style={{
          fontFamily: font.body,
          fontWeight: 600,
          fontSize: 16,
          background: nextDisabled ? tokens.line : tokens.stamp,
          color: nextDisabled ? "#8a97a3" : "#fff",
        }}
        className="rounded-full px-7 py-3 transition"
      >
        {nextLabel}
      </button>
    </div>
  );
}

const STATUS_META = {
  attention: { color: tokens.stamp, label: "ACTION NEEDED" },
  verify: { color: tokens.amber, label: "VERIFY" },
  complete: { color: tokens.green, label: "READY" },
};

const INSIGHT_CATEGORIES = new Set(["KENNEL REQUIREMENT", "AGE REQUIREMENT", "PET FEE", "BREED RESTRICTION", "VACCINATION"]);
const INSIGHT_ICONS = {
  "KENNEL REQUIREMENT": "🧳",
  "AGE REQUIREMENT": "🎂",
  "PET FEE": "💵",
  "BREED RESTRICTION": "🐾",
  VACCINATION: "💉",
};

// Before payment the real requirement text never reaches the page (not even blurred):
// we render neutral filler of a similar length under the blur.
const FILLER = "Included in your Travel Pass with exact steps and timing ";
function lockedPlaceholder(text) {
  const n = Math.max(24, Math.min(90, (text || "").length));
  return FILLER.repeat(3).slice(0, n);
}

function ResultRow({ category, what, why, deadline, link, status, unlocked }) {
  const meta = STATUS_META[status] || STATUS_META.verify;
  const isInsight = INSIGHT_CATEGORIES.has(category);

  if (isInsight) {
    return (
      <div className="rounded-xl p-5 mb-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        <div style={{ fontFamily: font.mono, fontSize: 12, color: tokens.ink, opacity: 0.45, letterSpacing: "0.08em" }} className="mb-1">
          {category}
        </div>
        {unlocked ? (
          <>
            <div style={{ fontFamily: font.display, fontSize: 17, color: tokens.navy }} className="mb-1">
              {what}
            </div>
            <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, opacity: 0.85 }}><LinkText text={why} /></div>
          </>
        ) : (
          <div
            style={{
              fontFamily: font.body,
              fontSize: 15.5,
              color: tokens.ink,
              opacity: 0.45,
              filter: "blur(3px)",
              userSelect: "none",
            }}
            aria-hidden="true"
          >
            {lockedPlaceholder(what)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5 mb-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div style={{ fontFamily: font.mono, fontSize: 12, color: tokens.ink, opacity: 0.45, letterSpacing: "0.08em" }} className="mb-1">
            {category}
          </div>
          {unlocked ? (
            <>
              <div style={{ fontFamily: font.display, fontSize: 17, color: tokens.navy }} className="mb-1">
                {what}
              </div>
              <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, opacity: 0.85 }}><LinkText text={why} /></div>
            </>
          ) : (
            <div
              style={{
                fontFamily: font.body,
                fontSize: 15.5,
                color: tokens.ink,
                opacity: 0.45,
                filter: "blur(3px)",
                userSelect: "none",
              }}
              className="mt-0.5"
              aria-hidden="true"
            >
              {lockedPlaceholder(what)}
            </div>
          )}
        </div>
        <span
          style={{
            fontFamily: font.mono,
            fontSize: 12,
            letterSpacing: "0.08em",
            color: meta.color,
            border: `1px solid ${meta.color}`,
            borderRadius: 999,
            padding: "3px 9px",
            whiteSpace: "nowrap",
          }}
        >
          {meta.label}
        </span>
      </div>
      {unlocked ? (
        <>
          <div className="flex items-center justify-between gap-3 mt-1 flex-wrap">
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <span
              style={{
                fontFamily: font.mono,
                fontSize: 12.5,
                color: tokens.navy,
                background: tokens.sky,
                padding: "3px 8px",
                borderRadius: 6,
              }}
            >
              DUE {deadline}
            </span>
            {category === "REQUIRED FORM" && (
              <span style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.stamp, fontWeight: 600 }}>
                Submit it as shown in the "Submission" step
              </span>
            )}
          </div>
          {link && (
            <a
              href={link}
              {...(isTel(link) ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              style={{
                fontFamily: font.body,
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                background: tokens.primary,
                textDecoration: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
              className="rounded-full px-4 py-1.5 hover:opacity-90 transition"
            >
              {isTel(link) ? `📞 Call ${prettyPhone(link)}` : "Go here →"}
            </a>
          )}
          </div>
        </>
      ) : (
        <div style={{ fontFamily: font.mono, fontSize: 12.5, color: tokens.stamp, opacity: 0.8 }} className="mt-3">
          🔒 UNLOCK TO SEE DEADLINE &amp; INSTRUCTIONS
        </div>
      )}
    </div>
  );
}

export default function PetPassGoQuiz() {
  const [step, setStep] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [addMembership, setAddMembership] = useState(false);
  const [purchaseIntent, setPurchaseIntent] = useState(""); // "join" | "pass", from /travel-pass
  const [guestPlan, setGuestPlan] = useState(""); // signed-out buyer: email sheet open for "pass" | "join"
  const [autoBuy, setAutoBuy] = useState(""); // set when returning signed in from signup/login with a saved purchase
  const [showDetails, setShowDetails] = useState(true);
  // Real membership status (read-only; only the server/Stripe can set it). The checkbox
  // further down is a pre-launch preview only and is hidden when NEXT_PUBLIC_SITE_LAUNCHED=true.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("plan");
    if (q === "join" || q === "pass") setPurchaseIntent(q);
    trackEvent("start_assessment", { content_type: "assessment", plan_intent: q || undefined });
  }, []);
  const previewTracked = React.useRef(false);
  useEffect(() => {
    if (step === 5 && !previewTracked.current) { previewTracked.current = true; trackEvent("preview_viewed", { content_type: "locked_preview" }); }
  }, [step]);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) supabase.rpc("my_membership").then(({ data: m }) => { if (m) setIsMember(true); });
    });
  }, []);
  const [answers, setAnswers] = useState({
    animal: "",
    role: "",
    origin: "",
    destination: "",
    date: "",
    airline: "",
    flight_number: "",
    flight_snapshot: null,
    round_trip: false,
    return_date: "",
    return_flight_number: "",
    return_flight_snapshot: null,
    psd: false,
    esa: false,
  });
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const set = (k, v) => setAnswers((a) => ({ ...a, [k]: v }));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // Resume a trip that was in progress if the person just came back from signup/login
  useEffect(() => {
    const pending = localStorage.getItem("petpassgo_pending_trip");
    if (pending) {
      try {
        const savedAnswers = JSON.parse(pending);
        setAnswers(savedAnswers);
        setStep(5);
        const intent = localStorage.getItem("petpassgo_purchase_intent");
        if (intent === "join" || intent === "pass") { setPurchaseIntent(intent); setAutoBuy(intent); }
        localStorage.removeItem("petpassgo_purchase_intent");
      } catch (e) {
        // ignore corrupted storage
      }
      localStorage.removeItem("petpassgo_pending_trip");
    }
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));

  // The locked preview is free for everyone, no account needed. Signup happens only
  // when someone chooses to buy (handlePurchase saves the answers and sends them to /signup).
  async function handleSeePlan() {
    next();
  }

  async function handlePurchase(plan = "pass") {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      // Pay first: ask for the email (existing accounts log in instead), then Stripe.
      // Answers stay in this browser so "Back" from Stripe returns to these results.
      const guestPlan = plan === "member" ? "join" : "pass";
      trackBeginCheckout(guestPlan);
      localStorage.setItem("petpassgo_pending_trip", JSON.stringify(answers));
      setGuestPlan(guestPlan);
      return;
    }

    const baseTrip = {
      user_id: data.user.id,
      origin: answers.origin,
      destination: answers.destination,
      airline: answers.airline,
      travel_date: answers.date || null,
      flight_number: answers.flight_number || null,
      flight_snapshot: answers.flight_snapshot || null,
      animal_type: answers.animal,
      role: answers.role,
      status: "ready",
    };
    // New columns are optional. One-way trips omit them so a trip still saves
    // if the return-date migration has not been applied yet.
    const extras = {};
    if (answers.round_trip && answers.return_date) {
      extras.return_date = answers.return_date;
      extras.return_flight_number = answers.return_flight_number || null;
      extras.return_flight_snapshot = answers.return_flight_snapshot || null;
    }
    if (answers.role === "Service animal" && answers.psd) extras.service_kind = "psd";
    let { data: trip, error } = await supabase.from("trips").insert({ ...baseTrip, ...extras }).select("id").single();
    if (error && Object.keys(extras).length) {
      ({ data: trip, error } = await supabase.from("trips").insert(baseTrip).select("id").single());
      if (!error) alert("Your trip was saved as a one-way trip. The return date can be added from your pass once the account update is in place.");
    }
    if (error || !trip) { alert("Sorry, something went wrong saving your trip. Please try again."); return; }

    // Payment happens on Stripe; only the Stripe webhook can mark the trip paid.
    const stripePlan = plan === "member" ? "join" : isMember ? "member_pass" : "pass";
    trackBeginCheckout(stripePlan);
    const { data: s } = await supabase.auth.getSession();
    const r = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" },
      body: JSON.stringify({ plan: stripePlan, trip_id: trip.id, attribution: getAttribution() }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.url) { alert(j.error || "Checkout isn't available right now. Please try again."); return; }
    localStorage.setItem("petpassgo_open_flight_tab", "1");
    window.location.href = j.url;
  }

  // Coming back signed in with a saved purchase: go straight to Stripe Checkout (no second click).
  const autoBuyRan = useRef(false);
  useEffect(() => {
    if (!autoBuy || autoBuyRan.current || !answers.origin) return;
    autoBuyRan.current = true;
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) handlePurchase(autoBuy === "join" ? "member" : "pass");
    });
  }, [autoBuy, answers]);

  function guessStatus(category) {
    category = String(category || "");
    if (category.includes("WHAT HAPPENS")) return "complete";
    if (category.includes("HEALTH") || category.includes("VACCINATION")) return "verify";
    return "attention";
  }

  useEffect(() => {
    if (step !== 5) return;

    setLoadingResults(true);
    setFetchError(false);

    // Free preview: the server returns only categories/status/length, never requirement text.
    supabase
      .rpc("requirements_preview", {
        p_airline: requirementAirline(answers.airline),
        p_animal: answers.animal,
        p_role: answers.role,
        p_trip_types: tripTypeForRoute(answers.origin, answers.destination) === "international" ? ["international", "domestic"] : ["domestic"],
      })
      .then(({ data, error }) => {
        if (error) {
          setFetchError(true);
          setResults([]);
        } else {
          const destLower = (answers.destination || "").toLowerCase();
          const filtered = (data || []).filter((row) => {
            if (!row.destination_match) return true;
            const keywords = row.destination_match.split(",").map((k) => k.trim());
            return keywords.some((k) => destLower.includes(k));
          });
          setResults(
            filtered.map((row) => ({
              id: row.id,
              category: row.category,
              what: row.title || "x".repeat(row.title_len || 40),
              why: row.description || "",
              status: STATUS_META[row.status] ? row.status : guessStatus(row.category || ""),
            }))
          );
        }
        setLoadingResults(false);
      });
  }, [step]);

  const eligibilityNotes = results.filter((r) => r.category === "ELIGIBILITY NOTE");
  const normalResults = results.filter((r) => r.category !== "ELIGIBILITY NOTE");
  const hasRealForms = normalResults.some((r) => ["REQUIRED FORM", "SUBMISSION"].includes(r.category));

  const readiness = unlocked
    ? Math.round((normalResults.filter((r) => r.status === "complete").length / (normalResults.length || 1)) * 100) || 33
    : null;

  const noMatch = step === 5 && !loadingResults && !fetchError && normalResults.length === 0;
  const notSureAirline = /not sure/i.test(answers.airline || "");
  const needsAction = normalResults.filter((r) => r.status === "attention").length;
  const needsVerify = normalResults.filter((r) => r.status === "verify").length;

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full">
      <SiteHeader />
      <div className="w-full flex justify-center px-4 py-10 md:py-14">
      <style>{`
        * { box-sizing: border-box; }
        h1, h2, h3, h4 { font-variant-ligatures: none; -webkit-font-variant-ligatures: none; }
      `}</style>

      <div className="w-full max-w-[720px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 style={{ fontFamily: font.display, fontWeight: 700, fontSize: 28, color: tokens.navy }}>Plan your trip</h1>
          </div>
          {step === 5 && process.env.NEXT_PUBLIC_SITE_LAUNCHED !== "true" && (
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontFamily: font.mono, fontSize: 12, color: tokens.muted }}>
              <input type="checkbox" checked={isMember} onChange={(e) => setIsMember(e.target.checked)} />
              PREVIEW AS MEMBER
            </label>
          )}
        </div>

        {step < 5 && (
          <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mb-4 text-center">See how it works — answer a few questions, preview your checklist, and only pay to unlock your real pass.{purchaseIntent === "join" ? ` Your pick: Join + Travel Pass (${P.joinToday} today, then ${P.member}/mo) — applied at checkout.` : purchaseIntent === "pass" ? ` Your pick: Travel Pass only (${P.pass}) — applied at checkout.` : ""}</p>
        )}
        <div className="rounded-2xl p-6 md:p-9" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 10px 30px rgba(20,33,61,0.06)" }}>
          {step < TOTAL_STEPS && <ProgressStub step={step} />}

          {step === 0 && (
            <>
              <h2 style={{ fontFamily: font.display, fontSize: 24, color: tokens.navy }} className="mb-1">
                What are you traveling with?
              </h2>
              <p style={{ fontFamily: font.body, fontSize: 15, opacity: 0.65 }} className="mb-5">
                This changes which requirements apply to your trip.
              </p>
              <div className="flex flex-col gap-3">
                <OptionCard icon="🐕" label="Dog" selected={answers.animal === "Dog"} onClick={() => set("animal", "Dog")} />
                <OptionCard icon="🐈" label="Cat" selected={answers.animal === "Cat"} onClick={() => set("animal", "Cat")} />
                <OptionCard icon="🐾" label="Other animal" selected={answers.animal === "Other"} onClick={() => set("animal", "Other")} />
              </div>
              <NavRow onNext={next} nextDisabled={!answers.animal} />
            </>
          )}

          {step === 1 && (
            <>
              <h2 style={{ fontFamily: font.display, fontSize: 24, color: tokens.navy }} className="mb-1">
                Pet, service dog, or ESA?
              </h2>
              <p style={{ fontFamily: font.body, fontSize: 15, opacity: 0.65 }} className="mb-5">
                A psychiatric service dog (PSD) is a service dog. An emotional support animal is not.{" "}
                <a href="/blog/service-dog-vs-esa-vs-psd-flying" style={{ color: tokens.navy, fontWeight: 600 }}>How they differ when you fly.</a>
              </p>
              <div className="flex flex-col gap-3">
                <OptionCard label="Pet" sub="Traveling for companionship, not task-trained" selected={answers.role === "Pet" && !answers.esa} onClick={() => setAnswers((a) => ({ ...a, role: "Pet", esa: false, psd: false }))} />
                <OptionCard label="Service dog" sub="Task-trained dog, including a psychiatric service dog (PSD)" selected={answers.role === "Service animal"} onClick={() => setAnswers((a) => ({ ...a, role: "Service animal", esa: false }))} />
                <OptionCard label="Emotional support animal" sub="Flies as a pet since 2021 — carrier and the airline pet fee" selected={answers.role === "Pet" && answers.esa} onClick={() => setAnswers((a) => ({ ...a, role: "Pet", esa: true, psd: false }))} />
              </div>
              {answers.esa && (
                <div className="rounded-xl p-4 mt-4" style={{ background: tokens.sky }}>
                  <div style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy }}>Your ESA flies as a pet</div>
                  <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink, lineHeight: 1.45 }} className="mt-1">Since 2021, U.S. airlines don’t treat emotional support animals as service animals. You’ll follow the pet path: a carrier under the seat and the airline’s pet fee. No DOT service-animal form.</p>
                </div>
              )}
              {answers.role === "Service animal" && answers.animal === "Dog" && (
                <label className="flex items-start gap-3 mt-4 rounded-xl p-4" style={{ background: tokens.sky, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!answers.psd} onChange={(e) => set("psd", e.target.checked)} className="mt-1" />
                  <span style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}><b>This is a PSD.</b> A psychiatric service dog is a service dog trained to do work for a psychiatric disability. Same DOT form as any service dog. Not an ESA, and not a letter you buy.</span>
                </label>
              )}
              {answers.role === "Service animal" && answers.animal === "Dog" && (
                <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mt-3">
                  The airline can ask for the <a href="/blog/dot-service-animal-form" style={{ color: tokens.navy, fontWeight: 600 }}>DOT service animal form</a>.
                  {answers.psd ? <> A PSD does not need a <a href="/blog/do-you-need-a-psd-letter" style={{ color: tokens.navy, fontWeight: 600 }}>letter or certificate</a>.</> : null}
                </p>
              )}
              {answers.role === "Service animal" && answers.animal && answers.animal !== "Dog" && (
                <div className="rounded-xl p-4 mt-4" style={{ background: "#FFF7F2", border: `1px solid ${tokens.primary}` }}>
                  <div style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy }}>U.S. airlines only recognize dogs as service animals</div>
                  <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink, lineHeight: 1.45 }} className="mt-1 mb-3">A cat or other animal can’t fly as a service animal. They fly as pets (carrier and pet fee). You can switch to the pet path and keep going, or go back and choose Dog.</p>
                  <button type="button" onClick={() => setAnswers((a) => ({ ...a, role: "Pet", esa: false, psd: false }))} className="rounded-full px-5 py-3" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 700, border: "none", cursor: "pointer" }}>Switch to the pet path</button>
                </div>
              )}
              <NavRow onBack={back} onNext={next} nextDisabled={!answers.role || (answers.role === "Service animal" && answers.animal !== "Dog")} />
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontFamily: font.display, fontSize: 24, color: tokens.navy }} className="mb-1">
                Where are you flying from and to?
              </h2>
              <p style={{ fontFamily: font.body, fontSize: 15, opacity: 0.65 }} className="mb-5">
                City or airport code is fine.
              </p>
              <FlightLookup date={answers.date} onFill={(f) => setAnswers((a) => ({ ...a, flight_number: f.flight_iata || a.flight_number, flight_snapshot: f, origin: airportLabel(f.departure?.iata, f.departure?.airport) || a.origin, destination: airportLabel(f.arrival?.iata, f.arrival?.airport) || a.destination, airline: airlinePickerName(f.airline) || a.airline, date: f.date_was_requested ? (f.flight_date || a.date) : a.date }))} />
              <div className="flex flex-col gap-3" style={{ position: "relative", zIndex: 1 }}>
                <AirportField key={`o-${answers.origin}`} label="Departing from (type a city)" value={answers.origin} onSelect={(v) => set("origin", v)} />
                <AirportField key={`d-${answers.destination}`} label="Flying to (type a city)" value={answers.destination} onSelect={(v) => set("destination", v)} />
              </div>
              <NavRow onBack={back} onNext={next} nextDisabled={!answers.origin || !answers.destination} />
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ fontFamily: font.display, fontSize: 24, color: tokens.navy }} className="mb-1">
                When are you traveling?
              </h2>
              <p style={{ fontFamily: font.body, fontSize: 15, opacity: 0.65 }} className="mb-4">
                One way is the normal trip: from, to, and one date. Round trip is optional — tap it only if you’re flying back.
              </p>
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setAnswers((a) => ({ ...a, round_trip: false, return_date: "", return_flight_number: "", return_flight_snapshot: null }))} className="rounded-full px-4 py-2.5" style={{ fontFamily: font.body, fontWeight: 700, background: !answers.round_trip ? tokens.navy : "#fff", color: !answers.round_trip ? "#fff" : tokens.navy, border: `2px solid ${tokens.navy}`, cursor: "pointer" }}>One way</button>
                <button type="button" onClick={() => set("round_trip", true)} className="rounded-full px-4 py-2.5" style={{ fontFamily: font.body, fontWeight: 700, background: answers.round_trip ? tokens.navy : "#fff", color: answers.round_trip ? "#fff" : tokens.navy, border: `2px solid ${tokens.navy}`, cursor: "pointer" }}>Round trip</button>
              </div>
              <label style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: tokens.navy }}>Depart</label>
              <input
                type="date"
                value={answers.date}
                onChange={(e) => set("date", e.target.value)}
                aria-label="Departure date"
                style={{
                  fontFamily: font.body,
                  border: `2px solid ${tokens.line}`,
                  fontSize: 16,
                  background: "#fff",
                  color: tokens.ink,
                  height: 52,
                  WebkitAppearance: "none",
                  appearance: "none",
                }}
                className="rounded-xl px-4 outline-none w-full mt-1"
              />
              {answers.round_trip && (
                <div className="mt-4">
                  <label style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: tokens.navy }}>Return date</label>
                  <input type="date" value={answers.return_date} min={answers.date || undefined} onChange={(e) => set("return_date", e.target.value)} aria-label="Return date" className="rounded-xl px-4 outline-none w-full mt-1" style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16, height: 52 }} />
                  <div className="mt-3">
                    <FlightLookup mode="return" date={answers.return_date} onFill={(f) => setAnswers((a) => ({ ...a, return_flight_number: f.flight_iata || a.return_flight_number, return_flight_snapshot: f, return_date: f.date_was_requested ? (f.flight_date || a.return_date) : a.return_date }))} />
                  </div>
                  {answers.return_date && <p style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy }}>Back {fmtTripDate(answers.return_date)}</p>}
                </div>
              )}
              <NavRow onBack={back} onNext={next} nextDisabled={!answers.date || (answers.round_trip && !answers.return_date)} />
            </>
          )}

          {step === 4 && (
            <>
              <h2 style={{ fontFamily: font.display, fontSize: 24, color: tokens.navy }} className="mb-1">
                Which airline?
              </h2>
              <p style={{ fontFamily: font.body, fontSize: 15, opacity: 0.65 }} className="mb-5">
                Requirements vary a lot by carrier — this is what makes your plan specific to you.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {AIRLINES.map((a) => (
                  <OptionCard key={a} label={a} compact selected={answers.airline === a} onClick={() => set("airline", a)} />
                ))}
              </div>
              <NavRow onBack={back} onNext={handleSeePlan} nextDisabled={!answers.airline} nextLabel="See my plan" />
            </>
          )}

          {step === 5 && (
            <>
              <div className="text-center mb-6">
                <div style={{ fontFamily: font.mono, fontSize: 12.5, color: tokens.stamp, letterSpacing: "0.12em" }} className="mb-2">
                  YOUR PERSONALIZED TRIP PLAN
                </div>
                <h2 style={{ fontFamily: font.display, fontSize: 26, color: tokens.navy }}>
                  {answers.animal} · {answers.origin || "—"} → {answers.destination || "—"}
                </h2>
                <div style={{ fontFamily: font.body, fontSize: 15, opacity: 0.65 }} className="mt-1">
                  {answers.airline} · {answers.date || "date pending"}{answers.round_trip && answers.return_date ? ` · back ${fmtTripDate(answers.return_date)}` : ""} · {answers.role === "Service animal" ? (answers.psd ? "PSD (service dog)" : "Service dog") : answers.esa ? "ESA, flying as a pet" : answers.role}{isMexicoAirport(answers.destination) || isMexicoAirport(answers.origin) ? " · International (Mexico)" : ""}
                </div>
              </div>

              {!loadingResults && eligibilityNotes.length > 0 && (
                <div className="mb-4">
                  {eligibilityNotes.map((note) => (
                    <div
                      key={note.what}
                      className="rounded-xl p-4 mb-3"
                      style={{ background: "#FFF9EC", border: `1.5px solid ${tokens.gold}` }}
                    >
                      <div style={{ fontFamily: font.display, fontSize: 16.5, color: tokens.navy }} className="mb-1">
                        {note.what}
                      </div>
                      <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink, opacity: 0.8 }}>
                        {note.why}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!noMatch && <div className="rounded-xl p-4 mb-5" style={{ background: tokens.navy }}>
                {loadingResults ? (
                  <div style={{ fontFamily: font.body, fontSize: 15, color: "#fff" }}>Looking up requirements…</div>
                ) : unlocked ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div style={{ fontFamily: font.mono, fontSize: 12, color: tokens.sky, opacity: 0.7, letterSpacing: "0.1em" }}>
                        TRIP READINESS
                      </div>
                      <div style={{ fontFamily: font.display, fontSize: 30, color: "#fff" }}>{readiness}%</div>
                    </div>
                    <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.sky, opacity: 0.8 }} className="max-w-[180px] text-right">
                      Full plan unlocked — deadlines and instructions below.
                    </div>
                  </div>
                ) : (
                  <div style={{ fontFamily: font.body, fontSize: 15, color: "#fff" }}>
                    <span style={{ fontWeight: 700 }}>{normalResults.length} requirements found</span> for this trip —{" "}
                    <span style={{ color: tokens.stamp === tokens.stamp ? "#F2A79A" : "" }}>{needsAction} need action</span>,{" "}
                    {needsVerify} need verification.
                  </div>
                )}
              </div>}

              {noMatch && (
                <div className="rounded-xl p-5 mb-4 text-center" style={{ background: "#FFF9EC", border: `1.5px solid ${tokens.gold}`, fontFamily: font.body, fontSize: 15.5, color: tokens.ink }}>
                  <div style={{ fontFamily: font.display, fontSize: 18, color: tokens.navy }} className="mb-1">🐾 We're not there yet</div>
                  {notSureAirline ? (
                    <p className="mb-3">Pick your airline to see your Travel Pass. Requirements change a lot by carrier, so we need it to build your plan.</p>
                  ) : null}
                  <p>We don't cover this airline or trip yet. Email <a href="mailto:support@petpassgo.com" style={{ color: tokens.primary, fontWeight: 600 }}>support@petpassgo.com</a> and we'll look into adding it.</p>
                  {notSureAirline && (
                    <button onClick={() => setStep(4)} className="mt-4 rounded-full px-6 py-2.5" style={{ background: tokens.navy, color: "#fff", fontWeight: 600 }}>Choose my airline</button>
                  )}
                </div>
              )}

              {unlocked && !hasRealForms && normalResults.length > 0 && (
                <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, opacity: 0.75 }} className="mb-4">
                  No forms needed for this trip — {answers.airline}, {answers.origin || "—"} → {answers.destination || "—"}. Here's what to know:
                </div>
              )}

              {normalResults.map((r) => (
                <ResultRow key={r.id || r.what} {...r} unlocked={unlocked} />
              ))}

              {unlocked && (
                <div className="rounded-xl p-5 mb-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
                  <div style={{ fontFamily: font.mono, fontSize: 12, color: tokens.ink, opacity: 0.45, letterSpacing: "0.08em" }} className="mb-2">
                    DOCUMENT VAULT
                  </div>
                  <div style={{ fontFamily: font.body, fontSize: 14.5, opacity: 0.7 }} className="mb-3">
                    Upload what you have — we'll match it to the right requirement automatically.
                  </div>
                  {["Vaccination record", "Pet photo for Digital ID", "Training documentation (if applicable)"].map((doc) => (
                    <div key={doc} className="flex items-center justify-between py-2" style={{ borderTop: `1px solid ${tokens.line}` }}>
                      <span style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>{doc}</span>
                      <button
                        style={{
                          fontFamily: font.mono,
                          fontSize: 12.5,
                          color: tokens.navy,
                          border: `1px solid ${tokens.navy}`,
                          borderRadius: 999,
                          padding: "4px 12px",
                        }}
                      >
                        UPLOAD
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!unlocked && !noMatch && (
                <div className="mt-6 mb-2">
                  <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: tokens.navy }} className="mb-3">What your Travel Pass gives you</div>
                  <PassEdge />
                  <div className="mt-3"><PassIncluded /></div>
                </div>
              )}

              {noMatch ? null : !unlocked ? (
                isMember ? (
                  <div className="mt-5">
                    <button
                      onClick={() => handlePurchase("pass")}
                      style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600 }}
                      className="w-full rounded-full py-3.5 text-[15px] hover:opacity-90 transition"
                    >
                      Unlock your Travel Pass — {P.memberPass} member price
                    </button>
                    <div className="mt-3 rounded-xl p-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
                      <PlanPoints points={["This trip’s full Travel Pass", "Your pet’s records and Pet ID carried over"]} />
                    </div>
                  </div>
                ) : (
                  <div className="mt-5">
                    <div
                      className="rounded-xl p-5 mb-4"
                      style={{ background: tokens.navy }}
                    >
                      <div style={{ fontFamily: font.mono, fontSize: 12, color: tokens.gold, letterSpacing: "0.1em" }} className="mb-1">
                        READY TO FLY WITH {(answers.airline || "YOUR AIRLINE").toUpperCase()}
                      </div>
                      <div style={{ fontFamily: font.display, fontSize: 18, color: "#fff" }}>
                        Your pass for this trip is ready to unlock.
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl p-5 relative flex flex-col" style={{ background: tokens.navy, color: "#fff", border: `2px solid ${tokens.gold}` }}>
                        <span className="absolute -top-3 left-5 rounded-full px-3 py-0.5" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 800, fontSize: 11 }}>{purchaseIntent === "join" ? "YOUR PICK · " : ""}SAVE {P.savings} ON THIS TRIP</span>
                        <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 12.5, letterSpacing: ".12em", color: tokens.gold }} className="mb-1 mt-1">JOIN + PASS</div>
                        <div style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700 }}>{P.memberPass} <span style={{ fontSize: 15, fontWeight: 500, opacity: 0.75 }}>+ {P.member}/mo</span></div>
                        <div className="mb-4 flex-1 flex flex-col"><PlanPoints dark points={JOIN_PASS_POINTS} note={JOIN_PASS_NOTE} /></div>
                        <button onClick={() => { setAddMembership(true); handlePurchase("member"); }} className="w-full rounded-full py-3 hover:opacity-90 transition" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 700, fontSize: 15 }}>
                          Join and unlock your Travel Pass · {P.joinToday} today
                        </button>
                      </div>
                      <div className="rounded-2xl p-5 flex flex-col" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
                        <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 12.5, letterSpacing: ".12em", color: tokens.primary }} className="mb-1 mt-1">THIS TRIP ONLY</div>
                        <div style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: tokens.navy }}>{P.pass}</div>
                        <div className="mb-4 flex-1 flex flex-col"><PlanPoints points={passOnlyPoints(tripAccessCopy(answers.date, answers.round_trip ? answers.return_date : null))} note={purchaseIntent === "pass" ? "Your pick." : null} /></div>
                        <button onClick={() => handlePurchase("pass")} className="w-full rounded-full py-3 hover:opacity-90 transition" style={{ background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}`, fontFamily: font.body, fontWeight: 600, fontSize: 15 }}>
                          Unlock your Travel Pass — {P.pass}
                        </button>
                      </div>
                    </div>
                    <p style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }} className="mt-3 text-center">Nothing is charged until checkout.</p>

                  </div>
                )
              ) : (
                <div
                  className="mt-5 rounded-xl p-4 text-center"
                  style={{ background: "#fff", border: `1px dashed ${tokens.green}`, fontFamily: font.body, fontSize: 14.5, color: tokens.green }}
                >
                  ✓ Unlocked — this is what the customer sees after paying.
                </div>
              )}

              <button
                onClick={() => {
                  setStep(0);
                  setUnlocked(false);
                }}
                style={{ fontFamily: font.body, color: tokens.ink, opacity: 0.5, fontSize: 14.5 }}
                className="w-full text-center mt-4"
              >
                Start over
              </button>
            </>
          )}
        </div>
      </div>
      </div>
      <GuestEmailSheet open={!!guestPlan} title={guestPlan === "join" ? `Join + Travel Pass · ${P.joinToday}` : `Travel Pass · ${P.pass}`} plan={guestPlan} trip={answers} cancelPath="/assessment?checkout=canceled" onClose={() => setGuestPlan("")} />
    </div>
  );
}
