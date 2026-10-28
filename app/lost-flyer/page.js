"use client";
import { useEffect, useRef, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import { tokens, font } from "../../lib/theme";
import { PRICES as P } from "../../lib/pricing";

// Free for everyone, no account. Everything stays in the browser: nothing is uploaded or saved.
const W = 1080, H = 1350;

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
  const [f, setF] = useState({ name: "", desc: "", area: "", date: "", contact: "" });
  const [photo, setPhoto] = useState(null);
  const [msg, setMsg] = useState("");
  const canvas = useRef(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    const c = canvas.current; if (!c) return; const ctx = c.getContext("2d");
    const draw = (img) => {
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = tokens.primary; ctx.fillRect(0, 0, W, 190);
      ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "800 130px system-ui, sans-serif"; ctx.fillText("LOST PET", W / 2, 145);
      const py = 230, ph = 600;
      if (img) { const s = Math.max(920 / img.width, ph / img.height); const iw = img.width * s, ih = img.height * s; ctx.save(); ctx.beginPath(); ctx.rect(80, py, 920, ph); ctx.clip(); ctx.drawImage(img, 80 + (920 - iw) / 2, py + (ph - ih) / 2, iw, ih); ctx.restore(); }
      else { ctx.fillStyle = tokens.sky; ctx.fillRect(80, py, 920, ph); ctx.fillStyle = tokens.muted; ctx.font = "500 40px system-ui, sans-serif"; ctx.fillText("Add a photo", W / 2, py + ph / 2); }
      ctx.fillStyle = tokens.navy; ctx.font = "800 96px system-ui, sans-serif"; ctx.fillText(f.name || "Pet's name", W / 2, 940);
      ctx.font = "500 40px system-ui, sans-serif"; ctx.fillStyle = "#1A2333";
      let y = wrap(ctx, f.desc || "Breed, color, size, collar…", W / 2, 1005, 900, 50, 2);
      ctx.fillStyle = tokens.muted; ctx.font = "600 36px system-ui, sans-serif";
      ctx.fillText([f.area && `Last seen: ${f.area}`, f.date].filter(Boolean).join(" · ") || "Last seen: area, date", W / 2, y + 10);
      ctx.fillStyle = tokens.navy; ctx.fillRect(0, H - 190, W, 190);
      ctx.fillStyle = "#fff"; ctx.font = "800 64px system-ui, sans-serif"; ctx.fillText(f.contact ? `Call ${f.contact}` : "If found, please call", W / 2, H - 95);
      ctx.fillStyle = tokens.gold; ctx.font = "600 28px system-ui, sans-serif"; ctx.fillText("Made with PetPassGo", W / 2, H - 40);
    };
    if (photo) { const img = new Image(); img.onload = () => draw(img); img.src = photo; } else draw(null);
  }, [f, photo]);

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
          <p style={{ fontFamily: font.body, fontSize: 17, color: tokens.muted }} className="mb-6">Free, no account. Nothing you enter leaves your device.</p>
          <div className="grid gap-3">
            <label style={{ fontFamily: font.body, fontWeight: 600, color: tokens.navy }}>Photo<input type="file" accept="image/*" onChange={(e) => { const x = e.target.files?.[0]; if (x) setPhoto(URL.createObjectURL(x)); }} className="block mt-1" /></label>
            <input placeholder="Pet's name" value={f.name} onChange={set("name")} maxLength={30} className="rounded-lg px-3 py-2.5" style={input} aria-label="Pet's name" />
            <input placeholder="Description (breed, color, collar)" value={f.desc} onChange={set("desc")} maxLength={120} className="rounded-lg px-3 py-2.5" style={input} aria-label="Description" />
            <input placeholder="Last seen (area)" value={f.area} onChange={set("area")} maxLength={50} className="rounded-lg px-3 py-2.5" style={input} aria-label="Last seen area" />
            <input placeholder="Date (e.g. Oct 14)" value={f.date} onChange={set("date")} maxLength={20} className="rounded-lg px-3 py-2.5" style={input} aria-label="Date" />
            <input placeholder="Phone to call (optional)" value={f.contact} onChange={set("contact")} maxLength={20} className="rounded-lg px-3 py-2.5" style={input} aria-label="Phone" />
          </div>
          <div className="flex gap-3 flex-wrap mt-5">
            <button onClick={share} className="btn-primary rounded-full px-6 py-3" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700 }}>Share flyer</button>
            <button onClick={download} className="rounded-full px-6 py-3" style={{ border: `2px solid ${tokens.navy}`, color: tokens.navy, fontFamily: font.body, fontWeight: 600, background: "#fff" }}>Download</button>
          </div>
          {msg && <p role="status" className="mt-3" style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>{msg}</p>}
          <div className="rounded-2xl p-5 mt-8" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }} className="mb-1">Want finders to reach you without sharing your number?</div>
            <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mb-3">Finder messages come to you, and you get a note when someone opens the poster. The Lost &amp; Found board shows a pet in one state and city only after you tap Report lost.</p>
            <a href="/join" style={{ fontFamily: font.body, fontWeight: 700, color: tokens.primary }}>Membership {P.member}/mo →</a>
          </div>
        </div>
        <canvas ref={canvas} width={W} height={H} className="w-full rounded-xl" style={{ boxShadow: "0 10px 30px rgba(20,33,61,.15)", background: "#fff" }} aria-label="Flyer preview" role="img" />
      </main>
    </div>
  );
}
