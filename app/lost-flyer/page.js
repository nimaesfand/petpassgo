"use client";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import SiteHeader from "../../components/SiteHeader";
import { tokens, font } from "../../lib/theme";
import { JOIN_CTA } from "../../lib/cta";

// Free for everyone, no account. Everything stays in the browser: nothing is uploaded or saved.
// Letter size at 120 dpi.
const W = 1020, H = 1320;

function wrap(ctx, text, x, y, maxW, lh, maxLines) {
  const words = (text || "").split(/\s+/); let line = "", n = 0;
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; if (++n >= maxLines - 1) break; } else line = t;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lh;
}

export default function LostFlyer() {
  const [f, setF] = useState({ name: "", desc: "", area: "", date: "", contact: "", page: "" });
  const [photo, setPhoto] = useState(null);
  const [qr, setQr] = useState("");
  const [msg, setMsg] = useState("");
  const canvas = useRef(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    const link = f.page.trim();
    if (!/^https?:\/\//i.test(link)) { setQr(""); return; }
    QRCode.toDataURL(link, { margin: 1, width: 240, errorCorrectionLevel: "M", color: { dark: "#14213D", light: "#ffffff" } }).then(setQr).catch(() => setQr(""));
  }, [f.page]);

  useEffect(() => {
    const c = canvas.current; if (!c) return; const ctx = c.getContext("2d");
    const draw = (img, qrImg) => {
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = tokens.primary; ctx.fillRect(0, 0, W, 150);
      ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "800 92px system-ui, sans-serif"; ctx.fillText("LOST", W / 2, 108);
      const py = 190, ph = 560, pw = 860, px = (W - pw) / 2;
      if (img) { const s = Math.max(pw / img.width, ph / img.height); const iw = img.width * s, ih = img.height * s; ctx.save(); ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip(); ctx.drawImage(img, px + (pw - iw) / 2, py + (ph - ih) / 2, iw, ih); ctx.restore(); }
      else { ctx.fillStyle = tokens.sky; ctx.fillRect(px, py, pw, ph); ctx.fillStyle = tokens.navy; ctx.font = "700 40px system-ui, sans-serif"; ctx.fillText("Add a photo", W / 2, py + ph / 2); }
      const petName = f.name || "Pet's name";
      let nameSize = 78;
      ctx.fillStyle = tokens.navy; ctx.font = `800 ${nameSize}px system-ui, sans-serif`;
      while (nameSize > 36 && ctx.measureText(petName).width > 940) { nameSize -= 4; ctx.font = `800 ${nameSize}px system-ui, sans-serif`; }
      ctx.fillText(petName, W / 2, 830);
      ctx.font = "600 32px system-ui, sans-serif"; ctx.fillStyle = "#1A2333";
      let y = wrap(ctx, f.desc || "Breed, color, size, collar", W / 2, 885, 900, 42, 2);
      ctx.font = "700 30px system-ui, sans-serif";
      ctx.fillText([f.area && `Last seen: ${f.area}`, f.date].filter(Boolean).join(" · ") || "Last seen", W / 2, y + 8);
      ctx.fillStyle = tokens.navy; ctx.fillRect(0, H - 210, W, 210);
      ctx.fillStyle = "#fff"; ctx.font = "800 42px system-ui, sans-serif";
      if (qrImg) {
        ctx.textAlign = "left";
        ctx.drawImage(qrImg, 70, H - 185, 160, 160);
        ctx.fillText(f.contact ? `Call ${f.contact}` : "Scan to message the owner", 260, H - 110);
        ctx.font = "600 22px system-ui, sans-serif"; ctx.fillStyle = tokens.gold;
        ctx.fillText("PetPassGo", 260, H - 68);
      } else {
        ctx.fillText(f.contact ? `Call ${f.contact}` : "If found, please call", W / 2, H - 115);
        ctx.fillStyle = tokens.gold; ctx.font = "600 24px system-ui, sans-serif"; ctx.fillText("Made with PetPassGo", W / 2, H - 58);
      }
    };
    const paint = (img) => {
      if (!qr) { draw(img, null); return; }
      const qrImg = new Image();
      qrImg.onload = () => draw(img, qrImg);
      qrImg.onerror = () => draw(img, null);
      qrImg.src = qr;
    };
    if (photo) { const img = new Image(); img.onload = () => paint(img); img.src = photo; } else paint(null);
  }, [f, photo, qr]);

  const blob = () => new Promise((res) => canvas.current.toBlob(res, "image/png"));
  const fname = () => `lost-${(f.name || "pet").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
  async function share() {
    const file = new File([await blob()], fname(), { type: "image/png" });
    const text = `LOST: ${f.name || "my pet"}${f.area ? `, last seen ${f.area}` : ""}. Please share!`;
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], text }); } catch {} }
    else { download(); setMsg("Your device can't share images directly, so we downloaded the flyer. Post it from your photos."); }
  }
  async function download() { const a = document.createElement("a"); a.href = URL.createObjectURL(await blob()); a.download = fname(); a.click(); }
  const input = { fontFamily: font.body, fontSize: 15.5, border: `2px solid ${tokens.line}`, background: "#fff" };

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[1100px] mx-auto px-6 py-12 grid lg:grid-cols-[1fr_420px] gap-10 items-start">
        <div>
          <h1 style={{ fontFamily: font.display, fontSize: 40, fontWeight: 700, color: tokens.navy, lineHeight: 1.1 }} className="mb-2">Make a lost pet flyer</h1>
          <p style={{ fontFamily: font.body, fontSize: 17, color: tokens.ink }} className="mb-6">Free, no account. Nothing you enter leaves your device.</p>
          <div className="grid gap-3">
            <label className="inline-flex items-center min-h-[44px] rounded-full px-4 cursor-pointer" style={{ fontFamily: font.body, fontWeight: 700, color: "#fff", background: tokens.navy }}>Choose a photo<input type="file" accept="image/*" className="ppg-hp" onChange={(e) => { const x = e.target.files?.[0]; if (x) setPhoto(URL.createObjectURL(x)); }} /></label>
            <input placeholder="Pet's name" value={f.name} onChange={set("name")} maxLength={30} className="rounded-lg px-3 py-2.5" style={input} aria-label="Pet's name" />
            <input placeholder="Description (breed, color, collar)" value={f.desc} onChange={set("desc")} maxLength={120} className="rounded-lg px-3 py-2.5" style={input} aria-label="Description" />
            <input placeholder="Last seen (area)" value={f.area} onChange={set("area")} maxLength={50} className="rounded-lg px-3 py-2.5" style={input} aria-label="Last seen area" />
            <input placeholder="Date (e.g. Oct 14)" value={f.date} onChange={set("date")} maxLength={20} className="rounded-lg px-3 py-2.5" style={input} aria-label="Date" />
            <input placeholder="Phone to call (optional)" value={f.contact} onChange={set("contact")} maxLength={20} className="rounded-lg px-3 py-2.5" style={input} aria-label="Phone" />
            <label style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>PetPassGo page (optional)
              <input placeholder="https://www.petpassgo.com/id/…" value={f.page} onChange={set("page")} maxLength={200} className="rounded-lg px-3 py-2.5 mt-1" style={{ ...input, fontWeight: 500 }} aria-label="PetPassGo page" />
            </label>
          </div>
          <div className="flex gap-3 flex-wrap mt-5">
            <button onClick={share} className="ppg-btn ppg-btn-primary">Share flyer</button>
            <button onClick={download} className="ppg-btn ppg-btn-secondary">Download</button>
          </div>
          {msg && <p role="status" className="mt-3" style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>{msg}</p>}
          <div className="rounded-2xl p-5 mt-8" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }} className="mb-1">Want finders to reach you without sharing your number?</div>
            <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }} className="mb-3">Finder messages come to you, and you get a note when someone opens the poster. The Lost &amp; Found board shows a pet in one state and city only after you tap Report lost.</p>
            <a href="/join" className="ppg-btn ppg-btn-primary">{JOIN_CTA}</a>
          </div>
        </div>
        <div className="min-w-0 max-w-full">
          <canvas ref={canvas} width={W} height={H} className="block w-full max-w-full min-w-0 rounded-xl" style={{ width: "100%", maxWidth: "100%", height: "auto", boxShadow: "0 10px 30px rgba(20,33,61,.15)", background: "#fff" }} aria-label="Flyer preview" role="img" />
        </div>
      </main>
    </div>
  );
}
