"use client";
// Analytics foundation — privacy-respecting and completely inert until the
// owner sets NEXT_PUBLIC_GA_ID and/or NEXT_PUBLIC_META_PIXEL_ID in Vercel.
// No IDs are hardcoded. Do Not Track is respected (no scripts, no events,
// no attribution cookie). Full event dictionary: /workspace/ads-analytics/events.md

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
const ATTR_KEY = "ppg_attribution";
const ATTR_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];
let loaded = false;

export function dntOn() {
  if (typeof navigator === "undefined") return false;
  return navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.msDoNotTrack === "1";
}
function clean(v) { return String(v || "").slice(0, 200).trim(); }

// First-touch attribution: the first campaign touch that actually carries
// utm/click data wins; bare visits are stored only as a landing record.
export function captureAttribution() {
  if (typeof window === "undefined" || dntOn()) return {};
  try {
    const q = new URLSearchParams(window.location.search);
    const incoming = {};
    for (const k of ATTR_FIELDS) { const v = clean(q.get(k)); if (v) incoming[k] = v; }
    let stored = {};
    try { stored = JSON.parse(localStorage.getItem(ATTR_KEY) || "{}"); } catch {}
    const hasCampaign = (x) => !!(x.utm_source || x.gclid || x.fbclid);
    const next = hasCampaign(stored) ? stored : hasCampaign(incoming) ? { ...incoming, landing_path: window.location.pathname, first_touch_at: new Date().toISOString() } : stored.landing_path ? stored : { landing_path: window.location.pathname, first_touch_at: new Date().toISOString() };
    localStorage.setItem(ATTR_KEY, JSON.stringify(next));
    try {
      const enc = encodeURIComponent(JSON.stringify(next));
      if (document.cookie.indexOf(`${ATTR_KEY}=`) === -1 || hasCampaign(incoming)) document.cookie = `${ATTR_KEY}=${enc}; Max-Age=${90 * 86400}; Path=/; SameSite=Lax`;
    } catch {}
    return next;
  } catch { return {}; }
}
export function getAttribution() {
  if (typeof window === "undefined" || dntOn()) return {};
  try {
    const a = JSON.parse(localStorage.getItem(ATTR_KEY) || "{}");
    const out = {};
    for (const k of ATTR_FIELDS) if (a[k]) out[k] = a[k];
    return out;
  } catch { return {}; }
}

function loadTrackers() {
  if (loaded || typeof window === "undefined" || dntOn()) return;
  loaded = true;
  captureAttribution();
  if (GA_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { send_page_view: false, anonymize_ip: true });
    const s = document.createElement("script");
    s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(s);
  }
  if (META_PIXEL_ID) {
    /* eslint-disable */
    const f = window; if (f.fbq) return; const n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    const t = document.createElement("script"); t.async = true; t.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(t);
    window.fbq("init", META_PIXEL_ID);
  }
}

// One internal call -> GA4 event + Meta event (standard name where one exists,
// trackCustom otherwise). Attribution rides along on every event.
export function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || dntOn() || (!GA_ID && !META_PIXEL_ID)) return;
  loadTrackers();
  const p = { ...getAttribution(), ...params };
  try { if (GA_ID && window.gtag) window.gtag("event", name, p); } catch {}
  const meta = META_MAP[name];
  try {
    if (META_PIXEL_ID && window.fbq && meta) {
      const mp = { value: p.value, currency: p.currency || "USD", content_name: p.content_name, content_type: p.content_type, content_ids: p.content_ids };
      Object.keys(mp).forEach((k) => mp[k] === undefined && delete mp[k]);
      if (meta.custom) window.fbq("trackCustom", meta.name, mp); else window.fbq("track", meta.name, mp);
    }
  } catch {}
}
const META_MAP = {
  view_content: { name: "ViewContent" },
  page_view: { name: "PageView" },
  start_assessment: { name: "StartAssessment", custom: true },
  preview_viewed: { name: "PreviewViewed", custom: true },
  begin_checkout: { name: "InitiateCheckout" },
  purchase: { name: "Purchase" },
  sign_up: { name: "CompleteRegistration" },
  membership_start: { name: "MembershipStart", custom: true },
};

export function trackPageView(path) {
  trackEvent("page_view", { page_path: path, page_location: typeof window !== "undefined" ? window.location.href : undefined, content_type: "page" });
}
export function trackViewContent(contentType, contentName) {
  trackEvent("view_content", { content_type: contentType, content_name: contentName });
}

const PRICE_VALUE = { pass: 49.99, member_pass: 19.99, join: 26.98, membership: 6.99, member: 26.98 };
export function trackBeginCheckout(plan) {
  const value = PRICE_VALUE[plan];
  trackEvent("begin_checkout", { plan, value, currency: "USD", content_name: plan, items: value ? [{ item_id: plan, price: value, quantity: 1 }] : undefined });
}

// Purchase is fired once per Stripe checkout session (dedupe in sessionStorage).
export function trackPurchaseOnce({ transactionId, value, currency = "USD", plan, kind }) {
  if (!transactionId || typeof window === "undefined") return false;
  const key = `ppg_purchased_${transactionId}`;
  try { if (sessionStorage.getItem(key)) return false; sessionStorage.setItem(key, "1"); } catch {}
  trackEvent("purchase", { transaction_id: transactionId, value, currency: (currency || "USD").toUpperCase(), plan: plan || kind, content_name: kind || plan, items: value ? [{ item_id: kind || plan, price: value, quantity: 1 }] : undefined });
  if (kind === "membership" || kind === "join" || plan === "membership" || plan === "join") trackEvent("membership_start", { value, currency: (currency || "USD").toUpperCase(), content_name: "membership" });
  return true;
}
