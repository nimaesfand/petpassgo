"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import Icon from "./Icon";
import ContactForm from "./ContactForm";

function focusable(root) {
  return [...root.querySelectorAll("button, a[href], input, textarea, select")].filter((el) => {
    if (el.disabled || el.tabIndex < 0) return false;
    if (el.closest(".ppg-hp")) return false;
    return true;
  });
}

function displayName(user) {
  const meta = user?.user_metadata || {};
  return String(meta.full_name || [meta.first_name, meta.last_name].filter(Boolean).join(" ") || "").trim().slice(0, 120);
}

export default function ContactPanel({ onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  const [prefill, setPrefill] = useState({ name: "", email: "" });
  closeRef.current = onClose;

  useEffect(() => {
    let cancel = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancel) return;
      const user = data?.session?.user;
      setPrefill({ name: displayName(user), email: user?.email || "" });
    }).catch(() => {});
    return () => { cancel = true; };
  }, []);

  useEffect(() => {
    const root = panelRef.current;
    if (!root) return;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const name = root.querySelector("input[autocomplete='name']");
    (name || focusable(root)[0])?.focus();

    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusable(root);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (previous && typeof previous.focus === "function") previous.focus();
    };
  }, []);

  return (
    <div className="ppg-contact-layer" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        ref={panelRef}
        id="contact-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-panel-title"
        className="ppg-contact-panel"
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 id="contact-panel-title" style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: tokens.navy, margin: 0 }}>Contact</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="flex items-center justify-center rounded-full" style={{ width: 44, height: 44, background: tokens.sky, color: tokens.navy, border: "none", cursor: "pointer" }}>
            <Icon name="x" size={22} />
          </button>
        </div>
        <ContactForm initialName={prefill.name} initialEmail={prefill.email} compact />
      </div>
    </div>
  );
}
