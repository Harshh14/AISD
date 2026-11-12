const interviewService = require('../services/interviewService');

const scheduleInterview = async (req, res, next) => {
  try { res.status(201).json({ success: true, message: 'Interview scheduled', data: await interviewService.scheduleInterview(req.user.id, req.body) }); }
  catch (err) { next(err); }
};
const getMyInterviews = async (req, res, next) => {
  try { const data = await interviewService.getMyInterviews(req.user.id); res.json({ success: true, data, count: data.length }); }
  catch (err) { next(err); }
};
const getCompanyInterviews = async (req, res, next) => {
  try { const data = await interviewService.getCompanyInterviews(req.user.id); res.json({ success: true, data, count: data.length }); }
  catch (err) { next(err); }
};
const updateInterview = async (req, res, next) => {
  try { res.json({ success: true, message: 'Interview updated', data: await interviewService.updateInterview(req.user.id, req.params.interview_id, req.body) }); }
  catch (err) { next(err); }
};
const getAllInterviews = async (req, res, next) => {
  try { const data = await interviewService.getAllInterviewsAdmin(); res.json({ success: true, data, count: data.length }); }
  catch (err) { next(err); }
};

module.exports = { scheduleInterview, getMyInterviews, getCompanyInterviews, updateInterview, getAllInterviews };
