const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  jobId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM('Applied','Under Review','Shortlisted','Interview Scheduled','Interview Completed','Selected','Rejected','Offer Issued','Offer Accepted','Offer Declined','Withdrawn'),
    defaultValue: 'Applied',
  },
  coverLetter: { type: DataTypes.TEXT, allowNull: true },
  isEligible: { type: DataTypes.BOOLEAN, defaultValue: true },
  eligibilityReason: { type: DataTypes.TEXT, allowNull: true },
  appliedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  companyNotes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'applications',
  indexes: [{ unique: true, fields: ['studentId', 'jobId'] }],
});

module.exports = Application;
