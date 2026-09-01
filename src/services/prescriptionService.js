const { Prescription, Patient, Staff } = require('../models');
const { Op } = require('sequelize');

async function listPrescriptions(patientId, filters = {}) {
  const where = { patient_id: patientId };
  if (filters.status) where.status = filters.status;

  return Prescription.findAll({
    where,
    include: [
      { model: Staff, as: 'prescribedByStaff', attributes: ['id', 'first_name', 'last_name', 'specialization'] },
    ],
    order: [['created_at', 'DESC']],
  });
}

async function getPrescription(prescriptionId) {
  return Prescription.findByPk(prescriptionId, {
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'patient_number'] },
      { model: Staff, as: 'prescribedByStaff' },
    ],
  });
}

async function createPrescription(data) {
  return Prescription.create(data);
}

async function updatePrescription(prescriptionId, data) {
  const rx = await Prescription.findByPk(prescriptionId);
  if (!rx) return null;
  await rx.update(data);
  return rx;
}

async function discontinuePrescription(prescriptionId) {
  const rx = await Prescription.findByPk(prescriptionId);
  if (!rx) return null;
  await rx.update({ status: 'discontinued' });
  return rx;
}

async function deletePrescription(prescriptionId) {
  const rx = await Prescription.findByPk(prescriptionId);
  if (!rx) return false;
  await rx.destroy();
  return true;
}

module.exports = { listPrescriptions, getPrescription, createPrescription, updatePrescription, discontinuePrescription, deletePrescription };
