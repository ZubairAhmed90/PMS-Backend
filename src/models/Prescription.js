const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  prescribed_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  organization_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  medication_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  generic_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dosage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  frequency: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  route: {
    type: DataTypes.ENUM('oral', 'iv', 'im', 'sc', 'topical', 'inhaled', 'rectal', 'sublingual'),
    allowNull: false,
    defaultValue: 'oral',
  },
  duration_days: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'discontinued', 'on_hold'),
    allowNull: false,
    defaultValue: 'active',
  },
}, {
  tableName: 'prescriptions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['patient_id'] },
    { fields: ['prescribed_by'] },
    { fields: ['status'] },
  ],
});

module.exports = Prescription;
