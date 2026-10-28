import { tokens, font } from "../lib/theme";
import { JOIN_CTA } from "../lib/cta";
import { VAULT_SUB } from "../lib/travelPassOffer";

// Signed-out visitors and non-members see one action. Posts stay hidden.
export default function CommunityPaywall() {
  return (
    <div className="rounded-2xl p-7 text-center" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 700, color: tokens.navy }} className="mb-2">Pet Vault members</div>
      <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.muted, lineHeight: 1.5 }} className="mb-5">{VAULT_SUB} Community boards are part of Pet Vault. Reading and posting both require it.</p>
      <a href="/join" className="btn-primary inline-block rounded-full px-6 py-3.5" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>{JOIN_CTA}</a>
    </div>
  );
}
