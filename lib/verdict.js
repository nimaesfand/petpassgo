// One clear answer for a trip: can this pet fly it? Used free on the trip check
// and at the top of a paid Travel Pass. Unknowns are said out loud, never guessed.

export const VERDICT_LOOK = {
  go: { label: "Can fly", color: "#15803D", soft: "#E8F6EC", icon: "check" },
  action: { label: "Action needed", color: "#B45309", soft: "#FEF3C7", icon: "alert" },
  no: { label: "Not allowed", color: "#B91C1C", soft: "#FDECEC", icon: "x" },
  check: { label: "Check with airline", color: "#475569", soft: "#EEF2F6", icon: "help" },
};

function daysUntil(d) {
  if (!d) return null;
  const t = new Date(`${String(d).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(t.getTime())) return null;
  return Math.round((t - new Date()) / 864e5);
}

// rows: requirement rows for this trip (already filtered to the destination).
// trip: { airline, second_airline, connecting, role, pet_travel, date|travel_date, petName }
// fitWarnings: output of tripFitWarnings (optional)
export function tripVerdict({ rows, trip, fitWarnings = [] }) {
  const pet = trip.petName || "your pet";
  const airline = trip.airline;
  const isPet = trip.role !== "Service animal";
  const mode = trip.pet_travel || "cabin";
  if (!airline || /not sure/i.test(airline)) {
    return { key: "check", title: "Pick your airline for a firm answer", text: "Rules change a lot from one airline to the next. Choose yours and we'll check it." };
  }
  if (!rows || rows.length === 0) {
    return { key: "check", title: `We haven't verified ${airline}'s pet rules yet`, text: "We only show rules we can link to an official page. Confirm with the airline before you book." };
  }
  const blocks = rows.filter((r) => r.blocks);
  const all = blocks.find((r) => r.blocks === "all");
  if (isPet && all) return { key: "no", title: `${pet[0].toUpperCase() + pet.slice(1)} can't fly this route on ${all.airline === "Any" ? airline : all.airline}`, text: all.title || "This airline doesn't carry pets on this route. Try a different airline.", reasons: [all.title].filter(Boolean) };
  const cabin = blocks.find((r) => r.blocks === "cabin");
  const hold = blocks.find((r) => r.blocks === "hold") || (isPet && mode === "hold" ? fitWarnings.find((w) => w.level === "stop") : null);
  if (isPet && mode === "cabin" && cabin) return { key: "no", title: `No cabin pets on this trip`, text: cabin.title || "This airline doesn't allow pets in the cabin here.", reasons: [cabin.title].filter(Boolean) };
  if (isPet && mode === "hold" && hold) return { key: "no", title: `${pet[0].toUpperCase() + pet.slice(1)} can't fly in the hold on this trip`, text: hold.title || hold.text || "This airline doesn't check pets.", reasons: [hold.title].filter(Boolean) };
  if (isPet && mode === "unsure" && cabin && hold) return { key: "no", title: `${pet[0].toUpperCase() + pet.slice(1)} can't fly this route on ${airline}`, text: "No cabin pets and no checked pets here. Try a different airline." };
  if (isPet && mode === "unsure" && (cabin || hold)) return { key: "action", title: cabin ? "Hold only on this trip" : "Cabin only on this trip", text: cabin ? `${cabin.title}.` : `${pet[0].toUpperCase() + pet.slice(1)} needs to fit in an under-seat carrier.` };
  const stop = fitWarnings.find((w) => w.level === "stop");
  if (stop) return { key: "action", title: stop.title, text: stop.text };

  const steps = rows.filter((r) => r.status === "attention").length;
  const days = daysUntil(trip.travel_date || trip.date);
  if (days !== null && days >= 0 && days < 14 && steps > 0) {
    return { key: "action", title: `Yes, but the clock is tight`, text: `${steps} step${steps === 1 ? "" : "s"} to finish in ${days} day${days === 1 ? "" : "s"}. Start today.` };
  }
  return { key: "go", title: `Yes, ${pet} can fly this trip`, text: steps ? `${steps} thing${steps === 1 ? "" : "s"} to do first. Your Travel Pass lists each one with its deadline.` : "Follow your airline's booking steps and you're set." };
}

// The headline facts people want first: what it costs and what carrier they need.
export function tripFacts(rows, trip) {
  const main = trip.airline === "Hawaiian Airlines" ? "Alaska Airlines" : trip.airline;
  const mine = (cat) => rows.filter((r) => r.category === cat && r.title && r.airline === main && !r.destination_match);
  if (trip.role === "Service animal") {
    return { fee: "No charge", carrier: "Not needed. Harness or leash", };
  }
  const mode = trip.pet_travel || "cabin";
  const feeRow = mine("PET FEE")[0];
  const carrierRow = mine("KENNEL REQUIREMENT").sort((a, b) => Number(/^(american eagle|737)/i.test(a.title)) - Number(/^(american eagle|737)/i.test(b.title)))[0];
  const fee = mode === "hold" ? null : feeRow ? feeRow.title.replace(/^in-cabin pet fee:\s*/i, "").replace(/^pet fare:\s*/i, "") : null;
  const carrier = mode === "hold" ? null : carrierRow ? carrierRow.title.replace(/^carrier max:\s*/i, "Max ") : null;
  return { fee, carrier };
}
