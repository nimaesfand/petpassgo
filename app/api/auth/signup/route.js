import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Locked. This route is unused. Accounts are created after a paid guest checkout
// on /welcome, or when someone logs in. It must not create users.
export async function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
