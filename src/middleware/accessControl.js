const { Patient, Admission } = require('../models');
const { Op } = require('sequelize');

/**
 * Access control: ensures the authenticated user can only access
 * patient records they are authorized to see.
 *
 * - patient/caregiver: only patients they own (owner_user_id)
 * - hospital_staff: only patients with an active admission at their organization
 */
async function patientAccess(req, res, next) {
  try {
    const patientId = req.params.patientId || req.params.id;
    if (!patientId) return next();

    const user = req.user;
    const patient = await Patient.findByPk(patientId);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (user.role === 'patient' || user.role === 'caregiver') {
      if (patient.owner_user_id !== user.id) {
        return res.status(403).json({ error: 'Access denied to this patient record' });
      }
    } else if (user.role === 'hospital_staff') {
      const activeAdmission = await Admission.findOne({
        where: {
          patient_id: patientId,
          organization_id: user.organization_id,
          discharged_at: { [Op.is]: null },
        },
      });
      if (!activeAdmission) {
        return res.status(403).json({ error: 'No active admission for this patient at your organization' });
      }
    }

    req.patient = patient;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { patientAccess };
