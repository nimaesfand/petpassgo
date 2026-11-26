import { tokens, font } from "../lib/theme";
import Icon from "./Icon";

// Friendly empty state: an icon, one warm line that says why it matters, one clear button.
export default function EmptyState({ icon = "paw", color = tokens.primary, soft = "#FFF4EC", title, text, action, href, onClick }) {
  return (
    <div className="rounded-3xl px-5 py-6 text-center ppg-rise" style={{ background: `linear-gradient(180deg, ${soft} 0%, #fff 100%)`, border: `1.5px dashed ${color}55` }}>
      <span className="mx-auto flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: "#fff", color, boxShadow: `0 8px 20px ${color}26, 0 0 0 6px ${soft}` }}><Icon name={icon} size={28} /></span>
      <div className="mt-3" style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800, color: tokens.navy, lineHeight: 1.2 }}>{title}</div>
      {text ? <p className="mt-1 mx-auto max-w-[30rem]" style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink, lineHeight: 1.5 }}>{text}</p> : null}
      {action ? (href ? <a href={href} className="ppg-btn ppg-btn-primary mt-4">{action}</a> : <button type="button" onClick={onClick} className="ppg-btn ppg-btn-primary mt-4">{action}</button>) : null}
    </div>
  );
}
