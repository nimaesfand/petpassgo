import { createHash } from "crypto";
import { serviceClient } from "../../../../lib/serverEmail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const page = (title, line) => new Response(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#F3F5F9;font-family:system-ui,sans-serif;color:#14213D"><div style="max-width:440px;margin:60px auto;background:#fff;border-radius:24px;padding:28px;text-align:center"><div style="font-size:24px;font-weight:800">${title}</div><p style="font-size:16px;line-height:1.5;color:#1A2333">${line}</p><a href="/reviews" style="display:inline-block;margin-top:8px;background:#C2410C;color:#fff;text-decoration:none;font-weight:700;border-radius:999px;padding:12px 20px">See reviews</a></div></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });

// Approve or reject from the moderation email. The link carries a one-time token.
export async function GET(req) {
  const q = new URL(req.url).searchParams;
  const id = q.get("id") || "", t = q.get("t") || "", a = q.get("a");
  if (!id || !t || !["approve", "reject"].includes(a)) return page("Link not valid", "This link is missing something.");
  const sb = serviceClient();
  const { data: r } = await sb.from("reviews").select("id,mod_token_hash,display_name").eq("id", id).maybeSingle();
  if (!r || !r.mod_token_hash || r.mod_token_hash !== createHash("sha256").update(t).digest("hex")) return page("Link already used", "This review was already approved or rejected, or the member edited it (a new email was sent).");
  const approved = a === "approve";
  await sb.from("reviews").update({ status: approved ? "approved" : "rejected", approved_at: approved ? new Date().toISOString() : null, mod_token_hash: null }).eq("id", id);
  return page(approved ? "Review approved" : "Review rejected", approved ? `${r.display_name}'s review is now live on the reviews page.` : `${r.display_name}'s review stays hidden.`);
}
