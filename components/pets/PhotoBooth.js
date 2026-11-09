"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../Icon";
import { tokens, font } from "../../lib/theme";

// The passport photo booth. A very particular (and slightly slow) clerk walks you
// through it: bright light, face forward, crop into the oval, then a reluctant APPROVED.

const OUT_W = 800;
const OUT_H = 1000;
const FRAME = 4 / 5; // width / height

const LINES = {
  pick: (n) => `Next! …Passport photo for ${n}? Okay. Bright light. Face forward. Both ears in the frame. No sunglasses. Yes, I have to say that every time.`,
  loaded: () => "Hmm. Drag the photo so the face sits inside the oval. Pinch or use the slider to zoom. I'll wait. I'm always waiting.",
  dark: () => "It's very dark in here. Is this a pet or a cave? A spot near a window works best. You can try another, or use this one and I'll pretend I didn't see.",
  small: () => "This photo is tiny. It'll look blurry on the passport. A closer, sharper shot would be better.",
  good: () => "…Hm. Nice light. Face centered. I'm looking for a reason to reject it and I can't find one.",
  saving: () => "Stamping. Don't move. Not you, the photo.",
};

function loadImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => res({ img, url });
    img.onerror = rej;
    img.src = url;
  });
}

// Bev, Window 3. Original illustrated character: grey bun with a pencil, big glasses,
// cardigan, name badge. Blinks now and then; very much not in a hurry.
function BevFace({ size = 76 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="58" fill="#FDE7C3" />
      <circle cx="60" cy="60" r="58" fill="none" stroke="#F2B84B" strokeWidth="4" />
      {/* bun + pencil */}
      <ellipse cx="60" cy="22" rx="17" ry="13" fill="#B8BEC9" />
      <rect x="66" y="6" width="5" height="26" rx="2" fill="#F2B84B" transform="rotate(28 68 19)" />
      <polygon points="74,30 77,36 71,34" fill="#3B2A1A" transform="rotate(28 68 19)" />
      {/* hair */}
      <path d="M26 58 C24 34 44 26 60 26 C78 26 96 34 94 58 C90 46 80 40 60 40 C42 40 30 46 26 58Z" fill="#C9CED7" />
      {/* face */}
      <ellipse cx="60" cy="66" rx="30" ry="32" fill="#FFD9B8" />
      {/* cheeks */}
      <circle cx="42" cy="76" r="6" fill="#F7A8A0" opacity=".55" />
      <circle cx="78" cy="76" r="6" fill="#F7A8A0" opacity=".55" />
      {/* glasses */}
      <g fill="#fff" fillOpacity=".55" stroke="#14213D" strokeWidth="3">
        <circle cx="47" cy="64" r="10" />
        <circle cx="73" cy="64" r="10" />
      </g>
      <path d="M57 64 h6" stroke="#14213D" strokeWidth="3" />
      <path d="M37 62 l-7 -3 M83 62 l7 -3" stroke="#14213D" strokeWidth="2.5" strokeLinecap="round" />
      {/* half-lidded, unimpressed eyes */}
      <g className="ppg-bev-eyes">
        <path d="M42 66 q5 -3 10 0" stroke="#14213D" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M68 66 q5 -3 10 0" stroke="#14213D" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {/* flat little mouth */}
      <path d="M53 86 q7 2 14 0" stroke="#9A4B3A" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* cardigan + badge */}
      <path d="M22 118 C26 100 40 96 60 96 C80 96 94 100 98 118Z" fill="#C2410C" />
      <path d="M60 96 L52 118 M60 96 L68 118" stroke="#9A3412" strokeWidth="2" />
      <rect x="72" y="104" width="16" height="9" rx="2" fill="#fff" />
      <rect x="74" y="107" width="12" height="2" rx="1" fill="#14213D" />
    </svg>
  );
}

function useTyped(text, speed = 22) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setN(text.length); return; }
    let i = 0;
    let t;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < text.length) {
        const ch = text[i - 1];
        // She pauses at punctuation. Of course she does.
        t = setTimeout(tick, ch === "." || ch === "…" || ch === "?" || ch === "!" ? speed * 14 : ch === "," ? speed * 6 : speed);
      }
    };
    t = setTimeout(tick, 350);
    return () => clearTimeout(t);
  }, [text, speed]);
  return text.slice(0, n);
}

