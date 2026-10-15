// Single source of truth for prices shown in the UI. (Stripe will charge these later.)
export const PRICES = { member: "$6.99", memberUnit: "/mo", memberPass: "$19.99", pass: "$49.99", joinToday: "$26.98", savings: "$30" };
export const SITE_LAUNCHED = process.env.NEXT_PUBLIC_SITE_LAUNCHED === "true";
