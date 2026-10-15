"use client";

import React, { useState, useEffect } from "react";
import { PRICES as P } from "../../lib/pricing";
import { supabase } from "../../lib/supabaseClient";
import { AIRLINES, requirementAirline } from "../../lib/airlines";
import { tripTypeForRoute, isMexicoAirport } from "../../lib/airports";
import AirportField from "../../components/AirportField";
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
  const meta = STATUS_META[status];
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
            <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, opacity: 0.75 }}>{why}</div>
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
              <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, opacity: 0.75 }}>{why}</div>
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
              target="_blank"
              rel="noopener noreferrer"
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
              Go here →
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
  const [showDetails, setShowDetails] = useState(true);
  // Real membership status (read-only; only the server/Stripe can set it). The checkbox
  // further down is a pre-launch preview only and is hidden when NEXT_PUBLIC_SITE_LAUNCHED=true.
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
      localStorage.setItem("petpassgo_pending_trip", JSON.stringify(answers));
      window.location.href = `/signup?plan=${plan === "member" ? "member" : "pass"}`;
      return;
    }

    await supabase.from("trips").insert({
      user_id: data.user.id,
      origin: answers.origin,
      destination: answers.destination,
      airline: answers.airline,
      travel_date: answers.date || null,
      animal_type: answers.animal,
      role: answers.role,
      status: "ready",
      paid: true,
    });

    localStorage.setItem("petpassgo_open_flight_tab", "1");
    window.location.href = "/account";
  }

  function guessStatus(category) {
    if (category.includes("WHAT HAPPENS")) return "complete";
    if (category.includes("HEALTH") || category.includes("VACCINATION")) return "verify";
    return "attention";
  }

  useEffect(() => {
    if (step !== 5) return;

    setLoadingResults(true);
    setFetchError(false);

    supabase
      .from("airline_requirements")
      // Explicit columns: source links/verified dates are paid-dashboard only.
      .select("id,airline,animal_type,role,trip_type,category,title,description,deadline_description,submission_link,destination_match,status")
      .in("airline", [requirementAirline(answers.airline), "Any"])
      .in("animal_type", [answers.animal, "Any"])
      .in("role", [answers.role, "Any"])
      .in("trip_type", tripTypeForRoute(answers.origin, answers.destination) === "international" ? ["international", "domestic"] : ["domestic"])
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
              category: row.category,
              what: row.title,
              why: row.description,
              deadline: row.deadline_description,
              link: row.submission_link,
              status: row.status || guessStatus(row.category),
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
                Pet, or service animal?
              </h2>
              <p style={{ fontFamily: font.body, fontSize: 15, opacity: 0.65 }} className="mb-5">
                Service animals follow a different set of requirements than pets flying for companionship.
              </p>
              <div className="flex flex-col gap-3">
                <OptionCard label="Pet" sub="Traveling for companionship, not task-trained" selected={answers.role === "Pet"} onClick={() => set("role", "Pet")} />
                <OptionCard label="Service animal" sub="Trained to perform tasks for a disability" selected={answers.role === "Service animal"} onClick={() => set("role", "Service animal")} />
              </div>
              <NavRow onBack={back} onNext={next} nextDisabled={!answers.role} />
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
              <div className="flex flex-col gap-3" style={{ position: "relative", zIndex: 1 }}>
                <AirportField label="Departing from (type a city)" value={answers.origin} onSelect={(v) => set("origin", v)} />
                <AirportField label="Flying to (type a city)" value={answers.destination} onSelect={(v) => set("destination", v)} />
              </div>
              <NavRow onBack={back} onNext={next} nextDisabled={!answers.origin || !answers.destination} />
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ fontFamily: font.display, fontSize: 24, color: tokens.navy }} className="mb-1">
                When are you traveling?
              </h2>
              <p style={{ fontFamily: font.body, fontSize: 15, opacity: 0.65 }} className="mb-5">
                Deadlines for forms and health certificates are counted back from this date.
              </p>
              <input
                type="date"
                value={answers.date}
                onChange={(e) => set("date", e.target.value)}
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
                className="rounded-xl px-4 outline-none w-full"
              />
              <NavRow onBack={back} onNext={next} nextDisabled={!answers.date} />
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
                  {answers.airline} · {answers.date || "date pending"} · {answers.role}{isMexicoAirport(answers.destination) || isMexicoAirport(answers.origin) ? " · International (Mexico)" : ""}
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

              <div className="rounded-xl p-4 mb-5" style={{ background: tokens.navy }}>
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
              </div>

              {!loadingResults && normalResults.length === 0 && eligibilityNotes.length === 0 && (
                <div
                  className="rounded-xl p-4 mb-4 text-center"
                  style={{ background: "#fff", border: `1px dashed ${tokens.line}`, fontFamily: font.body, fontSize: 15, opacity: 0.75 }}
                >
                  We haven't researched verified requirements for {answers.airline || "this airline"} yet. We currently have
                  verified data for the airlines in our list. Try another airline, or pick "Other / not sure yet" only if you have not chosen yet.
                </div>
              )}

              {unlocked && !hasRealForms && normalResults.length > 0 && (
                <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, opacity: 0.75 }} className="mb-4">
                  No forms needed for this trip — {answers.airline}, {answers.origin || "—"} → {answers.destination || "—"}. Here's what to know:
                </div>
              )}

              {normalResults.map((r) => (
                <ResultRow key={r.what} {...r} unlocked={unlocked} />
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

              {!unlocked ? (
                isMember ? (
                  <div className="mt-5">
                    <button
                      onClick={handlePurchase}
                      style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600 }}
                      className="w-full rounded-full py-3.5 text-[15px] hover:opacity-90 transition"
                    >
                      Unlock this trip — {P.memberPass} member price
                    </button>
                    <ul
                      style={{ fontFamily: font.body, fontSize: 14, color: tokens.ink, opacity: 0.75 }}
                      className="mt-3 rounded-lg p-3 list-disc pl-5 space-y-1"
                    >
                      <li>This trip's full requirement list, deadlines, and submission steps</li>
                      <li>Your existing pet profile and documents carried over automatically</li>
                      <li>Reminders before each deadline</li>
                    </ul>
                  </div>
                ) : (
                  <div className="mt-5">
                    <div
                      className="rounded-xl p-5 mb-4"
                      style={{ background: tokens.navy }}
                    >
                      <div style={{ fontFamily: font.mono, fontSize: 12, color: tokens.gold, letterSpacing: "0.1em" }} className="mb-2">
                        READY TO FLY WITH {(answers.airline || "YOUR AIRLINE").toUpperCase()}
                      </div>
                      <div style={{ fontFamily: font.display, fontSize: 18, color: "#fff" }} className="mb-2">
                        Everything you need for your trip is ready and waiting.
                      </div>
                      <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.sky, opacity: 0.85 }}>
                        Every document, every form, the exact cost, and precisely where to send it — verified and
                        ready the moment you unlock it below. No guessing, no outdated blog posts, no calling the
                        airline and getting a different answer every time.
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl p-5 relative flex flex-col" style={{ background: tokens.navy, color: "#fff", border: `2px solid ${tokens.gold}` }}>
                        <span className="absolute -top-3 left-5 rounded-full px-3 py-0.5" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 800, fontSize: 11 }}>SAVE {P.savings} ON THIS TRIP</span>
                        <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 12.5, letterSpacing: ".12em", color: tokens.gold }} className="mb-1 mt-1">JOIN + PASS</div>
                        <div style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700 }}>{P.memberPass} <span style={{ fontSize: 15, fontWeight: 500, opacity: 0.75 }}>+ {P.member}/mo</span></div>
                        <p style={{ fontFamily: font.body, fontSize: 14, opacity: 0.8 }} className="mb-4 flex-1">This trip, plus Pet ID, lost-pet alerts, community and every future pass at {P.memberPass}.</p>
                        <button onClick={() => { setAddMembership(true); handlePurchase("member"); }} className="w-full rounded-full py-3 hover:opacity-90 transition" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 700, fontSize: 15 }}>
                          Join and unlock · {P.joinToday} today
                        </button>
                      </div>
                      <div className="rounded-2xl p-5 flex flex-col" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
                        <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 12.5, letterSpacing: ".12em", color: tokens.primary }} className="mb-1 mt-1">THIS TRIP ONLY</div>
                        <div style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: tokens.navy }}>{P.pass}</div>
                        <p style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }} className="mb-4 flex-1">Full checklist, deadlines, sources and reminders. Pet ID and vault until your trip ends.</p>
                        <button onClick={() => handlePurchase("pass")} className="w-full rounded-full py-3 hover:opacity-90 transition" style={{ background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}`, fontFamily: font.body, fontWeight: 600, fontSize: 15 }}>
                          Buy Travel Pass
                        </button>
                      </div>
                    </div>
                    <p style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }} className="mt-3 text-center">Membership is monthly. Cancel anytime.</p>

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
    </div>
  );
}
