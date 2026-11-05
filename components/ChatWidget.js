"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

const navy = "#14213D";
const ENABLED = process.env.NEXT_PUBLIC_CHAT_ENABLED === "true";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "assistant", content: "Hi! I can answer general questions about PetPassGo and flying with pets. For your exact airline requirements, start planning your trip." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [email, setEmail] = useState("");
  const [handoffState, setHandoffState] = useState("");
  const path = usePathname() || "";
  const account = path === "/account" || path.startsWith("/account/");
  const onPetPage = path === "/id" || path.startsWith("/id/");
  const [fieldFocus, setFieldFocus] = useState(false);
  const [slot, setSlot] = useState(null);
  const accountApp = account && !path.startsWith("/account/passport");
  useEffect(() => {
    if (!accountApp) { setSlot(null); return; }
    const sync = () => setSlot(document.getElementById("ppg-chat-slot"));
    sync();
    const id = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(id);
  }, [accountApp]);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    let timer;
    const typing = (el) => {
      if (!el || el.closest?.("[data-ppg-chat]")) return false;
      if (el.tagName === "TEXTAREA" || el.tagName === "SELECT") return true;
      if (el.tagName !== "INPUT") return false;
      return !["checkbox", "radio", "file", "button", "submit", "hidden", "range"].includes(el.type || "");
    };
    const sync = () => setFieldFocus(mq.matches && typing(document.activeElement));
    const later = () => { clearTimeout(timer); timer = setTimeout(sync, 0); };
    document.addEventListener("focusin", later);
    document.addEventListener("focusout", later);
    mq.addEventListener?.("change", later);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("focusin", later);
      document.removeEventListener("focusout", later);
      mq.removeEventListener?.("change", later);
    };
  }, []);
  if (!ENABLED || onPetPage || fieldFocus) return null;

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...msgs, { role: "user", content: text }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next.slice(1) }) });
      const d = await r.json();
      setMsgs([...next, { role: "assistant", content: d.reply || d.error || "Sorry, something went wrong." }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "Sorry, I can't connect right now." }]);
    }
    setBusy(false);
  }

  async function sendHandoff(e) {
    e.preventDefault();
    setHandoffState("sending");
    const r = await fetch("/api/handoff", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message: msgs.filter((m) => m.role === "user").slice(-1)[0]?.content || "", transcript: msgs }) });
    const d = await r.json().catch(() => ({}));
    setHandoffState(r.ok ? "sent" : d.error || "error");
  }

  const box = { fontFamily: "var(--font-body), system-ui, sans-serif", fontSize: 14 };
  const launch = (
    <button type="button" onClick={() => setOpen(true)} className="ppg-chat-launch rounded-full shadow-lg px-5 py-3" style={{ background: navy, color: "#F3F5F9", fontWeight: 600 }}>Questions? Chat</button>
  );
  const sheet = open ? (
    <div className="rounded-2xl shadow-xl flex flex-col" style={{ width: "min(320px, calc(100vw - 24px))", height: "min(60dvh, 440px)", background: "#fff", border: "1px solid #DCE3EC" }}>
      <div className="px-4 py-3 flex justify-between items-center rounded-t-2xl" style={{ background: navy, color: "#F3F5F9" }}>
        <span style={{ fontWeight: 600 }}>PetPassGo help</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {msgs.map((m, i) => (
          <div key={i} className="rounded-xl px-3 py-2" style={{ background: m.role === "user" ? "#F3F5F9" : "#F6F8FA", marginLeft: m.role === "user" ? 40 : 0, marginRight: m.role === "user" ? 0 : 40 }}>{m.content}</div>
        ))}
        {busy && <div style={{ opacity: 0.6 }}>Typing…</div>}
        {handoff && (
          handoffState === "sent" ? <div className="rounded-xl px-3 py-2" style={{ background: "#EAF6EE" }}>Thanks! The PetPassGo team will email you.</div> :
          <form onSubmit={sendHandoff} className="rounded-xl p-3" style={{ background: "#F6F8FA" }}>
            <div className="mb-2">Leave your email and the PetPassGo team will get back to you.</div>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded px-2 py-1 mb-2" style={{ border: "1px solid #DCE3EC" }} />
            <button type="submit" disabled={handoffState === "sending"} className="rounded-full px-3 py-1" style={{ background: navy, color: "#fff" }}>Send</button>
            {handoffState && handoffState !== "sending" && <div className="mt-1" style={{ color: "#C2410C", fontSize: 12 }}>{handoffState}</div>}
          </form>
        )}
      </div>
      {!handoff && <button type="button" onClick={() => setHandoff(true)} className="text-left px-3 pb-1" style={{ fontSize: 12, textDecoration: "underline", color: navy }}>Talk to a person</button>}
      <form onSubmit={send} className="p-2 flex gap-2" style={{ borderTop: "1px solid #DCE3EC" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={1000} placeholder="Ask a question…" className="flex-1 rounded px-2 py-1" style={{ border: "1px solid #DCE3EC" }} />
        <button type="submit" disabled={busy} className="rounded-full px-3" style={{ background: navy, color: "#fff" }}>Send</button>
      </form>
    </div>
  ) : null;
  if (slot) {
    return (
      <>
        {createPortal(<div data-ppg-chat className="ppg-no-print" style={box}>{open ? null : launch}</div>, slot)}
        {sheet ? <div className="ppg-chat-sheet ppg-no-print" style={box}>{sheet}</div> : null}
      </>
    );
  }
  return (
    <div data-ppg-chat className="ppg-no-print" style={{ position: "fixed", right: account ? "auto" : 16, left: account ? 16 : "auto", bottom: account ? "calc(146px + env(safe-area-inset-bottom, 0px))" : (open ? "calc(156px + env(safe-area-inset-bottom, 0px))" : "calc(16px + env(safe-area-inset-bottom, 0px))"), zIndex: 50, maxWidth: "calc(100vw - 32px)", ...box }}>
      {sheet ? <div style={{ marginBottom: 10 }}>{sheet}</div> : null}
      {open ? null : launch}
    </div>
  );
}
