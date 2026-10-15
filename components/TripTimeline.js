"use client";
import { tokens } from "../lib/theme";
import { reminderSchedule, daysUntil, fmt } from "../lib/travelDates";

export default function TripTimeline({ trip }) {
  const items = reminderSchedule(trip);
  if (!items.length) return null;
  return (
    <div className="rounded-xl p-4 mb-4" style={{ background: "#fff", border: "1px solid #E5E0D5" }}>
      <div style={{ fontFamily: "var(--font-body), system-ui, sans-serif", fontSize: 12, letterSpacing: "0.1em", color: tokens.muted }} className="mb-2">REMINDERS</div>
      {items.map((it) => {
        const d = daysUntil(it.date);
        return (
          <div key={it.kind} className="flex gap-3 py-2" style={{ borderTop: "1px solid #F0ECE3", opacity: d < 0 ? 0.45 : 1 }}>
            <div style={{ minWidth: 110, fontSize: 14, fontWeight: 600 }}>{fmt(it.date)}<div style={{ fontWeight: 400, opacity: 0.6, fontSize: 12.5 }}>{d < 0 ? "passed" : d === 0 ? "today" : `in ${d} day${d > 1 ? "s" : ""}`}</div></div>
            <div style={{ fontSize: 14.5 }}><b>{it.title}</b><div style={{ opacity: 0.75 }}>{it.body}</div></div>
          </div>
        );
      })}
    </div>
  );
}
