import { NextResponse } from "next/server";
import { allowRequest, clientIp } from "../../../lib/rateLimit";
import { requireUser } from "../../../lib/paidUser";
import { animalDescription, fillAirTransportationForm, fillReliefForm, isServiceTrip } from "../../../lib/dotForm";
import { sendResendEmail, serviceClient } from "../../../lib/serverEmail";
import { isMember } from "../../../lib/stripeServer";

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
    const petId = String(body.pet_id || "");
    let trip = null;
    let pet = null;
    if (/^[0-9a-f-]{36}$/i.test(tripId)) {
      const { data } = await sb.from("trips").select("id,paid,role,animal_type,origin,destination,travel_date,pet_id").eq("id", tripId).eq("user_id", user.id).maybeSingle();
      trip = data;
      if (!trip?.paid) return NextResponse.json({ error: "The DOT form is on a paid Travel Pass." }, { status: 403 });
      if (!isServiceTrip(trip)) return NextResponse.json({ error: "The DOT form is for a service-dog Travel Pass." }, { status: 403 });
    } else if (/^[0-9a-f-]{36}$/i.test(petId)) {
      // Pet Vault members with a signed service dog statement: filled in from the passport, any trip.
      const { data } = await sb.from("pets").select("id,name,breed,animal_type,sex,weight_lb,handler_name,vet_name,vet_phone,training,role,service_attested_at").eq("id", petId).eq("user_id", user.id).maybeSingle();
      if (!data) return NextResponse.json({ error: "Pet not found." }, { status: 404 });
      if (!data.service_attested_at || data.animal_type !== "Dog") return NextResponse.json({ error: "Sign the service dog statement in the passport first." }, { status: 403 });
      if (!(await isMember(serviceClient(), user.id))) return NextResponse.json({ error: "The filled-in DOT form is part of Pet Vault.", need: "vault" }, { status: 402 });
      pet = data;
      trip = { travel_date: /^\d{4}-\d{2}-\d{2}$/.test(body.flight_date || "") ? body.flight_date : "", origin: clip(body.origin, 8).toUpperCase(), destination: clip(body.destination, 8).toUpperCase() };
    } else {
      return NextResponse.json({ error: "Missing trip." }, { status: 400 });
    }

    if (!pet && trip.pet_id) {
      const { data } = await sb.from("pets").select("id,name,breed,animal_type,sex,weight_lb,handler_name,vet_name,vet_phone,training").eq("id", trip.pet_id).eq("user_id", user.id).maybeSingle();
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
      trainer: clip(body.trainer, 80) || (pet?.training?.trained_by === "owner" ? clip(body.handler, 80) || clip(pet?.handler_name, 80) : clip(pet?.training?.trainer_name, 80)),
      flightDate: trip.travel_date,
      origin: trip.origin,
      destination: trip.destination,
    };
    const bytes = kind === "relief" ? await fillReliefForm(values) : await fillAirTransportationForm(values);
    const filename = kind === "relief" ? "DOT-Service-Animal-Relief-Attestation-Form.pdf" : "DOT-Service-Animal-Air-Transportation-Form.pdf";
    if (body.deliver === "email") {
      if (!user.email) return NextResponse.json({ error: "Your account has no email address." }, { status: 400 });
      const sent = await sendResendEmail({
        to: user.email,
        subject: kind === "relief" ? "Your DOT relief attestation form" : `Your DOT service animal form${values.animalName ? ` for ${values.animalName}` : ""}`,
        text: [
          "Here is your U.S. DOT form, filled in with the details you entered.",
          "",
          "Before you send it to your airline:",
          "1. Read and check each attestation box yourself.",
          "2. Sign and date it.",
          "3. Send it to your airline the way it asks: online up to 48 hours before, or at the gate if you booked within 48 hours. Your Travel Pass shows your airline's exact steps.",
          "",
          "PetPassGo fills in your details only. We never check the boxes or sign for you.",
          "",
          "— PetPassGo",
        ].join("\n"),
        kind: "dot_form",
        attachments: [{ filename, content: Buffer.from(bytes).toString("base64") }],
      });
      if (!sent.ok) return NextResponse.json({ error: "We couldn't email the form. Try downloading it instead." }, { status: 502 });
      return NextResponse.json({ sent: true });
    }
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
