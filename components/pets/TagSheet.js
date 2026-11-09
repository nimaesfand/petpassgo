"use client";

import PetQr from "../../lib/PetQr";
import { Wordmark } from "../Logo";
import { PetIllustration } from "../PetIdCard";
import { tokens, font } from "../../lib/theme";
import { profileLabel } from "../../lib/petProfile";

// One printable US Letter sheet: 8 collar tags, 2 carrier/crate stickers and a
// fold-over wallet card. All sizes are in real inches so they print true to size.
const IN = 96; // CSS px per inch

const cut = { border: "1.5px dashed #9AA4B2" };
const label = { fontFamily: font.body, fontSize: 10, fontWeight: 800, letterSpacing: ".16em", color: tokens.muted, margin: "0 0 6px" };

function CollarTag({ pet }) {
  return (
    <div className="ppg-tag" style={{ ...cut, width: 1.5 * IN, height: 1.5 * IN, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff", position: "relative" }}>
      <div style={{ position: "absolute", top: 7, width: 9, height: 9, borderRadius: "50%", border: "1.5px solid #9AA4B2" }} aria-hidden="true" />
      <div style={{ fontFamily: font.body, fontSize: 7.5, fontWeight: 800, letterSpacing: ".14em", color: tokens.primary, marginTop: 8 }}>SCAN IF FOUND</div>
      <PetQr petId={pet.id} publicKey={pet.public_slug || pet.id} size={Math.round(0.86 * IN)} color={tokens.navy} />
      <div style={{ fontFamily: font.display, fontSize: 11, fontWeight: 800, color: tokens.navy, maxWidth: 1.1 * IN, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{pet.name}</div>
    </div>
  );
}

function Sticker({ pet, photo }) {
  return (
    <div style={{ ...cut, width: 3.6 * IN, height: 2.3 * IN, borderRadius: 14, background: "#fff", display: "flex", overflow: "hidden" }}>
      <div style={{ width: 1.45 * IN, background: tokens.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: 8 }}>
        <div style={{ background: "#fff", borderRadius: 10, padding: 5 }}>
          <PetQr petId={pet.id} publicKey={pet.public_slug || pet.id} size={Math.round(1.05 * IN)} color={tokens.navy} />
        </div>
        <div style={{ fontFamily: font.body, fontSize: 8, fontWeight: 800, letterSpacing: ".14em", color: tokens.gold }}>POINT YOUR CAMERA</div>
      </div>
      <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 800, color: tokens.primary, lineHeight: 1.05 }}>If found,<br />scan me.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: `2px solid ${tokens.gold}`, background: "#E8EEF7", flexShrink: 0 }}>{photo}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 800, color: tokens.navy, lineHeight: 1.05, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pet.name}</div>
              <div style={{ fontFamily: font.body, fontSize: 10.5, color: tokens.muted }}>{pet.breed || pet.animal_type}</div>
            </div>
          </div>
        </div>
        <div style={{ fontFamily: font.body, fontSize: 9.5, lineHeight: 1.3, color: tokens.ink }}>The scan opens my page and lets you message my owner right away.</div>
        <Wordmark size={12} />
      </div>
    </div>
  );
}

