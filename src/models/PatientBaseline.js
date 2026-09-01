const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PatientBaseline = sequelize.define('PatientBaseline', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  hr_mean: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  hr_std: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  spo2_mean: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  spo2_std: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  sample_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  last_updated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'patient_baselines',
  timestamps: true,
  underscored: true,
});

module.exports = PatientBaseline;
