"use client";
import SiteHeader from "../../components/SiteHeader";
import { tokens } from "../../lib/theme";
const D = "var(--font-display), system-ui, sans-serif", B = "var(--font-body), system-ui, sans-serif";
const Btn = ({ children, alt, full }) => <span className={`inline-block rounded-full px-7 py-3.5 text-center ${full ? "w-full" : ""}`} style={{ background: alt ? "#fff" : tokens.primary, color: alt ? tokens.navy : "#fff", border: alt ? `2px solid ${tokens.navy}` : "none", fontFamily: B, fontWeight: 600, fontSize: 16 }}>{children}</span>;
const Eyebrow = ({ c = tokens.primary, children }) => <div style={{ fontFamily: B, color: c, fontSize: 13, fontWeight: 700, letterSpacing: "0.14em" }} className="mb-3">{children}</div>;
const Label = ({ n, t }) => <div className="max-w-[1240px] mx-auto px-6 md:px-14 pt-10" style={{ fontFamily: B, fontSize: 12, fontWeight: 700, letterSpacing: ".14em", color: tokens.muted }}>MOCKUP {n} · {t}</div>;

const PLANS = [
  { k: "free", name: "Free", price: "$0", unit: "no account needed", blurb: "See what your trip needs.", items: ["Trip questions", "Preview of the steps you'll need", "Lost-pet flyer + instant sharing"], cta: "Plan your trip", alt: true },
  { k: "member", name: "Membership", price: "$4.99", unit: "per month", blurb: "Everything for your pet, all year.", items: ["Pet vault + Digital Pet ID with QR", "Lost-pet alerts + finder messages", "Community boards", "Expiry reminders · unlimited pets", "Travel Passes just $19.99"], cta: "Join for $4.99/mo", hi: true },
  { k: "pass", name: "Travel Pass", price: "$49.99", unit: "per trip, no membership", blurb: "One trip, fully covered.", items: ["Full checklist + deadlines", "Official sources", "Reminders for this trip", "Pet ID active until the trip ends"], cta: "Buy a Travel Pass", alt: true },
];
const ROWS = [
  ["Trip questions + step preview", 1, 1, 1], ["Lost-pet flyer + social sharing", 1, 1, 1],
  ["Full checklist, deadlines, sources", 0, "$19.99/trip", 1], ["Trip reminders", 0, "With pass", 1],
  ["Digital Pet ID with QR", 0, 1, "Until trip ends"], ["Pet vault (documents)", 0, 1, "Until trip ends"],
  ["Lost-pet alerts + finder messages", 0, 1, 0], ["Community boards", 0, 1, 0],
  ["Document expiry reminders", 0, 1, 0], ["Pets", "—", "Unlimited", "1"],
];
const Cell = ({ v }) => <td className="py-3 px-3 text-center" style={{ fontFamily: B, fontSize: 14.5, fontWeight: 600, color: v === 1 ? tokens.green : v === 0 ? "#B8C2D0" : tokens.navy }}>{v === 1 ? "✓" : v === 0 ? "✗" : v}</td>;

