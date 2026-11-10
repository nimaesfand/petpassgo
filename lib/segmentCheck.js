import { buildPassCards } from "./passCards";
import { checkoutKeyFromAnswers } from "./checkoutKey";
import { passReady, requirementQueryTypes, rulesRole, segmentPlans, segmentsToStore } from "./segments";

function rule(over) {
  return {
    id: over.id,
    category: over.category,
    title: over.title,
    description: over.description || over.title,
    status: "complete",
    source_url: over.source_url || "https://www.united.com/en/us/fly/travel/traveling-with-pets.html",
    verified_at: "2026-10-18",
    airline: over.airline,
    animal_type: over.animal_type || "Any",
    role: over.role || "Any",
    trip_type: over.trip_type,
    destination_match: over.destination_match || null,
  };
}

const unitedFee = rule({ id: "u-fee", airline: "United", category: "PET FEE", title: "Cabin pet fee: $150 each way", trip_type: "domestic" });
const unitedSeat = rule({ id: "u-seat", airline: "United", category: "SEAT RESTRICTION", title: "No exit row with a cabin pet", trip_type: "domestic" });
const unitedCargo = rule({ id: "u-cargo", airline: "United", category: "CARGO", title: "Checked pets are not offered", trip_type: "domestic" });
const deltaFee = rule({ id: "d-fee", airline: "Delta", category: "PET FEE", title: "Delta cabin pet fee", trip_type: "domestic" });
const aeroFee = rule({ id: "am-fee", airline: "Aeroméxico", category: "PET FEE", title: "Reserve the cabin pet", trip_type: "international", source_url: "https://www.aeromexico.com/es_mx/vuelos-con-mascotas" });
const aeroHold = rule({ id: "am-hold", airline: "Aeroméxico", category: "CARGO", title: "Larger pets may travel in the hold", trip_type: "international", source_url: "https://www.aeromexico.com/es_mx/vuelos-con-mascotas" });
const mexicoDog = rule({ id: "mx", airline: "Aeroméxico", category: "HEALTH DOCUMENTATION", title: "Mexico entry certificate", trip_type: "international", destination_match: "mexico,mex", source_url: "https://www.aphis.usda.gov/pet-travel/us-to-another-country-export/pet-travel-us-mexico" });
const canadaDog = rule({ id: "ca", airline: "Air Canada", category: "HEALTH DOCUMENTATION", title: "Canada entry papers", trip_type: "international", destination_match: "canada", source_url: "https://www.united.com/en/us/fly/travel/traveling-with-pets.html" });
const tsa = rule({ id: "tsa", airline: "Any", category: "AIRPORT DAY-OF", title: "TSA: take your pet out of the carrier", trip_type: "domestic", source_url: "https://www.tsa.gov/travel/frequently-asked-questions/can-i-take-my-pet-through-security-checkpoint" });
const dot = rule({ id: "dot", airline: "United", category: "REQUIRED FORM", title: "DOT Service Animal Air Transportation Form", trip_type: "domestic", role: "Service animal", source_url: "https://www.transportation.gov/resources/individuals/aviation-consumer-protection/service-animals" });
const lufthansa = rule({ id: "lh", airline: "Lufthansa", category: "PET FEE", title: "Lufthansa pet fee", trip_type: "international", source_url: "https://www.lufthansa.com/" });

function titles(cards) {
  return cards.map((card) => card.shortTitle).sort();
}

