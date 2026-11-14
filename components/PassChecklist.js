"use client";
import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import { tokens, font } from "../lib/theme";
import { useTodayPT } from "../lib/useTodayPT";
import { groupCards, cardDone, dueChip, passProgress, ASK_AIRLINE } from "../lib/passCards";
import { passReady, segmentPlans } from "../lib/segments";
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
    <div className="flex items-baseline justify-between gap-3 mt-5 mb-2 px-1">
      <h3 style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: tokens.navy }}>{children}</h3>
      {hint && <span style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>{hint}</span>}
    </div>
  );
}

// The whole trip in a few lines, before any detail. Short trips say so plainly.
const HEAVY = /HEALTH|VACCIN|FORM|SUBMISSION|PERMIT|IMPORT/;
function AtAGlance({ steps, airline, petName, onOpen }) {
  if (!steps.length) return null;
  const easy = steps.length <= 5 && !steps.some((c) => c.dot || HEAVY.test(String(c.category || "").toUpperCase()));
  return (
    <section className="rounded-2xl p-4 mb-1" style={{ background: easy ? "#EAF6EE" : "#fff", border: `1px solid ${easy ? tokens.green : tokens.line}` }}>
      <h3 style={{ fontFamily: font.display, fontSize: 21, fontWeight: 800, color: tokens.navy, lineHeight: 1.2 }}>{easy ? "This flight is easy" : `${steps.length} things to do before you fly`}</h3>
      <p className="mt-1" style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink }}>{easy ? `All ${airline || "your airline"} needs from you:` : "In this order:"}</p>
      <ol className="mt-2 flex flex-col gap-1.5">
        {steps.map((c, i) => (
          <li key={c.id}>
            <button type="button" onClick={() => onOpen(c.id)} className="w-full text-left flex gap-2.5 items-start" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: font.body, fontSize: 16, color: tokens.navy, lineHeight: 1.4 }}>
              <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 24, height: 24, marginTop: 1, background: easy ? tokens.green : tokens.navy, color: "#fff", fontSize: 13, fontWeight: 800 }}>{i + 1}</span>
              <span>{c.oneLine || c.shortTitle}</span>
            </button>
          </li>
        ))}
      </ol>
      {easy && petName ? <p className="mt-3" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>That&apos;s it. Tap a step for the details, and check it off when it&apos;s done.</p> : null}
    </section>
  );
}

function AskAirlineCard({ card }) {
  return (
    <article className="rounded-2xl mb-2 px-4 py-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.3, color: tokens.navy }}>{card.shortTitle}</div>
      <p style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.4, color: tokens.ink, margin: "4px 0 0" }}>{ASK_AIRLINE}</p>
    </article>
  );
}

function CheckButton({ done, onClick, label }) {
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onClick(); }} aria-label={done ? `Mark ${label} not done` : `Mark ${label} done`} className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 30, height: 30, border: `2px solid ${done ? tokens.green : tokens.line}`, background: done ? tokens.green : "#fff", color: "#fff", cursor: "pointer" }}>
      {done ? <Icon name="check" size={17} /> : null}
    </button>
  );
}