function Clerk({ text }) {
  const shown = useTyped(text);
  const typing = shown.length < text.length;
  return (
    <div className="flex items-end gap-3">
      <div className="flex-shrink-0 ppg-bev"><BevFace /></div>
      <div className="relative flex-1 rounded-3xl rounded-bl-md px-4 py-3.5" style={{ background: "#FFFDF8", boxShadow: "0 10px 26px rgba(0,0,0,.22)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 16, color: tokens.navy }}>Bev</span>
          <span className="rounded-full px-2 py-0.5" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 800, fontSize: 10.5, letterSpacing: ".1em" }}>WINDOW 3</span>
        </div>
        <p aria-live="polite" style={{ fontFamily: font.body, fontSize: 16.5, lineHeight: 1.5, color: tokens.ink, margin: 0, minHeight: "3em" }}>
          <span className="sr-only">{text}</span>
          <span aria-hidden="true">{shown}{typing ? <span className="ppg-caret" /> : null}</span>
        </p>
      </div>
    </div>
  );
}

export default function PhotoBooth({ pet, onSave, onClose }) {
  const [host, setHost] = useState(null);
  const [img, setImg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // offset of image centre from frame centre, in frame px
  const [line, setLine] = useState("pick");
  const [busy, setBusy] = useState(false);
  const [approved, setApproved] = useState(false);
  const frameRef = useRef(null);
  const drag = useRef(null);
  const pinch = useRef(null);
  const [frameW, setFrameW] = useState(280);

  useEffect(() => {
    setHost(document.body);
    document.documentElement.classList.add("ppg-revealing");
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => { document.documentElement.classList.remove("ppg-revealing"); window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  useEffect(() => () => { if (img?.url) URL.revokeObjectURL(img.url); }, [img]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFrameW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [host, img]);

  const frameH = frameW / FRAME;
  // Base scale makes the image just cover the frame.
  const base = img ? Math.max(frameW / img.img.naturalWidth, frameH / img.img.naturalHeight) : 1;
  const scale = base * zoom;
  const dispW = img ? img.img.naturalWidth * scale : 0;
  const dispH = img ? img.img.naturalHeight * scale : 0;

  function clamp(p, z = zoom) {
    if (!img) return p;
    const s = base * z;
    const maxX = Math.max(0, (img.img.naturalWidth * s - frameW) / 2);
    const maxY = Math.max(0, (img.img.naturalHeight * s - frameH) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, p.x)), y: Math.min(maxY, Math.max(-maxY, p.y)) };
  }

  function judge(image) {
    const c = document.createElement("canvas");
    c.width = 40; c.height = 50;
    const g = c.getContext("2d");
    g.drawImage(image, 0, 0, 40, 50);
    const d = g.getImageData(0, 0, 40, 50).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    const lum = sum / (d.length / 4);
    if (lum < 70) return "dark";
    if (Math.min(image.naturalWidth, image.naturalHeight) < 400) return "small";
    return "loaded";
  }

  async function pick(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const loaded = await loadImage(f);
      setImg(loaded);
      setZoom(1);
      setPos({ x: 0, y: 0 });
      setApproved(false);
      setLine(judge(loaded.img));
    } catch {
      setLine("pick");
    }
  }

  function onPointerDown(e) {
    if (!img) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, start: pos };
  }
  function onPointerMove(e) {
    if (!drag.current || drag.current.id !== e.pointerId || pinch.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    setPos(clamp({ x: drag.current.start.x + dx, y: drag.current.start.y + dy }));
  }
  function onPointerUp() { drag.current = null; }
  function onTouchStart(e) {
    if (e.touches.length === 2) {
      const [a, b] = e.touches;
      pinch.current = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), z: zoom };
    }
  }
  function onTouchMove(e) {
    if (e.touches.length === 2 && pinch.current) {
      e.preventDefault();
      const [a, b] = e.touches;
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const z = Math.min(4, Math.max(1, pinch.current.z * (d / pinch.current.d)));
      setZoom(z);
      setPos((p) => clamp(p, z));
    }
  }
  function onTouchEnd(e) { if (e.touches.length < 2) pinch.current = null; }
  function onWheel(e) {
    if (!img) return;
    const z = Math.min(4, Math.max(1, zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
    setZoom(z);
    setPos((p) => clamp(p, z));
  }

  async function approve() {
    if (!img || busy) return;
    setBusy(true);
    setLine("good");
    // Draw the visible frame at full resolution.
    const c = document.createElement("canvas");
    c.width = OUT_W; c.height = OUT_H;
    const g = c.getContext("2d");
    const k = OUT_W / frameW;
    const w = dispW * k, h = dispH * k;
    const x = OUT_W / 2 + pos.x * k - w / 2;
    const y = OUT_H / 2 + pos.y * k - h / 2;
    g.fillStyle = "#fff";
    g.fillRect(0, 0, OUT_W, OUT_H);
    g.imageSmoothingQuality = "high";
    g.drawImage(img.img, x, y, w, h);
    const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.9));
    await new Promise((r) => setTimeout(r, 1100)); // the clerk is thorough
    setApproved(true);
    setLine("saving");
    try {
      const file = new File([blob], `passport-photo.jpg`, { type: "image/jpeg" });
      await onSave?.(file);
      await new Promise((r) => setTimeout(r, 900));
      onClose?.();
    } finally {
      setBusy(false);
    }
  }

  if (!host) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Passport photo booth" className="fixed inset-0 z-[1000] flex flex-col" style={{ background: `radial-gradient(120% 80% at 50% 0%, #22386A, ${tokens.navy} 60%, #0B1428)` }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ color: "#fff" }}>
        <div className="flex items-center gap-2">
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 19 }}>Passport photos</div>
          <span className="rounded-md px-2 py-0.5" style={{ background: "#fff", color: tokens.navy, fontFamily: "ui-monospace, Menlo, monospace", fontWeight: 800, fontSize: 12, transform: "rotate(-3deg)" }}>NOW SERVING 042</span>
        </div>
        <button type="button" onClick={onClose} aria-label="Close photo booth" className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "rgba(255,255,255,.12)", color: "#fff", border: "none", cursor: "pointer" }}><Icon name="x" size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="mx-auto grid gap-4" style={{ maxWidth: 440 }}>
          <Clerk text={LINES[line](pet.name)} />

          <div ref={frameRef} className="relative mx-auto w-full overflow-hidden rounded-2xl select-none" style={{ maxWidth: 300, aspectRatio: "4 / 5", background: "#fff", touchAction: "none", cursor: img ? "grab" : "default", boxShadow: "0 20px 50px rgba(0,0,0,.4)", border: `4px solid ${approved ? tokens.green : "#fff"}`, transition: "border-color .3s" }}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onWheel={onWheel}>
            {img ? (
              <img src={img.url} alt="" draggable={false} style={{ position: "absolute", left: "50%", top: "50%", width: dispW, height: dispH, maxWidth: "none", transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`, pointerEvents: "none" }} />
            ) : (
              <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-6" style={{ cursor: "pointer", background: "#F3F5F9" }}>
                <span className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: tokens.primary, color: "#fff" }}><Icon name="camera" size={30} /></span>
                <span style={{ fontFamily: font.body, fontWeight: 800, fontSize: 17, color: tokens.navy }}>Choose a photo</span>
                <span style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>A bright, close face shot</span>
                <input type="file" accept="image/*" className="ppg-hp" onChange={pick} />
              </label>
            )}
            {/* Guide: dim outside the oval, plus a dashed outline */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 500" preserveAspectRatio="none" aria-hidden="true">
              <defs><mask id="ppg-oval"><rect width="400" height="500" fill="#fff" /><ellipse cx="200" cy="225" rx="130" ry="165" fill="#000" /></mask></defs>
              {img ? <rect width="400" height="500" fill="rgba(11,20,40,.45)" mask="url(#ppg-oval)" /> : null}
              <ellipse cx="200" cy="225" rx="130" ry="165" fill="none" stroke={img ? "#fff" : tokens.line} strokeWidth="3" strokeDasharray="10 8" />
            </svg>
            {approved ? (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="ppg-pp-stamp" style={{ border: `5px solid ${tokens.green}`, color: tokens.green, background: "rgba(255,255,255,.85)", borderRadius: 14, padding: "6px 16px", fontFamily: font.display, fontWeight: 800, fontSize: 32, letterSpacing: ".08em", transform: "rotate(-12deg)" }}>APPROVED</div>
              </div>
            ) : null}
          </div>

          {img ? (
            <div className="grid gap-3">
              <label className="flex items-center gap-3" style={{ color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 14 }}>
                Zoom
                <input type="range" min="1" max="4" step="0.01" value={zoom} onChange={(e) => { const z = Number(e.target.value); setZoom(z); setPos((p) => clamp(p, z)); }} className="flex-1" style={{ accentColor: tokens.gold }} aria-label="Zoom" />
              </label>
              <button type="button" onClick={approve} disabled={busy} className="ppg-btn ppg-btn-primary w-full" style={{ minHeight: 52, fontSize: 17 }}>{busy ? (approved ? "Saving…" : "Inspecting…") : "Submit to the clerk"}</button>
              <label className="ppg-btn w-full text-center" style={{ minHeight: 48, background: "rgba(255,255,255,.12)", color: "#fff", border: "1.5px solid rgba(255,255,255,.35)", cursor: "pointer" }}>
                Use a different photo
                <input type="file" accept="image/*" className="ppg-hp" onChange={pick} />
              </label>
            </div>
          ) : (
            <ul className="grid gap-2" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {[["☀️", "Bright, even light. A window is perfect."], ["🐶", "Face toward the camera, close up."], ["👂", "Both ears and the whole face in the frame."], ["🧢", "No hats, costumes or sunglasses. Sorry."]].map(([e, t]) => (
                <li key={t} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,.08)", color: "#fff", fontFamily: font.body, fontSize: 15 }}>
                  <span aria-hidden="true" style={{ fontSize: 20 }}>{e}</span>{t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    host
  );
}
