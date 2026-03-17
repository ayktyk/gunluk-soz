const MODEL_FALLBACKS = [
  'claude-3-5-haiku-20241022',
  'claude-3-5-sonnet-20241022',
  'claude-3-haiku-20240307'
];

function normalizeBody(body) {
  if (!body) return {};
  if (typeof body === 'string') return JSON.parse(body);
  return body;
}

function getErrorMessage(data) {
  if (!data) return '';
  if (typeof data.error === 'string') return data.error;
  return data.error?.message || data.message || '';
}

function isModelAccessError(status, data) {
  if (![400, 403, 404].includes(status)) return false;
  const msg = getErrorMessage(data).toLowerCase();
  return /model|access|permission|available|not[\s_-]?found|unsupported/.test(msg);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' });
  }

  try {
    const requestBody = normalizeBody(req.body);
    const requestedModel = requestBody.model;
    const modelsToTry = [
      requestedModel,
      ...MODEL_FALLBACKS
    ].filter((value, index, list) => value && list.indexOf(value) === index);

    let lastResult = null;

    for (const model of modelsToTry) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({ ...requestBody, model })
      });

      const data = await response.json().catch(() => null);
      if (response.ok) {
        return res.status(response.status).json(data);
      }

      lastResult = { status: response.status, data, model };
      if (!isModelAccessError(response.status, data)) {
        break;
      }
    }

    const errorPayload = lastResult?.data || { error: 'Upstream request failed' };
    return res.status(lastResult?.status || 502).json({
      ...errorPayload,
      attemptedModel: lastResult?.model,
      attemptedModels: modelsToTry
    });
  } catch (error) {
    console.error('Anthropic proxy failed:', error);
    return res.status(502).json({ error: error.message || 'Upstream request failed' });
  }
};
