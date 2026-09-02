const { Patient, Admission, Device, User, Alert, VitalReading, PatientAllergy, PatientCondition } = require('../models');
const { Op } = require('sequelize');

async function listAccessiblePatients(user) {
  if (user.role === 'patient' || user.role === 'caregiver') {
    return Patient.findAll({
      where: { owner_user_id: user.id },
      include: [
        { model: Device, as: 'devices' },
        { model: Admission, as: 'admissions', where: { discharged_at: null }, required: false },
        { model: PatientAllergy, as: 'allergies', attributes: ['id', 'allergy', 'severity', 'notes'] },
        { model: PatientCondition, as: 'conditions', attributes: ['id', 'condition', 'diagnosed_date', 'status', 'notes'] },
      ],
    });
  }

  if (user.role === 'hospital_staff' || user.role === 'admin') {
    // Only patients with active admissions at this user's organization
    const admissions = await Admission.findAll({
      where: {
        organization_id: user.organization_id,
        discharged_at: { [Op.is]: null },
      },
      include: [{
        model: Patient,
        as: 'patient',
        include: [
          { model: Device, as: 'devices' },
          { model: PatientAllergy, as: 'allergies', attributes: ['id', 'allergy', 'severity', 'notes'] },
          { model: PatientCondition, as: 'conditions', attributes: ['id', 'condition', 'diagnosed_date', 'status', 'notes'] },
        ],
      }],
    });
    return admissions.map((a) => {
      const p = a.patient.toJSON();
      p.room_or_location = a.room_or_location;
      p.admission_id = a.id;
      p.admitted_at = a.admitted_at;
      return p;
    });
  }

  return [];
}

async function getPatient(patientId) {
  return Patient.findByPk(patientId, {
    include: [
      { model: Device, as: 'devices' },
      { model: Admission, as: 'admissions' },
      { model: User, as: 'owner', attributes: ['id', 'email'] },
      { model: PatientAllergy, as: 'allergies', attributes: ['id', 'allergy', 'severity', 'notes'] },
      { model: PatientCondition, as: 'conditions', attributes: ['id', 'condition', 'diagnosed_date', 'status', 'notes'] },
    ],
  });
}

async function createPatient(ownerUserId, data) {
  const patientNumber = data.patient_number || `PT-${Date.now().toString().slice(-6)}`;
  const patient = await Patient.create({
    owner_user_id: ownerUserId,
    patient_number: patientNumber,
    name: data.name,
    date_of_birth: data.date_of_birth || null,
    gender: data.gender || null,
    phone: data.phone || null,
    email: data.email || null,
    address: data.address || null,
    blood_group: data.blood_group || null,
    emergency_contact_name: data.emergency_contact_name || null,
    emergency_contact_phone: data.emergency_contact_phone || null,
    status: data.status || 'active',
  });

  await syncPatientAllergies(patient.id, data.allergies);
  await syncPatientConditions(patient.id, data.conditions || data.medical_history);

  return getPatient(patient.id);
}

async function updatePatient(patientId, data) {
  const patient = await Patient.findByPk(patientId);
  if (!patient) return null;
  // Only update scalar fields on the patient record
  const allowedFields = [
    'name', 'date_of_birth', 'gender', 'phone', 'email', 'address',
    'blood_group', 'patient_number',
    'emergency_contact_name', 'emergency_contact_phone', 'status',
  ];
  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }
  await patient.update(updateData);

  if (data.allergies !== undefined) await syncPatientAllergies(patient.id, data.allergies);
  if (data.conditions !== undefined || data.medical_history !== undefined) {
    await syncPatientConditions(patient.id, data.conditions || data.medical_history);
  }

  return getPatient(patient.id);
}

async function syncPatientAllergies(patientId, allergies) {
  if (!Array.isArray(allergies)) return;
  await PatientAllergy.destroy({ where: { patient_id: patientId } });
  if (allergies.length === 0) return;
  const records = allergies
    .filter((a) => a && (typeof a === 'string' ? a.trim() : a.allergy))
    .map((a) => (typeof a === 'string'
      ? { id: require('uuid').v4(), patient_id: patientId, allergy: a.trim(), severity: 'unknown' }
      : { id: require('uuid').v4(), patient_id: patientId, allergy: a.allergy, severity: a.severity || 'unknown', notes: a.notes || null }
    ));
  if (records.length > 0) await PatientAllergy.bulkCreate(records);
}

async function syncPatientConditions(patientId, conditions) {
  if (!Array.isArray(conditions)) return;
  await PatientCondition.destroy({ where: { patient_id: patientId } });
  if (conditions.length === 0) return;
  const records = conditions
    .filter((c) => c && (typeof c === 'string' ? c.trim() : c.condition))
    .map((c) => (typeof c === 'string'
      ? { id: require('uuid').v4(), patient_id: patientId, condition: c.trim(), status: 'active' }
      : { id: require('uuid').v4(), patient_id: patientId, condition: c.condition, diagnosed_date: c.diagnosed_date || null, status: c.status || 'active', notes: c.notes || null }
    ));
  if (records.length > 0) await PatientCondition.bulkCreate(records);
}

async function deletePatient(patientId) {
  const patient = await Patient.findByPk(patientId);
  if (!patient) return false;
  await patient.destroy();
  return true;
}

async function getRecentVitals(patientId, limit = 60) {
  return VitalReading.findAll({
    where: { patient_id: patientId },
    order: [['timestamp', 'DESC']],
    limit,
  });
}

async function getRecentAlerts(patientId, limit = 20) {
  return Alert.findAll({
    where: { patient_id: patientId },
    order: [['timestamp', 'DESC']],
    limit,
  });
}

module.exports = {
  listAccessiblePatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getRecentVitals,
  getRecentAlerts,
};
