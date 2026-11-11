"use client";

import { useState, useEffect, useRef } from "react";
import { PRICES as P, usd } from "../../lib/pricing";
import { supabase } from "../../lib/supabaseClient";
import { OTHER_AIRLINE, airlineGroupsForRegion } from "../../lib/airlines";
import { TRAVEL_METHODS } from "../../lib/tripFit";
import { pickTripPet } from "../../lib/tripPet";
import { routeAllowed, tripTypeForRoute } from "../../lib/airports";
import { connectionReady, rulesRole, segmentsToStore } from "../../lib/segments";
import { saveCheckoutTrip } from "../../lib/tripCheckout";
import AirportField from "../../components/AirportField";
import RequirementsPreview from "../../components/RequirementsPreview";
import FlightLookup, { airportLabel, airlineFromFlight } from "../../components/FlightLookup";
import { readTripIntent } from "../../lib/tripIntent";
import { fmtTripDate } from "../../lib/tripAccess";
import { trackEvent, trackBeginCheckout, getAttribution } from "../../lib/analytics";
import { GuestEmailSheet } from "../../components/GuestEmailStep";
import SiteHeader from "../../components/SiteHeader";
import Icon from "../../components/Icon";
import { PLAN_CTA } from "../../lib/cta";
import { tokens, font } from "../../lib/theme";
import TrustBadges from "../../components/TrustBadges";
import WithdrawalConsent from "../../components/WithdrawalConsent";
import MarketingOptIn from "../../components/MarketingOptIn";
import { WITHDRAWAL_BLOCKED, takeWithdrawalConsent } from "../../lib/withdrawal";





const TOTAL_STEPS = 7;

function ProgressStub({ step }) {
  const shown = Math.min(step + 1, TOTAL_STEPS);
  const pct = shown >= TOTAL_STEPS ? 100 : Math.round((shown / TOTAL_STEPS) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: tokens.ink }}>
        <span>Step {shown} of {TOTAL_STEPS}</span>
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
      {icon && <Icon name={icon} size={22} />}
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

