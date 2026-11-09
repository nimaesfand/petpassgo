import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const real = createClient(supabaseUrl, supabaseAnonKey);

// On the preview-only practice pages (/sandbox/...), every call goes to an in-browser
// stand-in with sample data instead of the real database. Everywhere else this is the
// normal Supabase client.
export const supabase = new Proxy(real, {
  get(target, key) {
    const sb = typeof window !== "undefined" ? window.__ppgSandbox : null;
    const src = sb && key in sb ? sb : target;
    const v = src[key];
    return typeof v === "function" ? v.bind(src) : v;
  },
});
