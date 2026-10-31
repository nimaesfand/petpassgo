import Icon from "./Icon";
import { tokens, font } from "../lib/theme";

// Plain statements about things the product actually does. No ratings,
// customer counts, or seals that look like a third-party certification.
const BADGES = [
  { icon: "lock", title: "Secure checkout with Stripe", line: "Card payments go through Stripe. We don’t store your full card number." },
  { icon: "link", title: "Rules checked on official airline sites", line: "Each rule in a Travel Pass shows its source and the Last checked date." },
  { icon: "shield", title: "Your info stays private", line: "Finder messages never show your phone number." },
  { icon: "message", title: "Real support", line: "Email support@petpassgo.com and a person replies." },
  { icon: "checkCircle", title: "Flight-Ready Guarantee", line: "If a requirement we showed was wrong and your pet was refused boarding, we refund that Travel Pass." },
];

export default function TrustBadges({ className = "" }) {
  return (
    <ul className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      {BADGES.map((b) => (
        <li key={b.title} className="flex gap-3 items-start rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <span aria-hidden className="flex items-center justify-center flex-shrink-0 rounded-xl" style={{ width: 44, height: 44, background: tokens.navy, color: tokens.gold }}>
            <Icon name={b.icon} size={22} />
          </span>
          <span className="min-w-0">
            <span className="block" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.3, color: tokens.navy }}>{b.title}</span>
            <span className="block mt-1" style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.45, color: tokens.ink }}>{b.line}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
