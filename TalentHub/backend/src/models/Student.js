const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  rollNumber: { type: DataTypes.STRING(50), unique: true, allowNull: true },
  branch: { type: DataTypes.STRING(50), allowNull: true },
  cgpa: { type: DataTypes.FLOAT, allowNull: true, validate: { min: 0, max: 10 } },
  activeBacklogs: { type: DataTypes.INTEGER, defaultValue: 0 },
  phone: { type: DataTypes.STRING(15), allowNull: true },
  graduationYear: { type: DataTypes.INTEGER, allowNull: true },
  degree: { type: DataTypes.STRING(100), allowNull: true },
  resume: { type: DataTypes.STRING(500), allowNull: true },
  skills: {
    type: DataTypes.TEXT, allowNull: true,
    get() { const v = this.getDataValue('skills'); return v ? JSON.parse(v) : []; },
    set(v) { this.setDataValue('skills', JSON.stringify(v || [])); },
  },
  isPlaced: { type: DataTypes.BOOLEAN, defaultValue: false },
  profileComplete: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'students' });

module.exports = Student;
