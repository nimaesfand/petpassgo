"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

const tokens = {
  navy: "#152238",
  gold: "#C9A227",
  sky: "#EAF0F6",
  paper: "#F6F8FA",
  ink: "#1C2733",
  stamp: "#B23A2E",
  line: "#D9E1E8",
  green: "#3E7A4B",
  amber: "#B8860B",
};

const font = {
  display: "'Fraunces', serif",
  mono: "'IBM Plex Mono', monospace",
  body: "'Inter', sans-serif",
};

const AIRLINES = [
  "Delta",
  "American Airlines",
  "United",
  "Southwest",
  "JetBlue",
  "Alaska Airlines",
  "Other / not sure yet",
];

const AIRPORTS = [
  { code: "LAX", city: "Los Angeles", name: "Los Angeles Intl" },
  { code: "BUR", city: "Los Angeles", name: "Hollywood Burbank" },
  { code: "LGB", city: "Los Angeles", name: "Long Beach" },
  { code: "SNA", city: "Los Angeles", name: "John Wayne (Orange County)" },
  { code: "BOS", city: "Boston", name: "Logan Intl" },
  { code: "JFK", city: "New York", name: "John F. Kennedy Intl" },
  { code: "LGA", city: "New York", name: "LaGuardia" },
  { code: "EWR", city: "New York", name: "Newark Liberty" },
  { code: "ORD", city: "Chicago", name: "O'Hare Intl" },
  { code: "MDW", city: "Chicago", name: "Midway Intl" },
  { code: "MIA", city: "Miami", name: "Miami Intl" },
  { code: "FLL", city: "Miami", name: "Fort Lauderdale-Hollywood" },
  { code: "TPA", city: "Tampa", name: "Tampa Intl" },
  { code: "ATL", city: "Atlanta", name: "Hartsfield-Jackson" },
  { code: "AUS", city: "Austin", name: "Austin-Bergstrom" },
  { code: "DFW", city: "Dallas", name: "Dallas/Fort Worth Intl" },
  { code: "DAL", city: "Dallas", name: "Dallas Love Field" },
  { code: "SEA", city: "Seattle", name: "Seattle-Tacoma Intl" },
  { code: "SFO", city: "San Francisco", name: "San Francisco Intl" },
  { code: "OAK", city: "San Francisco", name: "Oakland Intl" },
  { code: "DEN", city: "Denver", name: "Denver Intl" },
  { code: "PHX", city: "Phoenix", name: "Sky Harbor Intl" },
  { code: "LAS", city: "Las Vegas", name: "Harry Reid Intl" },
];

