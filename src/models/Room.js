const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  organization_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  department_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  room_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  room_type: {
    type: DataTypes.ENUM('general', 'private', 'semi_private', 'icu', 'nicu', 'operation_theater', 'emergency', 'isolation', 'ward'),
    allowNull: false,
    defaultValue: 'general',
  },
  floor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  building: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  occupied: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  rate_per_day: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },
  amenities: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'maintenance', 'reserved'),
    allowNull: false,
    defaultValue: 'available',
  },
}, {
  tableName: 'rooms',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['organization_id'] },
    { fields: ['department_id'] },
    { unique: true, fields: ['organization_id', 'room_number'] },
    { fields: ['status'] },
  ],
});

module.exports = Room;
