import { tokens, font } from "../lib/theme";

// A made-up pass for people who have not paid. No real airline, airport, or rule.
const STEPS = [
  { title: "Reserve the pet spot", when: "Aim to do this 2 weeks before the made-up date", detail: "Sample Air asks you to add the pet on the booking. This date is an example, not a real deadline." },
  { title: "Measure the carrier", when: "Aim to do this 1 week before", detail: "In this example the carrier max is 17 × 11 × 10 in. Mochi’s sample carrier is 16 × 10 × 9 in, so it fits this made-up limit." },
  { title: "Pack for the airport", when: "Aim to do this the day before", detail: "A bowl, a leash, pads, a familiar cloth, waste bags, and a few treats. This list is general. It is not an airline rule." },
  { title: "Travel day", when: "On the made-up travel day", detail: "Check in, use a relief area, and follow security’s instructions. Your real pass replaces this after you pay." },
];

export default function SamplePass({ compact = false }) {
  return (
    <section className="rounded-2xl p-4 sm:p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }} aria-label="Made-up sample pass">
      <div className="rounded-full px-3 py-1 inline-block mb-3" style={{ background: "#FFF4D6", color: "#8A5A00", fontFamily: font.body, fontSize: 14, fontWeight: 800 }}>
        Made-up example
      </div>
      <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: tokens.navy, lineHeight: 1.2 }}>A sample pass for Mochi</h2>
      <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink, lineHeight: 1.45 }} className="mt-2">
        Sample Air, Sample City (SMP) to Sample Bay (SMB). Not a real airline and not real rules. Your checklist, with sources and dates, is in the pass after you pay.
      </p>
      {!compact && (
        <ol className="mt-4 space-y-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-xl p-3" style={{ background: tokens.paper }}>
              <div style={{ fontFamily: font.body, fontSize: 16, fontWeight: 800, color: tokens.navy }}>{i + 1}. {s.title}</div>
              <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.primary }} className="mt-1">{s.when}</div>
              <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink, lineHeight: 1.45 }} className="mt-1">{s.detail}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
