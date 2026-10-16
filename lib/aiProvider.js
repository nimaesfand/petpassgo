// Shared server-side AI provider (same approach as the original document check).
// Keys stay on the server. Returns null when no provider is configured.
export function aiProvider() {
  if (process.env.AI_GATEWAY_API_KEY)
    return { url: "https://ai-gateway.vercel.sh/v1/chat/completions", key: process.env.AI_GATEWAY_API_KEY, model: process.env.DOC_CHECK_MODEL || "openai/gpt-4o-mini" };
  if (process.env.OPENAI_API_KEY)
    return { url: "https://api.openai.com/v1/chat/completions", key: process.env.OPENAI_API_KEY, model: process.env.DOC_CHECK_MODEL || "gpt-4o-mini" };
  return null;
}
export const AI_KEY_HINT = "AI_GATEWAY_API_KEY or OPENAI_API_KEY";
