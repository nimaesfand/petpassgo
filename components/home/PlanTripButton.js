"use client";

import { PLAN_CTA } from "../../lib/cta";
import { readHomeIntentHref } from "../../lib/tripIntent";
import { tokens, font } from "../../lib/theme";

// Picks up the homepage chooser (Domestic / International, pet) when one was set.
export default function PlanTripButton({ children, className = "", style, full = false }) {
  return (
    <a
      href="/assessment"
      onClick={(e) => {
        const href = readHomeIntentHref();
        if (href !== "/assessment") {
          e.preventDefault();
          window.location.href = href;
        }
      }}
      className={`btn-primary inline-flex items-center justify-center rounded-full px-8 py-3.5 min-h-[52px] ${full ? "w-full" : ""} ${className}`}
      style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, textDecoration: "none", ...style }}
    >
      {children || PLAN_CTA}
    </a>
  );
}
