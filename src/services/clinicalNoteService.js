const { ClinicalNote, Patient, Staff } = require('../models');
const { Op } = require('sequelize');

async function listClinicalNotes(patientId, filters = {}) {
  const where = { patient_id: patientId };
  if (filters.note_type) where.note_type = filters.note_type;
  if (!filters.include_confidential) {
    where.is_confidential = false;
  }

  return ClinicalNote.findAll({
    where,
    include: [
      { model: Staff, as: 'staff', attributes: ['id', 'first_name', 'last_name', 'role'] },
    ],
    order: [['created_at', 'DESC']],
    limit: filters.limit || 50,
  });
}

async function getClinicalNote(noteId) {
  return ClinicalNote.findByPk(noteId, {
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'patient_number'] },
      { model: Staff, as: 'staff' },
    ],
  });
}

async function createClinicalNote(data) {
  return ClinicalNote.create(data);
}

async function updateClinicalNote(noteId, data) {
  const note = await ClinicalNote.findByPk(noteId);
  if (!note) return null;
  await note.update(data);
  return note;
}

async function deleteClinicalNote(noteId) {
  const note = await ClinicalNote.findByPk(noteId);
  if (!note) return false;
  await note.destroy();
  return true;
}

module.exports = { listClinicalNotes, getClinicalNote, createClinicalNote, updateClinicalNote, deleteClinicalNote };
