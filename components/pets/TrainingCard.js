"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { tokens, font } from "../../lib/theme";
import { pingSaved } from "../SavedToast";
import { levelsFor, TRAINED_BY, SERVICE_TASKS, statementText, tasksLine } from "../../lib/training";

const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "11px 13px", width: "100%", background: "#fff", color: tokens.ink };
const lab = { fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy };
const hint = { fontFamily: font.body, fontSize: 13.5, color: tokens.muted, lineHeight: 1.45 };

function Chip({ on, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className="rounded-full px-3.5 py-2" style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 700, cursor: "pointer", background: on ? tokens.navy : "#fff", color: on ? "#fff" : tokens.navy, border: `2px solid ${on ? tokens.navy : tokens.line}` }}>
      {on ? "✓ " : ""}{children}
    </button>
  );
}

const fmt = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function TrainingCard({ pet, userId, onChanged }) {
  const t = pet.training || {};
  const isDog = pet.animal_type === "Dog";
  const isService = /service/i.test(pet.role || "");
  const [levels, setLevels] = useState(Array.isArray(t.levels) ? t.levels : pet.trained ? ["house"] : []);
  const [by, setBy] = useState(t.trained_by || "");
  const [who, setWho] = useState(t.trainer_name || "");
  const [where, setWhere] = useState(t.trained_where || "");
  const [saving, setSaving] = useState(false);

  const [signing, setSigning] = useState(false);
  const [tasks, setTasks] = useState(Array.isArray(t.tasks) ? t.tasks : []);
  const [showTasks, setShowTasks] = useState(t.show_tasks === true);
  const [signed, setSigned] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const name = pet.name || "your dog";
  const [member, setMember] = useState(null);
  const [dotBusy, setDotBusy] = useState("");
  const [dotMsg, setDotMsg] = useState("");
  useEffect(() => { supabase.rpc("my_membership").then(({ data }) => setMember(!!data)); }, []);

  async function getDot(deliver) {
    setDotBusy(deliver); setDotMsg("");
    try {
      const { data } = await supabase.auth.getSession();
      const r = await fetch("/api/dot-form", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": data?.session?.access_token || "" }, body: JSON.stringify({ pet_id: pet.id, kind: "air", deliver }) });
      if (deliver === "email") {
        const j = await r.json().catch(() => ({}));
        setDotMsg(r.ok ? "Sent. Check your email." : j.error || "Couldn't send it. Try downloading instead.");
      } else if (r.ok) {
        const blob = await r.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = `DOT-Service-Animal-Form-${(pet.name || "dog").replace(/[^A-Za-z0-9]+/g, "-")}.pdf`;
        document.body.appendChild(a); a.click(); a.remove();
        setDotMsg("Downloaded. Check each box yourself, then sign and date it.");
      } else {
        const j = await r.json().catch(() => ({}));
        setDotMsg(j.error || "Couldn't make the form. Try again.");
      }
    } catch { setDotMsg("Couldn't make the form. Try again."); }
    setDotBusy("");
  }
  const toDocs = () => window.dispatchEvent(new CustomEvent("ppg-pet-section", { detail: { petId: pet.id, section: "docs" } }));
  const toggle = (list, set, k) => set(list.includes(k) ? list.filter((x) => x !== k) : [...list, k]);
  const options = levelsFor(pet.animal_type, isService || signing ? "Service animal" : pet.role);

  async function saveTraining() {
    setSaving(true);
    const keepTasks = pet.service_attested_at ? Array.from(new Set([...levels, "tasks"])) : levels;
    const training = { ...t, levels: keepTasks, trained_by: by || null, trainer_name: by && by !== "owner" ? who.trim() || null : null, trained_where: where.trim() || null };
    const { error } = await supabase.from("pets").update({ training, trained: keepTasks.length ? true : pet.trained }).eq("id", pet.id).eq("user_id", userId);
    setSaving(false);
    if (error) { alert("Couldn't save training. Please try again."); return; }
    pingSaved(); onChanged?.();
  }

  async function call(body) {
    const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/service-statement", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": data?.session?.access_token || "" }, body: JSON.stringify({ pet_id: pet.id, ...body }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "Something went wrong.");
    return j;
  }

  async function sign(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await call({ signed_name: signed, agree, tasks, show_tasks: showTasks, trained_by: by, trainer_name: who, trained_where: where });
      setSigning(false); pingSaved(); onChanged?.();
    } catch (x) { setErr(x.message); }
    setBusy(false);
  }

  async function withdraw() {
    if (!window.confirm(`Withdraw ${name}'s service dog statement? The passport will stop showing it as signed.`)) return;
    try { await call({ withdraw: true }); onChanged?.(); } catch (x) { alert(x.message); }
  }

  return (
    <section className="rounded-3xl p-4 sm:p-6 grid gap-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div>
        <h3 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, color: tokens.navy }}>{name}&apos;s training</h3>
        <p className="mt-1" style={hint}>Shows on the passport. Pick everything that applies.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map(([k, l]) => <Chip key={k} on={levels.includes(k)} onClick={() => toggle(levels, setLevels, k)}>{l}</Chip>)}
      </div>

      <div className="grid gap-2">
        <span style={lab}>Who trained {name}?</span>
        <div className="flex flex-wrap gap-2">{TRAINED_BY.map(([k, l]) => <Chip key={k} on={by === k} onClick={() => setBy(by === k ? "" : k)}>{l}</Chip>)}</div>
      </div>
      {by && by !== "owner" ? (
        <label className="grid gap-1.5"><span style={lab}>{by === "program" ? "Program name" : "Trainer or business name"}</span>
          <input value={who} onChange={(e) => setWho(e.target.value)} maxLength={120} style={input} placeholder={by === "program" ? "e.g. the organization that placed them" : "e.g. the trainer's name or business"} />
        </label>
      ) : null}
      {by ? (
        <label className="grid gap-1.5"><span style={lab}>Where they trained <span style={{ fontWeight: 500, color: tokens.muted }}>(city and state)</span></span>
          <input value={where} onChange={(e) => setWhere(e.target.value)} maxLength={120} style={input} placeholder="e.g. San Diego, CA" />
        </label>
      ) : null}
      <button type="button" disabled={saving} onClick={saveTraining} className="ppg-btn ppg-btn-primary" style={{ justifySelf: "start" }}>{saving ? "Saving…" : "Save training"}</button>

      {isDog ? (
        <div className="rounded-2xl p-4 grid gap-3" style={{ background: "#ECF6F4", border: "1.5px solid #9FD3CA" }}>
          {pet.service_attested_at ? (
            <>
              <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, color: "#0F5E58" }}>✓ Service dog statement signed {fmt(pet.service_attested_at)}</div>
              {t.tasks?.length ? <p style={hint}><b style={{ color: tokens.navy }}>Tasks:</b> {tasksLine(t.tasks)}{t.show_tasks ? " (shown on the passport)" : " (kept private)"}</p> : null}
              <div className="rounded-2xl p-4 grid gap-2" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
                <div style={{ fontFamily: font.display, fontSize: 17, fontWeight: 800, color: tokens.navy }}>{name}&apos;s DOT Service Animal form</div>
                {member ? (
                  <>
                    <p style={hint}>Filled in from {name}&apos;s passport for every trip. You check each box, then sign and date it. Airlines can ask for it once per trip, up to 48 hours before you fly.</p>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <button type="button" disabled={!!dotBusy} onClick={() => getDot("download")} className="ppg-btn ppg-btn-primary">{dotBusy === "download" ? "Making it…" : "Download the form"}</button>
                      <button type="button" disabled={!!dotBusy} onClick={() => getDot("email")} className="ppg-btn ppg-btn-secondary">{dotBusy === "email" ? "Sending…" : "Email it to me"}</button>
                    </div>
                    {dotMsg ? <p role="status" style={{ ...hint, color: tokens.navy, fontWeight: 700 }}>{dotMsg}</p> : null}
                    <p style={hint}>Signed it? <button type="button" onClick={toDocs} style={{ color: tokens.navy, fontWeight: 700, background: "none", border: "none", padding: 0, textDecoration: "underline", cursor: "pointer", font: "inherit" }}>Add a photo of it to Docs</button> so it shows in Gate Ready at the airport.</p>
                  </>
                ) : member === false ? (
                  <p style={hint}>With Pet Vault, we fill this form in from {name}&apos;s passport for every trip. <a href="/join" style={{ color: tokens.navy, fontWeight: 700 }}>Unlock it</a>, or <a href="/service-dog/dot-form" style={{ color: tokens.navy, fontWeight: 700 }}>fill in the blank form yourself</a>.</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => { setSigning(true); setTasks(t.tasks || []); }} className="ppg-btn ppg-btn-secondary">Sign again with changes</button>
                <button type="button" onClick={withdraw} style={{ fontFamily: font.body, fontWeight: 700, color: tokens.muted, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>Withdraw statement</button>
              </div>
            </>
          ) : !signing ? (
            <>
              <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, color: "#0F5E58" }}>{isService ? `Sign ${name}'s service dog statement` : `Is ${name} a service dog?`}</div>
              <p style={hint}>Tell us what {name} is trained to do and sign a short statement. The passport then shows the service dog seal with the date you signed.</p>
              <button type="button" onClick={() => setSigning(true)} className="ppg-btn ppg-btn-primary" style={{ justifySelf: "start" }}>Start the statement</button>
            </>
          ) : null}

          {signing ? (
            <form onSubmit={sign} className="grid gap-4">
              <div className="grid gap-2">
                <span style={lab}>What is {name} trained to do?</span>
                <div className="flex flex-wrap gap-2">{SERVICE_TASKS.map(([k, l]) => <Chip key={k} on={tasks.includes(k)} onClick={() => toggle(tasks, setTasks, k)}>{l}</Chip>)}</div>
                <label className="flex items-center gap-2" style={{ ...hint, color: tokens.ink }}>
                  <input type="checkbox" checked={showTasks} onChange={(e) => setShowTasks(e.target.checked)} style={{ width: 18, height: 18 }} />
                  Show these tasks on the passport (off keeps them private)
                </label>
              </div>
              {!by ? <p role="alert" style={{ ...hint, color: tokens.stamp, fontWeight: 700 }}>Pick who trained {name} above first.</p> : null}
              <div className="rounded-xl p-3" style={{ background: "#fff", border: `1px solid ${tokens.line}`, maxHeight: 220, overflowY: "auto" }}>
                <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", color: tokens.muted }}>STATEMENT</div>
                <p className="mt-1" style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink, lineHeight: 1.55, whiteSpace: "pre-line" }}>{statementText({ petName: pet.name, signedName: signed.trim() || "[your full name]" })}</p>
              </div>
              <label className="grid gap-1.5"><span style={lab}>Type your full name to sign</span>
                <input value={signed} onChange={(e) => setSigned(e.target.value)} maxLength={120} autoComplete="name" style={{ ...input, fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontSize: 22 }} placeholder="Your full name" />
              </label>
              <label className="flex items-start gap-2" style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink, lineHeight: 1.45 }}>
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 18, height: 18, marginTop: 2 }} />
                <span>I have read the statement, it is true, and I agree to the <a href="/terms#service-dogs" target="_blank" rel="noreferrer" style={{ color: tokens.navy, fontWeight: 700 }}>PetPassGo Terms</a>.</span>
              </label>
              {err ? <p role="alert" style={{ ...hint, color: tokens.stamp, fontWeight: 700 }}>{err}</p> : null}
              <div className="flex flex-wrap gap-3 items-center">
                <button type="submit" disabled={busy || !agree || !by} className="ppg-btn ppg-btn-primary">{busy ? "Signing…" : "Sign statement"}</button>
                <button type="button" onClick={() => setSigning(false)} style={{ fontFamily: font.body, fontWeight: 700, color: tokens.muted, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
              </div>
            </form>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
