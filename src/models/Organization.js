const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('hospital', 'clinic', 'nursing_home', 'lab', 'pharmacy'),
    allowNull: false,
    defaultValue: 'hospital',
  },
  address: {
    type: DataTypes.TEXT,
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
  license_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  total_beds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  webhook_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  api_key: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'organizations',
  timestamps: true,
  underscored: true,
});

module.exports = Organization;
