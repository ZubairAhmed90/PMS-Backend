const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  type: {
    type: DataTypes.ENUM('fall', 'hr_anomaly', 'spo2_low'),
    allowNull: false,
  },
  risk_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('pending_confirmation', 'confirmed', 'false_alarm', 'resolved'),
    allowNull: false,
    defaultValue: 'pending_confirmation',
  },
  summary_text: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'alerts',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['patient_id', 'timestamp'] },
    { fields: ['status'] },
  ],
});

module.exports = Alert;
