// Shared server-side AI provider. Keys stay on the server.
// Order: AI Gateway key, OpenAI key, then Vercel's built-in OIDC token for AI Gateway
// (sent on every request to a Vercel Function, so no key has to be pasted anywhere).
export function aiProvider(req, modelEnv = "DOC_CHECK_MODEL") {
  const model = process.env[modelEnv] || "openai/gpt-4o-mini";
  if (process.env.AI_GATEWAY_API_KEY)
    return { url: "https://ai-gateway.vercel.sh/v1/chat/completions", key: process.env.AI_GATEWAY_API_KEY, model };
  if (process.env.OPENAI_API_KEY)
    return { url: "https://api.openai.com/v1/chat/completions", key: process.env.OPENAI_API_KEY, model: (process.env[modelEnv] || "gpt-4o-mini").replace(/^openai\//, "") };
  const oidc = req?.headers?.get?.("x-vercel-oidc-token") || process.env.VERCEL_OIDC_TOKEN;
  if (oidc) return { url: "https://ai-gateway.vercel.sh/v1/chat/completions", key: oidc, model };
  return null;
}
export const AI_KEY_HINT = "AI_GATEWAY_API_KEY or OPENAI_API_KEY";