function AirlineGroup({ title, names, selected, onSelect, columns }) {
  if (!names.length) return null;
  return (
    <div className="mb-4">
      <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-2">{title}</div>
      <div className={columns === 2 ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"}>
        {names.map((a) => (
          <OptionCard key={a} label={a} compact selected={selected === a} onClick={() => onSelect(a)} />
        ))}
      </div>
    </div>
  );
}

function AirlineChoices({ query, selected, onSelect, region }) {
  const q = query.trim().toLowerCase();
  const match = (name) => !q || name.toLowerCase().includes(q);
  const groups = airlineGroupsForRegion(region).map(([title, names, columns]) => [title, names.filter(match), columns]);
  const showOther = match(OTHER_AIRLINE);
  const any = groups.some(([, names]) => names.length) || showOther;
  return (
    <>
      {groups.map(([title, names, columns]) => (
        <AirlineGroup key={title} title={title} names={names} selected={selected} onSelect={onSelect} columns={columns} />
      ))}
      {showOther && <OptionCard label={OTHER_AIRLINE} compact selected={selected === OTHER_AIRLINE} onClick={() => onSelect(OTHER_AIRLINE)} />}
      {!any && (
        <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>No airline with that name. Try another spelling, or pick Other / not sure yet.</p>
      )}
    </>
  );
}

export default function PetPassGoQuiz() {
  const [step, setStep] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [guestPlan, setGuestPlan] = useState(""); // signed-out buyer: email sheet open for "pass" | "join"
  const [buying, setBuying] = useState(false);
  const [consent, setConsent] = useState(false);
  const [tips, setTips] = useState(false);
  const [consentErr, setConsentErr] = useState("");
  const [airlineQuery, setAirlineQuery] = useState("");
  const [autoBuy, setAutoBuy] = useState(""); // set when returning signed in from signup/login with a saved purchase
  const [booted, setBooted] = useState(false);
  const [regionHint, setRegionHint] = useState("");
  // Real membership status (read-only; only the server/Stripe can set it). The checkbox
  // further down is a pre-launch preview only and is hidden when NEXT_PUBLIC_SITE_LAUNCHED=true.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("plan");
    trackEvent("start_assessment", { content_type: "assessment", plan_intent: q || undefined });
  }, []);
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
    connecting: null,
    second_airline: "",
    second_date: "",
    second_mode: "",
    stop: "",
    pet_travel: "",
  });
  const set = (k, v) => setAnswers((a) => ({ ...a, [k]: v }));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // Resume a trip that was in progress if the person just came back from signup/login.
  // Otherwise a homepage chooser can pre-fill pet type and which airline group to show.
  useEffect(() => {
    try {
      const pending = localStorage.getItem("petpassgo_pending_trip");
      if (pending) {
        try {
          const savedAnswers = JSON.parse(pending);
          setAnswers(savedAnswers);
          setStep(6);
          const intent = localStorage.getItem("petpassgo_purchase_intent");
          if (intent === "join" || intent === "pass") setAutoBuy(intent);
          localStorage.removeItem("petpassgo_purchase_intent");
        } catch (e) {
          // ignore corrupted storage
        }
        localStorage.removeItem("petpassgo_pending_trip");
        return;
      }
      const intent = readTripIntent(window.location.search);
      if (intent.region) setRegionHint(intent.region);
      if (intent.pet) setAnswers((a) => ({ ...a, ...intent.answers }));
      if (intent.step) setStep(intent.step);
    } finally {
      setBooted(true);
    }
  }, []);

  const next = () => setStep((s) => {
    if (s === 0 && answers.esa && answers.role === "Pet") return 2;
    return Math.min(s + 1, TOTAL_STEPS);
  });

  // Questions lead straight to checkout. Pay-first email and Stripe stay in handlePurchase.
  async function handleSeePlan() {
    next();
  }

  async function handlePurchase(plan = "pass", consentOverride = false) {
    if (buying) return;
    const { data } = await supabase.auth.getUser();
    if (!consentOverride && !consent) { setConsentErr(WITHDRAWAL_BLOCKED); return; }
    if (!routeAllowed(answers.origin, answers.destination)) {
      alert("PetPassGo trips are in the United States, Canada, and Mexico.");
      return;
    }
    if (!data.user) {
      // Pay first: ask for the email (existing accounts log in instead), then Stripe.
      // Answers stay in this browser so "Back" from Stripe returns to these results.
      const nextGuest = plan === "member" ? "join" : "pass";
      trackBeginCheckout(nextGuest);
      localStorage.setItem("petpassgo_pending_trip", JSON.stringify(answers));
      setGuestPlan(nextGuest);
      return;
    }

    setBuying(true);
    const baseTrip = {
      user_id: data.user.id,
      origin: answers.origin,
      destination: answers.destination,
      airline: answers.airline,
      travel_date: answers.date || null,
      flight_number: answers.flight_number || null,
      flight_snapshot: answers.flight_snapshot || null,
      animal_type: answers.animal,
      role: rulesRole(answers.role, answers.esa),
      status: answers.connecting ? "checking" : "ready",
    };
    const { data: pets } = await supabase.from("pets").select("id,animal_type").eq("user_id", data.user.id);
    const linked = pickTripPet(pets, { animal_type: answers.animal });
    if (linked) baseTrip.pet_id = linked.id;
    const extras = {};
    if (answers.round_trip && answers.return_date) {
      extras.return_date = answers.return_date;
      extras.return_flight_number = answers.return_flight_number || null;
      extras.return_flight_snapshot = answers.return_flight_snapshot || null;
    }
    if (answers.role === "Service animal" && answers.psd) extras.service_kind = "psd";
    if (answers.connecting) extras.connecting = true;
    if (answers.connecting && answers.second_airline) extras.second_airline = answers.second_airline;
    if (answers.pet_travel) extras.pet_travel = answers.pet_travel;
    const segments = segmentsToStore(answers);
    if (segments) extras.segments = segments;
    const saved = await saveCheckoutTrip(supabase, { userId: data.user.id, baseTrip, extras, answers });
    if (saved.paid) { setBuying(false); alert("This trip is already unlocked. Open My Trips to see it."); return; }
    if (saved.droppedSegments) alert("The connection city was not stored yet. Apply the database update, then plan the trip again. The first and second airline were saved.");
    if (saved.droppedReturn) alert("Your trip was saved as a one-way trip. The return date can be added from your pass once the account update is in place.");
    const trip = saved.trip;
    if (saved.error || !trip) { setBuying(false); alert("Sorry, something went wrong saving your trip. Please try again."); return; }

    // Payment happens on Stripe; only the Stripe webhook can mark the trip paid.
    const stripePlan = plan === "member" ? "join" : isMember ? "member_pass" : "pass";
    trackBeginCheckout(stripePlan);
    const { data: s } = await supabase.auth.getSession();
    const r = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" },
      body: JSON.stringify({ plan: stripePlan, trip_id: trip.id, attribution: getAttribution(), immediate_access_consent: true, marketing_opt_in: tips }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.url) { setBuying(false); alert(j.error || "Checkout isn't available right now. Please try again."); return; }
    localStorage.setItem("petpassgo_open_flight_tab", "1");
    window.location.href = j.url;
  }

  // Coming back signed in with a saved purchase: go straight to Stripe Checkout (no second click).
  const autoBuyRan = useRef(false);
  useEffect(() => {
    if (!autoBuy || autoBuyRan.current || !answers.origin) return;
    autoBuyRan.current = true;
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session && takeWithdrawalConsent()) handlePurchase(autoBuy === "join" ? "member" : "pass", true);
    });
  }, [autoBuy, answers]);

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full ppg-fab-clear">
      <SiteHeader />
      <div className="w-full flex justify-center px-4 py-10 md:py-14">
      <style>{`
        * { box-sizing: border-box; }
        h1, h2, h3, h4 { font-variant-ligatures: none; -webkit-font-variant-ligatures: none; }
      `}</style>

      <div className="w-full max-w-[720px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 style={{ fontFamily: font.display, fontWeight: 700, fontSize: 28, color: tokens.navy }}>{PLAN_CTA}</h1>
          </div>

        </div>

        <div className="rounded-2xl p-6 md:p-9" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 10px 30px rgba(20,33,61,0.06)" }}>
          {!booted ? (
            <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.muted }}>Loading your questions…</p>
          ) : (<>
          {step < TOTAL_STEPS && <ProgressStub step={step} />}

          {step === 0 && (
            <>
              <h2 style={{ fontFamily: font.display, fontSize: 24, color: tokens.navy }} className="mb-1">
                What are you traveling with?
              </h2>
              <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.muted }} className="mb-5">
                This changes which requirements apply to your trip.
              </p>
              {answers.esa && (
                <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink }} className="mb-4">ESA is selected. Choose dog or cat. An emotional support animal flies as a pet.</p>
              )}
              <div className="flex flex-col gap-3">
                <OptionCard icon="dog" label="Dog" selected={answers.animal === "Dog"} onClick={() => set("animal", "Dog")} />
                <OptionCard icon="cat" label="Cat" selected={answers.animal === "Cat"} onClick={() => set("animal", "Cat")} />
                <OptionCard icon="paw" label="Other animal" selected={answers.animal === "Other"} onClick={() => set("animal", "Other")} />
              </div>
              <NavRow onNext={next} nextDisabled={!answers.animal} />
            </>
          )}

          {step === 1 && (
            <>
              <h2 style={{ fontFamily: font.display, fontSize: 24, color: tokens.navy }} className="mb-1">
                Pet, service dog, or ESA?
              </h2>
              <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.muted }} className="mb-5">
                A psychiatric service dog (PSD) is a service dog. An emotional support animal is not.
              </p>
              <div className="flex flex-col gap-3">
                <OptionCard label="Pet" sub="Traveling for companionship, not task-trained" selected={answers.role === "Pet" && !answers.esa} onClick={() => setAnswers((a) => ({ ...a, role: "Pet", esa: false, psd: false }))} />
                <OptionCard label="Service dog" sub="Task-trained dog, including a psychiatric service dog (PSD)" selected={answers.role === "Service animal"} onClick={() => setAnswers((a) => ({ ...a, role: "Service animal", esa: false }))} />
                <OptionCard label="Emotional support animal" sub="Flies as a pet" selected={answers.role === "Pet" && answers.esa} onClick={() => setAnswers((a) => ({ ...a, role: "Pet", esa: true, psd: false }))} />
              </div>
              {answers.esa && (
                <div className="rounded-xl p-4 mt-4" style={{ background: tokens.sky }}>
                  <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>Your ESA flies as a pet</div>
                  <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink, lineHeight: 1.45 }} className="mt-1">The Travel Pass uses the pet path after you pay.</p>
                </div>
              )}
              {answers.role === "Service animal" && answers.animal === "Dog" && (
                <label className="flex items-start gap-3 mt-4 rounded-xl p-4" style={{ background: tokens.sky, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!answers.psd} onChange={(e) => set("psd", e.target.checked)} className="mt-1" />
                  <span style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}><b>This is a PSD.</b> A psychiatric service dog is a service dog. It is not an emotional support animal.</span>
                </label>
              )}
              {answers.role === "Service animal" && answers.animal && answers.animal !== "Dog" && (
                <div className="rounded-xl p-4 mt-4" style={{ background: "#FFF7F2", border: `1px solid ${tokens.primary}` }}>
                  <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>U.S. airlines recognize dogs as service animals</div>
                  <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink, lineHeight: 1.45 }} className="mt-1 mb-3">A cat or other animal flies as a pet. Switch to the pet path, or go back and choose Dog.</p>
                  <button type="button" onClick={() => setAnswers((a) => ({ ...a, role: "Pet", esa: false, psd: false }))} className="rounded-full px-5 py-3" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 700, border: "none", cursor: "pointer" }}>Switch to the pet path</button>
                </div>
              )}
              <NavRow onBack={back} onNext={next} nextDisabled={!answers.role || (answers.role === "Service animal" && answers.animal !== "Dog")} />
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontFamily: font.display, fontSize: 24, color: tokens.navy }} className="mb-5">
                Where are you flying from and to?
              </h2>
              <FlightLookup
                date={answers.date}
                onNumberOnly={(num, d) => setAnswers((a) => ({ ...a, flight_number: num, date: d || a.date }))}
                onFill={(f) => {
                  const origin = airportLabel(f.departure?.iata, f.departure?.airport);
                  const destination = airportLabel(f.arrival?.iata, f.arrival?.airport);
                  const airline = airlineFromFlight(f);
                  const date = f.flight_date || answers.date;
                  setAnswers((a) => ({ ...a, origin, destination, date, airline: airline || a.airline, flight_number: f.flight_iata || f.requested_iata || "", flight_snapshot: f }));
                  // Everything we need came from the flight: skip ahead to "how does your pet fly?"
                  if (airline && date && routeAllowed(origin, destination)) setTimeout(() => setStep(5), 900);
                }}
              />
              <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: tokens.muted }} className="mb-2">Or type your cities</div>
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
                When do you leave?
              </h2>
              <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.muted }} className="mb-4">
                One way is the usual trip. Choose round trip only if you fly back.
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
                  {answers.return_date && <p style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mt-2">Back {fmtTripDate(answers.return_date)}</p>}
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
              {answers.flight_snapshot && answers.airline ? (
                <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }} className="mb-4">
                  Filled in from your flight number: {answers.airline}. Change it if that’s wrong.
                </p>
              ) : null}
              <input
                value={airlineQuery}
                onChange={(e) => setAirlineQuery(e.target.value)}
                placeholder="Search airlines"
                aria-label="Search airlines"
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }}
                className="rounded-xl px-4 py-3 outline-none w-full mb-4"
              />
              <AirlineChoices
                query={airlineQuery}
                selected={answers.airline}
                onSelect={(name) => { set("airline", name); setTimeout(() => setStep((s) => (s === 4 ? 5 : s)), 220); }}
                region={tripTypeForRoute(answers.origin, answers.destination) === "domestic" ? "domestic" : (regionHint || "near")}
              />
              <NavRow onBack={back} onNext={handleSeePlan} nextDisabled={!answers.airline} nextLabel="Continue" />
            </>
          )}

          {step === 5 && (
            <>
              <h2 style={{ fontFamily: font.display, fontSize: 24, color: tokens.navy }} className="mb-5">
                How does the trip fly?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <OptionCard label="Nonstop" sub="One flight" selected={answers.connecting === false} onClick={() => setAnswers((a) => ({ ...a, connecting: false, second_airline: "", stop: "", second_date: "", second_mode: "" }))} />
                <OptionCard label="Connecting" sub="Two flights" selected={answers.connecting === true} onClick={() => setAnswers((a) => ({ ...a, connecting: true }))} />
              </div>
              {answers.connecting === true && (
                <div className="mt-5">
                  <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-2">Where do you change planes?</div>
                  <AirportField key={`stop-${answers.stop}`} label="Stop city" value={answers.stop} onSelect={(stop) => set("stop", stop)} />
                  <label className="block mt-3" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>Second flight date
                    <input type="date" aria-label="Second flight date" value={answers.second_date || answers.date} min={answers.date || undefined} onChange={(e) => set("second_date", e.target.value)} className="mt-1 w-full rounded-xl px-3" style={{ fontFamily: font.body, fontSize: 16, height: 52, border: `2px solid ${tokens.line}` }} />
                  </label>
                  <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mt-4 mb-2">Are all flights on {answers.airline && !/not sure/i.test(answers.airline) ? answers.airline : "the same airline"}?</div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => set("second_airline", "")} className="rounded-full px-4 py-2.5" style={{ fontFamily: font.body, fontWeight: 700, background: !answers.second_airline ? tokens.navy : "#fff", color: !answers.second_airline ? "#fff" : tokens.navy, border: `2px solid ${tokens.navy}`, cursor: "pointer" }}>Yes, same airline</button>
                    <select value={answers.second_airline} onChange={(e) => set("second_airline", e.target.value)} aria-label="Second airline" className="rounded-full px-4 py-2.5" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, background: answers.second_airline ? tokens.navy : "#fff", color: answers.second_airline ? "#fff" : tokens.navy, border: `2px solid ${tokens.navy}`, cursor: "pointer" }}>
                      <option value="">Another airline too…</option>
                      {airlineGroupsForRegion(tripTypeForRoute(answers.origin, answers.destination) === "domestic" ? "domestic" : (regionHint || "near")).flatMap(([, names]) => names).filter((n) => n !== answers.airline && n !== OTHER_AIRLINE).map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              )}
              {answers.role !== "Service animal" && answers.connecting === true && (
                <div className="mt-4">
                  <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-2">Second flight</div>
                  <div className="flex flex-col gap-3">
                    {TRAVEL_METHODS.filter((m) => m.id !== "unsure").map((m) => (
                      <OptionCard key={m.id} label={m.label} sub={m.sub} selected={(answers.second_mode || answers.pet_travel) === m.id} onClick={() => set("second_mode", m.id)} />
                    ))}
                  </div>
                </div>
              )}
              {answers.role !== "Service animal" && answers.connecting !== null && (
                <div className="mt-6">
                    <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-2">{answers.connecting ? "First flight" : `Where will your ${answers.animal === "Other" ? "pet" : String(answers.animal || "pet").toLowerCase()} ride?`}</div>
                  <div className="flex flex-col gap-3">
                    {TRAVEL_METHODS.map((m) => (
                      <OptionCard key={m.id} label={m.label} sub={m.sub} selected={answers.pet_travel === m.id} onClick={() => set("pet_travel", m.id)} />
                    ))}
                  </div>
                </div>
              )}
              <NavRow onBack={back} onNext={next} nextDisabled={answers.connecting === null || (answers.role !== "Service animal" && !answers.pet_travel) || !connectionReady(answers)} nextLabel="Continue" />
            </>
          )}

          {step === 6 && (
            <>
              <RequirementsPreview answers={answers} />
              <h2 style={{ fontFamily: font.display, fontSize: 24, color: tokens.navy }} className="mb-3">Choose your pass</h2>
              <WithdrawalConsent checked={consent} onChange={(v) => { setConsent(v); setConsentErr(""); }} error={consentErr} />
              {isMember ? (
                <button disabled={buying} onClick={() => handlePurchase("pass")} className="w-full rounded-full py-3.5 mt-2" style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, opacity: buying ? 0.7 : 1 }}>{buying ? "One moment…" : `Unlock my Travel Pass · ${usd(P.memberPass)}`}</button>
              ) : (
                <div className="grid gap-3 mt-2">
                  <div className="rounded-2xl p-5" style={{ border: `2px solid ${tokens.primary}`, background: "#FFFBF8" }}>
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 19, color: tokens.navy }}>Travel Pass</div>
                      <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22, color: tokens.navy }}>{P.pass} <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: tokens.muted }}>one time</span></div>
                    </div>
                    <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }} className="mt-1 mb-4">Everything for this trip. No subscription. Pet Vault is included until 7 days after you land.</p>
                    <button disabled={buying} onClick={() => handlePurchase("pass")} className="w-full rounded-full py-3.5" style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, opacity: buying ? 0.7 : 1 }}>{buying ? "One moment…" : `Unlock my Travel Pass · ${usd(P.pass)}`}</button>
                  </div>
                  <div className="rounded-2xl p-5" style={{ border: `1px solid ${tokens.line}`, background: "#fff" }}>
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 17, color: tokens.navy }}>Pet Vault + Travel Pass</div>
                      <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: tokens.navy }}>{P.joinToday} <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: tokens.muted }}>today</span></div>
                    </div>
                    <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }} className="mt-1 mb-4">Keep your pet's ID, records and lost-pet help all year. {P.member} for Pet Vault plus a {P.memberPass} member pass, then {P.member}/mo. Cancel anytime.</p>
                    <button type="button" disabled={buying} onClick={() => handlePurchase("member")} className="w-full rounded-full py-3" style={{ background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}`, fontFamily: font.body, fontWeight: 700, fontSize: 16, opacity: buying ? 0.7 : 1 }}>{buying ? "One moment…" : `Join Pet Vault + Pass · ${usd(P.joinToday)}`}</button>
                  </div>
                </div>
              )}
              <div className="mt-3"><MarketingOptIn checked={tips} onChange={setTips} /></div>
              <TrustBadges className="mt-4 text-left" />
              <div className="mt-6">
                <button onClick={back} style={{ fontFamily: font.body, color: tokens.ink, fontSize: 16 }}>← Back</button>
              </div>
            </>
          )}
          </>)}
        </div>
      </div>
      </div>
      <GuestEmailSheet open={!!guestPlan} showConsent={false} showMarketing={false} marketingOptIn={tips} title={guestPlan === "join" ? `Join + Travel Pass · ${usd(P.joinToday)}` : `Travel Pass · ${usd(P.pass)}`} plan={guestPlan} trip={answers} cancelPath="/assessment?checkout=canceled" onClose={() => setGuestPlan("")} />
    </div>
  );
}
