"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SiteHeader from "../../../components/SiteHeader";
import CommunityNotice from "../../../components/CommunityNotice";
import CommunityPaywall from "../../../components/CommunityPaywall";
import WinBack from "../../../components/WinBack";
import { lapsedPreview } from "../../../lib/access";
import { supabase } from "../../../lib/supabaseClient";
import { BOARDS, boardBySlug, textProblem, friendly, formatPostWhen, POST_TYPES, LOST_POST_TYPES, postTypeLabel } from "../../../lib/community";
import { US_STATES, stateName, titleCase, visitorArea } from "../../../lib/places";
import { tokens, font } from "../../../lib/theme";
import CommunityPetChip from "../../../components/CommunityPetChip";

const input = { fontFamily: font.body, fontSize: 15.5, border: `2px solid ${tokens.line}`, background: "#fff" };

function DisplayNameSetup({ onDone }) {
  const [name, setName] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault(); setBusy(true); setErr("");
    const { data, error } = await supabase.rpc("set_community_display_name", { name });
    setBusy(false); if (error) setErr(friendly(error)); else onDone(data);
  }
  return (
    <form onSubmit={save} className="rounded-2xl p-5 mb-6" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: tokens.navy }} className="mb-1">Pick a display name to post</div>
      <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mb-3">Shown on your posts instead of your email. 3–24 characters.</p>
      <div className="flex gap-2 flex-wrap">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="e.g. BiscuitsHuman" className="rounded-lg px-3 py-2 flex-1 min-w-[200px]" style={input} aria-label="Display name" />
        <button disabled={busy} className="rounded-full px-5 py-2" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 600 }}>{busy ? "Saving…" : "Save"}</button>
      </div>
      {err && <div role="alert" className="mt-2" style={{ fontFamily: font.body, fontSize: 14, color: tokens.primary }}>{err}</div>}
    </form>
  );
}


