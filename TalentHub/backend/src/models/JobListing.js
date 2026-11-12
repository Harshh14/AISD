const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobListing = sequelize.define('JobListing', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  jobType: { type: DataTypes.ENUM('Full-Time', 'Internship', 'Part-Time', 'Contract'), defaultValue: 'Full-Time' },
  location: { type: DataTypes.STRING(200), allowNull: true },
  salaryMin: { type: DataTypes.FLOAT, allowNull: true },
  salaryMax: { type: DataTypes.FLOAT, allowNull: true },
  currency: { type: DataTypes.STRING(10), defaultValue: 'INR' },
  minCgpa: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  maxBacklogs: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  eligibleBranches: {
    type: DataTypes.TEXT, allowNull: false, defaultValue: '[]',
    get() { const v = this.getDataValue('eligibleBranches'); return v ? JSON.parse(v) : []; },
    set(v) { this.setDataValue('eligibleBranches', JSON.stringify(v || [])); },
  },
  skills: {
    type: DataTypes.TEXT, allowNull: true,
    get() { const v = this.getDataValue('skills'); return v ? JSON.parse(v) : []; },
    set(v) { this.setDataValue('skills', JSON.stringify(v || [])); },
  },
  applicationDeadline: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM('Active', 'Closed', 'Draft'), defaultValue: 'Active' },
  openings: { type: DataTypes.INTEGER, defaultValue: 1 },
}, { tableName: 'job_listings' });

module.exports = JobListing;
