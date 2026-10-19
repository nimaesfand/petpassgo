"use client";
import { tokens, font } from "../lib/theme";

// Mobile-only bottom tab bar for the signed-in account app. Exactly five tabs,
// each mapped to a real account surface by the parent (no dead tabs).
const ITEMS = [
  { key: "home", icon: "🏠", label: "Home" },
  { key: "travel", icon: "✈️", label: "Travel" },
  { key: "passport", icon: "🛂", label: "Passport" },
  { key: "health", icon: "🩺", label: "Health" },
  { key: "more", icon: "⋯", label: "More" },
];

export default function MobileBottomNav({ active, onNavigate }) {
  return (
    <nav aria-label="Account" className="md:hidden" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60, background: "#fff", borderTop: `1px solid ${tokens.line}`, paddingBottom: "env(safe-area-inset-bottom)", boxShadow: "0 -6px 24px rgba(20,33,61,0.08)" }}>
      <div className="flex">
        {ITEMS.map((it) => {
          const on = active === it.key;
          return (
            <button key={it.key} type="button" aria-current={on ? "page" : undefined} onClick={() => onNavigate(it.key)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
              style={{ minHeight: 58, padding: "6px 2px", background: on ? tokens.sky : "#fff", color: on ? tokens.primary : tokens.muted, fontFamily: font.body, fontSize: 11.5, fontWeight: on ? 800 : 600, border: "none", borderTop: on ? `3px solid ${tokens.primary}` : "3px solid transparent", cursor: "pointer" }}>
              <span style={{ fontSize: 20, lineHeight: 1 }} aria-hidden="true">{it.icon}</span>
              <span>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
