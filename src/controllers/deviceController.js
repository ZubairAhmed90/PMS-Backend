const { Device, Patient } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function listDevices(req, res, next) {
  try {
    const { patientId } = req.params;
    const devices = await Device.findAll({ where: { patient_id: patientId } });
    res.json(devices);
  } catch (err) {
    next(err);
  }
}

async function createDevice(req, res, next) {
  try {
    const { patientId } = req.params;
    const deviceKey = req.body.device_key || `dev-${uuidv4().slice(0, 8)}`;
    const device = await Device.create({
      patient_id: patientId,
      device_key: deviceKey,
    });
    res.status(201).json(device);
  } catch (err) {
    next(err);
  }
}

async function deleteDevice(req, res, next) {
  try {
    const device = await Device.findByPk(req.params.deviceId);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    await device.destroy();
    res.json({ message: 'Device deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDevices, createDevice, deleteDevice };
