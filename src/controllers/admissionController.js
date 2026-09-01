const { Admission, Patient, Organization } = require('../models');
const { Op } = require('sequelize');

async function listAdmissions(req, res, next) {
  try {
    const { patientId } = req.params;
    const admissions = await Admission.findAll({
      where: { patient_id: patientId },
      include: [{ model: Organization, as: 'organization', attributes: ['id', 'name'] }],
      order: [['admitted_at', 'DESC']],
    });
    res.json(admissions);
  } catch (err) {
    next(err);
  }
}

async function createAdmission(req, res, next) {
  try {
    const { patientId } = req.params;
    const { organization_id, room_or_location } = req.body;

    // For hospital_staff, use their own org
    const orgId = req.user.role === 'hospital_staff' ? req.user.organization_id : organization_id;
    if (!orgId) return res.status(400).json({ error: 'organization_id is required' });

    const admission = await Admission.create({
      patient_id: patientId,
      organization_id: orgId,
      room_or_location: room_or_location || null,
      admitted_at: new Date(),
    });
    res.status(201).json(admission);
  } catch (err) {
    next(err);
  }
}

async function dischargePatient(req, res, next) {
  try {
    const admission = await Admission.findByPk(req.params.admissionId);
    if (!admission) return res.status(404).json({ error: 'Admission not found' });
    await admission.update({ discharged_at: new Date() });
    res.json(admission);
  } catch (err) {
    next(err);
  }
}

module.exports = { listAdmissions, createAdmission, dischargePatient };
