import { tokens, font } from "../lib/theme";
import { COMMUNITY_NOTICE } from "../lib/community";

export default function CommunityNotice() {
  return (
    <div role="note" className="rounded-xl px-4 py-3 mb-6 flex gap-3 items-start" style={{ background: "#FFF7E6", border: `1px solid ${tokens.gold}`, fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}>
      <span aria-hidden="true">ⓘ</span><span>{COMMUNITY_NOTICE}</span>
    </div>
  );
}
