import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/serverEmail";

export const dynamic = "force-dynamic";

// Creates an email+password account that can sign in right away (no "check your email" step),
// so new buyers go straight from signup to Stripe Checkout. The browser signs in afterwards.
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (password.length < 6 || password.length > 72) return NextResponse.json({ error: "Password must be 6 to 72 characters." }, { status: 400 });
  try {
    const { error } = await serviceClient().auth.admin.createUser({ email, password, email_confirm: true });
    if (error) {
      if (error.code === "email_exists" || error.status === 422 || /already/i.test(error.message || "")) {
        return NextResponse.json({ error: "exists" }, { status: 409 });
      }
      if (error.code === "weak_password") return NextResponse.json({ error: error.message }, { status: 400 });
      console.error("signup", error.code || error.status, error.message);
      return NextResponse.json({ error: "We couldn't create your account. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("signup", e?.message);
    return NextResponse.json({ error: "We couldn't create your account. Please try again." }, { status: 500 });
  }
}
