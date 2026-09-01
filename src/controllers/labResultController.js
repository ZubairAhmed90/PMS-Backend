const labResultService = require('../services/labResultService');

async function listLabResults(req, res, next) {
  try {
    const results = await labResultService.listLabResults(req.params.patientId, req.query);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

async function getLabResult(req, res, next) {
  try {
    const result = await labResultService.getLabResult(req.params.id);
    if (!result) return res.status(404).json({ error: 'Lab result not found' });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createLabResult(req, res, next) {
  try {
    const data = { ...req.body, patient_id: req.params.patientId };
    const result = await labResultService.createLabResult(data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function updateLabResult(req, res, next) {
  try {
    const result = await labResultService.updateLabResult(req.params.id, req.body);
    if (!result) return res.status(404).json({ error: 'Lab result not found' });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function deleteLabResult(req, res, next) {
  try {
    const deleted = await labResultService.deleteLabResult(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Lab result not found' });
    res.json({ message: 'Lab result deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listLabResults, getLabResult, createLabResult, updateLabResult, deleteLabResult };
