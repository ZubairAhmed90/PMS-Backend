/**
 * Test LLM summary generation standalone.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { generateSummary } = require('../src/services/llmSummary');

async function test() {
  const fakeAlert = {
    patientName: 'Fatima Bibi',
    alertType: 'hr_anomaly',
    riskScore: 68,
    recentVitals: [
      { heart_rate: 142, spo2: 94, timestamp: new Date(Date.now() - 60000) },
      { heart_rate: 138, spo2: 95, timestamp: new Date(Date.now() - 120000) },
      { heart_rate: 135, spo2: 95, timestamp: new Date(Date.now() - 180000) },
      { heart_rate: 88, spo2: 97, timestamp: new Date(Date.now() - 240000) },
      { heart_rate: 75, spo2: 98, timestamp: new Date(Date.now() - 300000) },
    ],
  };

  console.log('[Test] Generating LLM summary...');
  const summary = await generateSummary(fakeAlert);

  if (summary) {
    console.log('[Test] Summary:', summary);
  } else {
    console.log('[Test] No summary returned (check DASHSCOPE_API_KEY)');
  }
}

test().catch(console.error);
