"use client";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "../../../components/SiteHeader";
import BusinessAuth, { useBusinessUser } from "../../../components/discover/BusinessAuth";
import BusinessProfile from "../../../components/discover/BusinessProfile";
import Icon from "../../../components/Icon";
import { supabase } from "../../../lib/supabaseClient";
import { tokens, font } from "../../../lib/theme";
import { CATEGORIES, STATES, slugify, photoUrl } from "../../../lib/discover";

const EMPTY = {
  name: "", category: "", subcategories: [], tagline: "", description: "", pet_policy: "",
  address: "", city: "", state: "", zip: "", online_only: false, service_area: "",
  phone: "", email: "", website: "", booking_url: "", hours: "", photos: [],
};
const FIELDS = Object.keys(EMPTY);

// Shrink big phone photos before upload (max 1600px, JPEG).
async function shrink(file) {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((res) => c.toBlob((b) => res(b || file), "image/jpeg", 0.85));
  } catch { return file; }
}

function Label({ children, hint }) {
  return (
    <div className="mb-1.5">
      <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, color: tokens.navy }}>{children}</span>
      {hint && <span style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}> · {hint}</span>}
    </div>
  );
}

export default function ListingPage() {
  const user = useBusinessUser();
  const [id, setId] = useState(null);
  const [f, setF] = useState(EMPTY);
  const [cats, setCats] = useState([]);
  const [status, setStatus] = useState(null);
  const [note, setNote] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    supabase.from("business_categories").select("slug,name,short_name,icon,subcategories").order("sort").then(({ data }) => setCats(data || []));
  }, []);

  useEffect(() => {
    if (!user) return;
    const want = new URLSearchParams(window.location.search).get("id");
    if (!want) return;
    supabase.from("businesses").select("*").eq("id", want).maybeSingle().then(({ data }) => {
      if (!data) return;
      setId(data.id); setStatus(data.status); setNote(data.review_note || "");
      const next = {}; for (const k of FIELDS) next[k] = data[k] ?? EMPTY[k];
      setF(next); setConfirm(!!data.confirmed_by_business_at);
    });
  }, [user]);

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const cat = cats.find((c) => c.slug === f.category) || CATEGORIES.find((c) => c.slug === f.category);
  const subs = cats.find((c) => c.slug === f.category)?.subcategories || [];
  const preview = useMemo(() => ({ ...f, plan: "free", confirmed_by_business_at: confirm ? new Date().toISOString() : null, checked_by_petpassgo_at: null, name: f.name || "Your business name", city: f.city || "Your city", state: f.state || "—" }), [f, confirm]);

  async function addPhotos(files) {
    if (!user) return;
    const room = 3 - f.photos.length;
    const list = [...files].filter((x) => /^image\/(jpeg|png|webp|heic|heif)$/i.test(x.type) || /\.(jpe?g|png|webp|heic)$/i.test(x.name)).slice(0, room);
    if (!list.length) return;
    setUploading(true); setMsg("");
    const added = [];
    for (const file of list) {
      const blob = await shrink(file);
      const path = `${user.id}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.jpg`;
      const { error } = await supabase.storage.from("business-photos").upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (error) { setMsg(`A photo didn't upload: ${error.message}`); continue; }
      added.push(path);
    }
    setF((x) => ({ ...x, photos: [...x.photos, ...added].slice(0, 3) }));
    setUploading(false);
  }

  function movePhoto(i, d) {
    setF((x) => { const p = [...x.photos]; const j = i + d; if (j < 0 || j >= p.length) return x; [p[i], p[j]] = [p[j], p[i]]; return { ...x, photos: p }; });
  }

  async function save(e) {
    e.preventDefault();
    setMsg("");
    if (!f.name.trim() || !f.category || !f.state || (!f.online_only && !f.city.trim())) { setMsg("Add your business name, category, state and city."); return; }
    if (!f.phone.trim() && !f.website.trim() && !f.email.trim()) { setMsg("Add at least one way to reach you: phone, website or email."); return; }
    if (!confirm) { setMsg("Please confirm the details are accurate and that you can list this business."); return; }
    setBusy(true);
    const row = {};
    for (const k of FIELDS) row[k] = typeof f[k] === "string" ? f[k].trim() || null : f[k];
    row.name = f.name.trim(); row.city = f.online_only && !f.city.trim() ? "Online" : f.city.trim(); row.state = f.state;
    row.confirmed_by_business_at = new Date().toISOString();
    row.status = "pending";
    let error;
    if (id) ({ error } = await supabase.from("businesses").update(row).eq("id", id));
    else {
      const res = await supabase.from("businesses").insert({ ...row, owner_user_id: user.id, slug: slugify(row.name, row.city) }).select("id").single();
      error = res.error; if (res.data) setId(res.data.id);
    }
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    fetch("/api/business/notify", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": (await supabase.auth.getSession()).data?.session?.access_token || "" }, body: JSON.stringify({ name: row.name }) }).catch(() => {});
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const input = { fontFamily: font.body, fontSize: 16, color: tokens.ink, border: `1.5px solid ${tokens.line}`, borderRadius: 14, padding: "12px 14px", width: "100%", outline: "none", background: "#fff" };
  const card = { background: "#fff", border: `1px solid ${tokens.line}` };

  if (user === undefined) return <div style={{ background: tokens.sky, minHeight: "100vh" }}><SiteHeader /></div>;
  if (!user) return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="px-4 py-10 md:py-16"><BusinessAuth /></main>
    </div>
  );

  if (done) return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[640px] mx-auto px-4 py-12 text-center">
        <div className="mx-auto rounded-full flex items-center justify-center" style={{ width: 72, height: 72, background: "#E5F4EE", color: tokens.green }}><Icon name="checkCircle" size={36} /></div>
        <h1 style={{ fontFamily: font.display, fontSize: 34, fontWeight: 800, color: tokens.navy }} className="mt-5">Thanks! Your listing is in review.</h1>
        <p style={{ fontFamily: font.body, fontSize: 17, color: tokens.ink, lineHeight: 1.55 }} className="mt-3">PetPassGo checks every listing before it goes live, usually within 2 business days. We&apos;ll email you when it&apos;s published.</p>
        <div className="flex flex-wrap justify-center gap-3 mt-7">
          <a href="/business/dashboard" className="rounded-full px-6 py-3" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>Go to my dashboard</a>
          <button type="button" onClick={() => { setDone(false); setShowPreview(true); }} className="rounded-full px-6 py-3" style={{ background: "#fff", border: `1.5px solid ${tokens.navy}`, color: tokens.navy, fontFamily: font.body, fontWeight: 700, cursor: "pointer" }}>See my preview</button>
        </div>
      </main>
    </div>
  );

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 md:py-10">
        <a href="/business/dashboard" style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.navy, fontWeight: 600 }}>← Business dashboard</a>
        <h1 style={{ fontFamily: font.display, fontSize: 34, fontWeight: 800, color: tokens.navy, lineHeight: 1.1 }} className="mt-3">{id ? "Edit your listing" : "Create your free listing"}</h1>
        <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.muted }} className="mt-1">Pet owners see this in Discover. Clear photos and a specific pet policy make the biggest difference.</p>
        {note && status === "changes_requested" && <div className="rounded-2xl p-4 mt-4" style={{ background: "#FFF8EC", border: "1px solid #F1D49B", fontFamily: font.body, fontSize: 15, color: "#7A4F00" }}><b>PetPassGo asked for a change:</b> {note}</div>}
        {status === "published" && <div className="rounded-2xl p-4 mt-4" style={{ background: tokens.sky, border: `1px solid ${tokens.line}`, fontFamily: font.body, fontSize: 15, color: tokens.ink }}>Your listing is live. If you save changes, it goes back for a quick re-check and is hidden until it's approved again, usually within 2 business days.</div>}

        <div className="lg:hidden mt-5">
          <button type="button" onClick={() => setShowPreview((v) => !v)} className="rounded-full px-5 py-2.5" style={{ background: "#fff", border: `1.5px solid ${tokens.navy}`, color: tokens.navy, fontFamily: font.body, fontWeight: 700, cursor: "pointer" }}>{showPreview ? "Back to the form" : "Preview my listing"}</button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] mt-6 items-start">
          <form onSubmit={save} className={`flex flex-col gap-5 ${showPreview ? "hidden lg:flex" : ""}`}>
            <section className="rounded-3xl p-5 md:p-6 flex flex-col gap-4" style={card}>
              <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800, color: tokens.navy }}>The basics</div>
              <div><Label>Business name</Label><input value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={90} style={input} required /></div>
              <div>
                <Label>Category</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(cats.length ? cats : CATEGORIES).map((c) => {
                    const on = f.category === c.slug;
                    return (
                      <button key={c.slug} type="button" onClick={() => setF((x) => ({ ...x, category: c.slug, subcategories: x.category === c.slug ? x.subcategories : [] }))} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left"
                        style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 700, cursor: "pointer", background: on ? tokens.navy : "#fff", color: on ? "#fff" : tokens.navy, border: `1.5px solid ${on ? tokens.navy : tokens.line}` }}>
                        <Icon name={c.icon} size={18} />{c.short_name}
                      </button>
                    );
                  })}
                </div>
              </div>
              {subs.length > 0 && (
                <div>
                  <Label hint="pick any that fit">What you offer</Label>
                  <div className="flex flex-wrap gap-2">
                    {subs.map((s) => {
                      const on = f.subcategories.includes(s);
                      return <button key={s} type="button" onClick={() => set("subcategories", on ? f.subcategories.filter((x) => x !== s) : [...f.subcategories, s].slice(0, 6))} className="rounded-full px-3.5 py-2" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, cursor: "pointer", background: on ? "#FDE8E2" : "#fff", color: on ? tokens.primary : tokens.navy, border: `1.5px solid ${on ? tokens.primary : tokens.line}` }}>{s}</button>;
                    })}
                  </div>
                </div>
              )}
              <div><Label hint="one line, up to 90 characters">Tagline</Label><input value={f.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={90} placeholder={cat ? `e.g. Friendly ${cat.short_name.toLowerCase()} for dogs and cats` : ""} style={input} /></div>
              <div><Label hint={`${f.description.length}/1200`}>About your business</Label><textarea value={f.description} onChange={(e) => set("description", e.target.value)} maxLength={1200} rows={5} style={{ ...input, resize: "vertical" }} /></div>
              <div><Label hint="what pets are welcome, sizes, fees, rules">Pet policy</Label><textarea value={f.pet_policy} onChange={(e) => set("pet_policy", e.target.value)} maxLength={600} rows={3} placeholder="e.g. Dogs of all sizes welcome on the patio. Water bowls provided. Please keep pets leashed." style={{ ...input, resize: "vertical" }} /></div>
            </section>

            <section className="rounded-3xl p-5 md:p-6 flex flex-col gap-4" style={card}>
              <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800, color: tokens.navy }}>Photos <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: tokens.muted }}>· up to 3</span></div>
              <div className="grid grid-cols-3 gap-2">
                {f.photos.map((p, i) => (
                  <div key={p} className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "4 / 3", background: tokens.sky }}>
                    <img src={photoUrl(p)} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute left-2 top-2 rounded-full px-2 py-0.5" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontSize: 11, fontWeight: 700 }}>Cover</span>}
                    <div className="absolute right-1.5 bottom-1.5 flex gap-1">
                      {i > 0 && <button type="button" onClick={() => movePhoto(i, -1)} aria-label="Move left" className="rounded-full" style={{ width: 28, height: 28, background: "#fff", border: "none", cursor: "pointer" }}>←</button>}
                      <button type="button" onClick={() => set("photos", f.photos.filter((x) => x !== p))} aria-label="Remove photo" className="rounded-full flex items-center justify-center" style={{ width: 28, height: 28, background: "#fff", border: "none", cursor: "pointer", color: tokens.navy }}><Icon name="x" size={15} /></button>
                    </div>
                  </div>
                ))}
                {f.photos.length < 3 && (
                  <label className="rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer" style={{ aspectRatio: "4 / 3", border: `2px dashed ${tokens.line}`, color: tokens.navy, fontFamily: font.body, fontSize: 13.5, fontWeight: 700 }}>
                    <Icon name="camera" size={22} />{uploading ? "Uploading…" : "Add photo"}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} disabled={uploading} />
                  </label>
                )}
              </div>
              <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>Bright, real photos of your space, team or pets you care for work best. Only upload photos you own or have permission to use.</p>
            </section>

            <section className="rounded-3xl p-5 md:p-6 flex flex-col gap-4" style={card}>
              <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800, color: tokens.navy }}>Where you are</div>
              <label className="flex items-center gap-2.5" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>
                <input type="checkbox" checked={f.online_only} onChange={(e) => set("online_only", e.target.checked)} style={{ width: 18, height: 18 }} /> We&apos;re online only (no storefront)
              </label>
              {!f.online_only && <div><Label>Street address</Label><input value={f.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" style={input} /></div>}
              <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)] gap-2">
                <div><Label>City</Label><input value={f.city} onChange={(e) => set("city", e.target.value)} style={input} required={!f.online_only} /></div>
                <div><Label>State</Label>
                  <select value={f.state} onChange={(e) => set("state", e.target.value)} style={input} required>
                    <option value="">—</option>{STATES.map(([c]) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><Label>ZIP</Label><input value={f.zip} onChange={(e) => set("zip", e.target.value.replace(/[^\d-]/g, "").slice(0, 10))} inputMode="numeric" style={input} /></div>
              </div>
              <div><Label hint="for mobile services, sitters and delivery">Service area</Label><input value={f.service_area} onChange={(e) => set("service_area", e.target.value)} placeholder="e.g. All of San Diego County" style={input} /></div>
            </section>

            <section className="rounded-3xl p-5 md:p-6 flex flex-col gap-4" style={card}>
              <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800, color: tokens.navy }}>How to reach you</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Phone</Label><input value={f.phone} onChange={(e) => set("phone", e.target.value)} type="tel" autoComplete="tel" style={input} /></div>
                <div><Label>Email</Label><input value={f.email} onChange={(e) => set("email", e.target.value)} type="email" style={input} /></div>
                <div><Label>Website</Label><input value={f.website} onChange={(e) => set("website", e.target.value)} placeholder="yourbusiness.com" style={input} /></div>
                <div><Label>Booking link</Label><input value={f.booking_url} onChange={(e) => set("booking_url", e.target.value)} placeholder="optional" style={input} /></div>
              </div>
              <div><Label>Hours</Label><textarea value={f.hours} onChange={(e) => set("hours", e.target.value)} rows={3} placeholder={"Mon–Fri 8am–6pm\nSat 9am–2pm\nSun closed"} style={{ ...input, resize: "vertical" }} /></div>
            </section>

            <label className="flex gap-3 rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${confirm ? tokens.green : tokens.line}`, fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.5, cursor: "pointer" }}>
              <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }} />
              <span>I confirm these details are accurate, I&apos;m allowed to list this business, and I&apos;ll keep the pet policy and hours up to date.</span>
            </label>
            {msg && <div className="rounded-2xl px-4 py-3" style={{ background: "#FFF1EE", border: "1px solid #F2B8A8", fontFamily: font.body, fontSize: 15, color: "#B4321C" }}>{msg}</div>}
            <button type="submit" disabled={busy || uploading} className="rounded-full py-4" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 17, border: "none", cursor: "pointer", opacity: busy || uploading ? 0.7 : 1 }}>
              {busy ? "Saving…" : id ? "Save and send for review" : "Submit my free listing"}
            </button>
            <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted, textAlign: "center" }}>PetPassGo reviews every listing before it goes live.</p>
          </form>

          <div className={`lg:sticky lg:top-6 ${showPreview ? "" : "hidden lg:block"}`}>
            <div style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 800, letterSpacing: "0.14em", color: tokens.muted }} className="mb-2">LIVE PREVIEW</div>
            <BusinessProfile b={preview} preview />
          </div>
        </div>
      </main>
    </div>
  );
}
