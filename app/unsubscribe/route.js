import { NextResponse } from "next/server";
import { serviceClient } from "../../lib/serverEmail";

export const dynamic = "force-dynamic";

function page(ok) {
  const title = ok ? "You're unsubscribed" : "That link doesn't work";
  const body = ok
    ? "You won't get pet travel tips and deals from PetPassGo. Your account is otherwise unchanged."
    : "This unsubscribe link isn't valid. You can turn tips off from Account and billing if you're signed in.";
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#F3F5F9;font-family:system-ui,sans-serif;color:#1A2333"><main style="max-width:520px;margin:48px auto;background:#fff;border-radius:24px;padding:28px;border:1px solid #DCE3EC"><p style="letter-spacing:.08em;color:#F2B84B;font-weight:800;background:#14213D;display:inline-block;padding:6px 10px;border-radius:8px">PETPASSGO</p><h1 style="color:#14213D;font-size:32px;margin:16px 0 8px">${title}</h1><p style="font-size:18px;line-height:1.45">${body}</p><p style="margin-top:20px"><a href="/" style="color:#14213D;font-weight:700">Back to PetPassGo</a></p></main></body></html>`;
  return new NextResponse(html, { status: ok ? 200 : 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

async function handle(req) {
  const url = new URL(req.url);
  let token = url.searchParams.get("token") || "";
  if (!token && req.method === "POST") {
    const text = await req.text().catch(() => "");
    try {
      token = new URLSearchParams(text).get("token") || "";
      if (!token && text.trim().startsWith("{")) token = JSON.parse(text).token || "";
    } catch { /* ignore */ }
  }
  if (!token || token.length < 20) return page(false);
  try {
    const sb = serviceClient();
    const { data, error } = await sb.rpc("unsubscribe_marketing", { token });
    if (error || data !== true) return page(false);
    return page(true);
  } catch {
    return page(false);
  }
}

export function GET(req) { return handle(req); }
export function POST(req) { return handle(req); }
