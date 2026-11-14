import { NextResponse } from "next/server";
import { allowRequest, clientIp } from "../../../lib/rateLimit";
import { requireUser } from "../../../lib/paidUser";
import { sendResendEmail } from "../../../lib/serverEmail";
import { findAirport } from "../../../lib/airports";
import { ageText, fillHawaiiForm, splitName } from "../../../lib/hawaiiForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const clip = (v, n) => String(v || "").replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
const FILE = "Hawaii-Dog-and-Cat-Import-Form-AQS-279.pdf";

export async function POST(req) {
  try {
    const { user, sb } = await requireUser(req);
    if (!user || !sb) return NextResponse.json({ error: "Sign in to get this form." }, { status: 401 });
    if (!(await allowRequest(sb, `hawaii_form:${user.id}:${clientIp(req)}`, 15, 600))) return NextResponse.json({ error: "Too many tries. Try again in a few minutes." }, { status: 429 });
    const body = await req.json().catch(() => ({}));
    const tripId = String(body.trip_id || "");
    if (!/^[0-9a-f-]{36}$/i.test(tripId)) return NextResponse.json({ error: "Missing trip." }, { status: 400 });
    const { data: trip } = await sb.from("trips").select("id,paid,origin,destination,travel_date,pet_id,pet_count,animal_type").eq("id", tripId).eq("user_id", user.id).maybeSingle();
    if (!trip?.paid) return NextResponse.json({ error: "The Hawaii form is on a Travel Pass." }, { status: 403 });
    const dest = findAirport(trip.destination);
    if (!dest || !["HNL", "OGG", "KOA", "LIH", "ITO"].includes(dest.code)) return NextResponse.json({ error: "This form is for trips to Hawaii." }, { status: 400 });

    let pet = null;
    if (trip.pet_id) {
      const { data } = await sb.from("pets").select("name,animal_type,breed,sex,color,date_of_birth,microchip_number,handler_name").eq("id", trip.pet_id).eq("user_id", user.id).maybeSingle();
      pet = data;
    }
    const name = splitName(clip(body.owner, 80) || pet?.handler_name);
    const values = {
      arrival: trip.travel_date, petCount: trip.pet_count || 1, airport: dest.code,
      petName: pet?.name, species: pet?.animal_type || trip.animal_type, breed: pet?.breed, sex: pet?.sex, color: pet?.color,
      age: ageText(pet?.date_of_birth, trip.travel_date), chip: String(pet?.microchip_number || "").replace(/\s/g, ""),
      first: name.first, last: name.last, phone: clip(body.phone, 30), email: user.email || "",
      street: clip(body.street, 120), city: clip(body.city, 60), state: clip(body.state, 20), zip: clip(body.zip, 12),
      hiStreet: clip(body.hi_street, 120), hiCity: clip(body.hi_city, 60), hiZip: clip(body.hi_zip, 12),
    };
    const bytes = await fillHawaiiForm(values);
    if (body.deliver === "email") {
      if (!user.email) return NextResponse.json({ error: "Your account has no email address." }, { status: 400 });
      const sent = await sendResendEmail({
        to: user.email,
        subject: `Your Hawaii Dog & Cat Import Form${values.petName ? ` for ${values.petName}` : ""}`,
        text: [
          "Here is Hawaii's Dog & Cat Import Form (AQS-279), filled in with your pet's and trip details.",
          "",
          "Before you send it:",
          "1. Check every detail, and fill in anything that's blank (like your ID number).",
          "2. Pick your program (for example Direct Airport Release) and the fee.",
          "3. Sign and date it.",
          "4. Send it with your documents the way the Animal Quarantine Station asks. Your Travel Pass shows the deadline.",
          "",
          "PetPassGo fills in details only. We never pick the program or sign for you.",
          "",
          "— PetPassGo",
        ].join("\n"),
        kind: "hawaii_form",
        attachments: [{ filename: FILE, content: Buffer.from(bytes).toString("base64") }],
      });
      if (!sent.ok) return NextResponse.json({ error: "We couldn't email the form. Try downloading it instead." }, { status: 502 });
      return NextResponse.json({ sent: true });
    }
    return new NextResponse(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${FILE}"`, "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("hawaii_form", e?.message);
    return NextResponse.json({ error: "The form could not be prepared. Try again." }, { status: 500 });
  }
}
