"use client";

import { useEffect } from "react";

// Phones: keep the field you're typing in above the on-screen keyboard.
// While the keyboard is up (or a field was tapped), <html> gets `ppg-typing`:
// CSS then hides tall previews and floating buttons, and lifts bottom sheets.
// It also sets --ppg-kb (how much of the screen the keyboard covers),
// --ppg-vvtop and --ppg-vvh (the part of the page you can still see).

const TEXT_TYPES = /^(text|email|tel|number|search|url|password|date|datetime-local|month|time|week)$/;

function isTextField(el) {
  if (!el || !el.tagName) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag !== "INPUT") return false;
  return TEXT_TYPES.test((el.getAttribute("type") || "text").toLowerCase());
}

function scrollParent(el) {
  let p = el.parentElement;
  while (p && p !== document.body) {
    const s = getComputedStyle(p);
    if (/(auto|scroll)/.test(s.overflowY) && p.scrollHeight > p.clientHeight + 2) return p;
    p = p.parentElement;
  }
  return null;
}

export default function KeyboardHelper() {
  useEffect(() => {
    const root = document.documentElement;
    const vv = window.visualViewport;
    const coarse = window.matchMedia?.("(pointer: coarse)");
    if (!coarse?.matches) return undefined;

    let tapped = null;
    let tappedAt = 0;
    let baseline = vv ? vv.height : window.innerHeight;
    let offTimer = 0;
    const timers = [];

    const keyboardUp = () => (vv ? baseline - vv.height > 120 : false);

    const setVars = () => {
      if (!vv) return;
      const kb = Math.max(0, Math.round(window.innerHeight - (vv.offsetTop + vv.height)));
      root.style.setProperty("--ppg-kb", `${kb}px`);
      root.style.setProperty("--ppg-vvtop", `${Math.max(0, Math.round(vv.offsetTop))}px`);
      root.style.setProperty("--ppg-vvh", `${Math.round(vv.height)}px`);
    };

    const ensureVisible = () => {
      const el = document.activeElement;
      if (!isTextField(el)) return;
      const r = el.getBoundingClientRect();
      const top = vv ? vv.offsetTop : 0;
      const h = vv ? vv.height : window.innerHeight;
      const pad = 16;
      if (r.top >= top + pad && r.bottom <= top + h - pad) return;
      // Put the field about a third of the way down the part you can see.
      const delta = Math.round(r.top - (top + Math.min(h * 0.3, Math.max(pad, h - r.height - pad))));
      const sp = scrollParent(el);
      if (sp) sp.scrollBy({ top: delta, behavior: "smooth" });
      else window.scrollBy({ top: delta, behavior: "smooth" });
    };

    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    const turnOn = () => {
      clearTimeout(offTimer);
      if (!root.classList.contains("ppg-typing")) root.classList.add("ppg-typing");
      setVars();
      later(ensureVisible, 80);
      later(ensureVisible, 360);
    };

    const turnOff = () => {
      root.classList.remove("ppg-typing");
      root.style.removeProperty("--ppg-kb");
      root.style.removeProperty("--ppg-vvtop");
      root.style.removeProperty("--ppg-vvh");
    };

    const onPointer = (e) => {
      if (e.pointerType && e.pointerType !== "touch" && e.pointerType !== "pen") return;
      tapped = e.target;
      tappedAt = Date.now();
    };

    const onFocusIn = (e) => {
      const el = e.target;
      if (!isTextField(el)) return;
      const label = tapped?.closest?.("label");
      const byTap = Date.now() - tappedAt < 1500 && (tapped === el || el.contains?.(tapped) || (label && label.contains(el)));
      if (byTap || keyboardUp() || root.classList.contains("ppg-typing")) turnOn();
    };

    const onFocusOut = () => {
      clearTimeout(offTimer);
      offTimer = setTimeout(() => {
        if (!isTextField(document.activeElement)) turnOff();
      }, 150);
    };

    const onResize = () => {
      if (!vv) return;
      const focused = isTextField(document.activeElement);
      if (!focused) baseline = vv.height; // nothing focused: no keyboard
      if (focused && keyboardUp()) turnOn();
      else if (focused && root.classList.contains("ppg-typing")) { setVars(); later(ensureVisible, 60); }
    };

    const onOrientation = () => later(() => { baseline = vv ? vv.height : window.innerHeight; setVars(); }, 400);

    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    vv?.addEventListener("resize", onResize);
    vv?.addEventListener("scroll", setVars);
    window.addEventListener("orientationchange", onOrientation);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      vv?.removeEventListener("resize", onResize);
      vv?.removeEventListener("scroll", setVars);
      window.removeEventListener("orientationchange", onOrientation);
      timers.forEach(clearTimeout);
      clearTimeout(offTimer);
      turnOff();
    };
  }, []);
  return null;
}
