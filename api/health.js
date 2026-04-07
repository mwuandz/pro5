module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  return res.status(200).json({
    ok: true,
    configured: Boolean(process.env.XAI_API_KEY),
    model: process.env.OPENAI_MODEL || 'grok-4.20-reasoning',
  });
};