function Pricing() {
  return (
    <section id="m1" className="max-w-[1240px] mx-auto px-6 md:px-14 py-16">
      <Eyebrow>PRICING</Eyebrow>
      <h2 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.1 }} className="text-[32px] md:text-[42px] font-bold mb-10">Start free. Pay when you fly.</h2>
      <div className="grid md:grid-cols-3 gap-5 items-stretch">
        {PLANS.map((p) => (
          <div key={p.k} className="rounded-2xl p-7 flex flex-col relative" style={{ background: p.hi ? tokens.navy : "#fff", border: `${p.hi ? 2 : 1}px solid ${p.hi ? tokens.gold : tokens.line}`, color: p.hi ? "#fff" : tokens.navy, boxShadow: p.hi ? "0 18px 40px rgba(20,33,61,.25)" : "none" }}>
            {p.hi && <span className="absolute -top-3.5 left-7 rounded-full px-3 py-1" style={{ background: tokens.gold, color: tokens.navy, fontFamily: B, fontWeight: 800, fontSize: 12, letterSpacing: ".08em" }}>BEST VALUE · SAVE $30 ON EVERY TRIP</span>}
            <div style={{ fontFamily: B, fontWeight: 700, fontSize: 13, letterSpacing: ".12em", color: p.hi ? tokens.gold : tokens.primary }} className="mb-3">{p.name.toUpperCase()}</div>
            <div className="flex items-baseline gap-2"><span style={{ fontFamily: D, fontSize: 44, fontWeight: 700 }}>{p.price}</span><span style={{ fontFamily: B, fontSize: 14.5, opacity: .7 }}>{p.unit}</span></div>
            <p style={{ fontFamily: B, fontSize: 15.5, opacity: .8 }} className="mb-5">{p.blurb}</p>
            <ul className="space-y-2 mb-7 flex-1">{p.items.map((i) => <li key={i} className="flex gap-2" style={{ fontFamily: B, fontSize: 15 }}><span style={{ color: p.hi ? tokens.gold : tokens.green, fontWeight: 700 }}>✓</span>{i}</li>)}</ul>
            <Btn alt={p.alt} full>{p.cta}</Btn>
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-2xl overflow-x-auto" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        <table className="w-full min-w-[560px]" style={{ borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${tokens.line}` }}>
            <th className="text-left py-4 px-5" style={{ fontFamily: B, fontSize: 13, color: tokens.muted, letterSpacing: ".1em" }}>COMPARE</th>
            {["Free", "Membership", "Travel Pass"].map((h, i) => <th key={h} className="py-4 px-3" style={{ fontFamily: D, fontSize: 16, color: tokens.navy, background: i === 1 ? "#FFF7E6" : "transparent" }}>{h}</th>)}
          </tr></thead>
          <tbody>{ROWS.map(([f, a, b, c]) => (
            <tr key={f} style={{ borderBottom: `1px solid ${tokens.line}` }}>
              <td className="py-3 px-5" style={{ fontFamily: B, fontSize: 14.5, color: tokens.ink }}>{f}</td>
              <Cell v={a} /><td style={{ background: "#FFF7E6" }} className="text-center"><table className="w-full"><tbody><tr><Cell v={b} /></tr></tbody></table></td><Cell v={c} />
            </tr>))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section id="m2" className="max-w-[1240px] mx-auto px-6 md:px-14 pt-10 pb-16 text-center">
      <h1 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05 }} className="text-[40px] md:text-[62px] font-bold mb-5">Fly with your pet. Skip the guesswork.</h1>
      <p style={{ fontFamily: B, fontSize: 19, color: tokens.muted }} className="mb-10">Two ways to start. Both take a minute.</p>
      <div className="grid md:grid-cols-2 gap-5 max-w-[880px] mx-auto text-left">
        {[["✈️", "Flying soon?", "Answer a few trip questions and see every step you'll need.", "Plan your trip", "Free · no account"],
          ["🐾", "Just want peace of mind?", "Pet vault, a Digital Pet ID with QR, and lost-pet alerts.", "Get your pet's ID", "Membership · $4.99/mo"]].map(([ic, t, b, c, s], i) => (
          <div key={t} className="rounded-2xl p-7" style={{ background: i ? tokens.navy : "#fff", border: `1px solid ${i ? tokens.navy : tokens.line}`, color: i ? "#fff" : tokens.navy }}>
            <div className="text-3xl mb-3">{ic}</div>
            <div style={{ fontFamily: D, fontSize: 24, fontWeight: 700 }} className="mb-2">{t}</div>
            <p style={{ fontFamily: B, fontSize: 16, opacity: .8 }} className="mb-6">{b}</p>
            <div className="flex items-center gap-3 flex-wrap"><Btn alt={!!i}>{c} →</Btn><span style={{ fontFamily: B, fontSize: 13.5, opacity: .7 }}>{s}</span></div>
          </div>))}
      </div>
    </section>
  );
}