function Composer({ board, parentId, lostPets, myPets, profilePet, setProfilePet, defaultPet, onPosted, compact, area }) {
  const lostBoard = board === "lost-and-found";
  const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [petId, setPetId] = useState(defaultPet || "");
  const [postType, setPostType] = useState(lostBoard ? "found" : "tip");
  const [st, setSt] = useState(area?.state && area.state !== "all" ? area.state : "");
  const [city, setCity] = useState(area?.city && area.city !== "all" ? area.city : "");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setErr("");
    const p = textProblem(body) || textProblem(title); if (p) return setErr(p);
    if (!parentId && !postType) return setErr("Choose a post type.");
    if (lostBoard && !parentId && (!st || !city.trim())) return setErr("Add the city and state so people looking in that place see it.");
    setBusy(true);
    const { error } = lostBoard && !parentId ? await supabase.rpc("create_community_post_local", {
      board, body, title, post_type: postType, lost_state: st, lost_city: city.trim(), pet_id: petId || null,
    }) : await supabase.rpc("create_community_post", {
      board,
      body,
      title: parentId ? null : title,
      parent_id: parentId || null,
      pet_id: petId || null,
      post_type: parentId ? null : postType,
      profile_pet_id: profilePet || null,
    });
    setBusy(false);
    if (error) return setErr(friendly(error));
    setTitle(""); setBody(""); setPetId(""); onPosted();
  }
  return (
    <form onSubmit={submit} className={compact ? "mt-3" : "rounded-2xl p-5 mb-8"} style={compact ? {} : { background: "#fff", border: `1px solid ${tokens.line}` }}>
      {!parentId && (
        <div className="flex flex-wrap gap-2 mb-3">
          {(lostBoard ? LOST_POST_TYPES : POST_TYPES).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setPostType(t.id)}
              className="rounded-full px-3 py-1.5"
              style={{
                fontFamily: font.body,
                fontSize: 13.5,
                fontWeight: 600,
                border: `2px solid ${postType === t.id ? tokens.navy : tokens.line}`,
                background: postType === t.id ? tokens.navy : "#fff",
                color: postType === t.id ? "#fff" : tokens.navy,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      {!parentId && <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder={lostBoard ? (postType === "found" ? "e.g. Found: brown beagle near Balboa Park" : "e.g. Milo lost, help locate Milo") : "Your tip or question, in one line"} className="w-full rounded-lg px-3 py-2 mb-2" style={input} aria-label="Title" />}
      {lostBoard && !parentId && (
        <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: "1fr 110px" }}>
          <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} placeholder="City" aria-label="City" className="rounded-lg px-3 py-2" style={input} />
          <select value={st} onChange={(e) => setSt(e.target.value)} aria-label="State" className="rounded-lg px-2 py-2" style={input}>
            <option value="">State</option>
            {US_STATES.map(([c]) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}
      <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} rows={compact ? 2 : 4} placeholder={parentId ? "Write a reply…" : "Share the details. No links, emails or phone numbers."} className="w-full rounded-lg px-3 py-2" style={input} aria-label={parentId ? "Reply" : "Post"} />
      {myPets?.length > 0 && (
        <label className="flex items-center gap-2 mt-2 flex-wrap" style={{ fontFamily: font.body, fontSize: 15, color: tokens.navy }}>
          Show this pet on the post
          <select value={profilePet || ""} onChange={(e) => setProfilePet(e.target.value)} className="rounded-lg px-2 py-1" style={input} aria-label="Pet shown on the post">
            {myPets.map((p) => <option key={p.id} value={p.id}>{p.name}{p.breed ? ` · ${p.breed}` : ""}</option>)}
          </select>
        </label>
      )}
      {board === "lost-and-found" && !parentId && lostPets.length > 0 && (
        <label className="flex items-center gap-2 mt-2" style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.navy }}>
          Link my lost pet's poster:
          <select value={petId} onChange={(e) => setPetId(e.target.value)} className="rounded-lg px-2 py-1" style={input}>
            <option value="">None</option>
            {lostPets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      )}
      {err && <div role="alert" className="mt-2" style={{ fontFamily: font.body, fontSize: 14, color: tokens.primary }}>{err}</div>}
      <button disabled={busy || !body.trim()} className="rounded-full px-5 py-2 mt-2" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 600, fontSize: 14.5, opacity: busy || !body.trim() ? 0.6 : 1 }}>
        {busy ? "Posting…" : parentId ? "Reply" : "Post"}
      </button>
    </form>
  );
}

