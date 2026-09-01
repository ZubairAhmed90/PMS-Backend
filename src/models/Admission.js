const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admission = sequelize.define('Admission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  organization_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  room_or_location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  admitted_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  discharged_at: {
    type: DataTypes.DATE,
    allowNull: true, // null = currently active
  },
}, {
  tableName: 'admissions',
  timestamps: true,
  underscored: true,
});

module.exports = Admission;
