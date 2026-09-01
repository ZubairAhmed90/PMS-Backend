const { VitalReading, Device, Patient } = require('../models');

/**
 * Store a vital reading, looking up the patient via device_key.
 */
async function ingestVitals(deviceKey, payload) {
  const device = await Device.findOne({
    where: { device_key: deviceKey },
    include: [{ model: Patient, as: 'patient' }],
  });

  if (!device || !device.patient) {
    const err = new Error(`Unknown device_key: ${deviceKey}`);
    err.statusCode = 404;
    throw err;
  }

  const reading = await VitalReading.create({
    patient_id: device.patient.id,
    timestamp: payload.timestamp || new Date(),
    heart_rate: payload.heart_rate,
    spo2: payload.spo2,
    accel_x: payload.accel_x,
    accel_y: payload.accel_y,
    accel_z: payload.accel_z,
  });

  return { reading, patientId: device.patient.id, patientName: device.patient.name };
}

module.exports = { ingestVitals };
