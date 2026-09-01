const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LabResult = sequelize.define('LabResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  ordered_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  organization_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  test_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  test_category: {
    type: DataTypes.ENUM('blood', 'urine', 'imaging', 'pathology', 'microbiology', 'cardiac', 'other'),
    allowNull: false,
    defaultValue: 'blood',
  },
  result: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reference_range: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_abnormal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  collected_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  reported_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('ordered', 'collected', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'ordered',
  },
}, {
  tableName: 'lab_results',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['patient_id'] },
    { fields: ['organization_id'] },
    { fields: ['test_category'] },
    { fields: ['status'] },
  ],
});

module.exports = LabResult;
