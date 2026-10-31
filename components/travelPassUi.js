"use client";

import Icon from "./Icon";
import { tokens, font } from "../lib/theme";

export function RouteLine({ from, to }) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: tokens.navy, lineHeight: 1 }}>{from}</div>
      <div className="flex-1 flex items-center gap-2 min-w-[72px]" aria-hidden="true">
        <div className="flex-1 border-t-2 border-dotted" style={{ borderColor: tokens.navy }} />
        <span style={{ color: tokens.navy }}><Icon name="plane" size={22} /></span>
        <div className="flex-1 border-t-2 border-dotted" style={{ borderColor: tokens.navy }} />
      </div>
      <div style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: tokens.navy, lineHeight: 1 }}>{to}</div>
    </div>
  );
}

export function PassTabs({ tabs, value, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="ppg-hscroll flex gap-2 mb-4">
      {tabs.map(([k, text]) => (
        <button
          key={k}
          type="button"
          role="tab"
          aria-selected={value === k}
          onClick={() => onChange(k)}
          className="rounded-full px-4 py-2.5 flex-shrink-0"
          style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", minHeight: 44, background: value === k ? tokens.navy : "#fff", color: value === k ? "#fff" : tokens.ink, border: `1px solid ${value === k ? tokens.navy : tokens.line}`, cursor: "pointer" }}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function SoftCard({ title, action, children }) {
  return (
    <section className="rounded-2xl p-4 sm:p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: tokens.navy, lineHeight: 1.2 }}>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function TextButton({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full px-4 py-2.5" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", minHeight: 44 }}>{children}</button>
  );
}

export function StatusChip({ children, tone = "ok" }) {
  const map = {
    ok: { background: "#EAF6EE", color: tokens.green },
    warn: { background: "#FFF4D6", color: "#8A5A00" },
    bad: { background: "#FFF1EC", color: tokens.primary },
    neutral: { background: tokens.sky, color: tokens.navy },
  };
  const s = map[tone] || map.neutral;
  return <span className="inline-flex rounded-full px-3 py-1" style={{ background: s.background, color: s.color, fontFamily: font.body, fontWeight: 700, fontSize: 15 }}>{children}</span>;
}

export const PASS_TAB_LIST = [
  ["overview", "Overview"],
  ["flight", "Flight & Weather"],
  ["checklist", "Checklist"],
  ["reminders", "Reminders"],
  ["documents", "Documents"],
  ["destination", "Destination"],
];
