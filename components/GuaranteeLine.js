import { tokens, font } from "../lib/theme";

// One line, used wherever the guarantee is mentioned. The link is the terms.
export default function GuaranteeLine({ align = "left", className = "", tone = "ink" }) {
  const color = tone === "light" ? tokens.sky : tokens.ink;
  const link = tone === "light" ? tokens.gold : tokens.navy;
  return (
    <p className={className} style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.45, color, textAlign: align, margin: "12px 0 0" }}>
      If your pet is refused boarding because a requirement we showed you was wrong, we refund your Travel Pass.{" "}
      <a href="/guarantee" style={{ color: link, fontWeight: 700 }}>Terms</a>
    </p>
  );
}
