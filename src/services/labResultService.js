const { LabResult, Patient, Staff } = require('../models');
const { Op } = require('sequelize');

async function listLabResults(patientId, filters = {}) {
  const where = { patient_id: patientId };
  if (filters.status) where.status = filters.status;
  if (filters.test_category) where.test_category = filters.test_category;

  return LabResult.findAll({
    where,
    include: [
      { model: Staff, as: 'orderedByStaff', attributes: ['id', 'first_name', 'last_name', 'role'] },
    ],
    order: [['created_at', 'DESC']],
  });
}

async function getLabResult(labResultId) {
  return LabResult.findByPk(labResultId, {
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'patient_number'] },
      { model: Staff, as: 'orderedByStaff' },
    ],
  });
}

async function createLabResult(data) {
  return LabResult.create(data);
}

async function updateLabResult(labResultId, data) {
  const lab = await LabResult.findByPk(labResultId);
  if (!lab) return null;
  await lab.update(data);
  return lab;
}

async function deleteLabResult(labResultId) {
  const lab = await LabResult.findByPk(labResultId);
  if (!lab) return false;
  await lab.destroy();
  return true;
}

module.exports = { listLabResults, getLabResult, createLabResult, updateLabResult, deleteLabResult };
