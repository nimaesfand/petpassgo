import { serviceClient } from "./serverEmail.js";
import { isMember, userFromReq } from "./stripeServer.js";
import { SITE_LAUNCHED } from "./site.js";
import { tripAccessOpen } from "./tripAccess.js";

export async function requireUser(req) {
  const user = await userFromReq(req);
  const sb = serviceClient();
  return { user, sb };
}

// Signed-in, and either an active Pet Vault member or the owner of a paid trip.
export async function userIsPaid(sb, userId) {
  if (!sb || !userId) return false;
  if (await isMember(sb, userId)) return true;
  const { data, error } = await sb.from("trips").select("id").eq("user_id", userId).eq("paid", true).limit(1);
  if (error) return false;
  return !!(data && data.length);
}

// Vault tools (QR card, Wallet pass): same window as the account vault.
export async function vaultIsOpen(sb, userId) {
  if (!sb || !userId) return false;
  if (!SITE_LAUNCHED) return true;
  if (await isMember(sb, userId)) return true;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  let trips = await sb.from("trips").select("travel_date,return_date").eq("user_id", userId).eq("paid", true);
  if (trips.error) trips = await sb.from("trips").select("travel_date").eq("user_id", userId).eq("paid", true);
  return (trips.data || []).some((t) => tripAccessOpen(t.travel_date, t.return_date, today));
}
