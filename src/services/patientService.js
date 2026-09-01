const { Patient, Admission, Device, User, Alert, VitalReading } = require('../models');
const { Op } = require('sequelize');

async function listAccessiblePatients(user) {
  if (user.role === 'patient' || user.role === 'caregiver') {
    return Patient.findAll({
      where: { owner_user_id: user.id },
      include: [
        { model: Device, as: 'devices' },
        { model: Admission, as: 'admissions', where: { discharged_at: null }, required: false },
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
        include: [{ model: Device, as: 'devices' }],
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
    ],
  });
}

async function createPatient(ownerUserId, data) {
  const patientNumber = data.patient_number || `PT-${Date.now().toString().slice(-6)}`;
  return Patient.create({
    owner_user_id: ownerUserId,
    patient_number: patientNumber,
    name: data.name,
    date_of_birth: data.date_of_birth || null,
    gender: data.gender || null,
    phone: data.phone || null,
    email: data.email || null,
    address: data.address || null,
    blood_group: data.blood_group || null,
    allergies: data.allergies || null,
    medical_history: data.medical_history || null,
    emergency_contact_name: data.emergency_contact_name || null,
    emergency_contact_phone: data.emergency_contact_phone || null,
    status: data.status || 'active',
  });
}

async function updatePatient(patientId, data) {
  const patient = await Patient.findByPk(patientId);
  if (!patient) return null;
  // Only update fields that are provided
  const allowedFields = [
    'name', 'date_of_birth', 'gender', 'phone', 'email', 'address',
    'blood_group', 'allergies', 'medical_history', 'patient_number',
    'emergency_contact_name', 'emergency_contact_phone', 'status',
  ];
  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }
  await patient.update(updateData);
  return patient;
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
