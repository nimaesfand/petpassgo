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
    if (/does not require a health certificate/i.test(text)) return false;
    return HEALTH_CATS.test(r.category || "") || /health certificate|APHIS|FAVN|screwworm|rabies|microchip|CDC Dog Import/i.test(text);
  });
}

function SourceLink({ req, paid }) {
  if (!paid || !req.source_url) return null;
  return (
    <a href={req.source_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: tokens.primary, textDecoration: "underline" }}>
      Official source →
    </a>
  );
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
            : service && !needsVet
            ? "Service animals: DOT forms, not a pet health certificate"
            : needsVet
            ? (service ? "Vaccination / health items are on your checklist" : "A vet visit is on your checklist for this trip")
            : "No veterinary health certificate is on your checklist for this trip"}
        </div>
        <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink, lineHeight: 1.5, opacity: 0.85 }}>
          {noCert
            ? noCert.description
            : service && !needsVet
            ? "U.S. airlines use the DOT Service Animal Air Transportation Form (and the Relief Attestation on flights of 8+ hours). Your airline may also ask that vaccinations be current — check the vaccination and submission steps in your checklist."
            : needsVet
            ? "Based on the verified requirements for your airline, route and animal. Details and official sources are below."
            : `Your ${trip.airline || "airline"} Travel Pass for ${trip.origin || "?"} → ${trip.destination || "?"} doesn't list a veterinary health certificate. Always reconfirm with ${trip.airline || "your airline"} before you fly — rules can change.`}
        </p>
        {noCert?.source_url && (
          <div className="mt-2"><SourceLink req={noCert} paid /></div>
        )}
      </div>

      {/* Matched health requirements */}
      {rows.length > 0 && (
        <div className="mb-4">
          <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: tokens.navy, letterSpacing: "0.06em" }} className="mb-2">ON YOUR CHECKLIST</div>
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="rounded-lg px-3 py-2.5" style={{ background: tokens.sky }}>
                <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 14.5, color: tokens.navy }}>{r.title}</div>
                <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.ink, lineHeight: 1.45, opacity: 0.85 }} className="mt-0.5">{r.description}</div>
                {r.deadline_description && <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.primary, fontWeight: 600 }} className="mt-1">Timing: {r.deadline_description}</div>}
                <div className="mt-1"><SourceLink req={r} paid /></div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Service-animal form note when no health rows but service */}
      {service && rows.length === 0 && (
        <p style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }} className="mb-3">
          See the REQUIRED FORM and SUBMISSION steps in your checklist for how to send the DOT form to {trip.airline || "your airline"}.
        </p>
      )}

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

      <p style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.muted }} className="mt-3">
        Guidance only — not veterinary advice. Your airline and a licensed veterinarian have the final say.
      </p>
    </div>
  );
}
