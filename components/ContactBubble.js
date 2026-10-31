"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const CHAT = process.env.NEXT_PUBLIC_CHAT_ENABLED === "true";

export default function ContactBubble() {
  const path = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [Panel, setPanel] = useState(null);
  const [loading, setLoading] = useState(false);
  const account = path === "/account" || path.startsWith("/account/");

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    if (!Panel) {
      setLoading(true);
      try {
        const mod = await import("./ContactPanel");
        setPanel(() => mod.default);
      } finally {
        setLoading(false);
      }
    }
    setOpen(true);
  }

  const classes = ["ppg-contact-fab", account ? "is-account" : "", CHAT ? "with-chat" : ""].filter(Boolean).join(" ");

  return (
    <>
      <button
        type="button"
        className={classes}
        aria-label="Contact us"
        aria-expanded={open}
        aria-controls={open ? "contact-panel" : undefined}
        aria-haspopup="dialog"
        aria-busy={loading || undefined}
        onClick={toggle}
      >
        <Icon name={open ? "x" : "message"} size={26} />
      </button>
      {open && Panel ? <Panel onClose={() => setOpen(false)} /> : null}
    </>
  );
}
