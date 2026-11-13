// Turns the verified rule cards for a cabin-pet trip into a short, plain guide:
// one clear action per step, the airline's own facts as bullets, the pet's name,
// and a real "do it by" date. Facts only come from the sourced rows; this file
// rewrites wording and merges duplicates, it never adds a rule.
import { addDays, daysUntil, todayPT } from "./travelDates";
import { petFitSentence } from "./petFit";
import { shortCarrier } from "./verdict";

const cat = (c) => String(c?.category || "").toUpperCase();

function sentences(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z"“$0-9])/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (/[.!?]$/.test(s) ? s : `${s}.`));
}

const TWO_PETS = /\b(two pets|2 pets|second pet|second seat|two seats|each pet|per person)\b/i;
const NOT_FOR_YOU = /unaccompanied minor/i;
const CAPACITY = /\b(only|limit(?:ed)? to|up to|maximum of)\s+(\w+)\s+pets?\b.*\b(flight|cabin)\b|\bspots? (are|is) limited\b|book early/i;

function whoName(trip) {
  const n = String(trip?.pet?.name || "").trim();
  return n || null;
}

function bookingDue(trip, today) {
  if (!trip?.travel_date) return null;
  const ideal = addDays(trip.travel_date, -14);
  return daysUntil(ideal, today) < 0 ? today : ideal;
}

