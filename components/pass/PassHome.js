"use client";

import Icon from "../Icon";
import { tokens, font } from "../../lib/theme";
import { fmt } from "../../lib/travelDates";

// Travel Pass "Today" view: the trip at a glance, the one next step, and shortcuts.
// Everything else lives one tap away so the phone screen isn't a long scroll.

function Glance({ label, value, icon, tone }) {
  return (
    <div className="rounded-2xl p-3 min-w-0" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div className="flex items-center gap-1.5" style={{ fontFamily: font.body, fontSize: 11.5, fontWeight: 800, letterSpacing: ".06em", color: tokens.muted }}>
        <Icon name={icon} size={13} />{label.toUpperCase()}
      </div>
      <div className="mt-1" style={{ fontFamily: font.body, fontSize: 15.5, fontWeight: 800, color: tone || tokens.navy, lineHeight: 1.25, overflowWrap: "anywhere" }}>{value}</div>
    </div>
  );
}

function Shortcut({ icon, label, sub, onClick }) {
  return (
    <button type="button" onClick={onClick} className="ppg-lift flex flex-col items-center gap-1.5 rounded-2xl px-1 py-3 min-w-0" style={{ background: "#fff", border: `1px solid ${tokens.line}`, cursor: "pointer" }}>
      <span className="flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: tokens.sky, color: tokens.navy }}><Icon name={icon} size={20} /></span>
      <span style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 800, color: tokens.navy, lineHeight: 1.1 }}>{label}</span>
      {sub ? <span className="truncate max-w-full px-1" style={{ fontFamily: font.body, fontSize: 12, color: tokens.muted }}>{sub}</span> : null}
    </button>
  );
}

function dueText(iso, today) {
  if (!iso) return "Before you fly";
  const d = Math.round((new Date(`${iso}T12:00:00`) - new Date(`${today}T12:00:00`)) / 864e5);
  if (d < 0) return `Overdue · was due ${fmt(iso)}`;
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return `Due ${fmt(iso)} · in ${d} days`;
}

export default function PassHome({ facts, progress, ready, needsCheck, nextStep, today, onDone, onGo, onOpenStep, shortcuts, petName }) {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-3 gap-2">
        <Glance label="Pet fee" icon="tag" value={facts?.fee || "See steps"} />
        <Glance label="Carrier" icon="bag" value={facts?.carrier || "See steps"} />
        <Glance label="Ready" icon="check" value={needsCheck ? "Check flights" : progress.total ? `${progress.done} of ${progress.total}` : "—"} tone={ready ? tokens.green : undefined} />
      </div>

      {nextStep ? (
        <div className="rounded-3xl p-4 sm:p-5" style={{ background: "#FFF7F2", border: `2px solid ${tokens.primary}` }}>
          <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 800, letterSpacing: ".1em", color: tokens.primary }}>NEXT UP</div>
          <div className="mt-1" style={{ fontFamily: font.display, fontSize: 21, fontWeight: 800, color: tokens.navy, lineHeight: 1.2 }}>{nextStep.title || nextStep.shortTitle}</div>
          <div className="mt-1" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.primary }}>{dueText(nextStep.dueDate, today)}</div>
          {nextStep.what ? <p className="mt-2" style={{ fontFamily: font.body, fontSize: 15.5, lineHeight: 1.45, color: tokens.ink }}>{String(nextStep.what).split(/(?<=\.)\s/)[0]}</p> : null}
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" onClick={() => (onOpenStep ? onOpenStep(nextStep) : onGo("checklist"))} className="ppg-btn ppg-btn-primary">{nextStep.dot ? "Fill out my DOT form" : "Show me how"}</button>
            <button type="button" onClick={() => onDone(nextStep)} className="ppg-btn ppg-btn-secondary">I already did this</button>
          </div>
          <button type="button" onClick={() => onGo("checklist")} className="mt-3" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy, background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline" }}>See all {progress.total} steps</button>
        </div>
      ) : progress.total && ready ? (
        <div className="rounded-3xl p-5 text-center" style={{ background: "#E8F6EC", border: `2px solid ${tokens.green}` }}>
          <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, color: tokens.navy }}>{petName || "Your pet"} is ready to fly</div>
          <div className="mt-1" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>Every step is done. Keep your documents handy on travel day.</div>
        </div>
      ) : null}

      <div className="grid grid-cols-4 gap-2">
        {shortcuts.map((s) => <Shortcut key={s.label} {...s} />)}
      </div>
    </div>
  );
}
