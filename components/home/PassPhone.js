"use client";

import { useEffect, useRef, useState } from "react";
import { tokens, font } from "../../lib/theme";
import Icon from "../Icon";
import { PetIllustration } from "../PetIdCard";
import SampleChip from "../SampleChip";

// A sample Travel Pass that "works" on its own: steps tick off, progress fills,
// and the trip card shows weather and boarding info. Starts when scrolled into
// view; stays still for people who prefer reduced motion.

const STEPS = [
  { label: "Book your pet's cabin spot", due: "Done" },
  { label: "Carrier fits under the seat", due: "Done" },
  { label: "Vet records uploaded", due: "Due Dec 4" },
  { label: "Check in at the counter, not the kiosk", due: "Travel day" },
  { label: "Find the pet relief area", due: "Travel day" },
];

export default function PassPhone() {
  const ref = useRef(null);
  const [done, setDone] = useState(2);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setDone((n) => (n >= STEPS.length ? 2 : n + 1)), done >= STEPS.length ? 2600 : 1300);
    return () => clearTimeout(t);
  }, [running, done]);

  const pct = Math.round((done / STEPS.length) * 100);
  const ready = done >= STEPS.length;

  return (
    <div ref={ref} className="mx-auto w-full" style={{ maxWidth: 320 }}>
      <div className="rounded-[36px] p-2.5" style={{ background: tokens.navy, boxShadow: "0 24px 50px rgba(20,33,61,0.18)" }}>
        <div className="rounded-[28px] overflow-hidden" style={{ background: "#fff" }}>
          <div className="px-4 pt-4 pb-3" style={{ background: tokens.navy }}>
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 16, color: "#fff" }}>PetPassGo</span>
              <SampleChip />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ border: `3px solid ${tokens.gold}` }}>
                <PetIllustration size={44} />
              </div>
              <div className="min-w-0">
                <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 17, color: "#fff", lineHeight: 1.2 }}>Biscuit · LAX → JFK</div>
                <div style={{ fontFamily: font.body, fontSize: 13.5, color: "rgba(255,255,255,0.75)" }}>Delta · in cabin · Dec 18</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="rounded-xl px-2.5 py-2" style={{ background: "rgba(255,255,255,0.10)" }}>
                <div className="flex items-center gap-1.5" style={{ fontFamily: font.body, fontSize: 12, color: "rgba(255,255,255,0.7)" }}><Icon name="sun" size={14} /> LAX now</div>
                <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, color: "#fff" }}>68°F · clear</div>
              </div>
              <div className="rounded-xl px-2.5 py-2" style={{ background: "rgba(255,255,255,0.10)" }}>
                <div className="flex items-center gap-1.5" style={{ fontFamily: font.body, fontSize: 12, color: "rgba(255,255,255,0.7)" }}><Icon name="plane" size={14} /> DL 412</div>
                <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, color: tokens.gold }}>On time</div>
              </div>
            </div>
          </div>

          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center justify-between" style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: tokens.navy }}>
              <span>{ready ? "Ready to fly" : "Your checklist"}</span>
              <span style={{ color: ready ? tokens.green : tokens.muted }}>{pct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: tokens.line }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ready ? tokens.green : tokens.primary, transition: "width 0.6s ease, background 0.4s" }} />
            </div>
          </div>

          <ul className="px-2 pb-3 pt-1">
            {STEPS.map((s, i) => {
              const on = i < done;
              return (
                <li key={s.label} className="flex items-center gap-3 px-2 py-2 rounded-lg" style={{ background: i === done - 1 && running ? "#F2FAF5" : "transparent", transition: "background 0.4s" }}>
                  <span
                    aria-hidden="true"
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ width: 22, height: 22, border: `2px solid ${on ? tokens.green : tokens.line}`, background: on ? tokens.green : "#fff", color: "#fff", transition: "all 0.3s" }}
                  >
                    {on ? <Icon name="check" size={13} stroke={3} /> : null}
                  </span>
                  <span className="flex-1 min-w-0" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: on ? tokens.muted : tokens.ink, textDecoration: on ? "line-through" : "none" }}>{s.label}</span>
                  <span style={{ fontFamily: font.body, fontSize: 11.5, fontWeight: 700, color: on ? tokens.green : tokens.primary, whiteSpace: "nowrap" }}>{on ? "✓" : s.due}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