export function guideCards(cards, trip, today = todayPT()) {
  if (!Array.isArray(cards) || !cards.length) return cards;
  if (/service/i.test(String(trip?.role || ""))) return cards;
  const name = whoName(trip);
  const pet = name || "your pet";
  const Pet = name || "Your pet";
  const airline = trip?.airline && !/not sure/i.test(trip.airline) ? trip.airline : "your airline";
  const twoPets = Number(trip?.pet_count) === 2;
  const keepPoint = (s) => (twoPets || !TWO_PETS.test(s)) && !NOT_FOR_YOU.test(s);
  const named = (s) => (name ? String(s).replace(/\byour pet\b/g, name).replace(/^Your pet\b/, name) : s);
  const useful = (a, b) => Number(/tight|measure|stand up|turn around/i.test(b)) - Number(/tight|measure|stand up|turn around/i.test(a));

  const fee = cards.find((c) => cat(c).includes("FEE") && !c.askAirline);
  const weight = cards.find((c) => cat(c).includes("WEIGHT") && !c.askAirline);
  const booking = cards.find((c) => cat(c).includes("BOOK") && !c.fact && !c.askAirline);
  const kennel = cards.find((c) => /KENNEL|CARRIER/.test(cat(c)) && !c.askAirline && !/737/.test(c.shortTitle || ""));
  const drop = new Set();
  const out = [];

  for (const card of cards) {
    if (card.askAirline || card.dot) { out.push(card); continue; }
    const c = cat(card);
    const raw = `${card.title || ""}. ${card.description || ""}`;

    if (card === booking) {
      const all = sentences(card.description || card.title);
      const howRe = /\.com|\bapp\b|\bcall|online|contact|manage trips|my trips|reservations?/i;
      const how = all.find((s) => howRe.test(s) && !/\b(cannot|can't|can not|not able)\b/i.test(s)) || null;
      const capacity = all.find((s) => CAPACITY.test(s));
      const points = all.filter((s) => s !== how && s !== capacity && keepPoint(s));
      if (fee) {
        const price = String(fee.title || "").replace(/^(in-cabin |cabin )?pet (fee|fare):\s*/i, "").trim();
        const feeHow = sentences(fee.description).filter((s) => keepPoint(s))[0];
        points.unshift(`Pet fee: ${price}.${feeHow ? ` ${feeHow}` : ""}`);
        drop.add(fee);
      }
      if (twoPets) points.push("You're bringing two pets, so book a seat and pay the fee for each one.");
      const due = bookingDue(trip, today);
      out.push({
        ...card,
        shortTitle: name ? `Book ${name}'s spot` : "Book your pet's spot",
        oneLine: `Book ${pet}'s spot with ${airline}${fee ? ` (${String(fee.title || "").replace(/^(in-cabin |cabin )?pet (fee|fare):\s*/i, "").trim()})` : ""}`,
        what: how ? how.replace(/\byour pet\b/i, pet) : `Add ${pet} to your ${airline} reservation.`,
        why: "",
        points,
        dueNote: capacity || "",
        dueDate: due,
        dueSuggested: true,
        mergedIds: [...new Set([...(card.mergedIds || []), ...(fee?.mergedIds || [])])],
        icon: "phone",
        groupHint: "first",
      });
      continue;
    }

    if (card === kennel) {
      const dims = shortCarrier(card.title || "");
      const points = sentences(card.description).filter(keepPoint);
      if (weight) {
        const w = String(weight.title || "").replace(/;\s*/g, ": ").replace(/\byour pet\b/i, pet).trim();
        points.unshift(/[.!?]$/.test(w) ? w : `${w}.`);
        drop.add(weight);
      }
      const fit = petFitSentence(trip?.pet, [card, weight].filter(Boolean));
      out.push({
        ...card,
        fact: false,
        shortTitle: "Get a carrier that fits",
        oneLine: dims ? `Use a carrier no bigger than ${dims}` : "Use a carrier that fits under the seat",
        what: dims ? `${airline}'s biggest under-seat carrier: ${dims}.` : "Use a carrier that fits under the seat in front of you.",
        why: "",
        points: points.slice(0, 1).concat(points.slice(1).sort(useful)).slice(0, 4).map(named),
        dueNote: fit && !/^Add |^Link /.test(fit) ? fit : (name ? `Add ${name}'s carrier size to the passport and we'll check the fit for you.` : ""),
        dueDate: trip?.travel_date ? addDays(trip.travel_date, -3) : card.dueDate,
        dueSuggested: true,
        mergedIds: [...new Set([...(card.mergedIds || []), ...(weight?.mergedIds || [])])],
        groupHint: "general",
      });
      continue;
    }

    if (c.includes("SEAT") && !c.includes("SERVICE")) {
      const all = sentences(card.description).filter(keepPoint);
      const pick = all.find((s) => /window|aisle/i.test(s));
      const points = [String(card.title || "").replace(/\.$/, "") + ".", ...all.filter((s) => s !== pick && !/cannot sit|can't sit|may not sit/i.test(s))].filter((s) => s.length > 1);
      out.push({
        ...card,
        fact: false,
        shortTitle: "Pick an allowed seat",
        oneLine: pick ? "Pick a window or aisle seat, not an exit row or bulkhead" : String(card.title || "Pick a seat that allows a cabin pet").replace(/\.$/, ""),
        what: pick ? `${pick.replace(/ are recommended\.?$/i, "")} work best.`.replace(/^Window or aisle seats work best\.$/, "Choose a window or aisle seat.") : String(card.title || "Ask which seats allow a cabin pet.").replace(/\.$/, "") + ".",
        why: "",
        points,
        dueNote: "",
        dueDate: bookingDue(trip, today),
        dueSuggested: true,
        groupHint: "general",
      });
      continue;
    }

    if (c === "AIRPORT DAY-OF" && /tsa|x-ray/i.test(raw)) {
      out.push({
        ...card,
        shortTitle: `Security with ${pet}`,
        oneLine: `At security, carry ${pet} through. The empty carrier goes on the belt`,
        what: `Take ${pet} out of the carrier at the checkpoint. The empty carrier goes through the X-ray.`,
        why: "",
        points: [`Carry ${pet} through the metal detector, with the leash off.`, "Never send a pet through the X-ray machine.", "Officers may check the carrier by hand."],
        dueNote: "",
      });
      continue;
    }

    if (c === "CONNECTIONS" && !trip?.connecting && !(Array.isArray(trip?.segments) && trip.segments.length > 1)) continue;

    if (c === "AIRPORT DAY-OF" && /relief/i.test(raw)) { out.push({ ...card, dueNote: "" }); continue; }

    if ((c.includes("NO CARGO") || c.includes("DOESN'T FIT")) && trip?.pet_travel !== "hold") {
      out.push({ ...card, shortTitle: "No cargo option", what: `${airline} only flies pets in the cabin.`, why: sentences(card.description)[1] || "", points: [], fact: true, groupHint: "know" });
      continue;
    }

    if (!twoPets && /two pets|two seats/i.test(`${card.shortTitle || ""} ${card.title || ""}`)) { drop.add(card); continue; }

    // "No breed restrictions", "No minimum age published": nothing to do, so leave them off.
    if (card.fact && (c.includes("AGE") || c.includes("BREED")) && /^no\b/i.test(String(card.title || "").trim())) continue;

    out.push(card);
  }

  return out.filter((c) => !drop.has(c)).map((c) => (c.points ? { ...c, points: c.points.map(named), what: named(c.what) } : c));
}
