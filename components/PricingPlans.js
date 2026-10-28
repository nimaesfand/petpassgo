import { tokens } from "../lib/theme";
import { PRICES as P, usd } from "../lib/pricing";
import { VAULT_NAME } from "../lib/travelPassOffer";
import { JOIN_CTA, LOGIN_CTA, PLAN_CTA } from "../lib/cta";
const D = "var(--font-display), system-ui, sans-serif", B = "var(--font-body), system-ui, sans-serif";

const PASS_ITEMS = ["Rules for your exact flight and pet", "Checked steps, with the official page and a due date", "Flight day: live status, documents, Pet ID", "Pet ID and vault until 7 days after the trip ends"];

export const PLANS = [
  { k: "member", name: VAULT_NAME, price: P.member, unit: "USD /mo", blurb: `Travel Passes ${usd(P.memberPass)} for members.`, items: ["Digital Pet ID with QR", "Finder messages to you after Report lost", "Community boards", "Expiry reminders · unlimited pets"], cta: JOIN_CTA, href: "/join", hi: true },
  { k: "member-pass", name: "Travel Pass", price: P.memberPass, unit: "USD for members", blurb: "For members. One trip.", items: PASS_ITEMS, cta: LOGIN_CTA, href: "/login" },
  { k: "pass", name: "Travel Pass", price: P.pass, unit: "USD · one trip", blurb: "On its own. One trip.", items: PASS_ITEMS, cta: PLAN_CTA, href: "/assessment" },
];
const ROWS = [
  ["Full checklist, deadlines, sources", `${usd(P.memberPass)}/trip`, 1], ["Trip reminders", "With pass", 1],
  ["Digital Pet ID with QR", 1, "7 days after the trip ends"], ["Pet vault (documents)", 1, "7 days after the trip ends"],
  ["Finder messages to you", 1, 0], ["Community boards", 1, 0],
  ["Document expiry reminders", 1, 0], ["Pets", "Unlimited", "1"],
];
const mark = (v) => (v === 1 ? "✓" : v === 0 ? "✗" : v);
const col = (v) => (v === 1 ? tokens.green : v === 0 ? "#B8C2D0" : tokens.navy);

export function PlanCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
      {PLANS.map((p) => (
        <div key={p.k} className="rounded-2xl p-6 sm:p-7 flex flex-col h-full" style={{ background: p.hi ? tokens.navy : "#fff", border: `1px solid ${p.hi ? tokens.navy : tokens.line}`, color: p.hi ? "#fff" : tokens.navy }}>
          <div className="min-h-[2.5rem] mb-3" style={{ fontFamily: B, fontWeight: 700, fontSize: 13, letterSpacing: ".12em", lineHeight: 1.3, color: p.hi ? tokens.gold : tokens.primary }}>{p.name.toUpperCase()}</div>
          <div className="flex items-baseline gap-x-2 gap-y-1 flex-wrap min-h-[4.75rem]">
            <span style={{ fontFamily: D, fontSize: 44, fontWeight: 700, lineHeight: 1 }}>{p.price}</span>
            <span style={{ fontFamily: B, fontSize: 15, lineHeight: 1.3, opacity: 0.7 }}>{p.unit}</span>
          </div>
          <p className="mb-5 min-h-[3rem]" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.45, opacity: 0.85 }}>{p.blurb}</p>
          <ul className="space-y-2 mb-7 flex-1 min-h-[9.5rem]">{p.items.map((i) => <li key={i} className="flex gap-2" style={{ fontFamily: B, fontSize: 15, lineHeight: 1.4 }}><span style={{ color: p.hi ? tokens.gold : tokens.green, fontWeight: 700 }}>✓</span>{i}</li>)}</ul>
          <a href={p.href} className="btn-primary mt-auto flex items-center justify-center rounded-full px-4 py-3.5 text-center min-h-[52px] w-full" style={{ background: p.hi ? tokens.primary : "#fff", color: p.hi ? "#fff" : tokens.navy, border: `2px solid ${p.hi ? tokens.primary : tokens.navy}`, fontFamily: B, fontWeight: 600, fontSize: 16, lineHeight: 1.25, textDecoration: "none" }}>{p.cta}</a>
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
          {[VAULT_NAME, "Travel Pass"].map((h, i) => <th key={h} scope="col" className="py-4 px-3" style={{ fontFamily: D, fontSize: 16, color: tokens.navy, background: i === 0 ? "#FFF7E6" : "transparent" }}>{h}</th>)}
        </tr></thead>
        <tbody>{ROWS.map(([f, ...v]) => (
          <tr key={f} style={{ borderBottom: `1px solid ${tokens.line}` }}>
            <th scope="row" className="text-left py-3 px-5" style={{ fontFamily: B, fontSize: 14.5, fontWeight: 400, color: tokens.ink }}>{f}</th>
            {v.map((x, i) => <td key={i} className="py-3 px-3 text-center" aria-label={x === 1 ? "Included" : x === 0 ? "Not included" : undefined} style={{ fontFamily: B, fontSize: 14.5, fontWeight: 600, color: col(x), background: i === 0 ? "#FFF7E6" : "transparent" }}>{mark(x)}</td>)}
          </tr>))}
        </tbody>
      </table>
    </div>
  );
}
