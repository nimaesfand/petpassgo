"use client";
import { tokens, font } from "../lib/theme";
import { WITHDRAWAL_CHECKBOX } from "../lib/withdrawal";

// Unticked on purpose. The buyer has to tick it before checkout.
export default function WithdrawalConsent({ checked, onChange, error }) {
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
