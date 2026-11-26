"use client";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import SiteHeader from "../../components/SiteHeader";
import { tokens, font } from "../../lib/theme";
import { LOGIN_CTA } from "../../lib/cta";
import { rewardText } from "../../components/LostFlyerSheet";
import { SITE_URL } from "../../lib/site";
import { supabase } from "../../lib/supabaseClient";
import { usePetAccess } from "../../lib/access";
import { PRICES } from "../../lib/pricing";

// Part of Pet Vault (Nima, Nov 25: nothing is free except the trip check).
// Everything stays in the browser: nothing is uploaded or saved.
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

function VaultOnly() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[640px] mx-auto px-6 py-14">
        <div className="rounded-3xl p-6 sm:p-8" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 10px 30px rgba(20,33,61,.08)" }}>
          <h1 style={{ fontFamily: font.display, fontSize: 34, fontWeight: 800, color: tokens.navy, lineHeight: 1.1 }} className="mb-3">Lost pet flyers come with Pet Vault</h1>
          <p style={{ fontFamily: font.body, fontSize: 17, color: tokens.ink, lineHeight: 1.5 }} className="mb-2">Make a printable flyer in a minute, with your pet&apos;s photo and a QR code that lets anyone who finds them message you. Your number stays private.</p>
          <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.muted }} className="mb-6">Make your pet&apos;s passport first. Keep it with Pet Vault for {PRICES.member}/month.</p>
          <div className="flex flex-wrap gap-3">
            <a href="/passport/create" className="ppg-btn ppg-btn-primary">Make your pet&apos;s passport</a>
            <a href="/login" className="ppg-btn ppg-btn-secondary">{LOGIN_CTA}</a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LostFlyer() {
  const [userId, setUserId] = useState(undefined);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id || null)); }, []);
  const access = usePetAccess(userId || undefined);
  if (userId === undefined || (userId && access.loading)) return <div style={{ background: tokens.sky, minHeight: "100vh" }}><SiteHeader /></div>;
  if (!access.allowed) return <VaultOnly />;
  return <FlyerMaker />;
}