function AirportField({ label, value, onSelect }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);

  const matches =
    query.trim().length > 0
      ? AIRPORTS.filter(
          (a) =>
            a.city.toLowerCase().includes(query.toLowerCase()) ||
            a.code.toLowerCase().includes(query.toLowerCase()) ||
            a.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6)
      : [];

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          onSelect("");
        }}
        onFocus={() => setOpen(true)}
        placeholder={label}
        style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15 }}
        className="rounded-xl px-4 py-3 outline-none w-full"
      />
      {open && matches.length > 0 && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
          style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 8px 20px rgba(21,34,56,0.12)" }}
        >
          {matches.map((a) => (
            <button
              key={a.code}
              onClick={() => {
                const label = `${a.city} (${a.code})`;
                setQuery(label);
                onSelect(label);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-black/5"
              style={{ fontFamily: font.body, fontSize: 14 }}
            >
              <span>
                {a.city} — <span style={{ opacity: 0.6 }}>{a.name}</span>
              </span>
              <span style={{ fontFamily: font.mono, fontSize: 12, color: tokens.navy, fontWeight: 700 }}>{a.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const TOTAL_STEPS = 6;

function ProgressStub({ step }) {
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2" style={{ fontFamily: font.mono, fontSize: 11, color: tokens.ink, opacity: 0.6, letterSpacing: "0.08em" }}>
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
        <div style={{ fontFamily: font.body, fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>{label}</div>
        {sub && <div style={{ fontFamily: font.body, fontSize: 12.5, opacity: 0.7 }}>{sub}</div>}
      </div>
    </button>
  );
}

function NavRow({ onBack, onNext, nextLabel = "Continue", nextDisabled }) {
  return (
    <div className="flex items-center justify-between mt-8">
      {onBack ? (
        <button onClick={onBack} style={{ fontFamily: font.body, color: tokens.ink, opacity: 0.6, fontSize: 14 }} className="hover:opacity-90">
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
          fontSize: 14.5,
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

function ResultRow({ category, what, why, deadline, link, status, unlocked }) {
  const meta = STATUS_META[status];
  const isInsight = INSIGHT_CATEGORIES.has(category);

  if (isInsight) {
    return (
      <div className="rounded-xl p-5 mb-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        <div style={{ fontFamily: font.mono, fontSize: 10.5, color: tokens.ink, opacity: 0.45, letterSpacing: "0.08em" }} className="mb-1">
          {category}
        </div>
        {unlocked ? (
          <>
            <div style={{ fontFamily: font.display, fontSize: 17, color: tokens.navy }} className="mb-1">
              {what}
            </div>
            <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.ink, opacity: 0.75 }}>{why}</div>
          </>
        ) : (
          <div
            style={{
              fontFamily: font.body,
              fontSize: 14,
              color: tokens.ink,
              opacity: 0.45,
              filter: "blur(3px)",
              userSelect: "none",
            }}
          >
            {what}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5 mb-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div style={{ fontFamily: font.mono, fontSize: 10.5, color: tokens.ink, opacity: 0.45, letterSpacing: "0.08em" }} className="mb-1">
            {category}
          </div>
          {unlocked ? (
            <>
              <div style={{ fontFamily: font.display, fontSize: 17, color: tokens.navy }} className="mb-1">
                {what}
              </div>
              <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.ink, opacity: 0.75 }}>{why}</div>
            </>
          ) : (
            <div
              style={{
                fontFamily: font.body,
                fontSize: 14,
                color: tokens.ink,
                opacity: 0.45,
                filter: "blur(3px)",
                userSelect: "none",
              }}
              className="mt-0.5"
            >
              {what}
            </div>
          )}
        </div>
        <span
          style={{
            fontFamily: font.mono,
            fontSize: 10,
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
          {link && category === "REQUIRED FORM" && (
            <div style={{ fontFamily: font.body, fontSize: 12, color: tokens.ink, opacity: 0.65 }} className="mb-2">
              📥 Download and fill this out first — you'll submit it using the separate "Submission" step below.
            </div>
          )}
          {link && category === "SUBMISSION" && (
            <div style={{ fontFamily: font.body, fontSize: 12, color: tokens.ink, opacity: 0.65 }} className="mb-2">
              📤 This is where you actually send your completed form — use the button below.
            </div>
          )}
          <div className="flex items-center justify-between gap-3 mt-1 flex-wrap">
          <div className="flex-1 min-w-0">
            <span
              style={{
                fontFamily: font.mono,
                fontSize: 11,
                color: tokens.navy,
                background: tokens.sky,
                padding: "3px 8px",
                borderRadius: 6,
              }}
            >
              DUE {deadline}
            </span>
          </div>
          {link && link !== "https://www.delta.com/us/en/pet-travel/overview" && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: font.body,
                fontSize: 12.5,
                fontWeight: 600,
                color: "#fff",
                background: tokens.navy,
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
        <div style={{ fontFamily: font.mono, fontSize: 11, color: tokens.stamp, opacity: 0.8 }} className="mt-3">
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

  // Special handler for the last question (airline) — this is the signup gate.
  // Logged-in users go straight to results. New visitors save their answers and
  // are sent to create an account first, then land right back on their results.
  async function handleSeePlan() {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      next();
    } else {
      localStorage.setItem("petpassgo_pending_trip", JSON.stringify(answers));
      window.location.href = "/signup";
    }
  }

  async function handlePurchase() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      localStorage.setItem("petpassgo_pending_trip", JSON.stringify(answers));
      window.location.href = "/signup";
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
      .select("*")
      .in("airline", [answers.airline, "Any"])
      .in("animal_type", [answers.animal, "Any"])
      .in("role", [answers.role, "Any"])
      .eq("trip_type", "domestic")
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
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full flex justify-center px-4 py-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;700&display=swap');
        * { box-sizing: border-box; }
        h1, h2, h3, h4 { font-variant-ligatures: none; -webkit-font-variant-ligatures: none; }
      `}</style>

      <div className="w-full max-w-[540px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <a href="/" style={{ fontFamily: font.display, fontWeight: 600, fontSize: 20, color: tokens.navy, textDecoration: "none" }}>PetPassGo</a>
            <span style={{ fontFamily: font.mono, fontSize: 10, color: tokens.gold, letterSpacing: "0.1em" }}>TRIP ASSESSMENT</span>
          </div>
          {step === 5 && (
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontFamily: font.mono, fontSize: 10, color: tokens.ink, opacity: 0.6 }}>
              <input type="checkbox" checked={isMember} onChange={(e) => setIsMember(e.target.checked)} />
              PREVIEW AS $4.99 MEMBER
            </label>
          )}
        </div>

        <div className="rounded-2xl p-7" style={{ background: tokens.paper, border: `1px solid ${tokens.line}` }}>
          {step < TOTAL_STEPS && <ProgressStub step={step} />}

          {step === 0 && (
            <>
              <h2 style={{ fontFamily: font.display, fontSize: 24, color: tokens.navy }} className="mb-1">
                What are you traveling with?
              </h2>
              <p style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.65 }} className="mb-5">
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
              <p style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.65 }} className="mb-5">
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
              <p style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.65 }} className="mb-5">
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
              <p style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.65 }} className="mb-5">
                Deadlines for forms and health certificates are counted back from this date.
              </p>
              <input
                type="date"
                value={answers.date}
                onChange={(e) => set("date", e.target.value)}
                style={{
                  fontFamily: font.body,
                  border: `2px solid ${tokens.line}`,
                  fontSize: 15,
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
              <p style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.65 }} className="mb-5">
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
                <div style={{ fontFamily: font.mono, fontSize: 11, color: tokens.stamp, letterSpacing: "0.12em" }} className="mb-2">
                  YOUR PERSONALIZED TRIP PLAN
                </div>
                <h2 style={{ fontFamily: font.display, fontSize: 26, color: tokens.navy }}>
                  {answers.animal} · {answers.origin || "—"} → {answers.destination || "—"}
                </h2>
                <div style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.65 }} className="mt-1">
                  {answers.airline} · {answers.date || "date pending"} · {answers.role}
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
                      <div style={{ fontFamily: font.display, fontSize: 15.5, color: tokens.navy }} className="mb-1">
                        {note.what}
                      </div>
                      <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.ink, opacity: 0.8 }}>
                        {note.why}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl p-4 mb-5" style={{ background: tokens.navy }}>
                {loadingResults ? (
                  <div style={{ fontFamily: font.body, fontSize: 13.5, color: "#fff" }}>Looking up requirements…</div>
                ) : unlocked ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div style={{ fontFamily: font.mono, fontSize: 10, color: tokens.sky, opacity: 0.7, letterSpacing: "0.1em" }}>
                        TRIP READINESS
                      </div>
                      <div style={{ fontFamily: font.display, fontSize: 30, color: "#fff" }}>{readiness}%</div>
                    </div>
                    <div style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.sky, opacity: 0.8 }} className="max-w-[180px] text-right">
                      Full plan unlocked — deadlines and instructions below.
                    </div>
                  </div>
                ) : (
                  <div style={{ fontFamily: font.body, fontSize: 13.5, color: "#fff" }}>
                    <span style={{ fontWeight: 700 }}>{normalResults.length} requirements found</span> for this trip —{" "}
                    <span style={{ color: tokens.stamp === tokens.stamp ? "#F2A79A" : "" }}>{needsAction} need action</span>,{" "}
                    {needsVerify} need verification.
                  </div>
                )}
              </div>

              {!loadingResults && normalResults.length === 0 && eligibilityNotes.length === 0 && (
                <div
                  className="rounded-xl p-4 mb-4 text-center"
                  style={{ background: "#fff", border: `1px dashed ${tokens.line}`, fontFamily: font.body, fontSize: 13.5, opacity: 0.75 }}
                >
                  We haven't researched verified requirements for {answers.airline || "this airline"} yet — Delta is
                  currently the only airline with confirmed data. Try the assessment again and select Delta to see real results.
                </div>
              )}

              {unlocked && !hasRealForms && normalResults.length > 0 && (
                <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.ink, opacity: 0.75 }} className="mb-4">
                  No forms needed for this trip — {answers.airline}, {answers.origin || "—"} → {answers.destination || "—"}, domestic. Here's what to know:
                </div>
              )}

              {normalResults.map((r) => (
                <ResultRow key={r.what} {...r} unlocked={unlocked} />
              ))}

              {unlocked && (
                <div className="rounded-xl p-5 mb-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
                  <div style={{ fontFamily: font.mono, fontSize: 10.5, color: tokens.ink, opacity: 0.45, letterSpacing: "0.08em" }} className="mb-2">
                    DOCUMENT VAULT
                  </div>
                  <div style={{ fontFamily: font.body, fontSize: 13, opacity: 0.7 }} className="mb-3">
                    Upload what you have — we'll match it to the right requirement automatically.
                  </div>
                  {["Vaccination record", "Pet photo for Digital ID", "Training documentation (if applicable)"].map((doc) => (
                    <div key={doc} className="flex items-center justify-between py-2" style={{ borderTop: `1px solid ${tokens.line}` }}>
                      <span style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.ink }}>{doc}</span>
                      <button
                        style={{
                          fontFamily: font.mono,
                          fontSize: 11,
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
                      Refresh this trip — $19.99
                    </button>
                    <ul
                      style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.ink, opacity: 0.75 }}
                      className="mt-3 rounded-lg p-3 list-disc pl-5 space-y-1"
                    >
                      <li>This trip's full requirement list, deadlines, and submission steps</li>
                      <li>Your existing pet profile and documents carried over automatically</li>
                      <li>Updated Digital Pet ID for this itinerary</li>
                    </ul>
                  </div>
                ) : (
                  <div className="mt-5">
                    <div
                      className="rounded-xl p-5 mb-4"
                      style={{ background: tokens.navy }}
                    >
                      <div style={{ fontFamily: font.mono, fontSize: 10.5, color: tokens.gold, letterSpacing: "0.1em" }} className="mb-2">
                        READY TO FLY WITH {(answers.airline || "YOUR AIRLINE").toUpperCase()}
                      </div>
                      <div style={{ fontFamily: font.display, fontSize: 18, color: "#fff" }} className="mb-2">
                        Everything you need for your trip is ready and waiting.
                      </div>
                      <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.sky, opacity: 0.85 }}>
                        Every document, every form, the exact cost, and precisely where to send it — verified and
                        ready the moment you unlock it below. No guessing, no outdated blog posts, no calling the
                        airline and getting a different answer every time.
                      </div>
                    </div>

                    <button
                      onClick={handlePurchase}
                      style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600 }}
                      className="w-full rounded-full py-3.5 text-[15px] hover:opacity-90 transition"
                    >
                      Get the full Travel Pass — $49.99
                    </button>
                    <div style={{ fontFamily: font.body, fontSize: 12, opacity: 0.55, textAlign: "center" }} className="mt-2">
                      One-time. Not a subscription.
                    </div>

                    <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: tokens.navy }} className="mt-6 mb-3 text-center">
                      Every Travel Pass includes these two things, free:
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Mini Digital Pet ID preview */}
                      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${tokens.line}` }}>
                        <div style={{ background: tokens.navy }} className="px-3 py-2 flex items-center justify-between">
                          <div style={{ fontFamily: font.mono, fontSize: 8, color: tokens.gold, letterSpacing: "0.1em" }}>
                            DIGITAL PET ID
                          </div>
                          <div
                            style={{
                              fontFamily: font.mono,
                              fontSize: 7,
                              color: tokens.sky,
                              opacity: 0.6,
                            }}
                          >
                            PPG
                          </div>
                        </div>
                        <div style={{ background: "#fff" }} className="p-3">
                          <div className="flex items-center gap-2 mb-2.5">
                            <div
                              className="rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ width: 30, height: 30, background: tokens.sky, fontSize: 15 }}
                            >
                              {answers.animal === "Dog" ? "🐕" : answers.animal === "Cat" ? "🐈" : "🐾"}
                            </div>
                            <div>
                              <div style={{ fontFamily: font.display, fontSize: 13, color: tokens.navy, lineHeight: 1.1 }}>
                                {answers.animal || "Pet"}
                              </div>
                              <div style={{ fontFamily: font.mono, fontSize: 7.5, color: tokens.ink, opacity: 0.5, letterSpacing: "0.05em" }}>
                                VERIFIED PROFILE
                              </div>
                            </div>
                          </div>
                          <svg
                            viewBox="0 0 29 29"
                            className="mx-auto"
                            style={{ width: 40, height: 40, border: `1px solid ${tokens.line}` }}
                          >
                            <rect width="29" height="29" fill="#fff" />
                            {/* corner finder squares, like a real QR code */}
                            {[[1, 1], [22, 1], [1, 22]].map(([x, y]) => (
                              <g key={`${x}-${y}`}>
                                <rect x={x} y={y} width="6" height="6" fill={tokens.navy} />
                                <rect x={x + 1.3} y={y + 1.3} width="3.4" height="3.4" fill="#fff" />
                                <rect x={x + 2} y={y + 2} width="2" height="2" fill={tokens.navy} />
                              </g>
                            ))}
                            {/* scattered data dots */}
                            {[
                              [10, 2], [13, 3], [16, 1], [19, 4], [10, 5], [15, 6],
                              [2, 10], [5, 12], [3, 15], [7, 16], [1, 18], [5, 19],
                              [10, 10], [13, 11], [11, 14], [16, 12], [14, 16], [18, 9],
                              [22, 10], [25, 12], [23, 15], [26, 17], [21, 18], [24, 20],
                              [10, 22], [13, 24], [16, 21], [11, 26], [18, 23], [15, 27],
                            ].map(([x, y], i) => (
                              <rect key={i} x={x} y={y} width="1.3" height="1.3" fill={tokens.navy} />
                            ))}
                          </svg>
                        </div>
                      </div>

                      {/* Mini Travel Mode preview */}
                      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${tokens.line}` }}>
                        <div style={{ background: tokens.navy }} className="px-3 py-2">
                          <div style={{ fontFamily: font.mono, fontSize: 8, color: tokens.gold, letterSpacing: "0.1em" }}>
                            TRAVEL MODE
                          </div>
                        </div>
                        <div style={{ background: "#fff" }} className="p-3">
                          <div style={{ fontFamily: font.body, fontSize: 10.5, color: tokens.ink, opacity: 0.5 }} className="mb-1">
                            Day of your flight:
                          </div>
                          <div style={{ fontFamily: font.body, fontSize: 11, fontWeight: 600, color: tokens.navy }}>
                            Only what you need, right now
                          </div>
                          <div style={{ fontFamily: font.body, fontSize: 9.5, opacity: 0.6 }} className="mt-1">
                            Works with no signal
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="rounded-xl p-4 mb-1"
                      style={{ background: tokens.paper, border: `1px solid ${tokens.line}` }}
                    >
                      <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, color: tokens.navy }} className="mb-2">
                        Membership keeps all of this saved and up to date:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Vaccination records",
                          "Vet contact info",
                          "Medications & allergies",
                          "Microchip number",
                          "Emergency contact",
                          "Insurance policy info",
                        ].map((item) => (
                          <span
                            key={item}
                            style={{
                              fontFamily: font.body,
                              fontSize: 11.5,
                              color: tokens.navy,
                              background: "#fff",
                              border: `1px solid ${tokens.line}`,
                            }}
                            className="rounded-full px-3 py-1"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <label
                      className="flex items-start gap-3 mt-4 rounded-xl p-4 cursor-pointer"
                      style={{ background: "#fff", border: `1.5px solid ${addMembership ? tokens.navy : tokens.line}` }}
                    >
                      <input
                        type="checkbox"
                        checked={addMembership}
                        onChange={(e) => setAddMembership(e.target.checked)}
                        className="mt-1"
                      />
                      <div>
                        <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: tokens.navy }}>
                          🔥 Save on every future trip — Membership, $4.99/mo
                        </div>
                        <div style={{ fontFamily: font.body, fontSize: 12.5, opacity: 0.7 }} className="mt-1">
                          Your next trip refresh drops from $49.99 to just $19.99 — a $30 savings — and your pet's profile stays free to update, always.
                        </div>
                      </div>
                    </label>

                  </div>
                )
              ) : (
                <div
                  className="mt-5 rounded-xl p-4 text-center"
                  style={{ background: "#fff", border: `1px dashed ${tokens.green}`, fontFamily: font.body, fontSize: 13, color: tokens.green }}
                >
                  ✓ Unlocked — this is what the customer sees after paying.
                </div>
              )}

              <button
                onClick={() => {
                  setStep(0);
                  setUnlocked(false);
                }}
                style={{ fontFamily: font.body, color: tokens.ink, opacity: 0.5, fontSize: 13 }}
                className="w-full text-center mt-4"
              >
                Start over
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
