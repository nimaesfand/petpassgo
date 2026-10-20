"use client";
import { tokens, font } from "../lib/theme";
import Icon from "./Icon";

// Mobile-only bottom tab bar for the signed-in account app. Exactly five tabs,
// each mapped to a real account surface by the parent (no dead tabs).
const ITEMS = [
  { key: "home", icon: "home", label: "Home" },
  { key: "travel", icon: "plane", label: "Travel" },
  { key: "passport", icon: "passport", label: "Passport" },
  { key: "health", icon: "health", label: "Health" },
  { key: "more", icon: "more", label: "More" },
];

export default function MobileBottomNav({ active, onNavigate }) {
  return (
    <nav aria-label="Account" className="md:hidden" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60, background: "#fff", borderTop: `1px solid ${tokens.line}`, paddingBottom: "env(safe-area-inset-bottom)", boxShadow: "0 -6px 24px rgba(20,33,61,0.06)" }}>
      <div className="flex">
        {ITEMS.map((it) => {
          const on = active === it.key;
          return (
            <button key={it.key} type="button" aria-current={on ? "page" : undefined} onClick={() => onNavigate(it.key)}
              className="flex-1 flex flex-col items-center justify-center gap-1"
              style={{ minHeight: 58, padding: "8px 2px 6px", background: "#fff", color: on ? tokens.primary : "#8A94A6", fontFamily: font.body, fontSize: 11.5, fontWeight: on ? 700 : 500, border: "none", cursor: "pointer" }}>
              <Icon name={it.icon} size={24} stroke={1.6} />
              <span>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
