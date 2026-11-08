"use client";
import { tripFitWarnings } from "../lib/tripFit";
import { tokens, font } from "../lib/theme";
import Icon from "./Icon";

// Deal-breakers for the shape of the trip (second airline, connections, cabin vs hold).
// Shown free before checkout and again on the Travel Pass, so nobody pays for a trip
// their airline won't carry their pet on.
const LOOK = {
  stop: { bg: "#FFF1EE", border: "#F2B8A8", color: "#B4321C", icon: "ban" },
  warn: { bg: "#FFF8EC", border: "#F1D49B", color: "#8A5A00", icon: "clock" },
  info: { bg: tokens.sky, border: tokens.line, color: tokens.navy, icon: "checkCircle" },
};

export default function TripFitCard({ answers, className = "mb-5" }) {
  const items = tripFitWarnings(answers || {});
  if (!items.length) return null;
  const stops = items.filter((i) => i.level === "stop").length;
  return (
    <section className={className} aria-label="Trip check">
      <div style={{ fontFamily: font.body, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, color: stops ? LOOK.stop.color : tokens.muted }} className="mb-2">
        {stops ? "Check this before you pay" : "Trip check"}
      </div>
      <div className="flex flex-col gap-2">
        {items.map((it, i) => {
          const L = LOOK[it.level];
          return (
            <div key={i} className="rounded-xl p-3.5 flex gap-3 ppg-rise" style={{ background: L.bg, border: `1px solid ${L.border}` }}>
              <span className="shrink-0 mt-0.5" style={{ color: L.color }}><Icon name={L.icon} size={20} /></span>
              <div className="min-w-0">
                <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15.5, color: L.color }}>{it.title}</div>
                <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }} className="mt-0.5">{it.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
