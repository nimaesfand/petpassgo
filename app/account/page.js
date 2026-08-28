"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const tokens = {
  navy: "#152238",
  gold: "#C9A227",
  sky: "#EAF0F6",
  paper: "#F6F8FA",
  ink: "#1C2733",
  stamp: "#B23A2E",
  line: "#D9E1E8",
};

const font = {
  display: "'Fraunces', serif",
  mono: "'IBM Plex Mono', monospace",
  body: "'Inter', sans-serif",
};

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full flex items-center justify-center">
        <span style={{ fontFamily: font.body, color: tokens.ink, opacity: 0.6 }}>Loading…</span>
      </div>
    );
  }

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full flex justify-center px-4 py-16">
      <div className="w-full max-w-[520px]">
        <div className="flex items-center justify-between mb-8">
          <span style={{ fontFamily: font.display, fontWeight: 600, fontSize: 22, color: tokens.navy }}>
            PetPassGo
          </span>
          <button
            onClick={handleLogout}
            style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.ink, opacity: 0.6 }}
          >
            Log out
          </button>
        </div>

        <div className="rounded-2xl p-8" style={{ background: tokens.paper, border: `1px solid ${tokens.line}` }}>
          <div style={{ fontFamily: font.mono, fontSize: 10.5, color: tokens.stamp, letterSpacing: "0.1em" }} className="mb-2">
            YOUR ACCOUNT
          </div>
          <h1 style={{ fontFamily: font.display, fontSize: 24, color: tokens.navy }} className="mb-6">
            {user?.email}
          </h1>

          <div className="rounded-xl p-5 text-center" style={{ background: "#fff", border: `1px dashed ${tokens.line}` }}>
            <p style={{ fontFamily: font.body, fontSize: 14, opacity: 0.65 }}>
              Your pet's profile, trips, and documents will show up here next.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
