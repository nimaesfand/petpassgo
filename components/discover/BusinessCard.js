import { tokens, font } from "../../lib/theme";
import { CATEGORIES, photoUrl, STATE_NAME } from "../../lib/discover";
import Icon from "../Icon";

export function SponsorTag({ plan, small }) {
  if (plan !== "featured" && plan !== "premium") return null;
  const premium = plan === "premium";
  return (
    <span className="inline-flex items-center gap-1 rounded-full" style={{ padding: small ? "2px 8px" : "3px 10px", fontFamily: font.body, fontSize: small ? 11 : 12, fontWeight: 800, letterSpacing: "0.04em", background: premium ? tokens.navy : tokens.gold, color: premium ? tokens.gold : tokens.navy }}>
      {premium ? "Premium partner" : "Featured"} <span style={{ fontWeight: 600, opacity: 0.8 }}>· Sponsored</span>
    </span>
  );
}

export function CategoryIcon({ slug, size = 20 }) {
  const c = CATEGORIES.find((x) => x.slug === slug);
  return <Icon name={c?.icon || "pin"} size={size} />;
}

export function Cover({ b, height = 170, rounded = "" }) {
  const src = photoUrl(b.photos?.[0]);
  return src ? (
    <img src={src} alt={`${b.name}`} loading="lazy" className={`w-full object-cover ${rounded}`} style={{ height, display: "block", background: tokens.sky }} />
  ) : (
    <div className={`w-full flex items-center justify-center ${rounded}`} style={{ height, background: "linear-gradient(135deg,#E7F0FF,#FDE8E2)", color: tokens.navy }}>
      <CategoryIcon slug={b.category} size={42} />
    </div>
  );
}

export default function BusinessCard({ b, href }) {
  const cat = CATEGORIES.find((c) => c.slug === b.category);
  const sponsored = b.plan === "featured" || b.plan === "premium";
  return (
    <a href={href || `/discover/${b.slug}`} className="rounded-3xl overflow-hidden flex flex-col ppg-lift" style={{ background: "#fff", border: `1px solid ${sponsored ? tokens.gold : tokens.line}`, textDecoration: "none", boxShadow: sponsored ? "0 10px 30px rgba(242,184,75,.18)" : "none" }}>
      <div className="relative">
        <Cover b={b} />
        {sponsored && <div className="absolute" style={{ top: 12, left: 12 }}><SponsorTag plan={b.plan} small /></div>}
      </div>
      <div className="p-5 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-1.5" style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 700, color: tokens.primary, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          <CategoryIcon slug={b.category} size={15} />{b.subcategories?.[0] || cat?.short_name}
        </div>
        <div style={{ fontFamily: font.display, fontSize: 21, fontWeight: 800, color: tokens.navy, lineHeight: 1.15 }}>{b.name}</div>
        {b.tagline && <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }}>{b.tagline}</div>}
        <div className="mt-auto pt-2 flex items-center gap-1.5" style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>
          <Icon name={b.online_only ? "globe" : "pin"} size={15} />
          {b.online_only ? "Online · ships nationwide" : `${b.city}, ${STATE_NAME[b.state] ? b.state : b.state}`}
        </div>
      </div>
    </a>
  );
}
