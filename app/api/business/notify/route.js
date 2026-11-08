import { NextResponse } from "next/server";
import { sendResendEmail, serviceClient } from "../../../../lib/serverEmail";
import { signedInUser, adminEmails } from "../../../../lib/adminGate";
import { SITE_URL } from "../../../../lib/site";

export const dynamic = "force-dynamic";

// Tells the PetPassGo team a listing is waiting for review. Only for the listing's own owner.
export async function POST(req) {
  const user = await signedInUser(req);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const admin = serviceClient();
  const { data: rows } = await admin.from("businesses").select("id,name,city,state,status,updated_at").eq("owner_user_id", user.id).eq("status", "pending").order("updated_at", { ascending: false }).limit(1);
  const b = rows?.[0];
  if (!b || Date.now() - new Date(b.updated_at).getTime() > 10 * 60 * 1000) return NextResponse.json({ ok: true, sent: false });
  const to = await adminEmails(admin);
  if (!to.length) return NextResponse.json({ ok: true, sent: false });
  await sendResendEmail({
    to, kind: "business_review",
    subject: `New Discover listing to review: ${b.name}`,
    text: `${b.name} (${b.city}, ${b.state}) is waiting for review.\n\nReview it here: ${SITE_URL}/admin/businesses\n\nSubmitted by ${user.email}.`,
  });
  return NextResponse.json({ ok: true, sent: true });
}
