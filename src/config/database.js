const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(config.database.url, {
  dialect: 'mysql',
  logging: config.nodeEnv === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
