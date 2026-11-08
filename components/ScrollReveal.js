"use client";
import { useEffect } from "react";

// Fades sections in as they scroll into view. Elements opt in with data-reveal.
// The class is added here (not in the markup), so content stays visible without JS.
export default function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) return; // already on screen: leave as is
      el.classList.add("ppg-reveal");
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return null;
}