function Signup() {
  return (
    <section id="m3" className="max-w-[760px] mx-auto px-6 py-14">
      <div className="rounded-3xl p-8" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        <h2 style={{ fontFamily: D, fontSize: 32, fontWeight: 700, color: tokens.navy }} className="mb-1">Choose how to start</h2>
        <p style={{ fontFamily: B, color: tokens.muted }} className="mb-6">You can switch anytime.</p>
        {[["Membership", "$4.99/mo", "Pet vault, Pet ID with QR, lost-pet alerts, community. Travel Passes $19.99.", true],
          ["Travel Pass only", "$49.99 once", "One trip's checklist, deadlines and reminders. Pet ID until the trip ends.", false],
          ["Free account", "$0", "Save your trip answers. Upgrade later.", false]].map(([n, p, d, sel]) => (
          <label key={n} className="flex gap-4 items-start rounded-2xl p-5 mb-3" style={{ border: `2px solid ${sel ? tokens.primary : tokens.line}`, background: sel ? "#FFF7F2" : "#fff" }}>
            <span className="mt-1 rounded-full flex-shrink-0" style={{ width: 20, height: 20, border: `2px solid ${sel ? tokens.primary : tokens.line}`, boxShadow: sel ? `inset 0 0 0 4px #fff` : "none", background: sel ? tokens.primary : "#fff" }} />
            <span className="flex-1"><span className="flex justify-between gap-3 flex-wrap"><span style={{ fontFamily: D, fontSize: 19, fontWeight: 700, color: tokens.navy }}>{n}{sel && <span className="ml-2 rounded-full px-2 py-0.5 align-middle" style={{ background: tokens.gold, fontFamily: B, fontSize: 11, fontWeight: 800 }}>BEST VALUE</span>}</span><span style={{ fontFamily: B, fontWeight: 700, color: tokens.navy }}>{p}</span></span>
              <span style={{ fontFamily: B, fontSize: 14.5, color: tokens.muted }}>{d}</span></span>
          </label>))}
        <div className="grid gap-3 mt-6">
          <input placeholder="Email" className="rounded-lg px-4 py-3" style={{ border: `2px solid ${tokens.line}`, fontFamily: B }} />
          <input placeholder="Password" type="password" className="rounded-lg px-4 py-3" style={{ border: `2px solid ${tokens.line}`, fontFamily: B }} />
          <Btn full>Continue to payment · $4.99/mo</Btn>
          <p className="text-center" style={{ fontFamily: B, fontSize: 13, color: tokens.muted }}>Cancel anytime. By continuing you agree to our Terms and Privacy Policy.</p>
        </div>
      </div>
    </section>
  );
}

