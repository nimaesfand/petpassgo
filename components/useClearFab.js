"use client";

import { useEffect, useState } from "react";

function overlap(a, b, pad = 6) {
  return a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;
}

// Keeps a floating control easy to find, and slides it off marked account
// controls on a phone. `home` is the resting corner: { side: "left"|"right", bottom }.
export default function useClearFab(ref, active, home) {
  const [pos, setPos] = useState(null);
  const side = home?.side || "right";
  const bottom = home?.bottom ?? 16;
  useEffect(() => {
    if (!active) { setPos(null); return; }
    const mq = window.matchMedia("(max-width: 767px)");
    let frame = 0;
    function place() {
      const el = ref.current;
      if (!el || !mq.matches) { setPos(null); return; }
      const width = el.offsetWidth || 56;
      const height = el.offsetHeight || 56;
      const nav = document.querySelector("nav[aria-label='Account']");
      const navTop = nav && nav.getBoundingClientRect().height > 0 ? nav.getBoundingClientRect().top : window.innerHeight;
      const blocks = [...document.querySelectorAll("[data-keep-clear], [data-ppg-chat], .ppg-contact-fab")]
        .filter((node) => node !== el && !el.contains(node) && !node.contains(el))
        .map((node) => node.getBoundingClientRect())
        .filter((rect) => rect.width > 2 && rect.height > 2);
      const clear = (rect) => rect.top >= 64 && rect.bottom <= navTop - 8 && blocks.every((block) => !overlap(rect, block));
      const margin = 16;
      const right = window.innerWidth - margin - width;
      const left = margin;
      const xs = side === "left" ? [left, right] : [right, left];
      const homeTop = window.innerHeight - bottom - height;
      const tops = [homeTop];
      for (let top = homeTop - 64; top >= 64; top -= 64) tops.push(top);
      for (const x of xs) {
        for (const top of tops) {
          const rect = { left: x, top, right: x + width, bottom: top + height };
          if (!clear(rect)) continue;
          if (x === xs[0] && Math.abs(top - homeTop) < 4) { setPos(null); return; }
          setPos({ left: x, top });
          return;
        }
      }
      setPos({ left: xs[0], top: 72 });
    }
    function schedule() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    mq.addEventListener?.("change", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mq.removeEventListener?.("change", schedule);
    };
  }, [active, ref, side, bottom]);
  return pos;
}
