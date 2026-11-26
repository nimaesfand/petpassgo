import http2 from "http2";

// Apple Wallet update pushes: an empty push to each registered device makes Wallet
// ask our web service for the latest pass. Uses the same Pass Type ID certificate.
// Only works against Apple's production APNs host.
function pem(name) {
  const raw = String(process.env[name] || "").trim();
  if (!raw) return null;
  if (raw.includes("BEGIN ")) return raw;
  try { const t = Buffer.from(raw, "base64").toString("utf8"); return t.includes("BEGIN ") ? t : null; } catch { return null; }
}

export async function pushWalletUpdate(pushTokens) {
  const cert = pem("APPLE_PASS_CERT_BASE64"), key = pem("APPLE_PASS_KEY_BASE64"), topic = process.env.APPLE_PASS_TYPE_ID;
  if (!cert || !key || !topic || !pushTokens?.length) return { sent: 0 };
  return new Promise((resolve) => {
    let client;
    try {
      client = http2.connect("https://api.push.apple.com:443", { cert, key, passphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || undefined });
    } catch { resolve({ sent: 0 }); return; }
    let left = pushTokens.length, sent = 0;
    const done = () => { if (--left === 0) { client.close(); resolve({ sent }); } };
    client.on("error", () => { try { client.close(); } catch {} resolve({ sent }); });
    for (const token of pushTokens) {
      const req = client.request({ ":method": "POST", ":path": `/3/device/${token}`, "apns-topic": topic, "apns-push-type": "background", "content-type": "application/json" });
      req.on("response", (h) => { if (h[":status"] === 200) sent++; });
      req.on("error", done);
      req.on("end", done);
      req.end("{}");
      req.resume();
    }
    setTimeout(() => { try { client.close(); } catch {} resolve({ sent }); }, 8000);
  });
}
