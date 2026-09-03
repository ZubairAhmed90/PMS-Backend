const { Alert, Patient, VitalReading } = require('../models');
const { Op } = require('sequelize');
const { computeRiskScore } = require('./riskScore');
const { generateSummary } = require('./llmSummary');
const { getRedisClient } = require('../config/redis');

const pendingConfirmations = new Map();

/**
 * Create an alert when risk is warning or critical.
 * For fall alerts, start a 15-second confirmation timer.
 */
async function createAlertIfRisky(patientId, reading, riskResult) {
  const { risk_score, alert_level, alert_type } = riskResult;

  if (alert_level === 'normal' || !alert_type) return null;

  const patient = await Patient.findByPk(patientId);
  if (!patient) return null;

  const alert = await Alert.create({
    patient_id: patientId,
    timestamp: reading.timestamp || new Date(),
    type: alert_type,
    risk_score,
    status: 'pending_confirmation',
  });

  // Cache risk score in Redis (optional)
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.set(`risk:${patientId}`, JSON.stringify({ risk_score, alert_level, alertId: alert.id }));
    }
  } catch (err) {
    console.error('[Redis] Failed to cache risk score:', err.message);
  }

  // Generate LLM summary asynchronously (never block alert creation)
  generateAlertSummary(alert, patient);

  // For fall alerts, start 15-second confirmation timer
  if (alert_type === 'fall') {
    startConfirmationTimer(alert);
  } else {
    // Non-fall alerts auto-confirm
    await alert.update({ status: 'confirmed' });
  }

  return alert;
}

function startConfirmationTimer(alert) {
  const timer = setTimeout(async () => {
    try {
      const fresh = await Alert.findByPk(alert.id);
      if (fresh && fresh.status === 'pending_confirmation') {
        await fresh.update({ status: 'confirmed' });
        console.log(`[Alert] ${alert.id} auto-confirmed (no response in 15s)`);
      }
    } catch (err) {
      console.error('[Alert] Timer error:', err.message);
    }
    pendingConfirmations.delete(alert.id);
  }, 15000);

  pendingConfirmations.set(alert.id, timer);
}

async function confirmAlert(alertId, ok) {
  const alert = await Alert.findByPk(alertId);
  if (!alert) return null;
  if (alert.status !== 'pending_confirmation') return alert;

  // Clear the timer
  const timer = pendingConfirmations.get(alertId);
  if (timer) {
    clearTimeout(timer);
    pendingConfirmations.delete(alertId);
  }

  const newStatus = ok ? 'false_alarm' : 'confirmed';
  await alert.update({ status: newStatus });
  return alert;
}

async function generateAlertSummary(alert, patient) {
  try {
    const recentVitals = await VitalReading.findAll({
      where: {
        patient_id: patient.id,
        timestamp: { [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) },
      },
      order: [['timestamp', 'DESC']],
      limit: 10,
      raw: true,
    });

    const summary = await generateSummary({
      patientName: patient.name,
      alertType: alert.type,
      riskScore: alert.risk_score,
      recentVitals,
    });

    if (summary) {
      await alert.update({ summary_text: summary });
    }
  } catch (err) {
    console.error('[LLM] Summary generation error:', err.message);
  }
}

module.exports = { createAlertIfRisky, confirmAlert };
