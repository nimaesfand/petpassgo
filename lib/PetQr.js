"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export const PUBLIC_ID_BASE = "https://petpassgo.com/id/";

export default function PetQr({ petId, size = 64, color = "#14213D" }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    if (!petId) return;
    QRCode.toString(`${PUBLIC_ID_BASE}${petId}`, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: color, light: "#ffffff" },
    }).then(setSvg);
  }, [petId, color]);
  return (
    <a href={`/id/${petId}`} target="_blank" rel="noopener noreferrer" title="Open public Pet ID" className="flex-shrink-0">
      <div style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />
    </a>
  );
}
