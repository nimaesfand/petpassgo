"use client";
import { useEffect, useState } from "react";

// Tap a document row to open the file full screen on this page.
export default function DocTap({ token, doc, title, children }) {
  const [view, setView] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const ios = typeof navigator !== "undefined" && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

  useEffect(() => {
    if (!view) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setView(null); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [view]);

  async function open() {
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/check-doc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, doc }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.url) throw new Error(j.error || "Couldn't open the file.");
      setView(j);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  return (
    <>
      <button type="button" onClick={open} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", color: "inherit" }} aria-label={`Open ${title}`}>
        {children}
        <span style={{ display: "inline-block", marginTop: 6, fontWeight: 800, fontSize: 14, color: "#1D4ED8" }}>{busy ? "Opening…" : "Tap to open"}</span>
      </button>
      {err ? <div role="alert" style={{ fontSize: 13.5, color: "#B91C1C", marginTop: 4 }}>{err}</div> : null}
      {view ? (
        <div role="dialog" aria-modal="true" aria-label={title} style={{ position: "fixed", inset: 0, zIndex: 100, background: "#0B1529", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 14px", color: "#fff" }}>
            <div style={{ fontWeight: 800, fontSize: 17, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
            <button type="button" onClick={() => setView(null)} style={{ flexShrink: 0, minHeight: 48, padding: "0 22px", borderRadius: 999, background: "#fff", color: "#14213D", fontWeight: 800, fontSize: 16, border: "none", cursor: "pointer" }}>Close</button>
          </div>
          <div style={{ flex: 1, minHeight: 0, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {view.kind === "image" ? (
              <img src={view.url} alt={title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            ) : view.kind === "pdf" && !ios ? (
              <iframe src={view.url} title={title} style={{ width: "100%", height: "100%", border: "none" }} />
            ) : (
              <div style={{ textAlign: "center", padding: 24 }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#14213D" }}>{title}</div>
                <p style={{ fontSize: 15, color: "#2B3443", marginTop: 6 }}>Opens in your phone&apos;s file viewer.</p>
              </div>
            )}
          </div>
          <div style={{ padding: "12px 14px", display: "flex", justifyContent: "center" }}>
            <a href={view.url} target="_blank" rel="noopener noreferrer" style={{ minHeight: 48, display: "inline-flex", alignItems: "center", padding: "0 22px", borderRadius: 999, border: "2px solid rgba(255,255,255,.5)", color: "#fff", fontWeight: 800, fontSize: 15.5, textDecoration: "none" }}>Open file</a>
          </div>
        </div>
      ) : null}
    </>
  );
}
