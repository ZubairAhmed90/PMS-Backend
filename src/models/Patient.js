const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  owner_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  patient_number: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  blood_group: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  medical_history: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  emergency_contact_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emergency_contact_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'discharged', 'deceased', 'transferred'),
    allowNull: false,
    defaultValue: 'active',
  },
}, {
  tableName: 'patients',
  timestamps: true,
  underscored: true,
});

module.exports = Patient;
