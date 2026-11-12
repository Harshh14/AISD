const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Interview = sequelize.define('Interview', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  applicationId: { type: DataTypes.INTEGER, allowNull: false },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  jobId: { type: DataTypes.INTEGER, allowNull: false },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  interviewDate: { type: DataTypes.DATE, allowNull: false },
  interviewType: { type: DataTypes.ENUM('Online','Offline','Phone','Group Discussion','Technical','HR'), defaultValue: 'Online' },
  venue: { type: DataTypes.STRING(300), allowNull: true },
  meetingLink: { type: DataTypes.STRING(500), allowNull: true },
  round: { type: DataTypes.INTEGER, defaultValue: 1 },
  status: { type: DataTypes.ENUM('Scheduled','Completed','Cancelled','Rescheduled','No Show'), defaultValue: 'Scheduled' },
  result: { type: DataTypes.ENUM('Pending','Passed','Failed','On Hold'), defaultValue: 'Pending' },
  feedback: { type: DataTypes.TEXT, allowNull: true },
  score: { type: DataTypes.FLOAT, allowNull: true },
  instructions: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'interviews' });

module.exports = Interview;
