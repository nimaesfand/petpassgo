import { tokens, font } from "../../lib/theme";
import Icon from "../Icon";
import { PetIllustration } from "../PetIdCard";

const ROWS = [
  { icon: "home", label: "Overview" },
  { icon: "cloudSun", label: "Flight & weather" },
  { icon: "check", label: "Checklist", progress: true },
  { icon: "file", label: "Documents" },
  { icon: "stethoscope", label: "Vets & pet stores" },
  { icon: "clock", label: "Reminders" },
];

export default function PassPhone() {
  return (
    <figure className="mx-auto w-full" style={{ maxWidth: 320 }}>
      <div className="rounded-[36px] p-2.5" style={{ background: tokens.navy, boxShadow: "0 24px 50px rgba(20,33,61,0.18)" }}>
        <div className="rounded-[28px] overflow-hidden" style={{ background: "#fff" }}>
          <div className="px-4 pt-4 pb-3 flex items-center justify-between" style={{ background: tokens.navy }}>
            <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 16, color: "#fff" }}>PetPassGo</span>
            <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", color: tokens.gold }}>EXAMPLE</span>
          </div>
          <div className="px-4 py-4">
            <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", color: tokens.muted }}>YOUR TRAVEL PASS</div>
            <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22, color: tokens.navy, lineHeight: 1.2 }} className="mt-1">Example trip</div>
            <div className="flex items-center gap-3 mt-3">
              <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ border: `3px solid ${tokens.gold}` }}>
                <PetIllustration size={52} />
              </div>
              <div>
                <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: tokens.navy, lineHeight: 1.2 }}>Sample pet</div>
                <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>Dog · not a real pet</div>
              </div>
            </div>
          </div>
          <ul>
            {ROWS.map((row) => (
              <li key={row.label} className="px-4 py-3 flex items-start gap-3" style={{ borderTop: `1px solid ${tokens.line}` }}>
                <span aria-hidden="true" className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 36, height: 36, background: tokens.sky, color: tokens.navy }}>
                  <Icon name={row.icon} size={18} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center justify-between gap-2">
                    <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{row.label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tokens.muted} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
                  </span>
                  {row.progress ? (
                    <>
                      <span className="block mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: tokens.line }}>
                        <span className="block h-full rounded-full" style={{ width: "60%", background: tokens.primary }} />
                      </span>
                      <span className="block mt-1.5" style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.4, color: tokens.muted }}>Example. The bar fills as you check steps off.</span>
                    </>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.45, color: tokens.muted }} className="mt-3 text-center">
        Example layout. Airline rules stay hidden until you pay.
      </figcaption>
    </figure>
  );
}