function PostActions({ post, mine, isMod, onChange }) {
  const [msg, setMsg] = useState("");
  const btn = { fontFamily: font.body, fontSize: 13, color: tokens.muted, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" };
  async function report() {
    const reason = prompt("Why are you reporting this post? (optional)");
    if (reason === null) return;
    const { error } = await supabase.rpc("report_community_post", { post_id: post.id, reason });
    setMsg(error ? friendly(error) : "Thanks, we'll take a look.");
  }
  async function mod(action) {
    if (action === "delete" && !confirm("Delete this post permanently?")) return;
    const { error } = await supabase.rpc("moderate_community_post", { post_id: post.id, action }); if (error) setMsg(friendly(error)); else onChange();
  }
  async function delMine() {
    if (!confirm("Delete your post?")) return;
    const { error } = await supabase.rpc("delete_my_community_post", { post_id: post.id }); if (error) setMsg(friendly(error)); else onChange();
  }
  return (
    <div className="flex gap-4 items-center mt-2 flex-wrap">
      {!mine && <button style={btn} onClick={report}>Report</button>}
      {mine && <button style={btn} onClick={delMine}>Delete</button>}
      {isMod && (post.is_hidden
        ? <button style={{ ...btn, color: tokens.green }} onClick={() => mod("unhide")}>Unhide</button>
        : <button style={{ ...btn, color: tokens.primary }} onClick={() => mod("hide")}>Hide</button>)}
      {isMod && <button style={{ ...btn, color: tokens.primary }} onClick={() => mod("delete")}>Delete (mod)</button>}
      {msg && <span style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>{msg}</span>}
    </div>
  );
}

export default function BoardPage() {
  const { board: slug } = useParams();
  const search = useSearchParams();
  const board = boardBySlug(slug);
  const [session, setSession] = useState(undefined);
  const [displayName, setDisplayName] = useState(null);
  const [posts, setPosts] = useState([]);
  const [mine, setMine] = useState(new Set());
  const [stillLost, setStillLost] = useState(new Set());
  const [isMod, setIsMod] = useState(false);
  const [lostPets, setLostPets] = useState([]);
  const [myPets, setMyPets] = useState([]);
  const [profilePet, setProfilePet] = useState("");
  const [petChips, setPetChips] = useState({});
  const [openReply, setOpenReply] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canRead, setCanRead] = useState(null);
  const [canPost, setCanPost] = useState(false);
  const [recentOnly, setRecentOnly] = useState(false);
  const isLost = slug === "lost-and-found";
  const [area, setArea] = useState({ state: "", city: "all", ready: false });
  useEffect(() => {
    if (!isLost) return;
    const qs = search.get("state"); const qc = search.get("city");
    if (qs) return setArea({ state: qs.toUpperCase(), city: qc ? titleCase(qc) : "all", ready: true });
    let saved = null; try { saved = JSON.parse(localStorage.getItem("ppg_lf_area") || "null"); } catch {}
    if (saved?.state) return setArea({ ...saved, ready: true });
    visitorArea().then((g) => setArea({ state: g?.state || "all", city: g?.state && g?.city ? titleCase(g.city) : "all", ready: true }));
  }, [isLost]);
  function chooseArea(next) {
    setArea({ ...next, ready: true });
    try { localStorage.setItem("ppg_lf_area", JSON.stringify({ state: next.state, city: next.city })); } catch {}
  }

  async function load() {
    const { data } = await supabase
      .from("community_posts")
      .select("id,board,parent_id,author_name,title,body,pet_id,is_hidden,created_at,post_type,lost_state,lost_city")
      .eq("board", slug)
      .order("created_at", { ascending: false })
      .limit(300);
    const rows = data || []; setPosts(rows); setLoading(false);
    const ids = rows.map((r) => r.id);
    if (ids.length) supabase.rpc("my_community_post_ids", { ids }).then(({ data: m }) => setMine(new Set((m || []).map((x) => (typeof x === "string" ? x : Object.values(x)[0])))));
    if (ids.length) supabase.rpc("community_post_pets", { ids }).then(({ data: chips }) => {
      const map = {};
      (chips || []).forEach((c) => { map[c.post_id] = c; });
      setPetChips(map);
    });
    const petIds = [...new Set(rows.map((r) => r.pet_id).filter(Boolean))];
    if (petIds.length) supabase.rpc("community_pets_still_lost", { ids: petIds }).then(({ data: l }) => setStillLost(new Set((l || []).map((x) => (typeof x === "string" ? x : Object.values(x)[0])))));
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data?.session || null; setSession(s);
      if (!s) { setLoading(false); setCanRead(false); setCanPost(false); return; }
      const { data: ok } = await supabase.rpc("can_use_community");
      const postOk = !!ok && !lapsedPreview();
      setCanRead(postOk);
      setCanPost(postOk);
      if (!postOk) { setLoading(false); return; }
      load();
      if (postOk) {
        supabase.from("community_profiles").select("display_name").maybeSingle().then(({ data: p }) => setDisplayName(p?.display_name || ""));
        supabase.from("pets").select("id,name,breed,animal_type").order("created_at", { ascending: true }).then(({ data: minePets }) => {
          const list = minePets || [];
          setMyPets(list);
          setProfilePet((cur) => cur || list[0]?.id || "");
        });
        supabase.rpc("is_community_moderator").then(({ data: m }) => setIsMod(!!m));
        if (slug === "lost-and-found") {
          const { data: reps } = await supabase.from("pet_lost_reports").select("pet_id").eq("status", "lost");
          const ids = (reps || []).map((r) => r.pet_id);
          if (ids.length) { const { data: pets } = await supabase.from("pets").select("id,name").in("id", ids); setLostPets(pets || []); }
        }
      } else {
        setLoading(false);
      }
    });
  }, [slug]);

  const threads = useMemo(() => {
    const cutoff = recentOnly ? Date.now() - 90 * 86400000 : 0;
    const inArea = (p) => !isLost || area.state === "all" || !area.state || (p.lost_state === area.state && (area.city === "all" || p.lost_city === area.city));
    const top = posts.filter((p) => !p.parent_id && inArea(p) && (!recentOnly || new Date(p.created_at).getTime() >= cutoff));
    const replies = posts.filter((p) => p.parent_id).sort((a, b) => a.created_at.localeCompare(b.created_at));
    return top.map((t) => ({ ...t, replies: replies.filter((r) => r.parent_id === t.id) }));
  }, [posts, recentOnly, area, isLost]);
  const citiesInState = useMemo(() => {
    const set = new Set(posts.filter((p) => !p.parent_id && p.lost_state === area.state && p.lost_city).map((p) => p.lost_city));
    if (area.city && area.city !== "all") set.add(area.city);
    return [...set].sort();
  }, [posts, area.state, area.city]);

  if (!board) return (<><SiteHeader /><main className="max-w-3xl mx-auto px-6 py-16" style={{ fontFamily: font.body }}>That board doesn't exist. <a href="/community" style={{ color: tokens.navy, fontWeight: 600 }}>See all boards</a></main></>);

  const Post = ({ p, reply }) => (
    <div style={{ opacity: p.is_hidden ? 0.5 : 1 }}>
      <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mb-2 flex flex-wrap items-center gap-2">
        {petChips[p.id] ? <CommunityPetChip pet={petChips[p.id]} /> : null}
        <strong style={{ color: tokens.navy }}>{p.author_name}</strong>
        {!reply && isLost && (p.lost_city || p.lost_state) && <span style={{ fontWeight: 700, color: tokens.navy }}>{[p.lost_city, p.lost_state].filter(Boolean).join(", ")}</span>}
        {!reply && p.post_type && (
          <span className="rounded-full px-2 py-0.5" style={{ background: p.post_type === "lost" ? tokens.primary : tokens.sky, color: p.post_type === "lost" ? "#fff" : tokens.navy, fontSize: 12, fontWeight: 700 }}>{postTypeLabel(p.post_type)}</span>
        )}
        <span>· {formatPostWhen(p.created_at)}</span>
        {p.is_hidden && " · HIDDEN"}
      </div>
      {!reply && <h2 style={{ fontFamily: font.display, fontSize: 21, fontWeight: 700, color: tokens.navy }} className="mb-1">{p.title}</h2>}
      <p style={{ fontFamily: font.body, fontSize: reply ? 15 : 16, color: tokens.ink, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{p.body}</p>
      {p.pet_id && (
        <a href={`/id/${p.pet_id}`} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mt-3" style={{ background: stillLost.has(p.pet_id) ? tokens.primary : tokens.green, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
          {stillLost.has(p.pet_id) ? "Still lost: see poster & message owner" : "Reunited"}
        </a>
      )}
      {canPost && <PostActions post={p} mine={mine.has(p.id)} isMod={isMod} onChange={load} />}
    </div>
  );

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[860px] mx-auto px-6 py-12">
        <a href="/community" style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.navy }}>← All boards</a>

        {!isLost && <div className="flex flex-wrap gap-2 mt-4 mb-5 overflow-x-auto">
          {BOARDS.filter((b) => b.airline).map((b) => (
            <a
              key={b.slug}
              href={`/community/${b.slug}`}
              className="rounded-full px-3 py-1.5 whitespace-nowrap"
              style={{
                fontFamily: font.body,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                background: b.slug === slug ? tokens.navy : "#fff",
                color: b.slug === slug ? "#fff" : tokens.navy,
                border: `1px solid ${b.slug === slug ? tokens.navy : tokens.line}`,
              }}
            >
              {b.name}
            </a>
          ))}
          <a
            href="/community/lost-and-found"
            className="rounded-full px-3 py-1.5 whitespace-nowrap"
            style={{
              fontFamily: font.body,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              background: slug === "lost-and-found" ? tokens.navy : "#fff",
              color: slug === "lost-and-found" ? "#fff" : tokens.navy,
              border: `1px solid ${slug === "lost-and-found" ? tokens.navy : tokens.line}`,
            }}
          >
            Lost & found
          </a>
        </div>}

        <h1 style={{ fontFamily: font.display, fontSize: 38, fontWeight: 700, color: tokens.navy }} className="mt-1 mb-2">{board.name}</h1>
        <p style={{ fontFamily: font.body, fontSize: 17, color: tokens.muted }} className="mb-4">{board.blurb}</p>
        <CommunityNotice />

        {canRead === false && <CommunityPaywall />}
        {canPost && lapsedPreview() && <WinBack area="community" />}

        {canPost && displayName === "" && <DisplayNameSetup onDone={setDisplayName} />}
        {isLost && canRead && area.ready && (
          <div data-lf-filter className="rounded-2xl p-3 mb-4 grid gap-2" style={{ background: "#fff", border: `1px solid ${tokens.line}`, gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
            <label style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 700, color: tokens.muted, display: "grid", gap: 4, minWidth: 0 }}>STATE
              <select value={area.state || "all"} onChange={(e) => chooseArea({ state: e.target.value, city: "all" })} className="rounded-lg px-2 py-2 w-full" style={{ ...input, minWidth: 0 }}>
                <option value="all">All states</option>
                {US_STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
              </select>
            </label>
            <label style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 700, color: tokens.muted, display: "grid", gap: 4, minWidth: 0 }}>CITY
              <select disabled={!area.state || area.state === "all"} value={area.city || "all"} onChange={(e) => chooseArea({ state: area.state, city: e.target.value })} className="rounded-lg px-2 py-2 w-full" style={{ ...input, minWidth: 0 }}>
                <option value="all">{area.state && area.state !== "all" ? `All cities in ${area.state}` : "Pick a state first"}</option>
                {citiesInState.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
        )}
        {canPost && displayName && <Composer key={`${area.state}-${area.city}`} board={slug} area={area} lostPets={lostPets} myPets={myPets} profilePet={profilePet} setProfilePet={setProfilePet} defaultPet={search.get("pet") || ""} onPosted={load} />}

        {canRead && (
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <label style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.navy, display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={recentOnly} onChange={(e) => setRecentOnly(e.target.checked)} />
              Recent only (last 90 days)
            </label>
            <span style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>Newest first</span>
          </div>
        )}

        {canRead && (loading ? <div style={{ fontFamily: font.body, color: tokens.muted }}>Loading…</div> : threads.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ background: "#fff", border: `1px dashed ${tokens.line}`, fontFamily: font.body, color: tokens.muted }}>
            {isLost && area.state && area.state !== "all" ? `No lost or found pets posted in ${area.city !== "all" ? area.city : stateName(area.state)}${recentOnly ? " in the last 90 days" : ""}.` : recentOnly ? "No posts in the last 90 days." : "No posts yet. Start the first thread."}
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((t) => (
              <article key={t.id} className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
                <Post p={t} />
                {t.replies.length > 0 && (
                  <div className="mt-4 pl-4 space-y-4" style={{ borderLeft: `3px solid ${tokens.line}` }}>
                    {t.replies.map((r) => <Post key={r.id} p={r} reply />)}
                  </div>
                )}
                {canPost && displayName && (openReply === t.id
                  ? <Composer board={slug} parentId={t.id} lostPets={[]} myPets={myPets} profilePet={profilePet} setProfilePet={setProfilePet} onPosted={() => { setOpenReply(null); load(); }} compact />
                  : <button onClick={() => setOpenReply(t.id)} className="mt-3" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: tokens.navy, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Reply</button>)}
              </article>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
