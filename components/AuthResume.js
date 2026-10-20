"use client";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { hasResumeIntent, resumeAfterAuth } from "../lib/resumeIntent";

// When someone lands from an email confirmation / magic link, continue their checkout.
export default function AuthResume() {
  useEffect(() => {
    const fromEmail = /access_token=|type=(signup|magiclink|email)/.test(window.location.hash) || /[?&](code|token_hash)=/.test(window.location.search);
    if (!fromEmail || !hasResumeIntent()) return;
    let done = false;
    const go = () => { if (!done) { done = true; resumeAfterAuth(); } };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => { if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) go(); });
    supabase.auth.getSession().then(({ data }) => { if (data?.session) go(); });
    return () => sub?.subscription?.unsubscribe();
  }, []);
  return null;
}
