import { aiProvider } from "../../../lib/aiProvider";

export const dynamic = "force-dynamic";

// Health check: is the AI connected? Sends a one-word prompt. Shows no secrets.
export async function GET(req) {
  const p = aiProvider(req);
  if (!p) return Response.json({ ok: false, reason: "no provider" });
  try {
    const r = await fetch(p.url, { method: "POST", headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: p.model, max_tokens: 5, messages: [{ role: "user", content: "Reply with: ok" }] }) });
    const j = await r.json().catch(() => ({}));
    return Response.json({ ok: r.ok, status: r.status, model: p.model, reply: j?.choices?.[0]?.message?.content || null, error: r.ok ? null : (j?.error?.message || j?.error || null) });
  } catch (e) {
    return Response.json({ ok: false, reason: "request failed" });
  }
}
