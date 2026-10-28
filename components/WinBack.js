import { tokens, font } from "../lib/theme";
import { JOIN_CTA } from "../lib/cta";

// Droopy-eared, slightly sad dog. Pure SVG, no stock images.
export function SadDog({ size = 112 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="A sad dog with droopy ears">
      <circle cx="60" cy="60" r="58" fill="#E8EEF7" />
      <path d="M30 40 C14 46 14 80 26 92 C34 84 36 62 40 50 Z" fill={tokens.navy} />
      <path d="M90 40 C106 46 106 80 94 92 C86 84 84 62 80 50 Z" fill={tokens.navy} />
      <ellipse cx="60" cy="62" rx="30" ry="32" fill="#C98B4E" />
      <ellipse cx="60" cy="80" rx="17" ry="13" fill="#E7B987" />
      <path d="M44 56 q5 4 10 0" stroke={tokens.navy} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M66 56 q5 4 10 0" stroke={tokens.navy} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M41 50 l10 -4 M79 50 l-10 -4" stroke={tokens.navy} strokeWidth="2.6" strokeLinecap="round" />
      <ellipse cx="60" cy="72" rx="6" ry="4.5" fill={tokens.navy} />
      <path d="M53 86 q7 -5 14 0" stroke={tokens.navy} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M77 63 q2 5 0 8 q-2 -3 0 -8z" fill="#7FB3E8" />
    </svg>
  );
}

const COPY = {
  petid: (n) => [`${n || "Your pet"} misses you already`, "The full Digital Pet ID is resting. If someone scans the QR code, they can still message you."],
  vault: (n) => [`${n ? n + "'s" : "Your pet's"} papers are napping until you're back`, "Documents, vet details and expiry reminders are paused."],
  community: () => ["The boards feel quieter without you", "Fellow travelers are still swapping tips. Come say hi again."],
  pets: () => ["Room for one more?", "Extra pets come back with membership. Everyone you added is still here."],
};

export default function WinBack({ area = "petid", petName, compact }) {
  const [title, body] = COPY[area](petName);
  return (
    <div className={`rounded-2xl ${compact ? "p-5" : "p-7"} flex ${compact ? "flex-row items-center gap-4" : "flex-col items-center text-center"}`} style={{ background: "#fff", border: `1.5px solid ${tokens.gold}` }}>
      <SadDog size={compact ? 72 : 112} />
      <div className={compact ? "flex-1" : "mt-3"}>
        <div style={{ fontFamily: font.display, fontSize: compact ? 19 : 23, fontWeight: 700, color: tokens.navy, lineHeight: 1.2 }} className="mb-1.5">{title}</div>
        <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted, lineHeight: 1.5 }} className="mb-1">{body}</p>
        <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.green, fontWeight: 600 }} className="mb-4">Everything is kept safe, not deleted.</p>
        <a href="/join" className="btn-primary inline-block rounded-full px-6 py-3" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 600, textDecoration: "none" }}>{JOIN_CTA}</a>
      </div>
    </div>
  );
}
