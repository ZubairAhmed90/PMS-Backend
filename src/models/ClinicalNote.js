const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClinicalNote = sequelize.define('ClinicalNote', {
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
  organization_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  note_type: {
    type: DataTypes.ENUM('progress', 'nursing', 'physician', 'discharge', 'admission', 'consultation', 'operative', 'incident'),
    allowNull: false,
    defaultValue: 'progress',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_confidential: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'clinical_notes',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['patient_id'] },
    { fields: ['staff_id'] },
    { fields: ['note_type'] },
  ],
});

module.exports = ClinicalNote;
