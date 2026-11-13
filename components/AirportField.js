"use client";
import { useRef, useState } from "react";
import { selectableAirports, formatAirport, foldAscii, countryLabel } from "../lib/airports";
import { tokens, font } from "../lib/theme";

export default function AirportField({ label, value, onSelect }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  // On phones the keyboard covers the lower half of the screen. Lift the field
  // to the top so the typed text and the suggestions both stay visible.
  function lift() {
    const el = boxRef.current;
    if (!el || typeof window === "undefined" || window.innerWidth >= 768) return;
    setTimeout(() => { try { el.scrollIntoView({ block: "start", behavior: "smooth" }); } catch {} }, 280);
  }
  const q = foldAscii(query.trim());
  const matches = q.length > 0
    ? selectableAirports().filter((a) => foldAscii(a.city).includes(q) || foldAscii(a.metro).includes(q) || foldAscii(a.code).includes(q) || foldAscii(a.name).includes(q) || foldAscii(countryLabel(a.country)).includes(q))
        .sort((a, b) => (a.rank || 999) - (b.rank || 999))
        .slice(0, 12)
    : [];

  return (
    <div className="relative" ref={boxRef} style={{ scrollMarginTop: 84 }}>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); onSelect(""); }}
        onFocus={() => { setOpen(true); lift(); }}
        onBlur={() => {
          // Typed an exact airport code (or there's only one match) and tapped away:
          // pick it, so Continue isn't left greyed out with no reason shown.
          const code = query.trim().toUpperCase();
          const exact = matches.find((a) => a.code === code) || (matches.length === 1 ? matches[0] : null);
          if (exact && query !== formatAirport(exact)) { const lab = formatAirport(exact); setQuery(lab); onSelect(lab); }
          setTimeout(() => setOpen(false), 150);
        }}
        enterKeyHint="search"
        placeholder={label}
        style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }}
        className="rounded-xl px-4 py-3 outline-none w-full"
        aria-label={label}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-10 overflow-y-auto" style={{ maxHeight: "min(18rem, 38vh)", background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 8px 20px rgba(21,34,56,0.12)" }}>
          {matches.map((a) => (
            <button
              key={a.code + a.country}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { const lab = formatAirport(a); setQuery(lab); onSelect(lab); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50"
              style={{ fontFamily: font.body, fontSize: 16, color: tokens.navy, borderBottom: `1px solid ${tokens.line}` }}
            >
              <div><span style={{ fontWeight: 700 }}>{a.city}</span> <span style={{ fontWeight: 700, color: tokens.primary }}>{a.code}</span></div>
              <div style={{ color: tokens.muted, fontSize: 14 }}>{a.name} · {countryLabel(a.country)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
