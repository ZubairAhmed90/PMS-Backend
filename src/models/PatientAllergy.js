const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PatientAllergy = sequelize.define('PatientAllergy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  allergy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('mild', 'moderate', 'severe', 'unknown'),
    allowNull: false,
    defaultValue: 'unknown',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'patient_allergies',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['patient_id'] },
    { unique: true, fields: ['patient_id', 'allergy'] },
  ],
});

module.exports = PatientAllergy;
