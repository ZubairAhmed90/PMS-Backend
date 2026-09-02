const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoomAmenity = sequelize.define('RoomAmenity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  room_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amenity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'room_amenities',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['room_id'] },
    { unique: true, fields: ['room_id', 'amenity'] },
  ],
});

module.exports = RoomAmenity;
