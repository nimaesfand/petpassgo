import { NextResponse } from "next/server";
import { allowRequest, clientIp } from "../../../lib/rateLimit";
import { requireUser } from "../../../lib/paidUser";
import { animalDescription, fillAirTransportationForm, fillReliefForm, isServiceTrip } from "../../../lib/dotForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function clip(value, max) {
  return String(value || "").replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function POST(req) {
  try {
    const { user, sb } = await requireUser(req);
    if (!user || !sb) return NextResponse.json({ error: "Sign in to download this form." }, { status: 401 });
    const allowed = await allowRequest(sb, `dot_form:${user.id}:${clientIp(req)}`, 15, 600);
    if (!allowed) return NextResponse.json({ error: "Too many downloads. Try again in a few minutes." }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const tripId = String(body.trip_id || "");
    if (!/^[0-9a-f-]{36}$/i.test(tripId)) return NextResponse.json({ error: "Missing trip." }, { status: 400 });
    const { data: trip } = await sb.from("trips").select("id,paid,role,animal_type,origin,destination,travel_date,pet_id").eq("id", tripId).eq("user_id", user.id).maybeSingle();
    if (!trip?.paid) return NextResponse.json({ error: "The DOT form is on a paid Travel Pass." }, { status: 403 });
    if (!isServiceTrip(trip)) return NextResponse.json({ error: "The DOT form is for a service-dog Travel Pass." }, { status: 403 });

    let pet = null;
    if (trip.pet_id) {
      const { data } = await sb.from("pets").select("id,name,breed,animal_type,sex,weight_lb,handler_name,vet_name,vet_phone").eq("id", trip.pet_id).eq("user_id", user.id).maybeSingle();
      pet = data;
    }
    let rabiesExp = "";
    if (pet?.id) {
      const { data: rows } = await sb.from("pet_health_records").select("name,expires_on").eq("pet_id", pet.id).eq("user_id", user.id);
      const hit = (rows || []).find((row) => /rabies/i.test(row.name || "") && /^\d{4}-\d{2}-\d{2}$/.test(row.expires_on || ""));
      if (hit) rabiesExp = hit.expires_on;
    }
    const override = /^\d{4}-\d{2}-\d{2}$/.test(body.rabies_exp || "") ? body.rabies_exp : "";
    const kind = body.kind === "relief" ? "relief" : "air";
    const hours = Number(body.hours);
    if (kind === "relief" && !(hours >= 8)) return NextResponse.json({ error: "The relief form is for a flight of 8 hours or more." }, { status: 400 });

    const values = {
      handler: clip(body.handler, 80) || clip(pet?.handler_name, 80),
      phone: clip(body.phone, 30),
      email: user.email || "",
      animalName: pet?.name || "",
      description: animalDescription(pet, clip(body.color, 40)),
      rabiesExp: override || rabiesExp,
      vetName: pet?.vet_name || "",
      vetPhone: pet?.vet_phone || "",
      hours: Number.isFinite(hours) ? String(hours) : "",
      flightDate: trip.travel_date,
      origin: trip.origin,
      destination: trip.destination,
    };
    const bytes = kind === "relief" ? await fillReliefForm(values) : await fillAirTransportationForm(values);
    const filename = kind === "relief" ? "DOT-Service-Animal-Relief-Attestation-Form.pdf" : "DOT-Service-Animal-Air-Transportation-Form.pdf";
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "The form could not be prepared. Try again." }, { status: 500 });
  }
}
