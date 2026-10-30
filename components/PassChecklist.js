"use client";
import { useMemo, useState } from "react";
import Icon from "./Icon";
import { tokens, font } from "../lib/theme";
import { useTodayPT } from "../lib/useTodayPT";
import { buildPassCards, groupCards, cardDone, dueChip, passProgress, ASK_AIRLINE } from "../lib/passCards";
import ServiceAnimalTrack from "./ServiceAnimalTrack";
import LinkText from "./LinkText";
import { isTel, prettyPhone } from "../lib/linkify";

const CHIP = {
  overdue: { background: "#C2410C", color: "#fff" },
  today: { background: "#F2B84B", color: "#14213D" },
  soon: { background: "#FFF4D6", color: "#8A5A00" },
  later: { background: "#F3F5F9", color: "#14213D" },
};

function SectionLabel({ children, hint }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mt-4 mb-2">
      <h3 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }}>{children}</h3>
      {hint && <span style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>{hint}</span>}
    </div>
  );
}

function ProgressMark({ pct, complete }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const shown = Math.max(0, Math.min(100, pct));
  return (
    <div className="rounded-2xl p-4 mb-3 flex items-center gap-4" style={{ background: complete ? "#EAF6EE" : "#fff", border: `1px solid ${complete ? tokens.green : tokens.line}` }}>
      <svg width="56" height="56" viewBox="0 0 56 56" aria-label={complete ? "Travel Pass complete" : `${shown} percent complete`} className="flex-shrink-0">
        <circle cx="28" cy="28" r={r} fill="none" stroke={tokens.line} strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={complete ? tokens.green : tokens.stamp} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * shown) / 100} transform="rotate(-90 28 28)" />
        <text x="28" y="33" textAnchor="middle" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 13, fill: tokens.navy }}>{shown}%</text>
      </svg>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }}>{complete ? "Travel Pass complete" : `${shown}% complete`}</div>
        <div className="w-full h-2 rounded-full mt-2 overflow-hidden" style={{ background: tokens.line }}>
          <div className="h-full rounded-full" style={{ width: `${shown}%`, background: complete ? tokens.green : tokens.stamp }} />
        </div>
        <p style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.4, color: tokens.ink }} className="mt-2">{complete ? "Every step is checked. The list stays here." : "Checked steps stay on this pass."}</p>
      </div>
    </div>
  );
}

function AskAirlineCard({ card }) {
  return (
    <article className="rounded-2xl mb-2 px-3 py-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.3, color: tokens.navy }}>{card.shortTitle}</div>
      <p style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.4, color: tokens.ink, margin: "4px 0 0" }}>{ASK_AIRLINE}</p>
    </article>
  );
}

