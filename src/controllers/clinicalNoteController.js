const clinicalNoteService = require('../services/clinicalNoteService');

async function listClinicalNotes(req, res, next) {
  try {
    const notes = await clinicalNoteService.listClinicalNotes(req.params.patientId, req.query);
    res.json(notes);
  } catch (err) {
    next(err);
  }
}

async function getClinicalNote(req, res, next) {
  try {
    const note = await clinicalNoteService.getClinicalNote(req.params.id);
    if (!note) return res.status(404).json({ error: 'Clinical note not found' });
    res.json(note);
  } catch (err) {
    next(err);
  }
}

async function createClinicalNote(req, res, next) {
  try {
    const data = { ...req.body, patient_id: req.params.patientId };
    const note = await clinicalNoteService.createClinicalNote(data);
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
}

async function updateClinicalNote(req, res, next) {
  try {
    const note = await clinicalNoteService.updateClinicalNote(req.params.id, req.body);
    if (!note) return res.status(404).json({ error: 'Clinical note not found' });
    res.json(note);
  } catch (err) {
    next(err);
  }
}

async function deleteClinicalNote(req, res, next) {
  try {
    const deleted = await clinicalNoteService.deleteClinicalNote(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Clinical note not found' });
    res.json({ message: 'Clinical note deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listClinicalNotes, getClinicalNote, createClinicalNote, updateClinicalNote, deleteClinicalNote };
