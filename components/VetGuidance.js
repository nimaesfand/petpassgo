"use client";
import { tokens, font } from "../lib/theme";

// Builds trip-specific vet guidance ONLY from the filtered airline_requirements rows
// already loaded for this trip. No invented airline facts.
const HEALTH_CATS = /HEALTH DOCUMENTATION|VACCINATION/i;
function isService(role = "") { return /service|psychiatric/i.test(role); }

function explicitNoHealthCert(requirements) {
  return (requirements || []).find((r) => /does not require a health certificate/i.test(`${r.title} ${r.description}`));
}

function healthRows(requirements) {
  return (requirements || []).filter((r) => {
    const text = `${r.title} ${r.description}`;
    if (/does not require a health certificate|not required|encouraged/i.test(text)) return false;
    return HEALTH_CATS.test(r.category || "") || /health certificate|APHIS|FAVN|screwworm|rabies|microchip|CDC Dog Import/i.test(text);
  });
}

function encouragedHealth(requirements) {
  return (requirements || []).find((r) => /health/i.test(`${r.category} ${r.title}`) && /encourag/i.test(`${r.title} ${r.description}`) && /not required/i.test(`${r.title} ${r.description}`));
}

function LockedTeaser() {
  return (
    <div className="rounded-xl p-4 mb-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.body, fontSize: 12, letterSpacing: "0.1em", color: tokens.muted, fontWeight: 700 }} className="mb-1">VET VISIT GUIDANCE</div>
      <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted, lineHeight: 1.5 }}>
        Whether you need a vet visit, and exactly what to ask for, is in your Travel Pass — matched to your airline and route.
      </p>
      <div className="mt-2 rounded-lg px-3 py-2" style={{ background: tokens.sky, fontFamily: font.body, fontSize: 13.5, color: tokens.navy }}>🔒 Unlock your Travel Pass to see the full guidance and official sources.</div>
    </div>
  );
}

export default function VetGuidance({ trip, requirements = [], paid }) {
  if (!trip) return null;
  if (!paid) return <LockedTeaser />;

  const rows = healthRows(requirements);
  const noCert = explicitNoHealthCert(requirements);
  const encouraged = encouragedHealth(requirements);
  const service = isService(trip.role);
  const needsVet = rows.length > 0;

  // What to bring / ask — only items tied to matched requirements or explicit verified context.
  const bring = [];
  const ask = [];
  if (service) {
    bring.push("Your dog's rabies vaccination certificate (and any other vaccine records)");
    ask.push("Confirm rabies and other required vaccinations are current through your travel date");
  }
  rows.forEach((r) => {
    const t = `${r.title} ${r.description}`.toLowerCase();
    if (/aphis|7001|health certificate/.test(t)) {
      bring.push("Pet's microchip number and current rabies certificate (if any)");
      ask.push(`${r.title}${r.deadline_description ? ` — ${r.deadline_description}` : ""}`);
    }
    if (/favn/.test(t)) ask.push("FAVN rabies blood test status and lab timing");
    if (/screwworm|nws/.test(t)) {
      bring.push("Your itinerary (arrival date in Mexico)");
      ask.push("New World Screwworm inspection certificate (USDA-accredited vet; ≤ 5 days before arrival)");
    }
    if (/cdc dog import|microchip/.test(t)) {
      bring.push("Proof of ISO microchip implantation");
      ask.push("Confirm microchip is readable and matches paperwork");
    }
    if (/rabies/.test(t) && !ask.some((a) => /rabies/i.test(a))) ask.push("Confirm rabies vaccination is current through travel");
  });
  // Dedupe while preserving order
  const uniq = (arr) => [...new Set(arr)];

  return (
    <div className="rounded-xl p-4 mb-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.body, fontSize: 12, letterSpacing: "0.1em", color: tokens.muted, fontWeight: 700 }} className="mb-2">VET VISIT GUIDANCE</div>

      {/* Verdict */}
      <div className="rounded-lg px-4 py-3 mb-4" style={{ background: needsVet ? "#FFF7F2" : "#F0F7F2", border: `1px solid ${needsVet ? "#F2C4A8" : "#C7E2D0"}` }}>
        <div style={{ fontFamily: font.display, fontSize: 17, fontWeight: 700, color: tokens.navy }} className="mb-1">
          {noCert
            ? `${trip.airline} does not require a health certificate for cabin pets`
            : encouraged && !needsVet
            ? `${trip.airline || "Your airline"} encourages health papers. They are not required for this domestic trip`
            : service && !needsVet
            ? "Service animals: DOT forms, not a pet health certificate"
            : needsVet
            ? (service ? "Vaccination / health items are on your checklist" : "A vet visit is on your checklist for this trip")
            : "No veterinary health certificate is on your checklist for this trip"}
        </div>
      </div>

      {(uniq(bring).length > 0 || uniq(ask).length > 0) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {uniq(bring).length > 0 && (
            <div className="rounded-lg px-3 py-3" style={{ border: `1px solid ${tokens.line}` }}>
              <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: tokens.navy }} className="mb-2">What to bring to the vet</div>
              <ul className="space-y-1.5">{uniq(bring).map((x) => <li key={x} style={{ fontFamily: font.body, fontSize: 14, color: tokens.ink }}>• {x}</li>)}</ul>
            </div>
          )}
          {uniq(ask).length > 0 && (
            <div className="rounded-lg px-3 py-3" style={{ border: `1px solid ${tokens.line}` }}>
              <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: tokens.navy }} className="mb-2">Ask your vet for</div>
              <ul className="space-y-1.5">{uniq(ask).map((x) => <li key={x} style={{ fontFamily: font.body, fontSize: 14, color: tokens.ink }}>• {x}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      <p style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }} className="mt-3">Not veterinary advice.</p>
    </div>
  );
}
