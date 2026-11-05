import { tokens, font } from "../lib/theme";

export default function CommunityNotice() {
  return (
    <span className="inline-flex items-center rounded-full px-3 py-1" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontSize: 13, fontWeight: 700 }}>
      Unverified tips
    </span>
  );
}
