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
  // Step-by-step flows have their own buttons at the bottom; on phones the bubble would cover them.
  const flow = /^\/(assessment|passport\/(create|keep)|join)(\/|$)/.test(path);

  useEffect(() => {
    if (!account) { setSlot(null); return; }
    const sync = () => setSlot(document.getElementById("ppg-contact-slot"));
    sync();
    const id = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(id);
  }, [account]);

  // On phones, step aside when the bubble would sit on top of a button or link.
  const [hide, setHide] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || slot) return undefined;
    let raf = 0;
    const check = () => {
      raf = 0;
      if (window.innerWidth >= 768) { setHide(false); return; }
      const fab = document.querySelector(".ppg-contact-fab");
      if (!fab) return;
      const r = fab.getBoundingClientRect();
      const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 4, r.top + 4], [r.right - 4, r.bottom - 4]];
      const prev = fab.style.pointerEvents; fab.style.pointerEvents = "none";
      const under = pts.some(([x, y]) => (document.elementsFromPoint(x, y) || []).some((el) => !fab.contains(el) && el.closest?.("a,button,input,select,textarea") && !el.closest(".ppg-contact-fab")));
      fab.style.pointerEvents = prev;
      setHide(under && !open);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
    const id = setTimeout(on, 400);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); clearTimeout(id); if (raf) cancelAnimationFrame(raf); };
  }, [slot, open, path]);

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

  const classes = ["ppg-contact-fab", "ppg-no-print", slot ? "is-docked" : "", !slot && account ? "is-account" : "", !slot && CHAT ? "with-chat" : "", flow ? "is-flow" : "", hide ? "is-tucked" : ""].filter(Boolean).join(" ");
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
