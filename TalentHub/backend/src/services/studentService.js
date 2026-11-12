const { Student, User } = require('../models');

const getMyProfile = async (userId) => {
  const student = await Student.findOne({
    where: { userId },
    include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }],
  });
  if (!student) throw { statusCode: 404, message: 'Student profile not found' };
  return student;
};

const updateMyProfile = async (userId, data) => {
  let student = await Student.findOne({ where: { userId } });
  if (!student) throw { statusCode: 404, message: 'Student profile not found' };
  const allowedFields = ['rollNumber','branch','cgpa','activeBacklogs','phone','graduationYear','degree','resume','skills'];
  const updateData = {};
  allowedFields.forEach(f => { if (data[f] !== undefined) updateData[f] = data[f]; });
  updateData.profileComplete = !!(
    (data.branch || student.branch) &&
    (data.cgpa !== undefined ? data.cgpa !== null : student.cgpa !== null) &&
    (data.phone || student.phone) &&
    (data.graduationYear || student.graduationYear)
  );
  await student.update(updateData);
  return getMyProfile(userId);
};

const getAllStudents = async () => {
  return Student.findAll({
    include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }],
    order: [['createdAt', 'DESC']],
  });
};

const getStudentById = async (studentId) => {
  const student = await Student.findByPk(studentId, {
    include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }],
  });
  if (!student) throw { statusCode: 404, message: 'Student not found' };
  return student;
};

module.exports = { getMyProfile, updateMyProfile, getAllStudents, getStudentById };
