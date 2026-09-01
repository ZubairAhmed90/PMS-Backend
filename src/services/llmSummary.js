const axios = require('axios');
const config = require('../config');

/**
 * Generate a nurse-readable summary for an alert using Alibaba Cloud DashScope (Qwen).
 * Returns the summary text or null on failure.
 */
async function generateSummary({ patientName, alertType, riskScore, recentVitals }) {
  if (!config.dashscope.apiKey) {
    console.warn('[LLM] No DASHSCOPE_API_KEY configured — skipping summary');
    return null;
  }

  const vitalsSummary = recentVitals
    .slice(0, 5)
    .map((v) => `HR:${v.heart_rate} SpO2:${v.spo2} at ${new Date(v.timestamp).toISOString()}`)
    .join('; ');

  const prompt = `You are a clinical monitoring assistant. Given the following alert data, write a short (1-2 sentence) plain-language clinical note for a nurse. Be specific with numbers. Do not add disclaimers.

Patient: ${patientName}
Alert type: ${alertType}
Risk score: ${riskScore}/100
Recent vitals: ${vitalsSummary}

Write the note:`;

  try {
    const response = await axios.post(
      `${config.dashscope.baseUrl}/chat/completions`,
      {
        model: config.dashscope.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${config.dashscope.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return response.data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('[LLM] Summary generation failed:', err.message);
    return null;
  }
}

module.exports = { generateSummary };
