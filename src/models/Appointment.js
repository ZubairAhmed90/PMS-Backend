const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  staff_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  department_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  organization_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  appointment_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
  },
  type: {
    type: DataTypes.ENUM('consultation', 'follow_up', 'checkup', 'emergency', 'surgery', 'lab_test', 'imaging', 'therapy'),
    allowNull: false,
    defaultValue: 'consultation',
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
    allowNull: false,
    defaultValue: 'scheduled',
  },
  cancelled_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'appointments',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['patient_id', 'appointment_date'] },
    { fields: ['staff_id', 'appointment_date'] },
    { fields: ['organization_id'] },
    { fields: ['status'] },
  ],
});

module.exports = Appointment;
