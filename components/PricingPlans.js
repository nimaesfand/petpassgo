import { tokens } from "../lib/theme";
import { PRICES as P } from "../lib/pricing";
const D = "var(--font-display), system-ui, sans-serif", B = "var(--font-body), system-ui, sans-serif";

export const PLANS = [
  { k: "free", name: "Free", price: "$0", unit: "no account needed", blurb: "See what your trip needs.", items: ["Trip questions", "Preview of the steps you'll need", "Lost-pet flyer + instant sharing"], cta: "Plan your trip", href: "/assessment" },
  { k: "member", name: "Membership", price: P.member, unit: "per month", blurb: "Everything for your pet, all year.", items: ["Pet vault + Digital Pet ID with QR", "Lost-pet alerts + finder messages", "Community boards", "Expiry reminders · unlimited pets", `Travel Passes just ${P.memberPass}`], cta: `Join for ${P.member}/mo`, href: "/signup?plan=member", hi: true },
  { k: "pass", name: "Travel Pass", price: P.pass, unit: "per trip, no membership", blurb: "One trip, fully covered.", items: ["Full checklist + deadlines", "Official sources", "Reminders for this trip", "Pet ID + vault until the trip ends"], cta: "Buy a Travel Pass", href: "/assessment" },
];
const ROWS = [
  ["Trip questions + step preview", 1, 1, 1], ["Lost-pet flyer + social sharing", 1, 1, 1],
  ["Full checklist, deadlines, sources", 0, `${P.memberPass}/trip`, 1], ["Trip reminders", 0, "With pass", 1],
  ["Digital Pet ID with QR", 0, 1, "Until trip ends"], ["Pet vault (documents)", 0, 1, "Until trip ends"],
  ["Lost-pet alerts + finder messages", 0, 1, 0], ["Community boards", 0, 1, 0],
  ["Document expiry reminders", 0, 1, 0], ["Pets", "—", "Unlimited", "1"],
];
const mark = (v) => (v === 1 ? "✓" : v === 0 ? "✗" : v);
const col = (v) => (v === 1 ? tokens.green : v === 0 ? "#B8C2D0" : tokens.navy);

export function PlanCards() {
  return (
    <div className="grid md:grid-cols-3 gap-5 items-stretch">
      {PLANS.map((p) => (
        <div key={p.k} className="rounded-2xl p-7 flex flex-col relative" style={{ background: p.hi ? tokens.navy : "#fff", border: `${p.hi ? 2 : 1}px solid ${p.hi ? tokens.gold : tokens.line}`, color: p.hi ? "#fff" : tokens.navy, boxShadow: p.hi ? "0 18px 40px rgba(20,33,61,.25)" : "none" }}>
          {p.hi && <span className="absolute -top-3.5 left-7 rounded-full px-3 py-1" style={{ background: tokens.gold, color: tokens.navy, fontFamily: B, fontWeight: 800, fontSize: 12, letterSpacing: ".08em" }}>BEST VALUE · SAVE {P.savings} ON EVERY TRIP</span>}
          <div style={{ fontFamily: B, fontWeight: 700, fontSize: 13, letterSpacing: ".12em", color: p.hi ? tokens.gold : tokens.primary }} className="mb-3">{p.name.toUpperCase()}</div>
          <div className="flex items-baseline gap-2 flex-wrap"><span style={{ fontFamily: D, fontSize: 44, fontWeight: 700 }}>{p.price}</span><span style={{ fontFamily: B, fontSize: 14.5, opacity: 0.7 }}>{p.unit}</span></div>
          <p style={{ fontFamily: B, fontSize: 15.5, opacity: 0.8 }} className="mb-5">{p.blurb}</p>
          <ul className="space-y-2 mb-7 flex-1">{p.items.map((i) => <li key={i} className="flex gap-2" style={{ fontFamily: B, fontSize: 15 }}><span style={{ color: p.hi ? tokens.gold : tokens.green, fontWeight: 700 }}>✓</span>{i}</li>)}</ul>
          <a href={p.href} className="btn-primary block rounded-full px-7 py-3.5 text-center" style={{ background: p.hi ? tokens.primary : "#fff", color: p.hi ? "#fff" : tokens.navy, border: p.hi ? "none" : `2px solid ${tokens.navy}`, fontFamily: B, fontWeight: 600, fontSize: 16, textDecoration: "none" }}>{p.cta}</a>
        </div>
      ))}
    </div>
  );
}

export function CompareTable() {
  return (
    <div className="mt-12 rounded-2xl overflow-x-auto" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <table className="w-full min-w-[560px]" style={{ borderCollapse: "collapse" }}>
        <thead><tr style={{ borderBottom: `1px solid ${tokens.line}` }}>
          <th className="text-left py-4 px-5" style={{ fontFamily: B, fontSize: 13, color: tokens.muted, letterSpacing: ".1em" }}>COMPARE</th>
          {["Free", "Membership", "Travel Pass"].map((h, i) => <th key={h} scope="col" className="py-4 px-3" style={{ fontFamily: D, fontSize: 16, color: tokens.navy, background: i === 1 ? "#FFF7E6" : "transparent" }}>{h}</th>)}
        </tr></thead>
        <tbody>{ROWS.map(([f, ...v]) => (
          <tr key={f} style={{ borderBottom: `1px solid ${tokens.line}` }}>
            <th scope="row" className="text-left py-3 px-5" style={{ fontFamily: B, fontSize: 14.5, fontWeight: 400, color: tokens.ink }}>{f}</th>
            {v.map((x, i) => <td key={i} className="py-3 px-3 text-center" aria-label={x === 1 ? "Included" : x === 0 ? "Not included" : undefined} style={{ fontFamily: B, fontSize: 14.5, fontWeight: 600, color: col(x), background: i === 1 ? "#FFF7E6" : "transparent" }}>{mark(x)}</td>)}
          </tr>))}
        </tbody>
      </table>
    </div>
  );
}
