// Split requirement text into plain text, web links and phone numbers so the
// checklist can render every URL and phone number as a tappable link.
const URL_RE = /https?:\/\/[^\s<>"')\]]+/;
// US numbers: 1-800-252-7522, (702) 505-8888, 800.221.1212, 651-905-2737.
const PHONE_RE = /(?:\+?1[\s.-]?)?(?:\(\d{3}\)\s?|\d{3}[\s.-])\d{3}[\s.-]\d{4}\b/;
const ANY_RE = new RegExp(`${URL_RE.source}|${PHONE_RE.source}`, "g");

export function telHref(phone) {
  const d = String(phone || "").replace(/[^\d]/g, "");
  if (d.length === 10) return `tel:+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `tel:+${d}`;
  return d ? `tel:${d}` : null;
}

// "tel:18002527522" -> "1-800-252-7522"
export function prettyPhone(href) {
  let d = String(href || "").replace(/[^\d]/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  if (d.length !== 10) return String(href || "").replace(/^tel:/, "");
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

export function isTel(href) {
  return /^tel:/i.test(String(href || ""));
}

export function linkParts(text) {
  const s = String(text || "");
  const out = [];
  let last = 0;
  for (const m of s.matchAll(ANY_RE)) {
    let raw = m[0];
    const trail = raw.match(/[.,;:!?]+$/);
    if (trail && /^https?:/.test(raw)) raw = raw.slice(0, -trail[0].length);
    if (m.index > last) out.push({ type: "text", value: s.slice(last, m.index) });
    if (/^https?:/.test(raw)) out.push({ type: "url", value: raw, href: raw });
    else out.push({ type: "tel", value: raw, href: telHref(raw) });
    last = m.index + raw.length;
  }
  if (last < s.length) out.push({ type: "text", value: s.slice(last) });
  return out;
}

export function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}
