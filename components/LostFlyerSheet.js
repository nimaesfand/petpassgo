import { tokens, font } from "../lib/theme";
import { fmtDate } from "../lib/lost";
import { PetIllustration } from "./PetIdCard";

// The one lost-pet flyer look (Report lost flyer, Lost tab preview; the /lost-flyer maker
// draws the same layout on a canvas). Built to print well with Chrome's default settings:
// the headline is red text on white with red rules, so nothing depends on background colors.
export const RED = "#B91C1C";

export function rewardText(r) {
  const v = String(r || "").trim();
  if (!v) return "";
  if (/^reward[!.]*$/i.test(v)) return "REWARD";
  if (/^reward\b/i.test(v)) return v.replace(/^reward\s*[:\-]?\s*/i, "Reward: ");
  return `Reward: ${v}`;
}

export function flyerDetails({ breed, color, sex, weight, chipped }) {
  return [breed, color, sex, Number(weight) > 0 ? `${Math.round(Number(weight))} lb` : null, chipped ? "Microchipped" : null].filter(Boolean).join(" · ");
}

export default function LostFlyerSheet({ name, kind = "PET", breed, color, sex, weight, chipped, area, date, note, reward, phone, pageUrl, qr, photo, animalType = "Dog", placeholder }) {
  const details = flyerDetails({ breed, color, sex, weight, chipped });
  const rw = rewardText(reward);
  return (
    <article className="ppg-print-sheet mx-auto bg-white min-w-0" style={{ width: "8.5in", maxWidth: "100%", overflow: "hidden", color: tokens.ink, fontFamily: font.body, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
      <div className="text-center" style={{ borderTop: `10px solid ${RED}`, borderBottom: `4px solid ${RED}`, padding: "10px 16px 8px" }}>
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 76, letterSpacing: "0.04em", color: RED, lineHeight: 1 }}>LOST {kind}</div>
      </div>
      <div className="text-center" style={{ padding: "12px 28px 10px" }}>
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 32, lineHeight: 1.1, color: tokens.navy, overflowWrap: "anywhere" }}>{name} lost, help locate {name}</div>
        <div className="mx-auto overflow-hidden" style={{ marginTop: 12, width: "6.8in", maxWidth: "100%", aspectRatio: "880 / 520", background: "#E8EEF7", border: `4px solid ${tokens.navy}` }}>
          <div className="flex items-center justify-center" style={{ width: "100%", height: "100%" }}>{photo || <PetIllustration type={animalType} size={180} />}</div>
        </div>
        {details ? <div style={{ fontSize: 19, fontWeight: 800, color: tokens.navy, marginTop: 10 }}>{details}</div> : null}
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
          {area || date ? <>Last seen {area || ""}{date ? `${area ? " · " : ""}${fmtDate(date)}` : ""}</> : placeholder ? <span style={{ color: tokens.muted }}>Last seen: where and when (you add this when you report)</span> : null}
        </div>
        {note ? <div style={{ fontSize: 16, marginTop: 4, overflow: "hidden", maxHeight: 46 }}>{note}</div> : null}
        {rw ? <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, color: RED, marginTop: 6 }}>{rw}</div> : null}
        <div style={{ fontSize: 15.5, fontWeight: 700, fontStyle: "italic", color: RED, marginTop: 6 }}>If you see {name}, please don&apos;t chase. Scan the code or call instead.</div>
        <div className="flex items-center justify-center gap-4" style={{ marginTop: 12, textAlign: "left", borderTop: `2px solid ${tokens.line}`, paddingTop: 12 }}>
          {qr ? <div style={{ width: 120, height: 120, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: qr }} /> : <div style={{ width: 120, height: 120, flexShrink: 0, border: `2px dashed ${tokens.line}` }} />}
          <div className="min-w-0" style={{ maxWidth: 320 }}>
            <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, color: tokens.navy }}>Seen {name}?</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>Scan the code to message the owner{phone ? <> or call {phone}</> : ""}.</div>
            {pageUrl ? <div style={{ fontSize: 12, marginTop: 4, overflowWrap: "anywhere" }}>{pageUrl}</div> : null}
          </div>
        </div>
      </div>
    </article>
  );
}
