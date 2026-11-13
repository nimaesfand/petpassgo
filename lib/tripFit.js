// Trip-shape checks: connecting flights, a second airline, and cabin vs. hold.
// Every fact here was checked against the airline's own pet pages on 2026-11-08.
// The detailed rules live in airline_requirements; these are the deal-breakers
// a traveler should see before paying.

// Hawaiian now runs on Alaska's pet policy.
function norm(name) {
  return name === "Hawaiian Airlines" ? "Alaska Airlines" : name;
}

// Can a pet ride in the cargo hold / as checked baggage?
// "no": never. "restricted": only for narrow groups (e.g. military). "yes": open to regular travelers.
const HOLD = {
  "Delta": { state: "restricted", note: "Delta only ships pets in cargo for active-duty military and U.S. State Department moves." },
  "American Airlines": { state: "restricted", note: "American only checks pets for active-duty military and U.S. State Department travelers. Other pets too big for the cabin can ship separately with American Airlines Cargo (PetEmbark)." },
  "United": { state: "restricted", note: "United ended PetSafe. Pets fly in cargo only with certain active-duty military or State Department travelers." },
  "Southwest": { state: "no", note: "Southwest carries pets in the cabin only. Nothing goes in the cargo hold." },
  "JetBlue": { state: "no", note: "JetBlue carries pets in the cabin only. Dogs and cats aren't carried in cargo." },
  "Frontier": { state: "no", note: "Frontier doesn't check pets as baggage." },
  "Allegiant": { state: "no", note: "Allegiant doesn't carry animals in the cargo bin." },
  "Sun Country": { state: "no", note: "Sun Country doesn't carry pets as cargo." },
  "Alaska Airlines": { state: "yes", note: "Alaska and Hawaiian carry pets in a climate-controlled baggage compartment for a fee. Snub-nosed breeds aren't accepted there." },
  "Air Canada": { state: "yes", note: "Air Canada checks pets in a hard-sided kennel. Seasonal heat and cold embargoes apply." },
  "Aeroméxico": { state: "yes", note: "Aeroméxico carries larger pets in the hold in an approved kennel." },
  "Volaris": { state: "yes", note: "Volaris checks pets up to 45 kg (100 lb) with the kennel." },
  "Viva Aerobus": { state: "yes", note: "Viva carries pets in the hold, except on connecting flights, and not snub-nosed breeds." },
};

// What an airline says about connections or other airlines on the same trip.
const CONNECT = {
  "JetBlue": { otherAirline: "JetBlue doesn't accept pets on codeshare or partner-airline bookings. Keep every flight on a JetBlue-only booking." },
  "Sun Country": { otherAirline: "Sun Country won't accept pets on trips that include another airline." },
  "Allegiant": { otherAirline: "Allegiant sells only its own flights and won't check anything through to another airline." },
  "Alaska Airlines": { otherAirline: "Alaska and Hawaiian don't transfer pets to other airlines. A checked pet must be collected and re-checked, so allow at least 4 hours." },
  "Viva Aerobus": { connecting: "Viva doesn't carry pets in the hold on connecting flights. In the cabin is fine." },
  "American Airlines": { connecting: "If a connection is 4 hours or longer, American charges the carry-on pet fee again." },
};

export const TRAVEL_METHODS = [
  { id: "cabin", label: "In the cabin with me", sub: "In a carrier under the seat in front of you" },
  { id: "hold", label: "In the hold (checked)", sub: "In a kennel in the plane's climate-controlled baggage area" },
  { id: "unsure", label: "Not sure yet", sub: "We'll show you what each airline allows" },
];

export function holdInfo(airline) {
  return HOLD[norm(airline)] || null;
}

// Returns [{ level: "stop" | "warn" | "info", title, text }], most serious first.
export function tripFitWarnings(answers) {
  const out = [];
  const a1 = answers.airline;
  const a2 = answers.connecting && answers.second_airline && answers.second_airline !== a1 ? answers.second_airline : null;
  const airlines = [a1, a2].filter((x) => x && !/not sure/i.test(x));
  const isPet = answers.role !== "Service animal";

  if (isPet && answers.pet_travel === "hold") {
    for (const name of airlines) {
      const h = holdInfo(name);
      if (!h) continue;
      if (h.state === "no") out.push({ level: "stop", title: `${name} won't take your pet in the hold`, text: `${h.note} Your pet has to fit in an under-seat carrier, or you'll need a different airline.` });
      else if (h.state === "restricted") out.push({ level: "stop", title: `${name} checks pets only in limited cases`, text: `${h.note} Most travelers need an under-seat carrier, or a different airline.` });
      else out.push({ level: "info", title: `${name} carries pets in the hold`, text: h.note });
    }
  }
  if (isPet && answers.pet_travel === "unsure") {
    for (const name of airlines) {
      const h = holdInfo(name);
      if (h && h.state !== "yes") out.push({ level: "warn", title: `${name} only flies pets in the cabin`, text: `Your pet rides in a carrier under the seat in front of you. ${name} has no cargo option, so if that won't work, pick an airline that checks pets.` });
    }
  }

  if (answers.connecting) {
    if (a2) {
      out.push({ level: "warn", title: "Two airlines, two sets of rules", text: `Your pet has to be booked with ${a1} and with ${a2} separately, and pay each airline's pet fee. Your Travel Pass shows both airlines' rules.` });
      for (const name of airlines) {
        const c = CONNECT[norm(name)];
        if (c?.otherAirline) out.push({ level: "stop", title: `${name} and partner flights`, text: c.otherAirline });
      }
    } else {
      out.push({ level: "info", title: "Connecting flights", text: `Make sure your pet is added to every flight in your trip, not just the first one.` });
    }
    for (const name of airlines) {
      const c = CONNECT[norm(name)];
      if (c?.connecting) out.push({ level: isPet && answers.pet_travel === "hold" ? "stop" : "info", title: `${name} connections`, text: c.connecting });
    }
  }

  const rank = { stop: 0, warn: 1, info: 2 };
  return out.sort((x, y) => rank[x.level] - rank[y.level]);
}