function WalletCard({ pet, photo }) {
  const w = 3.375 * IN, h = 2.125 * IN;
  return (
    <div style={{ display: "flex", ...cut, borderRadius: 12, overflow: "hidden", width: w * 2 }}>
      <div style={{ width: w, height: h, background: `linear-gradient(135deg, #0F766E, ${tokens.navy})`, color: "#fff", padding: 12, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Wordmark size={13} onDark />
          <span style={{ background: tokens.gold, color: tokens.navy, borderRadius: 99, padding: "1px 7px", fontFamily: font.body, fontSize: 7.5, fontWeight: 800, letterSpacing: ".14em" }}>PET ID</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 0.8 * IN, height: 0.95 * IN, borderRadius: 8, overflow: "hidden", border: `2px solid ${tokens.gold}`, background: "#E8EEF7", flexShrink: 0 }}>{photo}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{pet.name}</div>
            <div style={{ fontFamily: font.body, fontSize: 10.5, opacity: 0.9 }}>{pet.breed || pet.animal_type}</div>
            {pet.passport_no ? <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 10, marginTop: 4 }}>{pet.passport_no}</div> : null}
          </div>
        </div>
        <div style={{ fontFamily: font.body, fontSize: 8, opacity: 0.8 }}>Digital pet ID. Not a government ID.</div>
      </div>
      <div style={{ width: w, height: h, background: "#fff", borderLeft: "1.5px dashed #C9D2DE", display: "flex", alignItems: "center", gap: 10, padding: 12 }}>
        <PetQr petId={pet.id} publicKey={pet.public_slug || pet.id} size={Math.round(1.25 * IN)} color={tokens.navy} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 800, color: tokens.primary, lineHeight: 1.1 }}>Scan if found</div>
          <div style={{ fontFamily: font.body, fontSize: 9.5, color: tokens.ink, marginTop: 4, lineHeight: 1.3 }}>Opens {pet.name}'s page so you can message the owner.</div>
          <div style={{ fontFamily: font.body, fontSize: 8.5, color: tokens.muted, marginTop: 4, overflowWrap: "anywhere" }}>{profileLabel(pet)}</div>
        </div>
      </div>
    </div>
  );
}

export default function TagSheet({ pet, photoUrl }) {
  const photo = photoUrl
    ? <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><PetIllustration type={pet.animal_type} size={36} /></div>;

  return (
    <main style={{ background: tokens.sky, minHeight: "100vh" }}>
      <div className="ppg-no-print" style={{ maxWidth: 820, margin: "0 auto", padding: "20px 16px 8px" }}>
        <h1 style={{ fontFamily: font.display, fontSize: 30, fontWeight: 800, color: tokens.navy }}>{pet.name}'s QR tags</h1>
        <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink, marginTop: 4 }}>One sheet: 8 collar tags, 2 carrier stickers and a fold-over wallet card.</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "#FFF1E8", color: tokens.primary, fontFamily: font.body, fontSize: 14, fontWeight: 800 }}>Coming soon: durable metal PetPassGo QR collar tags. Until then, print these free.</div>
        <ol style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, margin: "12px 0 0", paddingLeft: 20, lineHeight: 1.6, listStyle: "decimal" }}>
          <li>Print at <b>100% / Actual size</b> (not "fit to page") on cardstock or sticker paper.</li>
          <li>Scan one with your phone camera before cutting, to make sure it opens {pet.name}'s page.</li>
          <li>Cut on the dashed lines. Cover collar tags with clear packing tape, or slip one into a clear tag holder (about $5 online).</li>
        </ol>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <button type="button" onClick={() => window.print()} className="ppg-btn ppg-btn-primary">Print tag sheet</button>
          <a href="/account?tab=vault" className="ppg-btn ppg-btn-secondary">Back to {pet.name}</a>
        </div>
      </div>

      <div className="ppg-tag-sheet" style={{ width: "8.5in", maxWidth: "100%", margin: "16px auto 32px", background: "#fff", padding: "0.4in", boxShadow: "0 10px 30px rgba(20,33,61,.12)" }}>
        <p style={label}>COLLAR TAGS · 1.5 IN</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1.5in)", gap: "0.22in", justifyContent: "start" }}>
          {Array.from({ length: 8 }).map((_, i) => <CollarTag key={i} pet={pet} />)}
        </div>

        <p style={{ ...label, marginTop: 22 }}>CARRIER &amp; CRATE STICKERS</p>
        <div style={{ display: "flex", gap: "0.25in", flexWrap: "wrap" }}>
          <Sticker pet={pet} photo={photo} />
          <Sticker pet={pet} photo={photo} />
        </div>

        <p style={{ ...label, marginTop: 22 }}>WALLET CARD · CUT OUT, FOLD ON THE MIDDLE LINE</p>
        <WalletCard pet={pet} photo={photo} />
      </div>
    </main>
  );
}
