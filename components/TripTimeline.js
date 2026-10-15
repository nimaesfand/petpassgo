"use client";
import { useMemo, useState } from "react";
import { tokens, font } from "../lib/theme";
import { reminderSchedule, classifyReminder, daysUntil, fmt, todayPT } from "../lib/travelDates";

// A reminder counts as "done" when every HEALTH DOCUMENTATION / REQUIRED FORM /
// VACCINATION / SUBMISSION requirement on the trip is checked off (or there are none
// of those and the user marks it done). Day-of packing (d1) is manual.
function relatedDone(item, requirements, statusMap) {
  if (item.kind === "d1") return false;
  if (item.kind === "dot48") {
    const forms = (requirements || []).filter((r) => /REQUIRED FORM|SUBMISSION/i.test(r.category || ""));
    return forms.length > 0 && forms.every((r) => statusMap[r.id]);
  }
  const health = (requirements || []).filter((r) => /HEALTH DOCUMENTATION|VACCINATION/i.test(r.category || ""));
  if (health.length === 0) return false;
  return health.every((r) => statusMap[r.id]);
}

export default function TripTimeline({ trip, requirements = [], statusMap = {} }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem(`ppg_rem_done_${trip.id}`) || "[]")); } catch { return new Set(); }
  });
  const today = todayPT();
  const flightDays = trip.travel_date ? daysUntil(trip.travel_date, today) : null;

  const rows = useMemo(() => {
    return reminderSchedule(trip).map((it) => {
      const done = dismissed.has(it.kind) || relatedDone(it, requirements, statusMap);
      const { state, days } = classifyReminder(it, trip, { done, today });
      return { ...it, state, days };
    });
  }, [trip, requirements, statusMap, dismissed, today]);

  if (!rows.length) return null;

  const doNow = rows.filter((r) => r.state === "do_now");
  const rest = rows.filter((r) => r.state !== "do_now");

  function markDone(kind) {
    setDismissed((prev) => {
      const next = new Set(prev); next.add(kind);
      try { sessionStorage.setItem(`ppg_rem_done_${trip.id}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  const label = (r) => {
    if (r.state === "do_now") return "Do this now";
    if (r.state === "done") return "done";
    if (r.state === "passed") return "passed";
    if (r.state === "today") return "today";
    return `in ${r.days} day${r.days === 1 ? "" : "s"}`;
  };

  const Row = ({ r, alert }) => (
    <div
      key={r.kind}
      className="flex gap-3 py-3"
      style={{
        borderTop: alert ? "none" : "1px solid #F0ECE3",
        opacity: r.state === "passed" || r.state === "done" ? 0.45 : 1,
        background: alert ? "#FFF7F2" : "transparent",
        margin: alert ? "0 -16px" : 0,
        padding: alert ? "12px 16px" : undefined,
        borderLeft: alert ? `4px solid ${tokens.primary}` : "none",
      }}
    >
      <div style={{ minWidth: 118, fontFamily: font.body, fontSize: 14, fontWeight: 600, color: alert ? tokens.primary : tokens.navy }}>
        {fmt(r.date)}
        <div style={{ fontWeight: 700, fontSize: 12.5, letterSpacing: "0.04em", textTransform: "uppercase", color: alert ? tokens.primary : tokens.muted, opacity: alert ? 1 : 0.75 }}>{label(r)}</div>
      </div>
      <div className="flex-1" style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}>
        <b style={{ color: tokens.navy }}>{alert ? (flightDays != null && flightDays >= 0 ? `Your flight is in ${flightDays} day${flightDays === 1 ? "" : "s"}` : "Do this before you fly") : r.title}</b>
        <div style={{ opacity: 0.8, marginTop: 2, lineHeight: 1.45 }}>{alert ? r.body : r.body}</div>
        {alert && <div style={{ fontSize: 12.5, color: tokens.muted, marginTop: 2 }}>Was due {fmt(r.date)} ({r.title})</div>}
        {alert && (
          <button type="button" onClick={() => markDone(r.kind)} className="mt-2" style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: tokens.navy, background: "none", border: "none", padding: 0, textDecoration: "underline", cursor: "pointer" }}>
            Mark done
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl p-4 mb-4 overflow-hidden" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.body, fontSize: 12, letterSpacing: "0.1em", color: tokens.muted, fontWeight: 700 }} className="mb-2">REMINDERS</div>
      {doNow.length > 0 && (
        <div className="mb-2">
          <div style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 700, color: tokens.primary, letterSpacing: "0.08em" }} className="mb-1">CATCH UP — BOOKED CLOSE TO DEPARTURE</div>
          {doNow.map((r) => <Row key={r.kind} r={r} alert />)}
        </div>
      )}
      {rest.map((r) => <Row key={r.kind} r={r} />)}
    </div>
  );
}
