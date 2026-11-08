import { tokens, font } from "../../lib/theme";
import { CATEGORIES, CHECKED_LINE, photoUrl, safeUrl, telHref, mapsHref, STATE_NAME } from "../../lib/discover";
import Icon from "../Icon";
import { SponsorTag, CategoryIcon } from "./BusinessCard";

function Action({ href, icon, label, primary }) {
  if (!href) return null;
  const ext = href.startsWith("http");
  return (
    <a href={href} target={ext ? "_blank" : undefined} rel={ext ? "noopener noreferrer nofollow" : undefined} className="inline-flex items-center gap-2 rounded-full px-5 py-3"
      style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15.5, textDecoration: "none", background: primary ? tokens.primary : "#fff", color: primary ? "#fff" : tokens.navy, border: primary ? "none" : `1.5px solid ${tokens.navy}` }}>
      <Icon name={icon} size={18} />{label}
    </a>
  );
}

function Row({ icon, label, children }) {
  if (!children) return null;
  return (
    <div className="flex gap-3 py-3" style={{ borderTop: `1px solid ${tokens.line}` }}>
      <span style={{ color: tokens.primary }} className="mt-0.5"><Icon name={icon} size={18} /></span>
      <div className="min-w-0">
        <div style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.muted }}>{label}</div>
        <div style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink, lineHeight: 1.5, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{children}</div>
      </div>
    </div>
  );
}

// The public profile. `preview` shows it before approval, clearly marked.
export default function BusinessProfile({ b, preview = false }) {
  const cat = CATEGORIES.find((c) => c.slug === b.category);
  const photos = (b.photos || []).map(photoUrl).filter(Boolean);
  const site = safeUrl(b.website);
  const book = safeUrl(b.booking_url);
  const tel = telHref(b.phone);
  const maps = mapsHref(b);
  const paid = b.plan === "featured" || b.plan === "premium";
  const checked = b.confirmed_by_business_at && b.checked_by_petpassgo_at;
  return (
    <article>
      {preview && (
        <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: "#FFF8EC", border: "1px solid #F1D49B", fontFamily: font.body, fontSize: 14.5, color: "#7A4F00" }}>
          Preview. This is how your listing will look once PetPassGo approves it. It isn&apos;t public yet.
        </div>
      )}
      <div className="rounded-3xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        {photos.length ? (
          <div className={`grid gap-1 ${photos.length === 1 ? "" : photos.length === 2 ? "grid-cols-2" : "grid-cols-[2fr_1fr]"}`} style={{ background: tokens.line }}>
            <img src={photos[0]} alt={b.name} className="w-full object-cover" style={{ height: 320, display: "block" }} />
            {photos.length === 2 && <img src={photos[1]} alt="" className="w-full object-cover" style={{ height: 320, display: "block" }} />}
            {photos.length === 3 && (
              <div className="grid grid-rows-2 gap-1">
                <img src={photos[1]} alt="" className="w-full h-full object-cover" style={{ height: 158, display: "block" }} />
                <img src={photos[2]} alt="" className="w-full h-full object-cover" style={{ height: 158, display: "block" }} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center" style={{ height: 200, background: "linear-gradient(135deg,#E7F0FF,#FDE8E2)", color: tokens.navy }}><CategoryIcon slug={b.category} size={56} /></div>
        )}
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5" style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: tokens.primary, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              <CategoryIcon slug={b.category} size={15} />{cat?.name}
            </span>
            {paid && <SponsorTag plan={b.plan} />}
          </div>
          <h1 style={{ fontFamily: font.display, color: tokens.navy, lineHeight: 1.08 }} className="text-[32px] md:text-[42px] font-bold">{b.name}</h1>
          {b.tagline && <p style={{ fontFamily: font.body, fontSize: 18, color: tokens.ink }} className="mt-2">{b.tagline}</p>}
          <div className="flex items-center gap-1.5 mt-3" style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>
            <Icon name={b.online_only ? "globe" : "pin"} size={16} />
            {b.online_only ? "Online · ships nationwide" : `${b.city}, ${STATE_NAME[b.state] || b.state}`}
          </div>
          {b.subcategories?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {b.subcategories.map((s) => <span key={s} className="rounded-full px-3 py-1" style={{ background: tokens.sky, fontFamily: font.body, fontSize: 13.5, fontWeight: 600, color: tokens.navy }}>{s}</span>)}
            </div>
          )}
          <div className="flex flex-wrap gap-2.5 mt-6">
            <Action href={book} icon="calendar" label="Book" primary />
            <Action href={tel} icon="phone" label="Call" primary={!book} />
            <Action href={maps} icon="pin" label="Directions" />
            <Action href={site} icon="external" label="Website" />
          </div>

          {b.pet_policy && (
            <div className="rounded-2xl p-5 mt-7" style={{ background: "#F3FAF6", border: "1px solid #CBE7D6" }}>
              <div className="flex items-center gap-2" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 15, color: "#1F6B45" }}><Icon name="paw" size={18} />Pet policy</div>
              <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.55, color: tokens.ink, whiteSpace: "pre-line" }} className="mt-1.5">{b.pet_policy}</p>
            </div>
          )}
          {b.description && <p style={{ fontFamily: font.body, fontSize: 16.5, lineHeight: 1.65, color: tokens.ink, whiteSpace: "pre-line" }} className="mt-6">{b.description}</p>}

          <div className="mt-6">
            <Row icon="clock" label="Hours">{b.hours}</Row>
            <Row icon="pin" label="Address">{b.online_only ? null : [b.address, `${b.city}, ${b.state} ${b.zip || ""}`.trim()].filter(Boolean).join("\n")}</Row>
            <Row icon="route" label="Service area">{b.service_area}</Row>
            <Row icon="phone" label="Phone">{b.phone}</Row>
          </div>

          <div className="flex items-start gap-2 mt-6 pt-5" style={{ borderTop: `1px solid ${tokens.line}`, fontFamily: font.body, fontSize: 14, color: tokens.muted, lineHeight: 1.5 }}>
            <span style={{ color: checked ? tokens.green : tokens.muted }} className="mt-0.5"><Icon name={checked ? "checkCircle" : "clock"} size={16} /></span>
            <span>
              {checked ? CHECKED_LINE + "." : "Waiting for PetPassGo's check."} Call ahead to confirm hours and pet rules before you visit.
              {paid ? " Sponsored listings pay for placement; PetPassGo doesn't endorse any business." : ""}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
