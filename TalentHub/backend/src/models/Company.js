const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  companyName: { type: DataTypes.STRING(150), allowNull: false },
  industry: { type: DataTypes.STRING(100), allowNull: true },
  website: { type: DataTypes.STRING(300), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  hrName: { type: DataTypes.STRING(100), allowNull: true },
  hrEmail: { type: DataTypes.STRING(150), allowNull: true },
  hrPhone: { type: DataTypes.STRING(15), allowNull: true },
  location: { type: DataTypes.STRING(200), allowNull: true },
  logoUrl: { type: DataTypes.STRING(500), allowNull: true },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'companies' });

module.exports = Company;
