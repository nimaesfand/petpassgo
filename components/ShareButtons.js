"use client";
import { useState } from "react";
import { tokens, font } from "../lib/theme";
import { shareLinks, shareText, publicIdUrl } from "../lib/lost";

export default function ShareButtons({ pet, lost, flyer = true }) {
  const [copied, setCopied] = useState(false);
  const url = publicIdUrl(pet.id);
  const pill = { fontFamily: font.body, fontWeight: 600, fontSize: 14.5, color: tokens.navy, border: `1.5px solid ${tokens.line}`, background: "#fff", textDecoration: "none" };
  async function nativeShare() {
    try { await navigator.share({ title: `Lost: ${pet.name}`, text: shareText(pet, lost), url }); } catch {}
  }
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }
  return (
    <div className="flex flex-wrap gap-2">
      {typeof navigator !== "undefined" && navigator.share && (
        <button onClick={nativeShare} className="btn-primary rounded-full px-4 py-2" style={{ ...pill, background: tokens.primary, color: "#fff", border: "none" }}>Share…</button>
      )}
      {shareLinks(pet, lost).map(([label, href]) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="btn-secondary rounded-full px-4 py-2" style={pill}>{label}</a>
      ))}
      <button onClick={copy} className="btn-secondary rounded-full px-4 py-2" style={pill}>{copied ? "Link copied" : "Copy link"}</button>
      {flyer && <a href={`/id/${pet.id}/flyer`} target="_blank" rel="noopener noreferrer" className="btn-secondary rounded-full px-4 py-2" style={pill}>Printable flyer</a>}
    </div>
  );
}
