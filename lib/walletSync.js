import { pushWalletUpdate } from "./applePush.js";
import { patchGoogleObject } from "./googleWallet.js";
import { PET_COLUMNS, passExtras } from "./walletData.js";

// Send updates for passes whose pet changed since the last push (DB triggers bump last_updated).
export async function syncWalletPass(sb, petId) {
  const { data: row } = await sb.from("wallet_passes").select("*").eq("pet_id", petId).maybeSingle();
  if (!row) return { skipped: true };
  if (row.last_pushed && new Date(row.last_pushed) >= new Date(row.last_updated)) return { skipped: true };
  const { data: regs } = await sb.from("wallet_registrations").select("device_id").eq("serial", petId);
  let sent = 0;
  if (regs?.length) {
    const { data: devs } = await sb.from("wallet_devices").select("push_token").in("device_id", regs.map((r) => r.device_id));
    sent = (await pushWalletUpdate((devs || []).map((d) => d.push_token))).sent;
  }
  if (row.google_object_id) {
    const { data: pet } = await sb.from("pets").select(PET_COLUMNS).eq("id", petId).maybeSingle();
    if (pet) await patchGoogleObject(pet, await passExtras(sb, pet)).catch(() => false);
  }
  await sb.from("wallet_passes").update({ last_pushed: new Date().toISOString() }).eq("pet_id", petId);
  return { sent };
}

export async function syncAllWalletPasses(sb, limit = 50) {
  const { data } = await sb.from("wallet_passes").select("pet_id,last_updated,last_pushed").order("last_updated", { ascending: false }).limit(200);
  const due = (data || []).filter((r) => !r.last_pushed || new Date(r.last_pushed) < new Date(r.last_updated)).slice(0, limit);
  let n = 0;
  for (const r of due) { await syncWalletPass(sb, r.pet_id).catch(() => null); n++; }
  return n;
}
