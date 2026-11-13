"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../Icon";
import { tokens, font } from "../../lib/theme";

// The passport photo booth. A very particular (and slightly slow) clerk walks you
// through it: bright light, face forward, crop into the frame, then a reluctant APPROVED.

const OUT_W = 800;
const OUT_H = 1000;
const FRAME = 4 / 5; // width / height

const LINES = {
  pick: (n) => `Next! …Oh. Passport photo for ${n}? Bright light, face forward, both ears in. No sunglasses. Yes, I say that every time.`,
  loaded: () => "Hmm. Drag the photo so the face fills the frame. Pinch or use the slider to zoom, and ↻ to turn it. Take your time. I have all day. Literally.",
  dark: () => "It's very dark in here. Is this a pet or a cave? Try one near a window, or use this one and I'll pretend I didn't see.",
  small: () => "This photo is tiny. It'll look blurry. A closer, sharper shot would be better.",
  inspect: () => "Hmm… let me take a look.",
  good: () => "…Nice light. Face centered. I'm looking for a reason to reject it and I can't find one.",
  saving: () => "APPROVED. Don't move. Not you, the photo.",
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
function BevFace({ size = 76, mood = "neutral" }) {
  const squint = mood === "inspect";
  const happy = mood === "happy";
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="58" fill="#FDE7C3" />
      <circle cx="60" cy="60" r="58" fill="none" stroke="#F2B84B" strokeWidth="4" />
      {/* bun, pencil and a little flower */}
      <ellipse cx="60" cy="22" rx="18" ry="14" fill="#C5CAD3" />
      <path d="M48 20 q12 -8 24 0" stroke="#AEB4BF" strokeWidth="2" fill="none" />
      <rect x="66" y="6" width="5" height="26" rx="2" fill="#F2B84B" transform="rotate(28 68 19)" />
      <polygon points="74,30 77,36 71,34" fill="#3B2A1A" transform="rotate(28 68 19)" />
      <g transform="translate(40 26)"><circle r="5" fill="#F7A8A0" /><circle r="2" fill="#F2B84B" /></g>
      {/* hair */}
      <path d="M25 60 C22 34 44 26 60 26 C78 26 98 34 95 60 C92 46 80 39 60 39 C42 39 29 46 25 60Z" fill="#D3D7DE" />
      {/* face */}
      <ellipse cx="60" cy="67" rx="31" ry="32" fill="#FFDDBF" />
      {/* pearl earrings */}
      <circle cx="29" cy="76" r="3" fill="#fff" stroke="#E5D9C3" /><circle cx="91" cy="76" r="3" fill="#fff" stroke="#E5D9C3" />
      {/* rosy cheeks */}
      <circle cx="40" cy="79" r="7.5" fill="#F7A8A0" opacity={happy ? ".85" : ".6"} />
      <circle cx="80" cy="79" r="7.5" fill="#F7A8A0" opacity={happy ? ".85" : ".6"} />
      {/* eyes: round and sparkly, or squinting when she inspects */}
      <g className="ppg-bev-eyes">
        {squint ? (
          <>
            <path d="M41 65 h11" stroke="#14213D" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M68 65 h11" stroke="#14213D" strokeWidth="3.2" strokeLinecap="round" />
          </>
        ) : happy ? (
          <>
            <path d="M41 66 q5.5 -6 11 0" stroke="#14213D" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M68 66 q5.5 -6 11 0" stroke="#14213D" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="47" cy="65" r="4.2" fill="#14213D" /><circle cx="73" cy="65" r="4.2" fill="#14213D" />
            <circle cx="48.6" cy="63.4" r="1.5" fill="#fff" /><circle cx="74.6" cy="63.4" r="1.5" fill="#fff" />
          </>
        )}
      </g>
      {/* big glasses on a chain */}
      <g fill="#fff" fillOpacity=".35" stroke="#7C3AED" strokeWidth="2.6">
        <circle cx="47" cy="65" r="11" />
        <circle cx="73" cy="65" r="11" />
      </g>
      <path d="M58 65 h4" stroke="#7C3AED" strokeWidth="2.6" />
      <path d="M36 66 C30 80 32 92 38 98 M84 66 C90 80 88 92 82 98" stroke="#F2B84B" strokeWidth="1.4" fill="none" strokeDasharray="2 2" />
      {/* mouth */}
      {happy ? <path d="M51 85 q9 9 18 0" stroke="#9A4B3A" strokeWidth="3" fill="#E9806E" strokeLinecap="round" /> : squint ? <path d="M54 88 h12" stroke="#9A4B3A" strokeWidth="3" strokeLinecap="round" /> : <path d="M52 86 q8 5 16 0" stroke="#9A4B3A" strokeWidth="3" fill="none" strokeLinecap="round" />}
      {/* cardigan, collar and badge */}
      <path d="M20 118 C24 100 40 96 60 96 C80 96 96 100 100 118Z" fill="#C2410C" />
      <path d="M48 97 L60 108 L72 97" fill="#FFF8EE" />
      <path d="M60 108 L60 118" stroke="#9A3412" strokeWidth="2" />
      <rect x="72" y="104" width="17" height="10" rx="2" fill="#fff" />
      <rect x="74" y="107" width="13" height="2" rx="1" fill="#14213D" />
      <rect x="74" y="110.5" width="8" height="1.6" rx=".8" fill="#9AA4B2" />
    </svg>
  );
}

