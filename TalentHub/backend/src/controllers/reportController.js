const reportService = require('../services/reportService');

const getPlacementStatistics = async (req, res, next) => {
  try { res.json({ success: true, data: await reportService.getPlacementStatistics() }); }
  catch (err) { next(err); }
};
const getPlacedStudents = async (req, res, next) => {
  try { const data = await reportService.getPlacedStudents(); res.json({ success: true, data, count: data.length }); }
  catch (err) { next(err); }
};

module.exports = { getPlacementStatistics, getPlacedStudents };
