import SiteHeader from "./SiteHeader";
import Prose from "./Prose";

export function LegalPage({ title, updated, children }) {
  return (
    <>
      <SiteHeader />
      <Prose>
        <div className="mb-6 rounded-xl p-4" style={{ background: "#FFF7E6", border: "1px solid #F2B84B", fontSize: 15 }}>
          <strong>Draft – review by a lawyer recommended.</strong> This document is a working draft and has not yet been reviewed by legal counsel.
        </div>
        <h1 style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontSize: 40, color: "#14213D" }} className="mb-2">{title}</h1>
        <p className="mb-8" style={{ fontSize: 14, color: "#4B5565" }}>Last updated: {updated}</p>
        <div className="legal">{children}</div>
        <p className="mt-10" style={{ fontSize: 14 }}><a href="/terms" style={{ color: "#14213D", textDecoration: "underline" }}>Terms of Service</a> · <a href="/privacy" style={{ color: "#14213D", textDecoration: "underline" }}>Privacy Policy</a></p>
      </Prose>
    </>
  );
}

export function H({ children }) {
  return <h2 style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontSize: 24, color: "#14213D" }} className="mt-10 mb-3">{children}</h2>;
}
export function P({ children }) { return <p className="mb-4">{children}</p>; }
export function UL({ children }) { return <ul className="mb-4 list-disc pl-6 space-y-1">{children}</ul>; }
export function O({ children }) { return <mark style={{ background: "#FDE7C2", padding: "0 3px" }}>[OWNER: {children}]</mark>; }
