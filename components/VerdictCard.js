"use client";

import Icon from "./Icon";
import { tokens, font } from "../lib/theme";
import { VERDICT_LOOK } from "../lib/verdict";

export default function VerdictCard({ verdict, compact = false }) {
  if (!verdict) return null;
  const v = VERDICT_LOOK[verdict.key] || VERDICT_LOOK.check;
  return (
    <div role="status" className="ppg-rise rounded-2xl p-4 sm:p-5 flex gap-4 items-start mb-4" style={{ background: v.soft, border: `2px solid ${v.color}` }}>
      <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: compact ? 40 : 48, height: compact ? 40 : 48, background: v.color, color: "#fff" }}>
        <Icon name={v.icon} size={compact ? 20 : 24} />
      </span>
      <div className="min-w-0">
        <span className="inline-block rounded-full px-2.5 py-0.5 mb-1" style={{ background: v.color, color: "#fff", fontFamily: font.body, fontSize: 12, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase" }}>{v.label}</span>
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: compact ? 19 : 22, color: tokens.navy, lineHeight: 1.2 }}>{verdict.title}</div>
        {verdict.text ? <div className="mt-1" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }}>{verdict.text}</div> : null}
      </div>
    </div>
  );
}
