/**
 * MQTT Ingestion Worker
 *
 * Separate process that subscribes to device vitals topics,
 * stores readings in PostgreSQL, and publishes to Redis for
 * the API layer to pick up.
 *
 * Run: node workers/ingest.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mqtt = require('mqtt');
const config = require('../src/config');
const { sequelize } = require('../src/models');
const { ingestVitals } = require('../src/services/vitalsService');
const { updateBaseline } = require('../src/services/baseline');
const { computeRiskScore } = require('../src/services/riskScore');
const { createAlertIfRisky } = require('../src/services/alertService');
const { dispatchWebhook } = require('../src/services/webhookDispatcher');
const { getRedisClient } = require('../src/config/redis');
const { Admission, Organization } = require('../src/models');
const { Op } = require('sequelize');

let redis = null;

async function start() {
  // Connect to database
  await sequelize.authenticate();
  console.log('[Worker] DB connected');

  redis = getRedisClient();

  // Connect to MQTT broker
  const client = mqtt.connect(config.mqtt.brokerUrl, {
    clientId: `pms-ingest-${Date.now()}`,
    reconnectPeriod: 5000,
  });

  client.on('connect', () => {
    console.log('[Worker] MQTT connected');
    client.subscribe('device/+/vitals', (err) => {
      if (err) console.error('[Worker] Subscribe error:', err);
      else console.log('[Worker] Subscribed to device/+/vitals');
    });
  });

  client.on('message', async (topic, message) => {
    try {
      // Extract device_key from topic: device/{device_key}/vitals
      const parts = topic.split('/');
      const deviceKey = parts[1];
      const payload = JSON.parse(message.toString());

      // Store the reading
      const { reading, patientId, patientName } = await ingestVitals(deviceKey, payload);
      console.log(`[Worker] Stored reading for ${patientName} (HR:${payload.heart_rate} SpO2:${payload.spo2})`);

      // Update baseline
      await updateBaseline(patientId);

      // Compute risk score
      const riskResult = await computeRiskScore(patientId, reading);

      // Cache risk in Redis
      await redis.set(`risk:${patientId}`, JSON.stringify({
        risk_score: riskResult.risk_score,
        alert_level: riskResult.alert_level,
        reading_id: reading.id,
        timestamp: reading.timestamp,
      }));

      // Publish to Redis channel for API layer
      await redis.publish('vitals:new', JSON.stringify({
        patientId,
        patientName,
        reading: reading.toJSON(),
        risk: riskResult,
      }));

      // Create alert if risky
      if (riskResult.alert_level !== 'normal') {
        const alert = await createAlertIfRisky(patientId, reading, riskResult);
        if (alert) {
          console.log(`[Worker] ALERT created: ${alert.type} (score: ${riskResult.risk_score}) for ${patientName}`);

          // Publish alert to Redis
          await redis.publish('alert:new', JSON.stringify({
            patientId,
            alert: alert.toJSON(),
            risk: riskResult,
          }));

          // Dispatch webhook (fire-and-forget)
          dispatchWebhook(patientId, alert);
        }
      }
    } catch (err) {
      console.error('[Worker] Processing error:', err.message);
    }
  });

  client.on('error', (err) => {
    console.error('[Worker] MQTT error:', err.message);
  });

  client.on('reconnect', () => {
    console.log('[Worker] MQTT reconnecting...');
  });
}

start().catch((err) => {
  console.error('[Worker] Fatal:', err);
  process.exit(1);
});
