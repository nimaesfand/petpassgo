import { tokens, font } from "../../lib/theme";
import Icon from "../Icon";
import { PetIllustration } from "../PetIdCard";

const TILES = [
  { icon: "health", label: "Vaccination records", tint: "#EAF6EE", ink: tokens.green },
  { icon: "file", label: "Health records", tint: tokens.sky, ink: tokens.navy },
  { icon: "stethoscope", label: "Vet records", tint: "#FDE8E2", ink: tokens.primary },
  { icon: "clock", label: "Reminders", tint: "#FFF7E6", ink: "#8A5A12" },
];

export default function VaultCluster() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {TILES.map((tile) => (
          <div key={tile.label} className="rounded-2xl p-3.5 flex items-center gap-3 min-h-[72px]" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 8px 20px rgba(20,33,61,0.05)" }}>
            <span aria-hidden="true" className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 40, height: 40, background: tile.tint, color: tile.ink }}>
              <Icon name={tile.icon} size={20} />
            </span>
            <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.3, color: tokens.navy }}>{tile.label}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_108px] gap-3 mt-3 items-stretch">
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 12px 28px rgba(20,33,61,0.08)" }}>
          <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", color: tokens.muted }}>EXAMPLE PROFILE</div>
          <div className="flex items-center gap-3 mt-3">
            <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ border: `3px solid ${tokens.gold}` }}>
              <PetIllustration size={64} />
            </div>
            <div className="min-w-0">
              <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 20, color: tokens.navy, lineHeight: 1.15 }}>Sample pet</div>
              <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }} className="mt-1">Dog</div>
            </div>
          </div>
          <div className="mt-3 rounded-xl px-3 py-2.5" style={{ border: `2px dashed ${tokens.line}`, fontFamily: font.body, fontWeight: 700, fontSize: 15, letterSpacing: "0.06em", lineHeight: 1.4, color: tokens.navy }}>
            QR CODE
          </div>
        </div>
        <div className="rounded-2xl px-2 py-4 flex flex-col items-center justify-center text-center" style={{ background: `linear-gradient(160deg, ${tokens.navy} 0%, ${tokens.navyDeep} 100%)`, boxShadow: "0 12px 28px rgba(20,33,61,0.16)" }} aria-hidden="true">
          <span className="flex items-center justify-center rounded-full" style={{ width: 46, height: 46, border: `2px solid ${tokens.gold}`, color: tokens.gold }}>
            <Icon name="passport" size={22} />
          </span>
          <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, letterSpacing: "0.12em", color: tokens.gold }} className="mt-3">PET ID</span>
          <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, color: "#fff", lineHeight: 1.2 }} className="mt-1">PetPassGo</span>
        </div>
      </div>
    </div>
  );
}
