import { tokens, font } from "../lib/theme";

// One line, used wherever the guarantee is mentioned. The link is the conditions.
export default function GuaranteeLine({ align = "left", className = "" }) {
  return (
    <p className={className} style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.45, color: tokens.muted, textAlign: align, margin: "12px 0 0" }}>
      Flight-Ready Guarantee: if a requirement we showed was wrong and your pet was refused boarding, we refund your pass.{" "}
      <a href="/guarantee" style={{ color: tokens.navy, fontWeight: 700 }}>Conditions apply</a>
    </p>
  );
}
