import { linkParts, hostOf } from "../lib/linkify";
import Icon from "./Icon";
import { tokens } from "../lib/theme";

const linkStyle = { color: tokens.primary, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 2, wordBreak: "break-word" };

// Renders text with every URL and phone number as a real, tappable link.
export default function LinkText({ text }) {
  return (
    <>
      {linkParts(text).map((p, i) =>
        p.type === "text" ? (
          <span key={i}>{p.value}</span>
        ) : p.type === "tel" ? (
          <a key={i} href={p.href} style={{ ...linkStyle, whiteSpace: "nowrap", display: "inline-block", padding: "8px 2px", margin: "-8px 0" }}><Icon name="phone" size={15} /> {p.value}</a>
        ) : (
          <a key={i} href={p.href} target="_blank" rel="noopener noreferrer" style={linkStyle}>{hostOf(p.value)} <Icon name="external" size={14} /></a>
        )
      )}
    </>
  );
}
