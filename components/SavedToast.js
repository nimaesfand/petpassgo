"use client";

import { useEffect, useState } from "react";
import { tokens, font } from "../lib/theme";

export function pingSaved() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("ppg-saved"));
}

export default function SavedToast() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let timer;
    const show = () => {
      setOn(true);
      clearTimeout(timer);
      timer = setTimeout(() => setOn(false), 2500);
    };
    window.addEventListener("ppg-saved", show);
    return () => {
      window.removeEventListener("ppg-saved", show);
      clearTimeout(timer);
    };
  }, []);
  if (!on) return null;
  return (
    <div
      className="ppg-no-print"
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "calc(84px + env(safe-area-inset-bottom, 0px))",
        transform: "translateX(-50%)",
        zIndex: 70,
        background: "#fff",
        color: tokens.green,
        border: `2px solid ${tokens.green}`,
        borderRadius: 999,
        padding: "10px 18px",
        fontFamily: font.body,
        fontWeight: 700,
        fontSize: 16,
        boxShadow: "0 8px 24px rgba(20,33,61,0.12)",
      }}
    >
      Saved
    </div>
  );
}