function useTyped(text, speed = 34, delay = 900) {
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
        t = setTimeout(tick, ch === "." || ch === "…" || ch === "?" || ch === "!" ? speed * 11 : ch === "," ? speed * 5 : speed);
      }
    };
    t = setTimeout(tick, delay);
    return () => clearTimeout(t);
  }, [text, speed, delay]);
  return text.slice(0, n);
}

function Clerk({ text, mood }) {
  const first = useRef(true);
  const shown = useTyped(text, 34, first.current ? 1300 : 350);
  useEffect(() => { first.current = false; }, []);
  const typing = shown.length < text.length;
  return (
    <div className="flex items-end gap-3">
      <div className="flex-shrink-0 ppg-bev"><BevFace size={92} mood={mood} /></div>
      <div className="ppg-bev-bubble relative flex-1 rounded-3xl rounded-bl-md px-4 py-3.5" style={{ background: "#FFFDF8", boxShadow: "0 10px 26px rgba(0,0,0,.22), 0 0 0 3px rgba(242,184,75,.55)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 16, color: tokens.navy }}>Bev</span>
          <span className="rounded-full px-2 py-0.5" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 800, fontSize: 10.5, letterSpacing: ".1em" }}>WINDOW 3</span>
        </div>
        <p aria-live="polite" style={{ fontFamily: font.body, fontSize: 17.5, lineHeight: 1.5, color: tokens.ink, margin: 0, minHeight: "4.5em" }}>
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
  const [rot, setRot] = useState(0); // 0, 90, 180, 270
  const [pos, setPos] = useState({ x: 0, y: 0 }); // image centre offset from the frame centre, in screen px
  const [line, setLine] = useState("pick");
  const [busy, setBusy] = useState(false);
  const [approved, setApproved] = useState(false);
  const [moving, setMoving] = useState(false);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const drag = useRef(null);
  const pinch = useRef(null);
  const [stageW, setStageW] = useState(340);

  useEffect(() => {
    setHost(document.body);
    document.documentElement.classList.add("ppg-revealing");
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => { document.documentElement.classList.remove("ppg-revealing"); window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  useEffect(() => () => { if (img?.url) URL.revokeObjectURL(img.url); }, [img]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStageW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [host, img]);

  // The crop frame sits in the middle of a bigger stage, so the rest of the
  // photo stays visible (dimmed) around it while you line things up.
  const PAD = 22;
  const frameW = Math.min(320, Math.max(200, stageW - PAD * 2));
  const frameH = frameW / FRAME;
  const stageH = frameH + PAD * 2;
  const turned = rot % 180 !== 0;
  const nw = img ? img.img.naturalWidth : 1;
  const nh = img ? img.img.naturalHeight : 1;
  // Zoom 1 = the photo just covers the frame. You can zoom out to fit it whole.
  const base = img ? Math.max(frameW / (turned ? nh : nw), frameH / (turned ? nw : nh)) : 1;
  const scale = base * zoom;
  const dispW = nw * scale;
  const dispH = nh * scale;
  const MIN_Z = 0.4;
  const MAX_Z = 6;

  function clamp(p, z = zoom, r = rot) {
    if (!img) return p;
    const s = base * z;
    const t = r % 180 !== 0;
    const w = (t ? nh : nw) * s;
    const h = (t ? nw : nh) * s;
    // Keep at least a strip of the photo inside the frame, but otherwise move freely.
    const maxX = w / 2 + frameW / 2 - 30;
    const maxY = h / 2 + frameH / 2 - 30;
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
      setRot(0);
      setPos({ x: 0, y: 0 });
      setApproved(false);
      setLine(judge(loaded.img));
    } catch {
      setLine("pick");
    }
  }

  const pointers = useRef(new Map());
  function onPointerDown(e) {
    if (!img || busy) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setMoving(true);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), z: zoom };
      drag.current = null;
    } else {
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, start: pos };
    }
  }
  function onPointerMove(e) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const z = Math.min(MAX_Z, Math.max(MIN_Z, pinch.current.z * (d / pinch.current.d)));
      setZoom(z);
      setPos((p) => clamp(p, z));
      return;
    }
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    setPos(clamp({ x: drag.current.start.x + dx, y: drag.current.start.y + dy }));
  }
  function onPointerUp(e) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) { drag.current = null; setMoving(false); }
  }
  function zoomTo(z) {
    const v = Math.min(MAX_Z, Math.max(MIN_Z, z));
    setZoom(v);
    setPos((p) => clamp(p, v));
  }
  function zoomBy(f) { zoomTo(zoom * f); }
  function onWheel(e) {
    if (!img) return;
    zoomBy(e.deltaY < 0 ? 1.08 : 0.93);
  }
  function rotate() {
    const r = (rot + 90) % 360;
    setRot(r);
    setPos((p) => clamp({ x: -p.y, y: p.x }, zoom, r));
  }
  function reset() { setZoom(1); setRot(0); setPos({ x: 0, y: 0 }); }

  async function approve() {
    if (!img || busy) return;
    setBusy(true);
    // Draw exactly what is inside the frame, at full resolution.
    const c = document.createElement("canvas");
    c.width = OUT_W; c.height = OUT_H;
    const g = c.getContext("2d");
    const k = OUT_W / frameW;
    g.fillStyle = "#fff";
    g.fillRect(0, 0, OUT_W, OUT_H);
    g.imageSmoothingQuality = "high";
    g.save();
    g.translate(OUT_W / 2 + pos.x * k, OUT_H / 2 + pos.y * k);
    g.rotate((rot * Math.PI) / 180);
    g.drawImage(img.img, (-dispW * k) / 2, (-dispH * k) / 2, dispW * k, dispH * k);
    g.restore();
    const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.9));
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    setLine("inspect");          // she squints at it…
    await wait(2600);
    setLine("good");             // …grudging approval…
    await wait(3400);
    setApproved(true);           // …and the stamp comes down.
    setLine("saving");
    try { frameRef.current?.classList.remove("ppg-booth-shake"); void frameRef.current?.offsetWidth; frameRef.current?.classList.add("ppg-booth-shake"); } catch {}
    try {
      const file = new File([blob], `passport-photo.jpg`, { type: "image/jpeg" });
      await onSave?.(file);
      await wait(2200);
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
          <span className="ppg-bev-ding rounded-md px-2 py-0.5" style={{ background: "#fff", color: tokens.navy, fontFamily: "ui-monospace, Menlo, monospace", fontWeight: 800, fontSize: 12 }}>NOW SERVING 042</span>
        </div>
        <button type="button" onClick={onClose} aria-label="Close photo booth" className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "rgba(255,255,255,.12)", color: "#fff", border: "none", cursor: "pointer" }}><Icon name="x" size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="mx-auto grid gap-4" style={{ maxWidth: 440 }}>
          <Clerk text={LINES[line](pet.name)} mood={line === "inspect" ? "inspect" : (line === "good" || line === "saving") ? "happy" : "neutral"} />

          {img ? (
            <div ref={stageRef} className="relative w-full overflow-hidden rounded-2xl select-none" style={{ height: stageH, background: "#0B1428", touchAction: "none", cursor: moving ? "grabbing" : "grab" }}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
              onWheel={onWheel} onDoubleClick={reset}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" draggable={false} style={{ position: "absolute", left: "50%", top: "50%", width: dispW, height: dispH, maxWidth: "none", transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) rotate(${rot}deg)`, transition: moving ? "none" : "transform .18s ease-out", pointerEvents: "none" }} />
              <div ref={frameRef} aria-hidden="true" className="absolute pointer-events-none rounded-xl" style={{ left: "50%", top: "50%", width: frameW, height: frameH, transform: "translate(-50%, -50%)", boxShadow: "0 0 0 2000px rgba(11,20,40,.62)", border: `3px solid ${approved ? tokens.green : "#fff"}`, transition: "border-color .3s" }}>
                <div className="absolute inset-0" style={{ opacity: moving ? 1 : 0, transition: "opacity .2s", backgroundImage: "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)", backgroundSize: `${frameW / 3}px ${frameH / 3}px`, backgroundPosition: "-1px -1px" }} />
                {approved ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="ppg-pp-stamp" style={{ border: `5px solid ${tokens.green}`, color: tokens.green, background: "rgba(255,255,255,.85)", borderRadius: 14, padding: "6px 16px", fontFamily: font.display, fontWeight: 800, fontSize: 32, letterSpacing: ".08em", transform: "rotate(-12deg)" }}>APPROVED</div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <label ref={stageRef} className="relative mx-auto w-full flex flex-col items-center justify-center gap-2 text-center p-6 rounded-2xl" style={{ maxWidth: 330, aspectRatio: "4 / 5", cursor: "pointer", background: "#F3F5F9", boxShadow: "0 20px 50px rgba(0,0,0,.4)" }}>
              <span className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: tokens.primary, color: "#fff" }}><Icon name="camera" size={30} /></span>
              <span style={{ fontFamily: font.body, fontWeight: 800, fontSize: 17, color: tokens.navy }}>Choose a photo</span>
              <span style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>A bright, close face shot</span>
              <input type="file" accept="image/*" className="ppg-hp" onChange={pick} />
            </label>
          )}

          {img ? (
            <div className="grid gap-3">
              <div className="flex items-center gap-2" style={{ color: "#fff" }}>
                <button type="button" onClick={rotate} aria-label="Rotate photo" className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 46, height: 46, background: "rgba(255,255,255,.14)", color: "#fff", border: "none", fontSize: 22, fontWeight: 800, cursor: "pointer" }}>↻</button>
                <button type="button" onClick={() => zoomBy(0.85)} aria-label="Zoom out" className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 46, height: 46, background: "rgba(255,255,255,.14)", color: "#fff", border: "none", fontSize: 26, fontWeight: 800, cursor: "pointer" }}>−</button>
                <input type="range" min={MIN_Z} max={MAX_Z} step="0.01" value={zoom} onChange={(e) => zoomTo(Number(e.target.value))} className="flex-1 min-w-0" style={{ accentColor: tokens.gold, height: 28 }} aria-label="Zoom" />
                <button type="button" onClick={() => zoomBy(1.18)} aria-label="Zoom in" className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 46, height: 46, background: "rgba(255,255,255,.14)", color: "#fff", border: "none", fontSize: 26, fontWeight: 800, cursor: "pointer" }}>+</button>
              </div>
              <div className="flex items-center justify-center gap-3" style={{ fontFamily: font.body, fontSize: 14, color: "rgba(255,255,255,.8)" }}>
                <span>Drag to move · pinch to zoom</span>
                <button type="button" onClick={reset} style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: "#fff", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>Reset</button>
              </div>
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
