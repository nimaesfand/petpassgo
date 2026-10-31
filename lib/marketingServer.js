import crypto from "crypto";

// Service-role writes. Creates the row if the signup trigger hasn't yet.
// optIn false is only applied when allowOff is set (account toggle and unsubscribe use the RPC).
export async function saveMarketingConsent(sb, userId, { optIn, source, allowOff = false }) {
  if (!userId) return;
  if (!optIn && !allowOff) return;
  const now = new Date().toISOString();
  const patch = {
    marketing_opt_in: !!optIn,
    marketing_opt_in_at: now,
    marketing_opt_in_source: source,
    updated_at: now,
  };
  const { data: row } = await sb.from("user_marketing").select("user_id").eq("user_id", userId).maybeSingle();
  if (!row) {
    const { error } = await sb.from("user_marketing").insert({
      user_id: userId,
      unsubscribe_token: crypto.randomBytes(24).toString("hex"),
      ...patch,
    });
    if (error) throw error;
    return;
  }
  const { error } = await sb.from("user_marketing").update(patch).eq("user_id", userId);
  if (error) throw error;
}
