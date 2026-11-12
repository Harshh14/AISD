const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '../../', process.env.DB_PATH || './database/talenthub.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
  define: { timestamps: true, underscored: false },
});

module.exports = sequelize;