export function segmentSelfCheck() {
  const errors = [];
  const one = { airline: "United", role: "Pet", animal_type: "Dog", origin: "SFO", destination: "EWR", travel_date: "2026-12-01" };
  const rows = [unitedFee, unitedSeat, unitedCargo, deltaFee, tsa];
  const direct = titles(buildPassCards(rows, one));
  const via = segmentPlans(rows, one);
  if (via.length !== 1 || via[0].label) errors.push("one-leg plan was split");
  if (JSON.stringify(titles(via[0].cards)) !== JSON.stringify(direct)) errors.push(`one-leg cards changed: ${titles(via[0].cards)} vs ${direct}`);
  if (requirementQueryTypes(one).join() !== "domestic") errors.push("one-leg domestic query changed");

  const bare = { origin: "SFO", destination: "EWR", airline: "United", date: "2026-12-01", role: "Pet", animal: "Dog" };
  if (checkoutKeyFromAnswers(bare) !== checkoutKeyFromAnswers({ ...bare, pet_travel: "cabin", connecting: false })) errors.push("one-leg checkout key changed");
  if (segmentsToStore(bare)) errors.push("one-leg cabin trip stored segments");

  const connection = {
    ...one,
    destination: "MEX",
    connecting: true,
    segments: [
      { origin: "SFO", destination: "DFW", date: "2026-12-01", airline: "United", mode: "cabin" },
      { origin: "DFW", destination: "MEX", date: "2026-12-01", airline: "Aeroméxico", mode: "cabin" },
    ],
  };
  const mixed = segmentPlans([unitedFee, deltaFee, aeroFee, aeroHold, mexicoDog, tsa], connection);
  if (mixed.length !== 2) errors.push("connection did not make two flights");
  const firstAirlines = mixed[0].cards.map((card) => card.airline || card.shortTitle).join(" ");
  if (!mixed[0].cards.some((card) => /150|Pet fee|fee/i.test(card.shortTitle + card.what)) ) errors.push("United leg missed its fee");
  if (mixed[0].cards.some((card) => /Aeroméxico|Mexico entry|Delta/i.test(card.what + card.shortTitle))) errors.push("first leg reused another airline");
  if (!mixed[0].resolved) errors.push("United domestic leg unresolved");
  if (!mixed[1].cards.some((card) => /Mexico entry|Reserve the cabin/i.test(card.shortTitle + card.what))) errors.push("Mexico leg missed Aeroméxico rules");
  if (mixed[1].cards.some((card) => /150|Delta|TSA/i.test(card.shortTitle + card.what))) errors.push("Mexico leg reused the first flight");
  if (mixed[1].cards.some((card) => /hold/i.test(card.shortTitle))) errors.push("cabin leg showed the hold rule");
  if (requirementQueryTypes(connection).sort().join() !== "domestic,international") errors.push(`query types ${requirementQueryTypes(connection)}`);
  void firstAirlines;

  const holdLeg = { ...one, pet_travel: "hold" };
  const holdPlans = segmentPlans([unitedFee, unitedSeat, unitedCargo], holdLeg);
  if (holdPlans[0].cards.some((card) => /exit row/i.test(card.shortTitle + card.what))) errors.push("hold trip kept a cabin seat rule");
  if (!holdPlans[0].cards.some((card) => /cargo|checked/i.test(card.shortTitle + card.what))) errors.push("hold trip dropped the cargo rule");
  const cabinLeg = { ...one, pet_travel: "cabin" };
  const cabinPlans = segmentPlans([unitedFee, unitedSeat, unitedCargo], cabinLeg);
  if (cabinPlans[0].cards.some((card) => /cargo|checked pets/i.test(card.shortTitle + card.what))) errors.push("cabin trip kept a hold-only rule");
  if (!cabinPlans[0].cards.some((card) => /exit|fee/i.test(card.shortTitle + card.what))) errors.push("cabin trip dropped cabin rules");

  if (rulesRole("Service animal", true) !== "Pet") errors.push("ESA was not a pet");
  const esa = segmentPlans([unitedFee, dot], { ...one, role: "Service animal", esa: true });
  if (esa[0].cards.some((card) => card.dot || /DOT/i.test(card.shortTitle))) errors.push("ESA received a service-animal form");
  if (!esa[0].cards.some((card) => /fee/i.test(card.shortTitle + card.what))) errors.push("ESA missed the pet fee");

  const canada = segmentPlans([canadaDog, tsa, unitedFee], { airline: "Air Canada", role: "Pet", animal_type: "Dog", origin: "SFO", destination: "YYZ", travel_date: "2026-12-01", pet_travel: "cabin" });
  if (!canada[0].cards.some((card) => /Canada entry/i.test(card.shortTitle + card.what))) errors.push("Canada leg missed the Canada rule");
  if (canada[0].cards.some((card) => /TSA|150/i.test(card.shortTitle + card.what))) errors.push("Canada leg used a U.S. domestic rule");

  const mexicoDomestic = segmentPlans([tsa, aeroFee], { airline: "Aeroméxico", role: "Pet", animal_type: "Dog", origin: "MEX", destination: "CUN", travel_date: "2026-12-01", pet_travel: "cabin" });
  if (mexicoDomestic[0].cards.some((card) => /TSA/i.test(card.shortTitle + card.what))) errors.push("Mexico domestic segment used the U.S. TSA rule");

  const europe = segmentPlans([lufthansa], { airline: "Lufthansa", role: "Pet", animal_type: "Dog", origin: "SFO", destination: "LHR", travel_date: "2026-12-01" });
  if (europe[0].reason !== "outside" || europe[0].cards.length) errors.push("Europe route was offered");

  const missing = segmentPlans([], { ...one, airline: "Other / not sure yet", pet_travel: "cabin" });
  if (missing[0].resolved || missing[0].reason !== "missing") errors.push("missing airline was treated as ready");
  if (passReady({ complete: true }, missing)) errors.push("unresolved trip was marked ready");
  if (!passReady({ complete: true }, via)) errors.push("resolved one-leg was not ready");

  const stored = segmentsToStore({ connecting: true, stop: "DFW", origin: "SFO", destination: "MEX", airline: "United", second_airline: "Aeroméxico", date: "2026-12-01", pet_travel: "cabin", role: "Pet" });
  if (!stored || stored.length !== 2 || stored[1].airline !== "Aeroméxico" || stored[0].mode !== "cabin") errors.push(`segments not stored ${JSON.stringify(stored)}`);

  return errors;
}

const errors = segmentSelfCheck();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("segment checks ok");
