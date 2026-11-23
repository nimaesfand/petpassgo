import { tokens, font } from "../../lib/theme";

// Benny, our golden retriever guide, says each line. Labeled as our AI guide.
export function BennySays({ children, sub }) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="flex-shrink-0 text-center">
        <div className="rounded-full overflow-hidden" style={{ width: 68, height: 68, border: `3px solid ${tokens.gold}`, boxShadow: "0 6px 16px rgba(20,33,61,.18)" }}>
          <img src="/images/hero-golden-retriever.jpg" alt="Benny, the PetPassGo guide" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "62% 22%" }} />
        </div>
        <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 800, color: tokens.navy, marginTop: 4 }}>Benny</div>
        <div style={{ fontFamily: font.body, fontSize: 10.5, color: tokens.muted }}>AI guide</div>
      </div>
      <div className="relative rounded-3xl rounded-tl-md px-5 py-4 flex-1 min-w-0" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 8px 24px rgba(20,33,61,.08)" }}>
        <div style={{ fontFamily: font.display, fontSize: 25, fontWeight: 800, color: tokens.navy, lineHeight: 1.2 }}>{children}</div>
        {sub ? <p className="mt-2" style={{ fontFamily: font.body, fontSize: 17, color: tokens.muted, lineHeight: 1.45 }}>{sub}</p> : null}
      </div>
    </div>
  );
}

const LOCKED = [
  ["Vet Verified", "Your vet confirms each vaccine with one click."],
  ["Gate Ready", "Everything on one screen at the airport."],
  ["Never Expired", "Reminders before vaccines or documents run out."],
  ["Bring Me Home tag", "A QR tag that lets anyone who finds them reach you."],
];

const EVERYTHING = [
  "The passport, with its QR code and a phone wallet pass",
  "Vet Verified records: your vet confirms each vaccine",
  "Every document in one place: rabies and health certificates, with a document check",
  "Gate Ready travel mode for the airport",
  "Reminders before vaccines and documents expire",
  "Bring Me Home: QR tag, lost-pet alerts and messages from whoever finds them",
  "Training records and the signed service dog statement",
  "Unlimited pets",
  "Travel Passes for $14.99 when a trip needs paperwork",
];

// Everything Pet Vault includes, folded away so the page stays simple.
export function EverythingInVault() {
  return (
    <details className="mt-3 rounded-2xl px-4 py-3" style={{ background: tokens.sky, border: `1px solid ${tokens.line}` }}>
      <summary style={{ fontFamily: font.body, fontWeight: 800, fontSize: 17, color: tokens.navy, cursor: "pointer" }}>See everything in Pet Vault</summary>
      <ul className="mt-3 grid gap-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {EVERYTHING.map((t) => (
          <li key={t} className="flex gap-2.5" style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink }}>
            <span aria-hidden="true" style={{ color: tokens.primary, fontWeight: 900 }}>✓</span>{t}
          </li>
        ))}
      </ul>
    </details>
  );
}

// The pages inside the passport that Pet Vault unlocks.
export function LockedPages({ name }) {
  return (
    <>
    <div className="grid gap-2.5">
      {LOCKED.map(([t, b]) => (
        <div key={t} className="rounded-2xl px-4 py-3.5 flex gap-3 items-start" style={{ background: "#FBF7EE", border: "1px solid #E6DCC6" }}>
          <span aria-hidden="true" className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 34, height: 34, background: tokens.navy, color: tokens.gold }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          </span>
          <span>
            <span className="block" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 17, color: tokens.navy }}>{t}</span>
            <span className="block mt-0.5" style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink, lineHeight: 1.4 }}>{b.replace("them", name ? name : "them")}</span>
          </span>
        </div>
      ))}
    </div>
    <EverythingInVault />
    </>
  );
}
