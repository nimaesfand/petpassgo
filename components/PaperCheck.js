"use client";
import { tokens, font } from "../lib/theme";
import Icon from "./Icon";

// The pet's papers held up against this trip. Problems first, in plain sentences.
const LOOK = {
  ok: { icon: "check", fg: "#15803D", bg: "#EAF6EE", word: "Good" },
  warn: { icon: "alert", fg: "#B91C1C", bg: "#FDECEC", word: "Fix this" },
  missing: { icon: "file", fg: "#B45309", bg: "#FEF3C7", word: "Needed" },
  todo: { icon: "clock", fg: "#475569", bg: "#EEF2F6", word: "Later" },
};

export default function PaperCheck({ checks, onUpload, petName }) {
  if (!checks?.length) return null;
  const problems = checks.filter((c) => c.status === "warn" || c.status === "missing").length;
  return (
    <section className="rounded-2xl mb-4 overflow-hidden" style={{ background: "#fff", border: `1px solid ${problems ? "#F5C2A8" : tokens.line}` }} aria-label="Document check">
      <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
        <div>
          <h3 style={{ fontFamily: font.display, fontSize: 19, fontWeight: 800, color: tokens.navy, lineHeight: 1.2 }}>Document check</h3>
          <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}>{problems ? `${problems} thing${problems === 1 ? "" : "s"} to fix in ${petName || "your pet"}'s documents.` : `${petName || "Your pet"}'s documents look right for this trip so far.`}</p>
        </div>
        {onUpload ? <button type="button" onClick={onUpload} className="ppg-btn ppg-btn-secondary ppg-btn-compact flex-shrink-0">Add a document</button> : null}
      </div>
      <ul className="px-2 pb-2" style={{ listStyle: "none", margin: 0 }}>
        {checks.map((c) => {
          const look = LOOK[c.status] || LOOK.todo;
          return (
            <li key={c.key} className="flex gap-3 rounded-xl px-2 py-2.5">
              <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: look.bg, color: look.fg }}><Icon name={look.icon} size={17} /></span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span style={{ fontFamily: font.body, fontWeight: 800, fontSize: 15.5, color: tokens.navy }}>{c.label}</span>
                  <span className="rounded-full px-2 py-0.5" style={{ background: look.bg, color: look.fg, fontFamily: font.body, fontSize: 11.5, fontWeight: 800, letterSpacing: ".03em" }}>{look.word.toUpperCase()}</span>
                  {c.verified ? <span className="rounded-full px-2 py-0.5" style={{ background: "#EAF2FB", color: tokens.navy, fontFamily: font.body, fontSize: 11.5, fontWeight: 800 }}>✓ VET VERIFIED</span> : null}
                </div>
                <p style={{ fontFamily: font.body, fontSize: 14.5, lineHeight: 1.45, color: tokens.ink }}>{c.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
