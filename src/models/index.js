const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const User = require('./User');
const Organization = require('./Organization');
const Patient = require('./Patient');
const Admission = require('./Admission');
const Device = require('./Device');
const VitalReading = require('./VitalReading');
const Alert = require('./Alert');
const PatientBaseline = require('./PatientBaseline');
const Department = require('./Department');
const Room = require('./Room');
const Staff = require('./Staff');
const Appointment = require('./Appointment');
const Prescription = require('./Prescription');
const LabResult = require('./LabResult');
const ClinicalNote = require('./ClinicalNote');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');
const RoomAmenity = require('./RoomAmenity');
const PatientAllergy = require('./PatientAllergy');
const PatientCondition = require('./PatientCondition');

// --- Existing Associations ---

// User -> Organization (hospital_staff belongs to an org)
Organization.hasMany(User, { foreignKey: 'organization_id', as: 'staff' });
User.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

// Patient -> User (owner)
User.hasMany(Patient, { foreignKey: 'owner_user_id', as: 'patients' });
Patient.belongsTo(User, { foreignKey: 'owner_user_id', as: 'owner' });

// Patient -> Admission
Patient.hasMany(Admission, { foreignKey: 'patient_id', as: 'admissions' });
Admission.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Organization -> Admission
Organization.hasMany(Admission, { foreignKey: 'organization_id', as: 'admissions' });
Admission.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

// Patient -> Device
Patient.hasMany(Device, { foreignKey: 'patient_id', as: 'devices' });
Device.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient -> VitalReading
Patient.hasMany(VitalReading, { foreignKey: 'patient_id', as: 'vitalReadings' });
VitalReading.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient -> Alert
Patient.hasMany(Alert, { foreignKey: 'patient_id', as: 'alerts' });
Alert.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient -> PatientBaseline (one-to-one)
Patient.hasOne(PatientBaseline, { foreignKey: 'patient_id', as: 'baseline' });
PatientBaseline.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient -> PatientAllergy (4NF multi-valued attribute)
Patient.hasMany(PatientAllergy, { foreignKey: 'patient_id', as: 'allergies' });
PatientAllergy.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient -> PatientCondition (4NF medical history)
Patient.hasMany(PatientCondition, { foreignKey: 'patient_id', as: 'conditions' });
PatientCondition.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// --- Department Associations ---
Organization.hasMany(Department, { foreignKey: 'organization_id', as: 'departments' });
Department.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

Department.belongsTo(Staff, { foreignKey: 'head_of_department_id', as: 'headOfDepartment' });

// --- Room Associations ---
Organization.hasMany(Room, { foreignKey: 'organization_id', as: 'rooms' });
Room.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

Department.hasMany(Room, { foreignKey: 'department_id', as: 'rooms' });
Room.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

Room.hasMany(RoomAmenity, { foreignKey: 'room_id', as: 'amenities' });
RoomAmenity.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

// --- Staff Associations ---
Organization.hasMany(Staff, { foreignKey: 'organization_id', as: 'staffMembers' });
Staff.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

Department.hasMany(Staff, { foreignKey: 'department_id', as: 'staffMembers' });
Staff.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

User.hasOne(Staff, { foreignKey: 'user_id', as: 'staffProfile' });
Staff.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// --- Appointment Associations ---
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Staff.hasMany(Appointment, { foreignKey: 'staff_id', as: 'appointments' });
Appointment.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staff' });

Department.hasMany(Appointment, { foreignKey: 'department_id', as: 'appointments' });
Appointment.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

Organization.hasMany(Appointment, { foreignKey: 'organization_id', as: 'appointments' });
Appointment.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

// --- Prescription Associations ---
Patient.hasMany(Prescription, { foreignKey: 'patient_id', as: 'prescriptions' });
Prescription.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Staff.hasMany(Prescription, { foreignKey: 'prescribed_by', as: 'prescriptions' });
Prescription.belongsTo(Staff, { foreignKey: 'prescribed_by', as: 'prescribedByStaff' });

// --- LabResult Associations ---
Patient.hasMany(LabResult, { foreignKey: 'patient_id', as: 'labResults' });
LabResult.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Staff.hasMany(LabResult, { foreignKey: 'ordered_by', as: 'orderedLabResults' });
LabResult.belongsTo(Staff, { foreignKey: 'ordered_by', as: 'orderedByStaff' });

// --- ClinicalNote Associations ---
Patient.hasMany(ClinicalNote, { foreignKey: 'patient_id', as: 'clinicalNotes' });
ClinicalNote.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Staff.hasMany(ClinicalNote, { foreignKey: 'staff_id', as: 'clinicalNotes' });
ClinicalNote.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staff' });

// --- Invoice Associations ---
Patient.hasMany(Invoice, { foreignKey: 'patient_id', as: 'invoices' });
Invoice.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Admission.hasMany(Invoice, { foreignKey: 'admission_id', as: 'invoices' });
Invoice.belongsTo(Admission, { foreignKey: 'admission_id', as: 'admission' });

Organization.hasMany(Invoice, { foreignKey: 'organization_id', as: 'invoices' });
Invoice.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

Invoice.hasMany(InvoiceItem, { foreignKey: 'invoice_id', as: 'items' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });

module.exports = {
  sequelize,
  User,
  Organization,
  Patient,
  Admission,
  Device,
  VitalReading,
  Alert,
  PatientBaseline,
  Department,
  Room,
  Staff,
  Appointment,
  Prescription,
  LabResult,
  ClinicalNote,
  Invoice,
  InvoiceItem,
  RoomAmenity,
  PatientAllergy,
  PatientCondition,
};
