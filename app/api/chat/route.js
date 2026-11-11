import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "../../../lib/chatPrompt";

export const dynamic = "force-dynamic";

import { aiProvider } from "../../../lib/aiProvider";

export async function POST(req) {
  if (process.env.NEXT_PUBLIC_CHAT_ENABLED !== "true") return NextResponse.json({ error: "Chat is not enabled." }, { status: 404 });
  const p = aiProvider(req, "CHAT_MODEL");
  if (!p) return NextResponse.json({ error: "Chat is not configured yet." }, { status: 503 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const history = Array.isArray(body?.messages) ? body.messages : [];
  const messages = history
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const r = await fetch(p.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: p.model, temperature: 0.2, max_tokens: 300, messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages] }),
  });
  if (!r.ok) return NextResponse.json({ error: "The assistant is unavailable right now." }, { status: 502 });
  const data = await r.json();
  const reply = data?.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't answer that. Want me to connect you with the PetPassGo team?";
  return NextResponse.json({ reply });
}
