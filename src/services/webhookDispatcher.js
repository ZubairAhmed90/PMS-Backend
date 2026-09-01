const axios = require('axios');
const { Organization, Patient, Admission } = require('../models');
const { Op } = require('sequelize');

/**
 * Fire-and-forget webhook dispatch to hospital systems.
 * Retries once on failure, never blocks the main alert flow.
 */
async function dispatchWebhook(patientId, alert) {
  try {
    // Find active admissions to get relevant organizations
    const admissions = await Admission.findAll({
      where: {
        patient_id: patientId,
        discharged_at: { [Op.is]: null },
      },
      include: [{ model: Organization, as: 'organization' }],
    });

    for (const admission of admissions) {
      const org = admission.organization;
      if (!org || !org.webhook_url) continue;

      const patient = await Patient.findByPk(patientId);
      const payload = {
        patient_id: patientId,
        patient_name: patient ? patient.name : 'Unknown',
        room: admission.room_or_location,
        risk_score: alert.risk_score,
        alert_type: alert.type,
        summary_text: alert.summary_text,
        timestamp: alert.timestamp,
      };

      try {
        await axios.post(org.webhook_url, payload, { timeout: 5000 });
        console.log(`[Webhook] Delivered to ${org.name}`);
      } catch (err) {
        console.warn(`[Webhook] First attempt failed for ${org.name}, retrying...`);
        // Retry once
        try {
          await axios.post(org.webhook_url, payload, { timeout: 5000 });
          console.log(`[Webhook] Retry delivered to ${org.name}`);
        } catch (retryErr) {
          console.error(`[Webhook] Failed to deliver to ${org.name}: ${retryErr.message}`);
        }
      }
    }
  } catch (err) {
    console.error('[Webhook] Dispatch error:', err.message);
  }
}

module.exports = { dispatchWebhook };
