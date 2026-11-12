const studentService = require('../services/studentService');

const getMyProfile = async (req, res, next) => {
  try { res.json({ success: true, data: await studentService.getMyProfile(req.user.id) }); }
  catch (err) { next(err); }
};
const updateMyProfile = async (req, res, next) => {
  try { res.json({ success: true, message: 'Profile updated', data: await studentService.updateMyProfile(req.user.id, req.body) }); }
  catch (err) { next(err); }
};
const getAllStudents = async (req, res, next) => {
  try { const data = await studentService.getAllStudents(); res.json({ success: true, data, count: data.length }); }
  catch (err) { next(err); }
};
const getStudentById = async (req, res, next) => {
  try { res.json({ success: true, data: await studentService.getStudentById(req.params.student_id) }); }
  catch (err) { next(err); }
};

module.exports = { getMyProfile, updateMyProfile, getAllStudents, getStudentById };
