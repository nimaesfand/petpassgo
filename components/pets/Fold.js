"use client";

import Icon from "../Icon";
import { tokens, font } from "../../lib/theme";

// One tidy row that opens to show its contents. Every "extra" on a pet tab uses it,
// so each tab is: one main thing up top, then a short list of these.
export default function Fold({ icon, color = tokens.navy, soft = tokens.sky, title, hint, children, defaultOpen = false, id }) {
  return (
    <details id={id} open={defaultOpen} className="ppg-fold group rounded-2xl" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <summary className="flex items-center gap-3 px-4 py-3.5" style={{ cursor: "pointer", listStyle: "none" }}>
        <span className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 38, height: 38, background: soft, color }}><Icon name={icon} size={19} /></span>
        <span className="flex-1 min-w-0">
          <span className="block" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 16, color: tokens.navy }}>{title}</span>
          {hint ? <span className="block truncate" style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>{hint}</span> : null}
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tokens.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-90 flex-shrink-0" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </summary>
      <div className="ppg-fold-body px-4 pb-4 min-w-0">{children}</div>
    </details>
  );
}
