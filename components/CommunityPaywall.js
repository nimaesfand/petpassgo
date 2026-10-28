import { tokens, font } from "../lib/theme";
import { PRICES as P } from "../lib/pricing";

export default function CommunityPaywall({ boardName, signedIn }) {
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ border: `1px solid ${tokens.line}` }}>
      <div style={{ filter: "blur(5px)", opacity: 0.6 }} className="p-6 space-y-5 bg-white" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-3 w-32 rounded mb-2" style={{ background: tokens.line }} />
            <div className="h-5 w-3/4 rounded mb-2" style={{ background: "#C9D3E3" }} />
            <div className="h-3 w-full rounded mb-1" style={{ background: tokens.line }} />
            <div className="h-3 w-5/6 rounded" style={{ background: tokens.line }} />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-5" style={{ background: "rgba(243,245,249,.55)" }}>
        <div className="rounded-2xl p-7 text-center max-w-md" style={{ background: "#fff", boxShadow: "0 18px 40px rgba(20,33,61,.18)", border: `1px solid ${tokens.line}` }}>
          <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 700, color: tokens.navy }} className="mb-2">
            {signedIn ? "Join to post" : "Sign in to read"}
          </div>
          <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.muted }} className="mb-5">
            {/lost/i.test(boardName || "")
              ? (signedIn
                ? "Browse is free with your account. Membership unlocks posting on this board."
                : "Sign in with a free account to read posts. Each one is for a state and city, and only after the owner taps Report lost.")
              : (signedIn
                ? `Browse is free with your account. Membership unlocks posting on the ${boardName || "airline"} board.`
                : `Sign in with a free account to read tips from people who flew ${boardName || "your airline"} with their pet. Members can post and reply.`)}
          </p>
          {signedIn ? (
            <a href="/join" className="btn-primary block rounded-full py-3.5" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 600, textDecoration: "none" }}>Join for {P.member}/mo</a>
          ) : (
            <>
              <a href="/login" className="btn-primary block rounded-full py-3.5 mb-2" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 600, textDecoration: "none" }}>Log in</a>
              <a href="/signup?free=1" className="block rounded-full py-3" style={{ fontFamily: font.body, fontWeight: 600, color: tokens.navy, textDecoration: "none" }}>Create a free account</a>
            </>
          )}
          <p style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }} className="mt-3">
            Membership also includes Pet ID, finder messages to you, and {P.memberPass} Travel Passes.
          </p>
        </div>
      </div>
    </div>
  );
}
