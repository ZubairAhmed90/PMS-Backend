const { PatientBaseline, VitalReading } = require('../models');
const { Op } = require('sequelize');

/**
 * Update the patient's rolling baseline (mean + std) for HR and SpO2
 * using the last 24 hours of readings.
 */
async function updateBaseline(patientId) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const readings = await VitalReading.findAll({
    where: {
      patient_id,
      timestamp: { [Op.gte]: since },
    },
    attributes: ['heart_rate', 'spo2'],
    raw: true,
  });

  if (readings.length < 2) return null;

  const hrValues = readings.map((r) => r.heart_rate).filter((v) => v != null);
  const spo2Values = readings.map((r) => r.spo2).filter((v) => v != null);

  const hrMean = mean(hrValues);
  const hrStd = stdDev(hrValues, hrMean);
  const spo2Mean = mean(spo2Values);
  const spo2Std = stdDev(spo2Values, spo2Mean);

  const [baseline] = await PatientBaseline.findOrCreate({
    where: { patient_id: patientId },
    defaults: {
      patient_id: patientId,
      hr_mean: hrMean,
      hr_std: hrStd,
      spo2_mean: spo2Mean,
      spo2_std: spo2Std,
      sample_count: readings.length,
      last_updated: new Date(),
    },
  });

  await baseline.update({
    hr_mean: hrMean,
    hr_std: hrStd,
    spo2_mean: spo2Mean,
    spo2_std: spo2Std,
    sample_count: readings.length,
    last_updated: new Date(),
  });

  return baseline;
}

function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, v) => sum + v, 0) / arr.length;
}

function stdDev(arr, avg) {
  if (arr.length < 2) return 0;
  const variance = arr.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

module.exports = { updateBaseline };
