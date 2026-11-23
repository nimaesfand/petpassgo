import { NextResponse } from "next/server";
import { requireUser } from "../../../lib/paidUser";
import { serviceClient } from "../../../lib/serverEmail";
import { ALL_TASK_KEYS, TRAINED_BY, PROGRAMS, PLACES, programLabel, legacyTrainer, STATEMENT_VERSION, statementText } from "../../../lib/training";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// The owner signs the service dog statement. We keep the exact text they agreed to,
// the typed name, the time and where it came from. We never mark a dog "certified".
export async function POST(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const petId = String(b.pet_id || "");
  if (!/^[0-9a-f-]{36}$/i.test(petId)) return NextResponse.json({ error: "Missing pet." }, { status: 400 });
  const { data: pet } = await sb.from("pets").select("id,name,animal_type,role,training").eq("id", petId).eq("user_id", user.id).maybeSingle();
  if (!pet) return NextResponse.json({ error: "Pet not found." }, { status: 404 });

  if (b.withdraw === true) {
    const svc = serviceClient();
    await svc.from("service_dog_statements").update({ withdrawn_at: new Date().toISOString() }).eq("pet_id", petId).eq("user_id", user.id).is("withdrawn_at", null);
    await svc.from("pets").update({ service_attested_at: null }).eq("id", petId).eq("user_id", user.id);
    return NextResponse.json({ ok: true });
  }

  if (pet.animal_type !== "Dog") return NextResponse.json({ error: "Only dogs can be service animals on U.S. flights." }, { status: 400 });
  const name = String(b.signed_name || "").trim().replace(/\s+/g, " ").slice(0, 120);
  if (name.length < 3 || !/\s/.test(name)) return NextResponse.json({ error: "Type your full name to sign." }, { status: 400 });
  if (b.agree !== true) return NextResponse.json({ error: "Check the box to agree." }, { status: 400 });
  const okTask = new Set(ALL_TASK_KEYS);
  const tasks = Array.from(new Set((Array.isArray(b.tasks) ? b.tasks : []).filter((t) => okTask.has(t)))).slice(0, ALL_TASK_KEYS.length);
  if (!tasks.length) return NextResponse.json({ error: "Pick at least one kind of task." }, { status: 400 });
  const trainedBy = TRAINED_BY.some(([k]) => k === b.trained_by) ? b.trained_by : null;
  if (!trainedBy) return NextResponse.json({ error: "Tell us who trained them." }, { status: 400 });
  const program = trainedBy === "program" && PROGRAMS.some(([k]) => k === b.program) ? b.program : null;
  if (trainedBy === "program" && !program) return NextResponse.json({ error: "Pick the program, or Another program." }, { status: 400 });
  // Picks only. A value typed before the pick-lists is kept as it was.
  const where = PLACES.some(([k]) => k === b.trained_where) ? b.trained_where : (pet.training?.trained_where || null);
  const keepTyped = trainedBy !== "owner" && !program ? legacyTrainer(pet.training) || null : null;
  const trainerName = program ? (programLabel(program) || "Another program") : keepTyped;

  const text = statementText({ petName: pet.name, signedName: name });
  const now = new Date().toISOString();
  const svc = serviceClient();
  const { error } = await svc.from("service_dog_statements").insert({
    pet_id: petId, user_id: user.id, signed_name: name, tasks, trained_by: trainedBy, trainer_name: trainerName, trained_where: where,
    statement_version: STATEMENT_VERSION, statement_text: text,
    ip: (req.headers.get("x-forwarded-for") || "").split(",")[0].trim().slice(0, 64) || null,
    user_agent: (req.headers.get("user-agent") || "").slice(0, 300) || null, created_at: now,
  });
  if (error) return NextResponse.json({ error: "Couldn't save your statement. Please try again." }, { status: 500 });
  const levels = Array.from(new Set([...(pet.training?.levels || []), "tasks"]));
  const training = { ...(pet.training || {}), levels, trained_by: trainedBy, program, trainer_name: program ? null : keepTyped, trained_where: where, tasks, show_tasks: b.show_tasks === true };
  await svc.from("pets").update({ role: "Service animal", training, service_attested_at: now }).eq("id", petId).eq("user_id", user.id);
  return NextResponse.json({ ok: true, signed_at: now });
}
