const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VitalReading = sequelize.define('VitalReading', {
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
  heart_rate: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  spo2: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  accel_x: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  accel_y: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  accel_z: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'vital_readings',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['patient_id', 'timestamp'] },
  ],
});

module.exports = VitalReading;
