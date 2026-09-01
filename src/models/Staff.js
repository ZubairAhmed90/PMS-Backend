const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Staff = sequelize.define('Staff', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  organization_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  department_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  employee_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('doctor', 'nurse', 'technician', 'pharmacist', 'lab_technician', 'receptionist', 'admin_staff'),
    allowNull: false,
    defaultValue: 'doctor',
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  qualification: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  license_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shift: {
    type: DataTypes.ENUM('morning', 'evening', 'night', 'rotating'),
    allowNull: true,
  },
  hire_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'on_leave', 'inactive', 'terminated'),
    allowNull: false,
    defaultValue: 'active',
  },
}, {
  tableName: 'staff',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['organization_id'] },
    { fields: ['department_id'] },
    { fields: ['user_id'] },
    { fields: ['role'] },
  ],
});

module.exports = Staff;
