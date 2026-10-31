"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import PawMark from "../components/PawMark";

export const PUBLIC_ID_BASE = `${(process.env.NEXT_PUBLIC_SITE_URL || "https://petpassgo.com").replace(/\/$/, "")}/id/`;

export default function PetQr({ petId, size = 64, color = "#14213D", publicKey }) {
  const key = publicKey || petId;
  const [svg, setSvg] = useState("");
  useEffect(() => {
    if (!key) return;
    QRCode.toString(`${PUBLIC_ID_BASE}${key}`, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: color, light: "#ffffff" },
    }).then(setSvg);
  }, [key, color]);
  const badge = Math.max(18, Math.round(size * 0.22));
  return (
    <a href={`/id/${key}`} target="_blank" rel="noopener noreferrer" title="Open public Pet ID" className="flex-shrink-0" style={{ position: "relative", display: "inline-block", width: size, height: size }}>
      <div style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />
      <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", width: badge, height: badge, transform: "translate(-50%, -50%)", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <PawMark size={Math.round(badge * 0.62)} color={color} />
      </span>
    </a>
  );
}
