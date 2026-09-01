const prescriptionService = require('../services/prescriptionService');

async function listPrescriptions(req, res, next) {
  try {
    const prescriptions = await prescriptionService.listPrescriptions(req.params.patientId, req.query);
    res.json(prescriptions);
  } catch (err) {
    next(err);
  }
}

async function getPrescription(req, res, next) {
  try {
    const rx = await prescriptionService.getPrescription(req.params.id);
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    res.json(rx);
  } catch (err) {
    next(err);
  }
}

async function createPrescription(req, res, next) {
  try {
    const data = { ...req.body, patient_id: req.params.patientId };
    const rx = await prescriptionService.createPrescription(data);
    res.status(201).json(rx);
  } catch (err) {
    next(err);
  }
}

async function updatePrescription(req, res, next) {
  try {
    const rx = await prescriptionService.updatePrescription(req.params.id, req.body);
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    res.json(rx);
  } catch (err) {
    next(err);
  }
}

async function discontinuePrescription(req, res, next) {
  try {
    const rx = await prescriptionService.discontinuePrescription(req.params.id);
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    res.json(rx);
  } catch (err) {
    next(err);
  }
}

async function deletePrescription(req, res, next) {
  try {
    const deleted = await prescriptionService.deletePrescription(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Prescription not found' });
    res.json({ message: 'Prescription deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPrescriptions, getPrescription, createPrescription, updatePrescription, discontinuePrescription, deletePrescription };
