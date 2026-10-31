"use client";

import { useState } from "react";
import { tokens, font } from "../lib/theme";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) {
        setState("error");
        setError(data.error || "We couldn't send that. Please try again.");
        return;
      }
      setState("sent");
    } catch {
      setState("error");
      setError("We couldn't send that. Please try again.");
    }
  }

  if (state === "sent") {
    return (
      <p role="status" style={{ fontFamily: font.body, fontSize: 18, lineHeight: 1.5, color: tokens.navy, fontWeight: 700, margin: 0 }}>
        Thanks! We'll get back to you within 24 hours.
      </p>
    );
  }

  const field = {
    fontFamily: font.body,
    fontSize: 16,
    border: `2px solid ${tokens.line}`,
    color: tokens.ink,
    background: "#fff",
    width: "100%",
    borderRadius: 12,
    padding: "14px 16px",
    minHeight: 52,
  };
  const label = { fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy, display: "grid", gap: 6 };

  return (
    <form onSubmit={onSubmit} className="grid gap-4" style={{ position: "relative" }}>
      <label style={label}>
        Name
        <input required maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} style={field} />
      </label>
      <label style={label}>
        Email
        <input required type="email" maxLength={200} autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} style={field} />
      </label>
      <label style={label}>
        Message
        <textarea required minLength={2} maxLength={4000} rows={6} value={message} onChange={(e) => setMessage(e.target.value)} style={{ ...field, minHeight: 160, resize: "vertical" }} />
      </label>
      <div className="ppg-hp" aria-hidden="true">
        <label>
          Company
          <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
      </div>
      {error ? <p role="alert" style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.stamp, margin: 0 }}>{error}</p> : null}
      <button type="submit" disabled={state === "sending"} className="btn-primary rounded-full px-8 py-3.5 min-h-[52px] w-full sm:w-auto" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, border: "none", cursor: state === "sending" ? "wait" : "pointer" }}>
        {state === "sending" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
