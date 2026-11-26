import { font } from "../lib/theme";

// One role badge for every passport (sample and real), so they always match.
// Top: icon, then the role in bold. Thin gold rule. Second line: smaller, gold.
const ICONS = {
  service: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  esa: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />,
  pet: <><circle cx="5.5" cy="10" r="2" /><circle cx="9" cy="5.5" r="2" /><circle cx="15" cy="5.5" r="2" /><circle cx="18.5" cy="10" r="2" /><path d="M12 12c-2.8 0-5.5 3.3-5.5 6 0 1.7 1.3 2.5 2.8 2.5 1 0 1.8-.5 2.7-.5s1.7.5 2.7.5c1.5 0 2.8-.8 2.8-2.5 0-2.7-2.7-6-5.5-6z" /></>,
};
const TITLES = { service: "SERVICE DOG", esa: <>EMOTIONAL<br />SUPPORT</>, pet: "PET" };
const INK = { service: "#1E3A8A", esa: "#7F1D1D", pet: "#7C2D12" };

export default function RoleBadge({ kind = "pet", sub, width = 128 }) {
  return (
    <div className={`ppg-badge ppg-badge-${kind}`} style={{ width, maxWidth: "100%", boxSizing: "border-box", borderRadius: 10, padding: "7px 7px 6px", textAlign: "center", color: "#fff" }}>
      <div className="flex flex-col items-center" style={{ gap: 4 }}>
        <span aria-hidden="true" className="flex items-center justify-center flex-shrink-0" style={{ width: 22, height: 22, borderRadius: 999, background: "#fff", boxShadow: "0 0 0 1.5px #F2B84B", color: INK[kind] }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill={kind === "pet" ? "currentColor" : "none"} stroke={kind === "pet" ? "none" : "currentColor"} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">{ICONS[kind]}</svg>
        </span>
        <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: kind === "esa" ? 12.5 : 14, letterSpacing: ".05em", lineHeight: 1.1, whiteSpace: "nowrap", textShadow: "0 1px 1px rgba(0,0,0,.35)" }}>{TITLES[kind]}</span>
      </div>
      {sub ? (
        <>
          <div aria-hidden="true" style={{ height: 1, margin: "5px 6px 4px", background: "linear-gradient(90deg, transparent, rgba(242,184,75,.85), transparent)" }} />
          <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 600, color: "#F7D58A", lineHeight: 1.25 }}>{sub}</div>
        </>
      ) : null}
    </div>
  );
}