function FlyerMaker() {
  const [myPets, setMyPets] = useState([]);
  useEffect(() => { supabase.from("pets").select("id,name,public_slug,animal_type,breed,color,sex,weight_lb,microchip_number").order("created_at").then(({ data }) => setMyPets(data || [])); }, []);
  const [f, setF] = useState({ kind: "DOG", name: "", desc: "", area: "", date: "", reward: "", chipped: false, contact: "", page: "" });
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
      // Same layout as the Report lost flyer (components/LostFlyerSheet.js).
      const RED = "#B91C1C";
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = RED; ctx.fillRect(0, 0, W, 16); ctx.fillRect(0, 150, W, 6);
      ctx.textAlign = "center"; ctx.font = "900 112px system-ui, sans-serif"; ctx.fillText(`LOST ${f.kind}`, W / 2, 128);
      const petName = f.name.trim() || "Your pet";
      const ask = `${petName} lost, help locate ${petName}`;
      let askSize = 58;
      ctx.fillStyle = tokens.navy; ctx.font = `900 ${askSize}px system-ui, sans-serif`;
      while (askSize > 32 && ctx.measureText(ask).width > 960) { askSize -= 3; ctx.font = `900 ${askSize}px system-ui, sans-serif`; }
      ctx.fillText(ask, W / 2, 222);
      const py = 250, ph = 520, pw = 880, px = (W - pw) / 2;
      ctx.fillStyle = tokens.navy; ctx.fillRect(px - 6, py - 6, pw + 12, ph + 12);
      if (img) { const s = Math.max(pw / img.width, ph / img.height); const iw = img.width * s, ih = img.height * s; ctx.save(); ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip(); ctx.drawImage(img, px + (pw - iw) / 2, py + (ph - ih) / 2, iw, ih); ctx.restore(); }
      else { ctx.fillStyle = tokens.sky; ctx.fillRect(px, py, pw, ph); ctx.fillStyle = tokens.navy; ctx.font = "700 40px system-ui, sans-serif"; ctx.fillText("Add a photo", W / 2, py + ph / 2); }
      const details = [f.desc.trim() || "Breed, color, size, collar", f.chipped ? "Microchipped" : ""].filter(Boolean).join(" · ");
      ctx.font = "800 34px system-ui, sans-serif"; ctx.fillStyle = tokens.navy;
      let y = wrap(ctx, details, W / 2, 830, 920, 42, 2);
      ctx.font = "700 30px system-ui, sans-serif"; ctx.fillStyle = "#1A2333";
      ctx.fillText([f.area && `Last seen ${f.area}`, f.date].filter(Boolean).join(" · ") || "Last seen", W / 2, y + 6);
      y += 6;
      const rw = rewardText(f.reward);
      if (rw) { ctx.font = "900 40px system-ui, sans-serif"; ctx.fillStyle = RED; ctx.fillText(rw, W / 2, y + 50); y += 50; }
      ctx.font = "italic 700 26px system-ui, sans-serif"; ctx.fillStyle = RED;
      ctx.fillText(`If you see ${petName}, please don't chase. Scan the code or call instead.`, W / 2, y + 46);
      ctx.fillStyle = tokens.line; ctx.fillRect(60, H - 220, W - 120, 3);
      ctx.fillStyle = tokens.navy;
      if (qrImg) {
        ctx.textAlign = "left";
        ctx.drawImage(qrImg, 90, H - 195, 170, 170);
        ctx.font = "900 46px system-ui, sans-serif"; ctx.fillText(`Seen ${petName}?`, 290, H - 130);
        ctx.font = "700 30px system-ui, sans-serif"; ctx.fillText(f.contact ? `Scan to message, or call ${f.contact}` : "Scan to message the owner", 290, H - 84);
        ctx.font = "600 22px system-ui, sans-serif"; ctx.fillStyle = tokens.muted; ctx.fillText("PetPassGo", 290, H - 46);
      } else {
        ctx.font = "900 46px system-ui, sans-serif"; ctx.fillText(`Seen ${petName}?`, W / 2, H - 140);
        ctx.font = "700 32px system-ui, sans-serif"; ctx.fillText(f.contact ? `Please call ${f.contact}` : "Add your PetPassGo page for a QR code", W / 2, H - 92);
        ctx.font = "600 22px system-ui, sans-serif"; ctx.fillStyle = tokens.muted; ctx.fillText("Made with PetPassGo", W / 2, H - 50);
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
    const text = `LOST ${f.kind}: ${f.name || "my pet"}${f.area ? `, last seen ${f.area}` : ""}. Please share!`;
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], text }); } catch {} }
    else { download(); setMsg("Your device can't share images directly, so we downloaded the flyer. Post it from your photos."); }
  }
  async function download() { const a = document.createElement("a"); a.href = URL.createObjectURL(await blob()); a.download = fname(); a.click(); }
  const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, background: "#fff" };

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[1100px] mx-auto px-6 py-12 grid lg:grid-cols-[1fr_420px] gap-10 items-start">
        <div>
          <h1 style={{ fontFamily: font.display, fontSize: 40, fontWeight: 700, color: tokens.navy, lineHeight: 1.1 }} className="mb-2">Make a lost pet flyer</h1>
          <p style={{ fontFamily: font.body, fontSize: 17, color: tokens.ink }} className="mb-6">Nothing you enter leaves your device.</p>
          <div className="grid gap-3">
            <label className="inline-flex items-center min-h-[44px] rounded-full px-4 cursor-pointer" style={{ fontFamily: font.body, fontWeight: 700, color: "#fff", background: tokens.navy }}>Choose a photo<input type="file" accept="image/*" className="ppg-hp" onChange={(e) => { const x = e.target.files?.[0]; if (x) setPhoto(URL.createObjectURL(x)); }} /></label>
            {myPets.length ? (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Fill in from your pet">
                {myPets.map((p) => (
                  <button key={p.id} type="button" className="ppg-chip-btn" onClick={() => setF({ ...f,
                    kind: /cat/i.test(p.animal_type || "") ? "CAT" : /dog/i.test(p.animal_type || "Dog") ? "DOG" : "PET",
                    name: p.name || "", page: `${SITE_URL}/id/${p.public_slug || p.id}`, chipped: !!p.microchip_number,
                    desc: [p.breed, p.color, p.sex, Number(p.weight_lb) > 0 ? `${Math.round(Number(p.weight_lb))} lb` : ""].filter(Boolean).join(" · ") })}>Use {p.name}&apos;s details</button>
                ))}
              </div>
            ) : null}
            <div className="flex gap-2" role="group" aria-label="Lost dog, cat or pet">
              {["DOG", "CAT", "PET"].map((k) => <button key={k} type="button" onClick={() => setF({ ...f, kind: k })} className="ppg-chip-btn" style={f.kind === k ? { background: tokens.navy, color: "#fff", borderColor: tokens.navy } : undefined}>Lost {k.toLowerCase()}</button>)}
            </div>
            <input placeholder="Pet's name" value={f.name} onChange={set("name")} maxLength={30} className="rounded-lg px-3 py-2.5" style={input} aria-label="Pet's name" />
            <input placeholder="Breed, color, sex, size (e.g. Dachshund · black & tan · male · 12 lb)" value={f.desc} onChange={set("desc")} maxLength={120} className="rounded-lg px-3 py-2.5" style={input} aria-label="Description" />
            <input placeholder="Last seen (area)" value={f.area} onChange={set("area")} maxLength={50} className="rounded-lg px-3 py-2.5" style={input} aria-label="Last seen area" />
            <input placeholder="Date (e.g. Oct 14)" value={f.date} onChange={set("date")} maxLength={20} className="rounded-lg px-3 py-2.5" style={input} aria-label="Date" />
            <input placeholder="Reward (optional, e.g. REWARD or $200)" value={f.reward} onChange={set("reward")} maxLength={40} className="rounded-lg px-3 py-2.5" style={input} aria-label="Reward" />
            <label className="flex items-center gap-2" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>
              <input type="checkbox" checked={f.chipped} onChange={(e) => setF({ ...f, chipped: e.target.checked })} style={{ width: 18, height: 18, accentColor: tokens.navy }} /> Microchipped
            </label>
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
        </div>
        <div className="min-w-0 max-w-full">
          <canvas ref={canvas} width={W} height={H} className="block w-full max-w-full min-w-0 rounded-xl" style={{ width: "100%", maxWidth: "100%", height: "auto", boxShadow: "0 10px 30px rgba(20,33,61,.15)", background: "#fff" }} aria-label="Flyer preview" role="img" />
        </div>
      </main>
    </div>
  );
}
