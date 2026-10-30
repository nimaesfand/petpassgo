// Simple fixed-window limiter. Prefers the existing service-role RPC
// (public.rate_limit_hit). Falls back to memory on this instance if that
// function is unavailable. No schema change.

const buckets = globalThis.__ppgRate || (globalThis.__ppgRate = new Map());

export function clientIp(req) {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  return ip.slice(0, 64);
}

export function memoryAllow(key, limit, windowMs) {
  const now = Date.now();
  const row = buckets.get(key);
  if (!row || now - row.start >= windowMs) {
    buckets.set(key, { start: now, hits: 1 });
    return true;
  }
  row.hits += 1;
  return row.hits <= limit;
}

export async function allowRequest(sb, key, limit, windowSeconds) {
  if (sb) {
    try {
      const { data, error } = await sb.rpc("rate_limit_hit", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      });
      if (!error) return data !== false;
    } catch { /* use memory */ }
  }
  return memoryAllow(key, limit, windowSeconds * 1000);
}
