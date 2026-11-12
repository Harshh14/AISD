const dashboardService = require('../services/dashboardService');

const getStudentDashboard = async (req, res, next) => {
  try { res.json({ success: true, data: await dashboardService.getStudentDashboard(req.user.id) }); }
  catch (err) { next(err); }
};
const getCompanyDashboard = async (req, res, next) => {
  try { res.json({ success: true, data: await dashboardService.getCompanyDashboard(req.user.id) }); }
  catch (err) { next(err); }
};
const getAdminDashboard = async (req, res, next) => {
  try { res.json({ success: true, data: await dashboardService.getAdminDashboard() }); }
  catch (err) { next(err); }
};

module.exports = { getStudentDashboard, getCompanyDashboard, getAdminDashboard };
