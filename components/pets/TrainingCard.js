"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { tokens, font } from "../../lib/theme";
import { pingSaved } from "../SavedToast";
import { levelsFor, TRAINED_BY, TASK_GROUPS, PLACES, placeLabel, cleanTrainerText, statementText, tasksLine } from "../../lib/training";

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
  const [by, setBy] = useState(t.trained_by === "program" ? "trainer" : t.trained_by || "");
  const [who, setWho] = useState(t.trainer_name || "");
  const [biz, setBiz] = useState(t.trainer_business || "");
  const [where, setWhere] = useState(placeLabel(t.trained_where) ? t.trained_where : "");
  const whoCheck = cleanTrainerText(who), bizCheck = cleanTrainerText(biz);
  const trainerErr = by === "trainer" ? (whoCheck.error || bizCheck.error || "") : "";
  const trainerMissing = by === "trainer" && !who.trim() && !biz.trim();
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
    if (trainerErr) { alert(trainerErr); return; }
    const training = { ...t, levels: keepTasks, trained_by: by || null, program: null, trainer_name: by === "trainer" ? whoCheck.value || null : null, trainer_business: by === "trainer" ? bizCheck.value || null : null, trained_where: where || null };
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
      await call({ signed_name: signed, agree, tasks, show_tasks: showTasks, trained_by: by, trainer_name: who, trainer_business: biz, trained_where: where });
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
        <p className="mt-1" style={hint}>Pick everything that applies. This is what you tell us: PetPassGo doesn&apos;t test or certify training.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map(([k, l]) => <Chip key={k} on={levels.includes(k)} onClick={() => toggle(levels, setLevels, k)}>{l}</Chip>)}
      </div>

      <div className="grid gap-2">
        <span style={lab}>Who trained {name}?</span>
        <div className="flex flex-wrap gap-2">{TRAINED_BY.map(([k, l]) => <Chip key={k} on={by === k} onClick={() => setBy(by === k ? "" : k)}>{l}</Chip>)}</div>
      </div>
      {by === "trainer" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5"><span style={lab}>Trainer&apos;s name</span>
            <input value={who} onChange={(e) => setWho(e.target.value)} maxLength={80} style={input} placeholder="e.g. Jordan Lee" />
          </label>
          <label className="grid gap-1.5"><span style={lab}>Business or program</span>
            <input value={biz} onChange={(e) => setBiz(e.target.value)} maxLength={80} style={input} placeholder="e.g. Paws Forward Training" />
          </label>
          {trainerErr ? <p role="alert" className="sm:col-span-2" style={{ ...hint, color: tokens.stamp, fontWeight: 700 }}>{trainerErr}</p> : null}
        </div>
      ) : null}
      {by ? (
        <label className="grid gap-1.5"><span style={lab}>Where they trained</span>
          <select value={where} onChange={(e) => setWhere(e.target.value)} style={input}>
            <option value="">Pick a state or country</option>
            {PLACES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
      ) : null}
      <button type="button" disabled={saving} onClick={saveTraining} className="ppg-btn ppg-btn-primary" style={{ justifySelf: "start" }}>{saving ? "Saving…" : "Save training"}</button>

      {isDog ? (
        <div className="rounded-2xl p-4 grid gap-3" style={{ background: "#ECF6F4", border: "1.5px solid #9FD3CA" }}>
          {pet.service_attested_at ? (
            <>
              <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, color: "#0F5E58" }}>✓ Service dog statement signed {fmt(pet.service_attested_at)}</div>
              {t.tasks?.length ? <p style={hint}><b style={{ color: tokens.navy }}>Tasks:</b> {tasksLine(t.tasks)}</p> : null}
              <label className="flex items-start gap-2" style={{ ...hint, color: tokens.ink }}>
                <input type="checkbox" checked={showTasks} onChange={async (e) => { const v = e.target.checked; setShowTasks(v); const { error } = await supabase.from("pets").update({ training: { ...t, show_tasks: v } }).eq("id", pet.id); if (error) setShowTasks(!v); else { pingSaved(); onChanged?.(); } }} style={{ width: 18, height: 18, marginTop: 2 }} />
                <span>Show training details (who trained {name}, where, and the type of tasks) on the passport and at the gate. When it&apos;s off, they only see &quot;Service dog, handler statement signed.&quot;</span>
              </label>
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
                  <p style={hint}>With Pet Vault, we fill this form in from {name}&apos;s passport for every trip. <a href="/join" style={{ color: tokens.navy, fontWeight: 700 }}>Unlock it</a>.</p>
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
              <p style={hint}>Tell us what {name} is trained to do and sign a short statement. The passport then shows &quot;Service dog, handler statement signed.&quot;</p>
              <button type="button" onClick={() => setSigning(true)} className="ppg-btn ppg-btn-primary" style={{ justifySelf: "start" }}>Start the statement</button>
            </>
          ) : null}

          {signing ? (
            <form onSubmit={sign} className="grid gap-4">
              <div className="grid gap-2">
                <span style={lab}>What is {name} trained to do?</span>
                <span style={hint}>Pick every task. Only the type (for example &quot;Psychiatric tasks&quot;) can show on the passport.</span>
                {TASK_GROUPS.map((g) => (
                  <div key={g.key} className="grid gap-1.5">
                    <span style={{ ...hint, fontWeight: 800, color: tokens.navy }}>{g.label.replace(/ tasks$/, "")}</span>
                    <div className="flex flex-wrap gap-2">{g.tasks.map(([k, l]) => <Chip key={k} on={tasks.includes(k)} onClick={() => toggle(tasks, setTasks, k)}>{l}</Chip>)}</div>
                  </div>
                ))}
                <label className="flex items-center gap-2" style={{ ...hint, color: tokens.ink }}>
                  <input type="checkbox" checked={showTasks} onChange={(e) => setShowTasks(e.target.checked)} style={{ width: 18, height: 18 }} />
                  Show training details on the passport and at the gate (off keeps them private)
                </label>
              </div>
              {!by ? <p role="alert" style={{ ...hint, color: tokens.stamp, fontWeight: 700 }}>Pick who trained {name} above first.</p> : trainerMissing ? <p role="alert" style={{ ...hint, color: tokens.stamp, fontWeight: 700 }}>Add the trainer&apos;s name or business above first.</p> : null}
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
                <button type="submit" disabled={busy || !agree || !by || trainerMissing || !!trainerErr || !tasks.length} className="ppg-btn ppg-btn-primary">{busy ? "Signing…" : "Sign statement"}</button>
                <button type="button" onClick={() => setSigning(false)} style={{ fontFamily: font.body, fontWeight: 700, color: tokens.muted, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
              </div>
            </form>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
