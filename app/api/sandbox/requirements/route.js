import { createClient } from "@supabase/supabase-js";

// Preview builds only: feeds the practice copy real airline rules for a sample trip.
export async function GET(req) {
  if (process.env.VERCEL_ENV === "production") return new Response("Not found", { status: 404 });
  const u = new URL(req.url);
  const airlines = [u.searchParams.get("airline") || "Any", u.searchParams.get("second") || "Any", "Any"].map((a) => (a === "Hawaiian Airlines" ? "Alaska Airlines" : a));
  const animal = u.searchParams.get("animal") || "Dog";
  const role = u.searchParams.get("role") || "Pet";
  const types = (u.searchParams.get("types") || "domestic").split(",");
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data, error } = await db.from("airline_requirements").select("*").in("airline", airlines).in("animal_type", [animal, "Any"]).in("role", [role, "Any"]).in("trip_type", types);
  if (error) return Response.json([], { status: 200 });
  return Response.json(data || []);
}