function PassCard({ card, open, done, today, onOpen, onMark, showTrack, onOpenRelief }) {
  const chip = dueChip(card.dueDate, today, { suggested: card.dueSuggested, dayOf: card.dueKind === "dayof" });
  const tone = CHIP[chip.tone] || CHIP.later;
  const showChip = !card.fact && !done;
  const points = Array.isArray(card.points) ? card.points.filter(Boolean) : [];
  return (
    <article id={`step-${card.id}`} className="rounded-2xl mb-2 overflow-hidden" style={{ scrollMarginTop: 90, background: "#fff", border: `1px solid ${open ? tokens.primary : tokens.line}`, boxShadow: open ? "0 8px 24px rgba(20,33,61,0.08)" : "none" }}>
      <div role="button" tabIndex={0} aria-expanded={open} onClick={onOpen} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }} className="w-full flex items-center gap-3 px-4 py-3 text-left" style={{ minHeight: 60, cursor: "pointer" }}>
        {card.fact ? (
          <span aria-hidden className="flex items-center justify-center flex-shrink-0 rounded-full" style={{ width: 30, height: 30, background: tokens.sky, color: tokens.navy }}><Icon name={card.icon || "pin"} size={16} /></span>
        ) : <CheckButton done={done} onClick={onMark} label={card.shortTitle} />}
        <span className="flex-1 min-w-0">
          <span className="block" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16.5, lineHeight: 1.25, color: done ? tokens.muted : tokens.navy, textDecoration: done ? "line-through" : "none" }}>{card.shortTitle}</span>
          {card.fact && !open && card.what ? <span className="block mt-0.5 truncate" style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}>{card.what}</span> : null}
        </span>
        {showChip && <span className="flex-shrink-0 rounded-full px-2.5 py-1" style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 700, background: tone.background, color: tone.color, whiteSpace: "nowrap" }}>{chip.label}</span>}
        <span aria-hidden style={{ color: tokens.muted, transform: open ? "rotate(90deg)" : "none", transition: "transform .2s", fontSize: 20, lineHeight: 1 }}>›</span>
      </div>
      {open && (
        <div className="px-4 pb-4">
          <p style={{ fontFamily: font.body, fontSize: 16.5, fontWeight: 600, color: tokens.navy, lineHeight: 1.45, margin: 0 }}><LinkText text={card.what} /></p>
          {points.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1.5">
              {points.map((t, i) => (
                <li key={i} className="flex gap-2" style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink, lineHeight: 1.45 }}>
                  <span aria-hidden style={{ color: tokens.primary, fontWeight: 800 }}>•</span><span><LinkText text={t} /></span>
                </li>
              ))}
            </ul>
          )}
          {card.why ? <p className="mt-2" style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink, lineHeight: 1.45, margin: "8px 0 0" }}><LinkText text={card.why} /></p> : null}
          {card.dueNote ? (
            <div className="rounded-xl px-3 py-2.5 mt-3 flex gap-2 items-start" style={{ background: "#FFF7E6", color: "#7A4B00", fontFamily: font.body, fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>
              <span aria-hidden className="mt-0.5"><Icon name="clock" size={16} /></span><span>{card.dueNote}</span>
            </div>
          ) : null}
          {card.relief && card.relief.covered.length > 0 && (
            <div className="rounded-xl p-3 mt-3" style={{ background: tokens.paper }}>
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
                  <a href={a.source} target="_blank" rel="noopener noreferrer" className="inline-block py-2" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.primary, textDecoration: "underline" }}>{a.linkText || `Open ${a.code} animal relief areas`}</a>
                </div>
              ))}
              {onOpenRelief && (
                <button type="button" onClick={onOpenRelief} className="mt-1" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 14.5, color: tokens.navy, background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline" }}>Show in Flight & weather</button>
              )}
            </div>
          )}
          {card.submission_link && (
            isTel(card.submission_link) ? (
              <a href={card.submission_link} className="rounded-full px-4 py-3 text-center block mt-3" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none", minHeight: 48 }}><Icon name="phone" size={18} /> Call {prettyPhone(card.submission_link)}</a>
            ) : (
              <a href={card.submission_link} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-3 text-center block mt-3" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none", minHeight: 48 }}>{card.goLabel || "Open the official page"} <Icon name="external" size={16} /></a>
            )
          )}
          {showTrack && card.dot && <div className="mt-3"><ServiceAnimalTrack trip={showTrack} embedded /></div>}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {!card.fact && (
              <button type="button" onClick={onMark} className="rounded-full px-5 py-3" style={{ background: done ? "#fff" : tokens.navy, color: done ? tokens.navy : "#fff", border: done ? `2px solid ${tokens.navy}` : "none", fontFamily: font.body, fontWeight: 700, fontSize: 15.5, cursor: "pointer" }}>
                {done ? "Undo" : "Done"}
              </button>
            )}
            {card.source_url && (
              <a href={card.source_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: tokens.muted, textDecoration: "none" }}>
                <Icon name="link" size={14} /> <span style={{ textDecoration: "underline" }}>{card.sourceHost || "Official source"}</span>{card.lastChecked ? ` · ${card.lastChecked.replace(/^Last checked/, "checked")}` : ""}
              </a>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export default function PassChecklist({ trip, requirements = [], statusMap = {}, onSetDone, onOpenRelief, focusId }) {
  const today = useTodayPT();
  const plans = useMemo(() => segmentPlans(requirements, trip), [requirements, trip]);
  const multi = plans.length > 1;
  const cards = useMemo(() => plans.flatMap((plan) => plan.cards), [plans]);
  const groups = useMemo(() => groupCards(cards, statusMap), [cards, statusMap]);
  const ready = passReady(passProgress(groups), plans);
  const [openId, setOpenId] = useState(null);
  const [doneOpen, setDoneOpen] = useState(false);
  const [nudge, setNudge] = useState(null);
  // Opened from "Next up": open that step and bring it into view.
  useEffect(() => {
    if (!focusId) return;
    setOpenId(focusId);
    setTimeout(() => { try { document.getElementById(`step-${focusId}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch {} }, 120);
  }, [focusId]);

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

  const block = (list, prefix = "") => list.map((card) => (
    card.askAirline ? <AskAirlineCard key={`${prefix}${card.id}`} card={card} /> : <PassCard
      key={`${prefix}${card.id}`}
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
  const savedOpen = doneOpen || ready;
  const legBody = (plan) => {
    const legGroups = groupCards(plan.cards, statusMap);
    return (
      <section key={plan.label} className="mb-4">
        <h3 style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: tokens.navy }} className="mt-2 mb-2">{plan.label}</h3>
        {!plan.resolved && (
          <article className="rounded-2xl mb-2 px-3 py-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{plan.reason === "outside" ? "This route is outside the United States, Canada, and Mexico." : "This flight needs checking."}</div>
            {plan.source ? <a href={plan.source} target="_blank" rel="noopener noreferrer" className="inline-block mt-2" style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.primary }}>Official source</a> : null}
          </article>
        )}
        {block(legGroups.first, plan.label)}
        {block(legGroups.general, plan.label)}
        {block(legGroups.know, plan.label)}
      </section>
    );
  };

  const isDayOf = (c) => c.dueKind === "dayof";
  const open = [...groups.first, ...groups.general];
  const before = open.filter((c) => !isDayOf(c) && !c.homeLeg).sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0) || String(a.dueDate || "9999").localeCompare(String(b.dueDate || "9999")));
  const travelDay = open.filter((c) => isDayOf(c) && !c.homeLeg);
  const comingHome = open.filter((c) => c.homeLeg).sort((a, b) => String(a.dueDate || "9999").localeCompare(String(b.dueDate || "9999")));

  const glance = [...before, ...travelDay, ...comingHome].filter((c) => !c.relief);
  const openStep = (id) => { setOpenId(id); setTimeout(() => { try { document.getElementById(`step-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch {} }, 80); };

  return (
    <div>
      {!multi ? <AtAGlance steps={glance} airline={trip?.airline} petName={trip?.pet?.name} onOpen={openStep} /> : null}
      {nudge && (
        <div className="rounded-2xl px-4 py-3 mt-2 flex items-center justify-between gap-3" style={{ background: "#EAF6EE", border: `1px solid ${tokens.green}` }}>
          <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15.5, color: tokens.green }}>{ready ? "All set!" : "Nice. Checked off."}</span>
          {nudge.id ? (
            <button type="button" onClick={() => { setOpenId(nudge.id); setNudge(null); }} style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15.5, color: tokens.navy, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Next: {nudge.title}</button>
          ) : null}
        </div>
      )}
      {multi ? plans.map(legBody) : null}
      {!multi && before.length > 0 && <SectionLabel hint="In date order">Before you fly</SectionLabel>}
      {!multi && block(before)}
      {!multi && travelDay.length > 0 && <SectionLabel hint="At the airport">Travel day</SectionLabel>}
      {!multi && block(travelDay)}
      {!multi && comingHome.length > 0 && <SectionLabel hint="For the flight back">Coming home</SectionLabel>}
      {!multi && block(comingHome)}
      {!multi && groups.know.length > 0 && <SectionLabel hint="No action needed">Good to know</SectionLabel>}
      {!multi && block(groups.know)}
      {groups.done.length > 0 && (
        <>
          <button type="button" onClick={() => setDoneOpen((v) => !v)} className="w-full mt-5 rounded-2xl px-4 py-3 text-left flex items-center justify-between" style={{ background: "#fff", border: `1px solid ${tokens.line}`, cursor: "pointer", minHeight: 48 }}>
            <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>Done ({groups.done.length})</span>
            <span style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>{savedOpen ? "Hide" : "Show"}</span>
          </button>
          {savedOpen && <div className="mt-2">{block(groups.done)}</div>}
        </>
      )}
    </div>
  );
}
