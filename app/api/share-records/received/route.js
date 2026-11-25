import { createHash } from "crypto";
import { emailConfigured, sendResendEmail, serviceClient } from "../../../../lib/serverEmail";
import { brandedEmail, esc } from "../../../../lib/emailHtml";
import { SITE_URL } from "../../../../lib/site";

export const dynamic = "force-dynamic";

function page(title, text) {
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;background:#F3F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
<div style="max-width:460px;margin:60px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(20,33,61,.08)">
<div style="background:#14213D;padding:18px 24px;font-size:22px;font-weight:800;color:#fff">PetPass<span style="color:#F2B84B">Go</span></div>
<div style="height:3px;background:#F2B84B"></div>
<div style="padding:26px 24px"><h1 style="margin:0 0 10px;font-size:24px;color:#14213D">${esc(title)}</h1><p style="margin:0;font-size:16px;line-height:1.5;color:#1A2333">${esc(text)}</p></div>
</div></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}

// The recipient taps "Got them?" in the email. We mark it and tell the owner once.
export async function GET(req) {
  const t = new URL(req.url).searchParams.get("t") || "";
  if (!/^[A-Za-z0-9_-]{20,80}$/.test(t)) return page("Link not valid", "This link isn't valid. You can just reply to the email instead.");
  const sb = serviceClient();
  const hash = createHash("sha256").update(t).digest("hex");
  const { data: send } = await sb.from("record_sends").select("id,user_id,pet_id,to_name,to_email,received_at").eq("token_hash", hash).maybeSingle();
  if (!send) return page("Link not valid", "This link isn't valid. You can just reply to the email instead.");
  if (!send.received_at) {
    await sb.from("record_sends").update({ received_at: new Date().toISOString() }).eq("id", send.id).is("received_at", null);
    if (emailConfigured()) {
      const { data: pet } = await sb.from("pets").select("name").eq("id", send.pet_id).maybeSingle();
      const { data: u } = await sb.auth.admin.getUserById(send.user_id);
      const who = send.to_name || send.to_email;
      if (u?.user?.email) {
        await sendResendEmail({
          to: u.user.email,
          subject: `${who} got ${pet?.name || "your pet"}'s records`,
          text: `${who} confirmed they received ${pet?.name || "your pet"}'s records.\n\nSee everything you've shared: ${SITE_URL}/account`,
          html: brandedEmail({ eyebrow: "RECORDS RECEIVED", title: `${who} got ${pet?.name || "your pet"}'s records`, intro: [`They tapped "Got them" in the email you sent. You're all set.`], button: { label: "Open Pet Vault", href: `${SITE_URL}/account` } }),
          kind: "share_records_received",
        });
      }
    }
  }
  return page("Thanks, they'll know you got it", "We let the owner know their pet's records arrived. You can close this page.");
}
