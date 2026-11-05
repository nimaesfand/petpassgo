"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const CHAT = process.env.NEXT_PUBLIC_CHAT_ENABLED === "true";

export default function ContactBubble() {
  const path = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [Panel, setPanel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slot, setSlot] = useState(null);
  const account = (path === "/account" || path.startsWith("/account/")) && !path.startsWith("/account/passport");
  const onPetPage = path === "/id" || path.startsWith("/id/");

  useEffect(() => {
    if (!account) { setSlot(null); return; }
    const sync = () => setSlot(document.getElementById("ppg-contact-slot"));
    sync();
    const id = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(id);
  }, [account]);

  if (onPetPage) return null;

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

  const classes = ["ppg-contact-fab", "ppg-no-print", slot ? "is-docked" : "", !slot && account ? "is-account" : "", !slot && CHAT ? "with-chat" : ""].filter(Boolean).join(" ");
  const button = (
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
  );

  return (
    <>
      {slot ? createPortal(button, slot) : button}
      {open && Panel ? <Panel onClose={() => setOpen(false)} /> : null}
    </>
  );
}
