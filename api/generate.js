const {
  normalizeRequestBody,
  buildOpenAIRequest,
  extractStructuredOutput,
  sanitizeModelOutput,
} = require('../lib/ai-bio-core');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
  const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';

  if (!OPENAI_API_KEY) {
    return res.status(503).json({ ok: false, error: 'Chưa cấu hình OPENAI_API_KEY trên Vercel.' });
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const payload = normalizeRequestBody(body);
    const requestBody = buildOpenAIRequest(payload, OPENAI_MODEL);

    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await apiResponse.text();
    let responseJson = {};
    try {
      responseJson = responseText ? JSON.parse(responseText) : {};
    } catch {
      responseJson = {};
    }

    if (!apiResponse.ok) {
      const message = responseJson?.error?.message || responseJson?.message || 'OpenAI API trả về lỗi.';
      return res.status(apiResponse.status).json({ ok: false, error: message });
    }

    const parsedOutput = extractStructuredOutput(responseJson);
    const sanitized = sanitizeModelOutput(parsedOutput, payload);

    return res.status(200).json({
      ok: true,
      model: OPENAI_MODEL,
      summary: sanitized.summary,
      persona: sanitized.persona,
      style: sanitized.style,
      suggestions: sanitized.suggestions,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Server gặp lỗi không xác định.',
    });
  }
};
