import { NextResponse } from "next/server";

// Site password gate — OPT-IN, OFF by default (owner decision 2026-10-17:
// "take it off, lets try it without a password"). The gate only runs when
// SITE_GATE_ENABLED="true" is set in Vercel AND SITE_USER/SITE_PASSWORD are
// present. To re-enable: set SITE_GATE_ENABLED=true (Production) and redeploy.
// This is only the site-wide preview gate; Supabase account auth, Stripe and
// the locked-preview rules are separate and unaffected.
export function middleware(req) {
  if (process.env.SITE_GATE_ENABLED !== "true" || !process.env.SITE_USER || !process.env.SITE_PASSWORD) {
    return NextResponse.next();
  }
  const basicAuth = req.headers.get("authorization");
  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    try {
      const [user, pwd] = atob(authValue).split(":");
      if (user === process.env.SITE_USER && pwd === process.env.SITE_PASSWORD) {
        return NextResponse.next();
      }
    } catch { /* fall through to 401 */ }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="PetPassGo private preview"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/cron/|api/stripe/webhook|api/pet-share/).*)"],
};
