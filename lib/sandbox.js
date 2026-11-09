// Practice mode for preview builds only. Stands in for Supabase with sample data held
// in the browser (sessionStorage), so pages can be clicked through and tested without
// signing in. Nothing here ever reaches the real database.

const USER = { id: "sandbox-user", email: "sample@petpassgo.test", user_metadata: { full_name: "Sample Owner" } };
const KEY = "ppg-sandbox-db-v2";

const SAMPLE_PHOTO = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 360'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#FCD9A8'/><stop offset='1' stop-color='#F2B84B'/></linearGradient></defs><rect width='300' height='360' fill='url(#g)'/><ellipse cx='150' cy='215' rx='92' ry='80' fill='#8A5A2B'/><ellipse cx='72' cy='190' rx='30' ry='62' fill='#5E3B19' transform='rotate(18 72 190)'/><ellipse cx='228' cy='190' rx='30' ry='62' fill='#5E3B19' transform='rotate(-18 228 190)'/><ellipse cx='150' cy='250' rx='46' ry='34' fill='#C99260'/><circle cx='120' cy='200' r='9' fill='#1A1A1A'/><circle cx='180' cy='200' r='9' fill='#1A1A1A'/><ellipse cx='150' cy='238' rx='16' ry='11' fill='#1A1A1A'/><path d='M138 262 q12 12 24 0' stroke='#1A1A1A' stroke-width='4' fill='none' stroke-linecap='round'/></svg>`
);

function seed() {
  const now = new Date().toISOString();
  return {
    pets: [{
      id: "pet-biscuit", user_id: USER.id, name: "Biscuit", animal_type: "Dog", role: "Pet",
      breed: "Dachshund", sex: "Male", color: "Red", weight_lb: null, date_of_birth: "2021-04-12",
      photo_url: "sandbox/biscuit.jpg", microchip_number: "985112003456789",
      emergency_contact_name: "Sample Owner", emergency_contact_phone: "555-0100",
      vet_name: "Sample Vet Clinic", vet_phone: "555-0199", allergies: null, medications: null,
      about_bio: null, housing_notes: null, handler_name: "Sample Owner",
      passport_no: "PPG-000-0001", passport_issued_at: null, public_slug: "biscuit-sample",
      show_dob_on_public: true, show_weight_on_public: false, show_sex_on_public: true, show_color_on_public: true,
      show_about_on_public: true, show_medical_on_public: false, show_contact_on_public_id: true,
      show_documents_on_public: false, show_housing_on_public: false, show_travel_on_public: false,
      created_at: now, updated_at: now,
    }],
    pet_health_records: [
      { id: "h1", pet_id: "pet-biscuit", user_id: USER.id, kind: "vaccine", name: "Rabies", date_given: "2025-05-01", expires_on: "2028-05-01", clinic: "Sample Vet Clinic", notes: null, show_to_finder: false },
      { id: "h2", pet_id: "pet-biscuit", user_id: USER.id, kind: "vaccine", name: "DHPP", date_given: "2025-05-01", expires_on: "2026-12-01", clinic: "Sample Vet Clinic", notes: null, show_to_finder: false },
    ],
    pet_measurements: [], documents: [],
    trips: [{
      id: "trip-hawaii", user_id: USER.id, pet_id: "pet-biscuit", origin: "LAX", destination: "HNL", airline: "Alaska Airlines",
      travel_date: new Date(Date.now() + 21 * 864e5).toISOString().slice(0, 10), return_date: new Date(Date.now() + 28 * 864e5).toISOString().slice(0, 10),
      status: "paid", paid: true, paid_at: now, created_at: now, animal_type: "Dog", role: "Pet", pet_travel: "cabin", connecting: false, second_airline: null,
      flight_number: null, return_flight_number: null, details_first_viewed_at: null, service_kind: null,
    }], trip_requirement_status: [], pet_share_cards: [],
    pet_lost_reports: [], finder_messages: [], pet_scans: [], purchases: [], memberships: [], pet_activation: [],
  };
}

function load() {
  try { const s = sessionStorage.getItem(KEY); if (s) return JSON.parse(s); } catch {}
  return seed();
}

export function resetSandbox() {
  try { sessionStorage.removeItem(KEY); } catch {}
}

export function createSandboxClient() {
  const db = load();
  const blobs = {};
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(db)); } catch {} };
  let n = 0;
  const id = () => `sb-${Date.now().toString(36)}-${(n++).toString(36)}`;

  function query(table) {
    const st = { op: "select", filters: [], order: [], limit: null, single: null, payload: null };
    const cmp = (a, b) => String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true });
    const api = {
      select() { return api; },
      insert(p) { st.op = "insert"; st.payload = p; return api; },
      upsert(p) { st.op = "upsert"; st.payload = p; return api; },
      update(p) { st.op = "update"; st.payload = p; return api; },
      delete() { st.op = "delete"; return api; },
      eq(k, v) { st.filters.push((r) => String(r[k]) === String(v)); return api; },
      neq(k, v) { st.filters.push((r) => String(r[k]) !== String(v)); return api; },
      in(k, a) { const s = (a || []).map(String); st.filters.push((r) => s.includes(String(r[k]))); return api; },
      is(k, v) { st.filters.push((r) => (r[k] ?? null) === v); return api; },
      gt(k, v) { st.filters.push((r) => cmp(r[k], v) > 0); return api; },
      gte(k, v) { st.filters.push((r) => cmp(r[k], v) >= 0); return api; },
      lt(k, v) { st.filters.push((r) => cmp(r[k], v) < 0); return api; },
      lte(k, v) { st.filters.push((r) => cmp(r[k], v) <= 0); return api; },
      match(o) { Object.entries(o || {}).forEach(([k, v]) => api.eq(k, v)); return api; },
      order(k, o = {}) { st.order.push([k, o.ascending !== false]); return api; },
      limit(x) { st.limit = x; return api; },
      single() { st.single = "one"; return api; },
      maybeSingle() { st.single = "maybe"; return api; },
      then(res, rej) { return Promise.resolve().then(run).then(res, rej); },
    };
    for (const m of ["not", "or", "ilike", "like", "filter", "contains", "range", "returns", "abortSignal", "throwOnError", "csv"]) api[m] = () => api;

    function run() {
      const rows = (db[table] ||= []);
      const hit = (r) => st.filters.every((f) => f(r));
      const stamp = new Date().toISOString();
      let data;
      if (st.op === "insert" || st.op === "upsert") {
        const list = (Array.isArray(st.payload) ? st.payload : [st.payload]).map((p) => ({ id: id(), user_id: USER.id, created_at: stamp, uploaded_at: stamp, ...p }));
        list.forEach((r) => { const i = rows.findIndex((x) => x.id === r.id); if (i >= 0) rows[i] = { ...rows[i], ...r }; else rows.push(r); });
        data = list; save();
      } else if (st.op === "update") {
        data = rows.filter(hit);
        data.forEach((r) => Object.assign(r, st.payload, { updated_at: stamp }));
        save();
      } else if (st.op === "delete") {
        data = rows.filter(hit);
        db[table] = rows.filter((r) => !hit(r));
        save();
      } else {
        data = rows.filter(hit).map((r) => ({ ...r }));
        for (const [k, asc] of [...st.order].reverse()) data.sort((a, b) => (a[k] == null) - (b[k] == null) || (asc ? 1 : -1) * cmp(a[k], b[k]));
        if (st.limit != null) data = data.slice(0, st.limit);
      }
      if (st.single) {
        const one = data[0] || null;
        if (!one && st.single === "one") return { data: null, error: { message: "No rows" } };
        return { data: one, error: null };
      }
      return { data, error: null, count: data.length };
    }
    return api;
  }

  const session = { access_token: "sandbox", user: USER };
  return {
    from: (t) => query(t),
    rpc: async (name, args) => {
      if (name === "my_membership") return { data: true, error: null };
      if (name === "get_trip_requirements") {
        const t = (db.trips || []).find((x) => x.id === args?.p_trip_id) || {};
        const q = new URLSearchParams({ airline: t.airline || "Any", second: t.second_airline || "Any", animal: t.animal_type || "Dog", role: t.role || "Pet", types: (args?.p_trip_types || ["domestic"]).join(",") });
        try { const r = await fetch(`/api/sandbox/requirements?${q}`); return { data: r.ok ? await r.json() : [], error: null }; } catch { return { data: [], error: null }; }
      }
      return { data: null, error: null };
    },
    auth: {
      getSession: async () => ({ data: { session }, error: null }),
      getUser: async () => ({ data: { user: USER }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({ data: { user: USER }, error: null }),
    },
    storage: {
      from: () => ({
        upload: async (path, file) => { try { blobs[path] = URL.createObjectURL(file); } catch {} return { data: { path }, error: null }; },
        remove: async () => ({ data: [], error: null }),
        createSignedUrl: async (path) => ({ data: { signedUrl: blobs[path] || SAMPLE_PHOTO }, error: null }),
        createSignedUrls: async (paths) => ({ data: paths.map((p) => ({ path: p, signedUrl: blobs[p] || SAMPLE_PHOTO })), error: null }),
        getPublicUrl: (path) => ({ data: { publicUrl: blobs[path] || SAMPLE_PHOTO } }),
        download: async () => ({ data: null, error: { message: "Not in practice mode" } }),
      }),
    },
    channel: () => { const c = { on: () => c, subscribe: () => c, unsubscribe() {} }; return c; },
    removeChannel: () => {},
  };
}
