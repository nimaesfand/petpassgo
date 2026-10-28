"use client";
import { useState } from "react";
import { AIRPORTS, formatAirport, foldAscii, countryLabel } from "../lib/airports";
import { tokens, font } from "../lib/theme";

export default function AirportField({ label, value, onSelect }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const q = foldAscii(query.trim());
  const matches = q.length > 0
    ? AIRPORTS.filter((a) => foldAscii(a.city).includes(q) || foldAscii(a.code).includes(q) || foldAscii(a.name).includes(q) || foldAscii(countryLabel(a.country)).includes(q))
        .sort((a, b) => (a.rank || 999) - (b.rank || 999))
        .slice(0, 12)
    : [];

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); onSelect(""); }}
        onFocus={() => setOpen(true)}
        placeholder={label}
        style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }}
        className="rounded-xl px-4 py-3 outline-none w-full"
        aria-label={label}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-10 max-h-72 overflow-y-auto" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 8px 20px rgba(21,34,56,0.12)" }}>
          {matches.map((a) => (
            <button
              key={a.code + a.country}
              type="button"
              onClick={() => { const lab = formatAirport(a); setQuery(lab); onSelect(lab); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50"
              style={{ fontFamily: font.body, fontSize: 16, color: tokens.navy, borderBottom: `1px solid ${tokens.line}` }}
            >
              <span style={{ fontWeight: 700 }}>{a.code}</span> · {a.city}
              <span style={{ color: tokens.muted, fontSize: 16 }}> · {countryLabel(a.country)} · {a.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
