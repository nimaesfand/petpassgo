"use client";
import { useState } from "react";
import { tokens, font } from "../lib/theme";

// A password box with a Show / Hide button inside it.
export default function PasswordInput({ style, className = "", ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative w-full">
      <input {...props} type={show ? "text" : "password"} autoCapitalize="none" autoCorrect="off" spellCheck={false}
        className={`${className} w-full`} style={{ ...style, paddingRight: 72 }} />
      <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
        className="absolute rounded-full px-3 py-1.5" style={{ right: 8, top: "50%", transform: "translateY(-50%)", background: tokens.sky, border: "none", cursor: "pointer", fontFamily: font.body, fontSize: 13.5, fontWeight: 700, color: tokens.navy }}>
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
