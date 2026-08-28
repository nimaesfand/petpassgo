"use client";

import React, { useState } from "react";

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

function ResultRow({ category, what, why, deadline, status, unlocked }) {
  const meta = STATUS_META[status];
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
        <div style={{ fontFamily: font.mono, fontSize: 11, color: tokens.ink, opacity: 0.5 }} className="mt-3">
          DUE {deadline}
        </div>
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
  const [showDetails, setShowDetails] = useState(false);
  const [answers, setAnswers] = useState({
    animal: "",
    role: "",
    origin: "",
    destination: "",
    date: "",
    airline: "",
  });

  const set = (k, v) => setAnswers((a) => ({ ...a, [k]: v }));
  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const mockResults =
    answers.role === "Service animal"
      ? [
          {
            category: "REQUIRED FORM",
            what: "DOT Service Animal Air Transportation Form",
            why: `Required by ${answers.airline || "most U.S. airlines"} before boarding with a service animal.`,
            deadline: "48 hrs before departure",
            status: "attention",
          },
          {
            category: "OWNER ATTESTATION",
            what: "Behavior & training attestation",
            why: "Confirms your animal can behave appropriately in a public cabin setting.",
            deadline: "At check-in",
            status: "verify",
          },
          {
            category: "HEALTH DOCUMENTATION",
            what: "Health certificate (international only)",
            why: `Not required for domestic ${answers.origin || "→"} ${answers.destination || "trips"} — skip this one.`,
            deadline: "N/A",
            status: "complete",
          },
        ]
      : [
          {
            category: "BOOKING REQUIREMENT",
            what: "Airline pet travel booking",
            why: `${answers.airline || "Your airline"} requires pets booked in-cabin or cargo to be added to your reservation in advance.`,
            deadline: "At booking",
            status: "attention",
          },
          {
            category: "HEALTH DOCUMENTATION",
            what: "Health certificate from vet",
            why: "Most carriers require this within 10 days of travel for pets in cargo or on longer routes.",
            deadline: "10 days before departure",
            status: "verify",
          },
          {
            category: "CARRIER REQUIREMENT",
            what: "Carrier size requirements",
            why: `${answers.airline || "Your airline"}'s under-seat carrier dimensions — shown once you pick a carrier.`,
            deadline: "Before you pack",
            status: "complete",
          },
        ];

  const readiness = unlocked
    ? Math.round((mockResults.filter((r) => r.status === "complete").length / mockResults.length) * 100) || 33
    : null;

  const needsAction = mockResults.filter((r) => r.status === "attention").length;
  const needsVerify = mockResults.filter((r) => r.status === "verify").length;

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full flex justify-center px-4 py-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div className="w-full max-w-[540px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: font.display, fontWeight: 600, fontSize: 20, color: tokens.navy }}>PetPassGo</span>
            <span style={{ fontFamily: font.mono, fontSize: 10, color: tokens.gold, letterSpacing: "0.1em" }}>TRIP ASSESSMENT</span>
          </div>
          {step === TOTAL_STEPS && (
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
              <NavRow onBack={back} onNext={next} nextDisabled={!answers.airline} nextLabel="See my plan" />
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

              <div className="rounded-xl p-4 mb-5" style={{ background: tokens.navy }}>
                {unlocked ? (
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
                    <span style={{ fontWeight: 700 }}>{mockResults.length} requirements found</span> for this trip —{" "}
                    <span style={{ color: tokens.stamp === tokens.stamp ? "#F2A79A" : "" }}>{needsAction} need action</span>,{" "}
                    {needsVerify} need verification.
                  </div>
                )}
              </div>

              {mockResults.map((r) => (
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
                      onClick={() => setUnlocked(true)}
                      style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600 }}
                      className="w-full rounded-full py-3.5 text-[15px] hover:opacity-90 transition"
                    >
                      Refresh this trip — $19.99
                    </button>
                    <button
                      onClick={() => setShowDetails((v) => !v)}
                      style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.navy, textAlign: "center" }}
                      className="w-full mt-2 underline"
                    >
                      {showDetails ? "Hide" : "See"} what's included
                    </button>
                    {showDetails && (
                      <ul
                        style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.ink, opacity: 0.75 }}
                        className="mt-2 rounded-lg p-3 list-disc pl-5 space-y-1"
                      >
                        <li>This trip's full requirement list, deadlines, and submission steps</li>
                        <li>Your existing pet profile and documents carried over automatically</li>
                        <li>Updated Digital Pet ID for this itinerary</li>
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="mt-5">
                    <button
                      onClick={() => setUnlocked(true)}
                      style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600 }}
                      className="w-full rounded-full py-3.5 text-[15px] hover:opacity-90 transition"
                    >
                      Get the full Travel Pass — $49.99
                    </button>
                    <div style={{ fontFamily: font.body, fontSize: 12.5, opacity: 0.7, textAlign: "center" }} className="mt-3">
                      Includes this trip's full plan, your pet's profile, document vault, and Digital Pet ID.
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
                          Also add PetPassGo Membership — $4.99/mo
                        </div>
                        <div style={{ fontFamily: font.body, fontSize: 12.5, opacity: 0.7 }} className="mt-1">
                          Optional. Keeps your pet's profile free to update anytime, and drops future trip refreshes to $19.99 instead of $49.99.
                        </div>
                      </div>
                    </label>

                    <button
                      onClick={() => setShowDetails((v) => !v)}
                      style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.navy, textAlign: "center" }}
                      className="w-full mt-3 underline"
                    >
                      {showDetails ? "Hide" : "See"} what each price includes
                    </button>
                    {showDetails && (
                      <div className="mt-2 rounded-lg p-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
                        <div style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 600, color: tokens.navy }}>$49.99 — Travel Pass</div>
                        <ul style={{ fontFamily: font.body, fontSize: 12.5, opacity: 0.75 }} className="list-disc pl-5 mb-2">
                          <li>Full requirement list + deadlines for this trip</li>
                          <li>Pet profile + document vault setup</li>
                          <li>Digital Pet ID with QR code</li>
                        </ul>
                        <div style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 600, color: tokens.navy }}>$4.99/mo — Membership</div>
                        <ul style={{ fontFamily: font.body, fontSize: 12.5, opacity: 0.75 }} className="list-disc pl-5 mb-2">
                          <li>Keep the profile and documents updated, free</li>
                          <li>Unlocks $19.99 trip refreshes instead of $49.99</li>
                        </ul>
                        <div style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 600, color: tokens.navy }}>$19.99 — Trip refresh</div>
                        <ul style={{ fontFamily: font.body, fontSize: 12.5, opacity: 0.75 }} className="list-disc pl-5">
                          <li>New trip's requirements, using your existing profile</li>
                        </ul>
                      </div>
                    )}
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
