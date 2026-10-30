import { tokens } from "../lib/theme";

// A non-text bar where airline-specific or personal details would sit.
export default function MaskedLine({ label = "Shown after you pay", width = "70%" }) {
  return (
    <span className="inline-block overflow-hidden rounded-md align-middle" role="img" aria-label={label} style={{ width, maxWidth: "100%", height: 16, verticalAlign: "middle" }}>
      <span aria-hidden="true" style={{ display: "block", height: "100%", background: tokens.line, filter: "blur(2px)", transform: "scale(1.15)" }} />
    </span>
  );
}
