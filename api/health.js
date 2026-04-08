export default async function handler(req, res) {
  return res.status(200).json({
    ok: true,
    provider: "xai",
    model: "grok-4.20-reasoning",
    hasApiKey: Boolean(process.env.XAI_API_KEY),
    timestamp: new Date().toISOString(),
  });
}
