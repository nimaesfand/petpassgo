import { createClient } from "@supabase/supabase-js";
import { serviceClient } from "./serverEmail";

// Returns { user, admin } for a signed-in PetPassGo owner/admin, otherwise null.
export async function adminGate(req) {
  const token = req.headers.get("x-sb-token") || "";
  if (!token) return null;
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data: u } = await anon.auth.getUser(token);
  if (!u?.user) return null;
  const admin = serviceClient();
  const { data } = await admin.from("admins").select("user_id").eq("user_id", u.user.id).maybeSingle();
  return data ? { user: u.user, admin } : null;
}

export async function signedInUser(req) {
  const token = req.headers.get("x-sb-token") || "";
  if (!token) return null;
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data } = await anon.auth.getUser(token);
  return data?.user || null;
}

export async function adminEmails(admin) {
  const { data } = await admin.from("admins").select("user_id");
  const out = [];
  for (const r of data || []) {
    const { data: u } = await admin.auth.admin.getUserById(r.user_id);
    if (u?.user?.email) out.push(u.user.email);
  }
  return out;
}
