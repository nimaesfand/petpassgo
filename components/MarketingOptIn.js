"use client";
import { tokens, font } from "../lib/theme";
import { MARKETING_LABEL } from "../lib/marketing";

export default function MarketingOptIn({ checked, onChange }) {
  return (
    <label style={{ display: "flex", gap: 12, alignItems: "flex-start", fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink, cursor: "pointer", padding: "4px 0" }}>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 22, height: 22, marginTop: 2, flex: "0 0 auto", accentColor: tokens.navy }}
      />
      <span>{MARKETING_LABEL}</span>
    </label>
  );
}
