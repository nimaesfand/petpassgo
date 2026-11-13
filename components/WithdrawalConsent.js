"use client";
import { useEffect, useState } from "react";
import { tokens, font } from "../lib/theme";
import { WITHDRAWAL_CHECKBOX } from "../lib/withdrawal";

// The 14-day withdrawal waiver is an EU/EEA/UK/Swiss rule. Ask /api/geo once per
// page load; everywhere else the box never shows and checkout just proceeds.
let geoPromise = null;
function loadGeo() {
  if (!geoPromise) geoPromise = fetch("/api/geo", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ withdrawal: false }));
  return geoPromise;
}
export function useWithdrawalRequired() {
  const [need, setNeed] = useState(null);
  useEffect(() => { let on = true; loadGeo().then((g) => { if (on) setNeed(!!g?.withdrawal); }); return () => { on = false; }; }, []);
  return need;
}

// Unticked on purpose for EU/UK buyers. Everyone else: renders nothing and
// counts as accepted so the existing checkout checks pass.
export default function WithdrawalConsent({ checked, onChange, error }) {
  const need = useWithdrawalRequired();
  useEffect(() => { if (need === false && !checked) onChange(true); }, [need]); // eslint-disable-line react-hooks/exhaustive-deps
  if (need !== true) return error ? <p role="alert" style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.stamp, margin: "8px 0 0" }}>{error}</p> : null;
  return (
    <div className="my-3">
      <label style={{ display: "flex", gap: 12, alignItems: "flex-start", fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink, cursor: "pointer", padding: "4px 0" }}>
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: 22, height: 22, marginTop: 2, flex: "0 0 auto", accentColor: tokens.navy }}
        />
        <span>{WITHDRAWAL_CHECKBOX}</span>
      </label>
      {error ? (
        <p role="alert" style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.stamp, margin: "8px 0 0" }}>{error}</p>
      ) : null}
    </div>
  );
}