function Paywall() {
  return (
    <section id="m4" className="max-w-[860px] mx-auto px-6 py-14">
      <div style={{ fontFamily: D, fontSize: 36, fontWeight: 700, color: tokens.navy }} className="mb-5">Delta</div>
      <div className="relative rounded-2xl overflow-hidden" style={{ border: `1px solid ${tokens.line}` }}>
        <div style={{ filter: "blur(5px)", opacity: .6 }} className="p-6 space-y-4 bg-white" aria-hidden="true">
          {[1, 2, 3].map((i) => <div key={i}><div className="h-3 w-32 rounded mb-2" style={{ background: tokens.line }} /><div className="h-5 w-3/4 rounded mb-2" style={{ background: "#C9D3E3" }} /><div className="h-3 w-full rounded mb-1" style={{ background: tokens.line }} /><div className="h-3 w-5/6 rounded" style={{ background: tokens.line }} /></div>)}
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-6" style={{ background: "rgba(243,245,249,.55)" }}>
          <div className="rounded-2xl p-7 text-center max-w-md" style={{ background: "#fff", boxShadow: "0 18px 40px rgba(20,33,61,.18)", border: `1px solid ${tokens.line}` }}>
            <div className="text-3xl mb-2">💬</div>
            <div style={{ fontFamily: D, fontSize: 24, fontWeight: 700, color: tokens.navy }} className="mb-2">Join the conversation</div>
            <p style={{ fontFamily: B, fontSize: 15.5, color: tokens.muted }} className="mb-5">Community boards are for members. Read real tips from people who flew Delta with their pet, and ask your own.</p>
            <Btn full>Join for $4.99/mo</Btn>
            <p style={{ fontFamily: B, fontSize: 13, color: tokens.muted }} className="mt-3">Includes Pet ID, lost-pet alerts and $19.99 Travel Passes. Already a member? <u>Log in</u></p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Upsell() {
  return (
    <section id="m5" className="max-w-[860px] mx-auto px-6 py-14">
      <div className="rounded-3xl p-8" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        <Eyebrow>YOUR DELTA TRIP · 7 STEPS</Eyebrow>
        <div style={{ fontFamily: D, fontSize: 30, fontWeight: 700, color: tokens.navy }} className="mb-5">Unlock your full checklist</div>
        <div className="flex flex-wrap gap-2 mb-7">{["Booking", "Health documents", "Carrier", "Vaccinations", "Day of travel", "Submission", "Arrival"].map((s) => <span key={s} className="rounded-full px-3 py-1.5" style={{ background: tokens.sky, fontFamily: B, fontSize: 13.5, fontWeight: 600, color: tokens.navy }}>🔒 {s}</span>)}</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6 relative" style={{ background: tokens.navy, color: "#fff", border: `2px solid ${tokens.gold}` }}>
            <span className="absolute -top-3 left-6 rounded-full px-3 py-0.5" style={{ background: tokens.gold, color: tokens.navy, fontFamily: B, fontWeight: 800, fontSize: 11.5 }}>SAVE $30 ON THIS TRIP</span>
            <div style={{ fontFamily: B, fontWeight: 700, fontSize: 13, letterSpacing: ".12em", color: tokens.gold }} className="mb-2">JOIN + PASS</div>
            <div style={{ fontFamily: D, fontSize: 34, fontWeight: 700 }}>$19.99 <span style={{ fontSize: 16, fontWeight: 500, opacity: .75 }}>+ $4.99/mo</span></div>
            <p style={{ fontFamily: B, fontSize: 14.5, opacity: .8 }} className="mb-5">This trip, plus Pet ID, lost-pet alerts, community and every future pass at $19.99.</p>
            <span className="block rounded-full py-3 text-center" style={{ background: tokens.gold, color: tokens.navy, fontFamily: B, fontWeight: 700 }}>Join and unlock · $24.98 today</span>
          </div>
          <div className="rounded-2xl p-6" style={{ border: `1px solid ${tokens.line}` }}>
            <div style={{ fontFamily: B, fontWeight: 700, fontSize: 13, letterSpacing: ".12em", color: tokens.primary }} className="mb-2">THIS TRIP ONLY</div>
            <div style={{ fontFamily: D, fontSize: 34, fontWeight: 700, color: tokens.navy }}>$49.99</div>
            <p style={{ fontFamily: B, fontSize: 14.5, color: tokens.muted }} className="mb-5">Full checklist, deadlines, sources and reminders. Pet ID until your trip ends.</p>
            <Btn alt full>Buy Travel Pass</Btn>
          </div>
        </div>
        <p className="mt-5" style={{ fontFamily: B, fontSize: 13, color: tokens.muted }}>Membership renews monthly. Cancel anytime.</p>
      </div>
    </section>
  );
}

export default function MockupPricing() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <Label n="1" t="HOMEPAGE PRICING" /><Pricing />
      <Label n="2" t="HOMEPAGE HERO" /><Hero />
      <Label n="3" t="SIGNUP / PLAN CHOICE" /><Signup />
      <Label n="4" t="COMMUNITY PAYWALL" /><Paywall />
      <Label n="5" t="END OF TRIP QUESTIONS" /><Upsell />
    </div>
  );
}
