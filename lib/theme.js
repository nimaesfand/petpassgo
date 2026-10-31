// Single source of truth for the PetPassGo look. Fonts are loaded once in app/layout.js via next/font/local.
export const tokens = {
  navy: "#14213D",       // brand / headings / dark bands
  navyDeep: "#0B1529",
  primary: "#C2410C",    // the ONE button color (white text = 5.2:1)
  primaryHover: "#9A3412",
  stamp: "#C2410C",      // legacy alias -> primary
  gold: "#F2B84B",       // accent on navy only
  sky: "#F3F5F9",        // page background
  paper: "#F8FAFC",
  ink: "#1A2333",
  muted: "#4B5565",      // secondary text (7.4:1 on white)
  line: "#DCE3EC",
  green: "#2F7A4A",
};
export const font = {
  display: "var(--font-display), system-ui, sans-serif",
  body: "var(--font-body), system-ui, sans-serif",
  mono: "var(--font-body), system-ui, sans-serif", // tags only: uppercase + letter-spacing
};
export const btn = {
  background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 600,
  textDecoration: "none", display: "inline-block", border: "none", cursor: "pointer",
};
