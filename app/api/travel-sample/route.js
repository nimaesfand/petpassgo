import { NextResponse } from "next/server";
import { serviceClient } from "../../../lib/serverEmail";
import { signCheckin } from "../../../lib/ppgSign";
export const dynamic = "force-dynamic";
// TEMPORARY preview-only test route. Remove after checking travel mode.
export async function GET() {
  if (process.env.VERCEL_ENV === "production") return NextResponse.json({ error: "no" }, { status: 404 });
  const sb = serviceClient();
  const { data } = await sb.from("pets").select("id").not("passport_issued_at", "is", null).limit(1);
  if (!data?.[0]) return NextResponse.json({ error: "none" });
  const { token } = signCheckin({ petId: data[0].id, minutes: 720 });
  return NextResponse.redirect(new URL(`/check/${token}?travel=1`, "https://petpassgo-git-pets-alive-nimaesfand-5208.vercel.app"));
}
