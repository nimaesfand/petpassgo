import { tokens, font } from "../lib/theme";
import { PASS_EDGE, PASS_GROUPS } from "../lib/travelPassOffer";

// The 3 differentiators. Stacked on phones, 3 across on wider screens.
export function PassEdge({ dark = false }) {
  return (
    <ul className="grid sm:grid-cols-3 gap-2.5 sm:gap-3">
      {PASS_EDGE.map((d) => (
        <li key={d.title} className="rounded-2xl p-4 flex sm:block gap-3 items-start" style={{ background: dark ? "rgba(255,255,255,0.08)" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.18)" : tokens.line}` }}>
          <span aria-hidden className="flex-shrink-0 inline-flex items-center justify-center rounded-xl sm:mb-2" style={{ width: 38, height: 38, background: tokens.gold, fontSize: 19 }}>{d.icon}</span>
          <span className="block">
            <span className="block" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.25, color: dark ? "#fff" : tokens.navy }}>{d.title}</span>
            <span className="block mt-1" style={{ fontFamily: font.body, fontSize: 14.5, lineHeight: 1.4, color: dark ? tokens.sky : tokens.muted }}>{d.line}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// Everything else, grouped by short category, one line per item.
export function PassIncluded() {
  return (
    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 rounded-2xl p-4 sm:p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      {PASS_GROUPS.map(([label, items]) => (
        <div key={label}>
          <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: tokens.stamp }} className="mb-1.5">{label.toUpperCase()}</div>
          <ul className="space-y-1">
            {items.map((i) => (
              <li key={i} className="flex gap-2" style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.35, color: tokens.ink }}>
                <span aria-hidden style={{ color: tokens.green, fontWeight: 700 }}>✓</span>{i}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// Bullet list used on both plan cards so they read the same.
export function PlanPoints({ points, dark = false, note }) {
  return (
    <>
      <ul className="space-y-1.5 mt-2 flex-1">
        {points.map((t) => (
          <li key={t} className="flex gap-2" style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.35, color: dark ? "#fff" : tokens.ink }}>
            <span aria-hidden style={{ color: dark ? tokens.gold : tokens.green, fontWeight: 700 }}>✓</span>{t}
          </li>
        ))}
      </ul>
      {note && <div style={{ fontFamily: font.body, fontSize: 13.5, color: dark ? tokens.sky : tokens.muted }} className="mt-2">{note}</div>}
    </>
  );
}
