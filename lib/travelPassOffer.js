// One place for how the Travel Pass and the membership are pitched.
// Every line here must match what the product actually does (see
// /api/trip-extras, PassChecklist, TripTimeline, VetGuidance, DayOfMode).
import { PRICES as P } from "./pricing";
import { PET_RELIEF } from "./petRelief";

// Membership is pitched as the Pet Vault, with one plain subline.
export const VAULT_NAME = "Pet Vault";
export const VAULT_SUB = "Your pet’s records, ID and more, all in one place.";

// The three things we do differently, in order.
export const PASS_EDGE = [
  { icon: "plane", title: "Built for your exact flight and pet", line: "Your airline, route and animal, service animals included. Not a generic guide." },
  { icon: "link", title: "Source and check date", line: "A step is shown when we have the official page and the date we last checked it." },
  { icon: "clock", title: "Flight day on one screen", line: "Live flight status, weather at both airports, your documents and Pet ID." },
];

const reliefAirports = Object.keys(PET_RELIEF).join(", ");

// Everything else, grouped. One short line each.
export const PASS_GROUPS = [
  ["Before you fly", ["Cabin or cargo: what your airline allows", "How to book your pet’s spot, the fee and carrier size", "Add your return flight to the same pass"]],
  ["Documents & vet", ["The documents and vaccines your trip needs", "What to ask your vet, and when to go", "Service animals: the DOT forms and when to send them"]],
  ["At the airport", ["Your airline’s temperature rules for checked pets", `Pet relief areas (${reliefAirports})`, "Vets and pet stores near where you land"]],
  ["Flight day", ["Live flight status, your documents and Pet ID on one screen", "Check off each step and see what’s left"]],
];

// Plan cards share the same bullet style everywhere.
export const JOIN_PASS_POINTS = [
  `This trip’s Travel Pass at the ${P.memberPass} member price`,
  `${VAULT_NAME}: your pet’s records, ID and more, all year`,
  `Every future pass ${P.memberPass}`,
];
export const JOIN_PASS_NOTE = `Then ${P.member}/mo. Renews monthly until you cancel online in Billing.`;
export const MEMBERSHIP_TERMS = `Renews at ${P.member}/month until you cancel. Cancel online anytime in account Billing. No phone call. You keep access through the month you've paid.`;

export function passOnlyPoints(accessLine) {
  return [
    "This trip’s full Travel Pass",
    accessLine || `${VAULT_NAME} & Pet ID until 7 days after your trip`,
    "One-time, no subscription",
  ];
}