function PassCard({ card, open, done, today, onOpen, onMark, showTrack, onOpenRelief }) {
  const chip = dueChip(card.dueDate, today, { suggested: card.dueSuggested, dayOf: card.dueKind === "dayof" });
  const tone = CHIP[chip.tone] || CHIP.later;
  const showChip = !card.fact || !!card.dueDate;
  return (
    <article className="rounded-2xl mb-2 overflow-hidden" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: open ? "0 8px 24px rgba(20,33,61,0.08)" : "none" }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onOpen}
        className="w-full flex items-center gap-2.5 px-3 py-3 text-left"
        style={{ minHeight: 56, background: "transparent", border: "none", cursor: "pointer" }}
      >
        <span aria-hidden className="flex items-center justify-center flex-shrink-0 rounded-xl" style={{ width: 36, height: 36, background: tokens.sky, color: tokens.navy }}><Icon name={card.icon} size={20} /></span>
        <span className="flex-1 min-w-0">
          <span className="block" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.25, color: tokens.navy }}>{card.shortTitle}</span>
          {card.lastChecked ? <span className="block mt-0.5" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: tokens.muted }}>{card.lastChecked}</span> : null}
        </span>
        {showChip && <span className="flex-shrink-0 rounded-full px-2 py-1" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, background: tone.background, color: tone.color }}>{chip.label}</span>}
        <span className="flex-shrink-0 rounded-full px-2.5 py-1" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, background: done ? "#EAF6EE" : tokens.sky, color: done ? tokens.green : tokens.navy }}>{done ? "Done" : card.fact ? "Fact" : "To do"}</span>
      </button>
      {open && (
        <div className="px-3 pb-3">
          <div className="rounded-xl p-3 mb-2" style={{ background: tokens.paper }}>
            <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", color: tokens.muted }}>WHAT TO DO</div>
            {card.dueNote && <p style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy, lineHeight: 1.4 }} className="mt-1">{card.dueNote}</p>}
            <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink, lineHeight: 1.45 }} className="mt-1"><LinkText text={card.what} /></p>
          </div>
          {card.why && (
            <div className="rounded-xl p-3 mb-2" style={{ background: tokens.paper }}>
              <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", color: tokens.muted }}>WHY</div>
              <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }} className="mt-1"><LinkText text={card.why} /></p>
            </div>
          )}
          {card.relief && card.relief.covered.length > 0 && (
            <div className="rounded-xl p-3 mb-2" style={{ background: tokens.paper }}>
              {card.relief.covered.map((a) => (
                <div key={a.code} className="mb-3 last:mb-0">
                  <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, color: tokens.navy }}>{a.code} · {a.city}</div>
                  <ul className="mt-1 space-y-1">
                    {a.areas.map((x, i) => (
                      <li key={`${a.code}-${i}`} style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink, lineHeight: 1.4 }}>
                        <b>{x.terminal}.</b> {x.spot} ({x.where === "before" ? "before security" : "after security"})
                      </li>
                    ))}
                  </ul>
                  <a href={a.source} target="_blank" rel="noopener noreferrer" className="inline-block py-2" style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.primary, textDecoration: "underline" }}>{a.linkText || `Open ${a.code} animal relief areas`}</a>
                </div>
              ))}
              {onOpenRelief && (
                <button type="button" onClick={onOpenRelief} className="mt-1" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 14.5, color: tokens.navy, background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline" }}>Show in Flight & weather</button>
              )}
            </div>
          )}
          {card.submission_link && (
            isTel(card.submission_link) ? (
              <a href={card.submission_link} className="rounded-full px-4 py-3 text-center block mb-2" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none", minHeight: 48 }}><Icon name="phone" size={18} /> Call {prettyPhone(card.submission_link)}</a>
            ) : (
              <a href={card.submission_link} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-3 text-center block mb-2" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none", minHeight: 48 }}>{card.goLabel || "Open the official page"} <Icon name="external" size={16} /></a>
            )
          )}
          {card.source_url && (
            <a href={card.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 mb-2" style={{ minHeight: 48, background: tokens.sky, fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy, textDecoration: "none" }}>
              <span className="min-w-0" style={{ wordBreak: "break-word" }}><Icon name="link" size={17} /> Official source: <span style={{ color: tokens.primary, textDecoration: "underline" }}>{card.sourceHost || "official page"}</span></span>
              <Icon name="external" size={18} />
            </a>
          )}
          {showTrack && card.dot && <div className="mb-2"><ServiceAnimalTrack trip={showTrack} embedded /></div>}
          {!card.fact && (
            <button type="button" onClick={onMark} className="w-full rounded-full py-3.5" style={{ background: done ? "#fff" : tokens.navy, color: done ? tokens.navy : "#fff", border: done ? `2px solid ${tokens.navy}` : "none", fontFamily: font.body, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
              {done ? "Mark not done" : "Mark done"}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default function PassChecklist({ trip, requirements = [], statusMap = {}, onSetDone, onOpenRelief }) {
  const today = useTodayPT();
  const cards = useMemo(() => buildPassCards(requirements, trip), [requirements, trip]);
  const groups = useMemo(() => groupCards(cards, statusMap), [cards, statusMap]);
  const [openId, setOpenId] = useState(null);
  const [doneOpen, setDoneOpen] = useState(false);
  const [nudge, setNudge] = useState(null);

  function toggleOpen(id) {
    setOpenId((cur) => (cur === id ? null : id));
    setNudge(null);
  }

  function nextOpen(exceptId) {
    return [...groups.first, ...groups.general].find((c) => c.id !== exceptId && !cardDone(c, statusMap));
  }

  async function mark(card) {
    const done = cardDone(card, statusMap);
    const ids = (card.mergedIds || [card.id]).filter(Boolean);
    await onSetDone?.(ids, !done);
    if (!done) {
      const nxt = nextOpen(card.id);
      setOpenId(null);
      setDoneOpen(false);
      setNudge(nxt ? { id: nxt.id, title: nxt.shortTitle } : { id: null, title: null });
    } else {
      setNudge(null);
    }
  }

  const block = (list) => list.map((card) => (
    card.askAirline ? <AskAirlineCard key={card.id} card={card} /> : <PassCard
      key={card.id}
      card={card}
      open={openId === card.id}
      done={cardDone(card, statusMap)}
      today={today}
      showTrack={card.dot ? trip : null}
      onOpenRelief={onOpenRelief}
      onOpen={() => toggleOpen(card.id)}
      onMark={() => mark(card)}
    />
  ));

  const progress = passProgress(groups);
  const savedOpen = doneOpen || progress.complete;

  return (
    <div>
      <ProgressMark pct={progress.pct} complete={progress.complete} />
      {nudge && (
        <div className="rounded-2xl px-4 py-3 mb-3 flex items-center justify-between gap-3" style={{ background: "#EAF6EE", border: `1px solid ${tokens.green}` }}>
          <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.green }}>{progress.complete ? "Travel Pass complete" : "Checked off. It’s saved on this pass."}</span>
          {nudge.id ? (
            <button type="button" onClick={() => { setOpenId(nudge.id); setNudge(null); }} style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Next: {nudge.title}</button>
          ) : null}
        </div>
      )}
      {groups.first.length > 0 && <SectionLabel hint="Time-sensitive">Do these first</SectionLabel>}
      {block(groups.first)}
      {(groups.general.length > 0 || groups.know.length > 0) && <SectionLabel hint="The rest of this trip">General prep</SectionLabel>}
      {block(groups.general)}
      {groups.know.length > 0 && <SectionLabel hint="Kept for reference">Reference</SectionLabel>}
      {block(groups.know)}
      <SectionLabel hint={groups.done.length ? `${groups.done.length} checked` : "Nothing yet"}>Saved on this pass</SectionLabel>
      <button type="button" onClick={() => setDoneOpen((v) => !v)} className="w-full rounded-2xl px-4 py-3 text-left flex items-center justify-between" style={{ background: "#fff", border: `1px solid ${tokens.line}`, cursor: "pointer", minHeight: 48 }}>
        <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>Saved ({groups.done.length})</span>
        <span style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>{savedOpen ? "Hide" : "Show"}</span>
      </button>
      {savedOpen && <div className="mt-2">{groups.done.length ? block(groups.done) : <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="px-1 py-2">Checked items stay here.</p>}</div>}
    </div>
  );
}
