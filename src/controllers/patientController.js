const patientService = require('../services/patientService');

async function listPatients(req, res, next) {
  try {
    const patients = await patientService.listAccessiblePatients(req.user);
    res.json(patients);
  } catch (err) {
    next(err);
  }
}

async function getPatient(req, res, next) {
  try {
    const patient = await patientService.getPatient(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    next(err);
  }
}

async function createPatient(req, res, next) {
  try {
    const { name, date_of_birth, phone, email, address, gender, blood_group, allergies, conditions, medical_history, emergency_contact_name, emergency_contact_phone, room_or_location } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const patient = await patientService.createPatient(req.user.id, {
      name, date_of_birth, phone, email, address, gender, blood_group,
      allergies, conditions: conditions || medical_history,
      emergency_contact_name, emergency_contact_phone,
    });
    res.status(201).json(patient);
  } catch (err) {
    next(err);
  }
}

async function updatePatient(req, res, next) {
  try {
    const patient = await patientService.updatePatient(req.params.id, req.body);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    next(err);
  }
}

async function deletePatient(req, res, next) {
  try {
    const deleted = await patientService.deletePatient(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    next(err);
  }
}

async function getVitals(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 60;
    const vitals = await patientService.getRecentVitals(req.params.id, limit);
    res.json(vitals);
  } catch (err) {
    next(err);
  }
}

async function getAlerts(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const alerts = await patientService.getRecentAlerts(req.params.id, limit);
    res.json(alerts);
  } catch (err) {
    next(err);
  }
}

module.exports = { listPatients, getPatient, createPatient, updatePatient, deletePatient, getVitals, getAlerts };
