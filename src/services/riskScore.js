const { PatientBaseline, VitalReading } = require('../models');
const { Op } = require('sequelize');

/**
 * Compute a fused risk score (0-100) for a new vital reading.
 *
 * Components:
 *  - HR deviation from personal baseline (z-score based)
 *  - SpO2 below 92 (hard clinical threshold)
 *  - Fall heuristic (acceleration spike + stillness)
 *
 * Returns: { risk_score, alert_level, alert_type }
 */
async function computeRiskScore(patientId, reading) {
  const baseline = await PatientBaseline.findOne({ where: { patient_id } });

  let hrComponent = 0;
  let spo2Component = 0;
  let fallComponent = 0;
  let alertType = null;

  // --- HR deviation ---
  if (baseline && baseline.hr_std > 0 && reading.heart_rate != null) {
    const zScore = Math.abs(reading.heart_rate - baseline.hr_mean) / baseline.hr_std;
    // z > 2 starts scoring, z > 4 is max
    hrComponent = Math.min(40, Math.max(0, (zScore - 2) * 20));
    if (zScore > 2.5) alertType = 'hr_anomaly';
  } else if (reading.heart_rate != null) {
    // No baseline yet — use generic safe range 60-100
    if (reading.heart_rate > 120 || reading.heart_rate < 50) {
      hrComponent = 30;
      alertType = 'hr_anomaly';
    }
  }

  // --- SpO2 ---
  if (reading.spo2 != null) {
    if (reading.spo2 < 90) {
      spo2Component = 40;
      alertType = 'spo2_low';
    } else if (reading.spo2 < 92) {
      spo2Component = 25;
      alertType = 'spo2_low';
    } else if (reading.spo2 < 95) {
      spo2Component = 10;
    }
  }

  // --- Fall detection heuristic ---
  if (reading.accel_x != null && reading.accel_y != null && reading.accel_z != null) {
    const accelMag = Math.sqrt(
      reading.accel_x ** 2 + reading.accel_y ** 2 + reading.accel_z ** 2
    );
    if (accelMag > 2.5) {
      // Check for subsequent stillness — look at last 10s of readings
      const tenSecsAgo = new Date(new Date(reading.timestamp).getTime() - 10000);
      const recentReadings = await VitalReading.findAll({
        where: {
          patient_id,
          timestamp: { [Op.between]: [tenSecsAgo, reading.timestamp] },
        },
        order: [['timestamp', 'ASC']],
        raw: true,
      });

      if (recentReadings.length >= 2) {
        const motions = recentReadings.map((r) =>
          Math.sqrt(r.accel_x ** 2 + r.accel_y ** 2 + r.accel_z ** 2)
        );
        const avgMotion = motions.reduce((a, b) => a + b, 0) / motions.length;
        if (avgMotion < 0.3) {
          fallComponent = 35;
          alertType = 'fall';
        }
      } else {
        // Single spike with no follow-up data — moderate suspicion
        fallComponent = 15;
      }
    }
  }

  const riskScore = Math.min(100, Math.round(hrComponent + spo2Component + fallComponent));

  let alertLevel = 'normal';
  if (riskScore >= 60) alertLevel = 'critical';
  else if (riskScore >= 35) alertLevel = 'warning';

  return { risk_score: riskScore, alert_level: alertLevel, alert_type: alertType };
}

module.exports = { computeRiskScore };
