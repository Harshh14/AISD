const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Offer = sequelize.define('Offer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  applicationId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  jobId: { type: DataTypes.INTEGER, allowNull: false },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  ctc: { type: DataTypes.FLOAT, allowNull: false },
  currency: { type: DataTypes.STRING(10), defaultValue: 'INR' },
  joiningDate: { type: DataTypes.DATE, allowNull: true },
  offerLetterUrl: { type: DataTypes.STRING(500), allowNull: true },
  status: { type: DataTypes.ENUM('Issued','Accepted','Declined','Revoked','Expired'), defaultValue: 'Issued' },
  expiryDate: { type: DataTypes.DATE, allowNull: true },
  designation: { type: DataTypes.STRING(150), allowNull: true },
  offerLocation: { type: DataTypes.STRING(200), allowNull: true },
  remarks: { type: DataTypes.TEXT, allowNull: true },
  studentDecisionAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'offers' });

module.exports = Offer;
