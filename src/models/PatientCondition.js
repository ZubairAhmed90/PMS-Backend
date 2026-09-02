const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PatientCondition = sequelize.define('PatientCondition', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  condition: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  diagnosed_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'managed', 'resolved'),
    allowNull: false,
    defaultValue: 'active',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'patient_conditions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['patient_id'] },
  ],
});

module.exports = PatientCondition;
