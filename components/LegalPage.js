import SiteHeader from "./SiteHeader";
import Prose from "./Prose";

export function LegalPage({ title, updated, children }) {
  return (
    <>
      <SiteHeader />
      <Prose>
        <h1 style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontSize: 40, color: "#14213D" }} className="mb-2">{title}</h1>
        <p className="mb-8" style={{ fontSize: 16, color: "#4B5565" }}>Effective date: {updated}</p>
        <div className="legal">{children}</div>
        <p className="mt-10" style={{ fontSize: 15, lineHeight: 1.5 }}><a href="/guarantee" style={{ color: "#14213D", textDecoration: "underline" }}>Flight-Ready Guarantee</a>. <a href="/guarantee" style={{ color: "#14213D", fontWeight: 700 }}>Terms</a>{" · "}<a href="/terms" style={{ color: "#14213D", textDecoration: "underline" }}>Terms of Service</a>{" · "}<a href="/privacy" style={{ color: "#14213D", textDecoration: "underline" }}>Privacy Policy</a></p>
      </Prose>
    </>
  );
}

export function H({ children }) {
  return <h2 style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontSize: 24, color: "#14213D" }} className="mt-10 mb-3">{children}</h2>;
}
export function P({ children }) { return <p className="mb-4">{children}</p>; }
export function UL({ children }) { return <ul className="mb-4 list-disc pl-6 space-y-1">{children}</ul>; }
export function Email() { return <a href="mailto:support@petpassgo.com" style={{ color: "#14213D", textDecoration: "underline" }}>support@petpassgo.com</a>; }
