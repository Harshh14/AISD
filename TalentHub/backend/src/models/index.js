const sequelize = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const Company = require('./Company');
const JobListing = require('./JobListing');
const Application = require('./Application');
const Interview = require('./Interview');
const Offer = require('./Offer');

User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Company, { foreignKey: 'userId', as: 'companyProfile', onDelete: 'CASCADE' });
Company.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Company.hasMany(JobListing, { foreignKey: 'companyId', as: 'jobs', onDelete: 'CASCADE' });
JobListing.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Student.hasMany(Application, { foreignKey: 'studentId', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

JobListing.hasMany(Application, { foreignKey: 'jobId', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(JobListing, { foreignKey: 'jobId', as: 'job' });

Application.hasMany(Interview, { foreignKey: 'applicationId', as: 'interviews', onDelete: 'CASCADE' });
Interview.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

Student.hasMany(Interview, { foreignKey: 'studentId', as: 'interviews' });
Interview.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

JobListing.hasMany(Interview, { foreignKey: 'jobId', as: 'interviews' });
Interview.belongsTo(JobListing, { foreignKey: 'jobId', as: 'job' });

Company.hasMany(Interview, { foreignKey: 'companyId', as: 'interviews' });
Interview.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Application.hasOne(Offer, { foreignKey: 'applicationId', as: 'offer', onDelete: 'CASCADE' });
Offer.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

Student.hasMany(Offer, { foreignKey: 'studentId', as: 'offers' });
Offer.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

JobListing.hasMany(Offer, { foreignKey: 'jobId', as: 'offers' });
Offer.belongsTo(JobListing, { foreignKey: 'jobId', as: 'job' });

Company.hasMany(Offer, { foreignKey: 'companyId', as: 'offers' });
Offer.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

module.exports = { sequelize, User, Student, Company, JobListing, Application, Interview, Offer };
