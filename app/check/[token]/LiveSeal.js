"use client";
import { useEffect, useState } from "react";

// A ticking clock and moving band, so a screenshot can't pass for the live page.
export default function LiveSeal({ expiresAt }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const left = Math.max(0, Math.round((new Date(expiresAt) - now) / 60000));
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" });
  return (
    <div className="ppg-live rounded-2xl px-4 py-3 flex items-center justify-between gap-3" style={{ color: "#fff" }}>
      <div className="flex items-center gap-2.5">
        <span className="ppg-live-dot" aria-hidden="true" />
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".16em", opacity: 0.85 }}>LIVE CHECK-IN VIEW</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{time}</div>
        </div>
      </div>
      <div className="text-right" style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>{left > 0 ? `Link expires in ${left} min` : "Link expired"}</div>
    </div>
  );
}
