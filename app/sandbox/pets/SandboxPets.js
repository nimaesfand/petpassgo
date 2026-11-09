"use client";

import { createSandboxClient, resetSandbox } from "../../../lib/sandbox";

if (typeof window !== "undefined" && !window.__ppgSandbox) {
  window.__ppgSandbox = createSandboxClient();
  if (!new URLSearchParams(window.location.search).get("tab")) {
    const u = new URL(window.location.href);
    u.searchParams.set("tab", "vault");
    window.history.replaceState(null, "", u);
  }
}

import AccountPage from "../../account/page";

export default function SandboxPets() {
  return (
    <>
      <div style={{ position: "fixed", left: 8, bottom: 8, zIndex: 9999, background: "#14213D", color: "#fff", fontFamily: "system-ui", fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 999, opacity: 0.85 }}>
        Practice copy · sample data ·{" "}
        <button type="button" onClick={() => { resetSandbox(); window.location.reload(); }} style={{ color: "#F2B84B", background: "none", border: "none", fontWeight: 800, cursor: "pointer", padding: 0 }}>Reset</button>
      </div>
      <AccountPage />
    </>
  );
}
