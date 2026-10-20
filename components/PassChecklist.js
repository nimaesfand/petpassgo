"use client";
import { useMemo, useState } from "react";
import { tokens, font } from "../lib/theme";
import { useTodayPT } from "../lib/useTodayPT";
import { buildPassCards, groupCards, cardDone, dueChip } from "../lib/passCards";
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
      {hint && <span style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>{hint}</span>}
    </div>
  );
}

function PassCard({ card, open, done, today, onOpen, onMark, showTrack, onOpenRelief }) {
  const chip = dueChip(card.dueDate, today);
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
        <span aria-hidden className="flex items-center justify-center flex-shrink-0 rounded-xl" style={{ width: 36, height: 36, background: tokens.sky, fontSize: 18 }}>{card.icon}</span>
        <span className="flex-1 min-w-0" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.25, color: tokens.navy }}>{card.shortTitle}</span>
        {showChip && <span className="flex-shrink-0 rounded-full px-2 py-1" style={{ fontFamily: font.body, fontSize: 11.5, fontWeight: 700, background: tone.background, color: tone.color }}>{chip.label}</span>}
        <span className="flex-shrink-0 rounded-full px-2.5 py-1" style={{ fontFamily: font.body, fontSize: 12, fontWeight: 700, background: done ? "#EAF6EE" : tokens.sky, color: done ? tokens.green : tokens.navy }}>{done ? "Done" : card.fact ? "Fact" : "To do"}</span>
      </button>
      {open && (
        <div className="px-3 pb-3">
          <div className="rounded-xl p-3 mb-2" style={{ background: tokens.paper }}>
            <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: tokens.muted }}>WHAT TO DO</div>
            <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink, lineHeight: 1.45 }} className="mt-1"><LinkText text={card.what} /></p>
          </div>
          {card.why && (
            <div className="rounded-xl p-3 mb-2" style={{ background: tokens.paper }}>
              <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: tokens.muted }}>WHY</div>
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
                  <a href={a.source} target="_blank" rel="noopener noreferrer" className="inline-block py-2" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.primary, textDecoration: "underline" }}>Official {a.code} page ↗</a>
                </div>
              ))}
              {onOpenRelief && (
                <button type="button" onClick={onOpenRelief} className="mt-1" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 14.5, color: tokens.navy, background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline" }}>Show in Flight & weather</button>
              )}
            </div>
          )}
          {card.submission_link && (
            isTel(card.submission_link) ? (
              <a href={card.submission_link} className="rounded-full px-4 py-3 text-center block mb-2" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none", minHeight: 48 }}>📞 Call {prettyPhone(card.submission_link)}</a>
            ) : (
              <a href={card.submission_link} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-3 text-center block mb-2" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none", minHeight: 48 }}>{card.goLabel || "Open the official page"} ↗</a>
            )
          )}
          {card.source_url && (
            <a href={card.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 mb-2" style={{ minHeight: 48, background: tokens.sky, fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy, textDecoration: "none" }}>
              <span className="min-w-0" style={{ wordBreak: "break-word" }}>🔗 Official source: <span style={{ color: tokens.primary, textDecoration: "underline" }}>{card.sourceHost || "official page"}</span></span>
              <span aria-hidden>↗</span>
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
    return [...groups.first, ...groups.confirm].find((c) => c.id !== exceptId && !cardDone(c, statusMap));
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
    <PassCard
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

  return (
    <div>
      {nudge && (
        <div className="rounded-2xl px-4 py-3 mb-3 flex items-center justify-between gap-3" style={{ background: "#EAF6EE", border: `1px solid ${tokens.green}` }}>
          <span style={{ fontFamily: font.body, fontWeight: 700, color: tokens.green }}>Checked off. It’s in Done.</span>
          {nudge.id ? (
            <button type="button" onClick={() => { setOpenId(nudge.id); setNudge(null); }} style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Next: {nudge.title}</button>
          ) : (
            <span style={{ fontFamily: font.body, fontSize: 14, color: tokens.navy }}>That’s the list.</span>
          )}
        </div>
      )}
      {groups.first.length > 0 && <SectionLabel hint="Start here">Do first</SectionLabel>}
      {block(groups.first)}
      {groups.confirm.length > 0 && <SectionLabel hint="Confirm, then check off">Check & confirm</SectionLabel>}
      {block(groups.confirm)}
      {groups.know.length > 0 && <SectionLabel hint="No checkbox">Good to know</SectionLabel>}
      {block(groups.know)}
      <SectionLabel hint={groups.done.length ? `${groups.done.length} checked` : "Nothing yet"}>Done</SectionLabel>
      <button type="button" onClick={() => setDoneOpen((v) => !v)} className="w-full rounded-2xl px-4 py-3 text-left flex items-center justify-between" style={{ background: "#fff", border: `1px solid ${tokens.line}`, cursor: "pointer" }}>
        <span style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy }}>Done ({groups.done.length})</span>
        <span style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>{doneOpen ? "Hide" : "Show"}</span>
      </button>
      {doneOpen && <div className="mt-2">{groups.done.length ? block(groups.done) : <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="px-1 py-2">Checked items land here.</p>}</div>}
    </div>
  );
}
