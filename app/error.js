"use client";
export default function Error({ reset }) {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
      <div>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>Something went wrong on this page.</h2>
        <p style={{ opacity: 0.7, marginBottom: 16 }}>Your answers are safe. Please try again, or email support@petpassgo.com.</p>
        <button onClick={() => reset()} style={{ padding: "10px 22px", borderRadius: 999, background: "#14213D", color: "#fff" }}>Try again</button>
      </div>
    </div>
  );
}
