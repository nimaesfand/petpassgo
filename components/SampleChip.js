import { tokens, font } from "../lib/theme";

export default function SampleChip() {
  return (
    <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 700, letterSpacing: "0.02em", color: tokens.navy, background: tokens.gold, borderRadius: 999, padding: "3px 8px", lineHeight: 1.2 }}>
      Sample
    </span>
  );
}
