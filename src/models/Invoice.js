const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  organization_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  admission_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  paid_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'card', 'insurance', 'bank_transfer', 'online'),
    allowNull: true,
  },
  insurance_provider: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  insurance_claim_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'issued', 'partial', 'paid', 'overdue', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft',
  },
}, {
  tableName: 'invoices',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['patient_id'] },
    { fields: ['organization_id'] },
    { fields: ['status'] },
    { fields: ['invoice_number'] },
  ],
});

module.exports = Invoice;
