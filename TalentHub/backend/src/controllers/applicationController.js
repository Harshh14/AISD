const applicationService = require('../services/applicationService');

const applyForJob = async (req, res, next) => {
  try { res.status(201).json({ success: true, message: 'Application submitted', data: await applicationService.applyForJob(req.user.id, req.body) }); }
  catch (err) { next(err); }
};
const getMyApplications = async (req, res, next) => {
  try { const data = await applicationService.getMyApplications(req.user.id); res.json({ success: true, data, count: data.length }); }
  catch (err) { next(err); }
};
const getJobApplications = async (req, res, next) => {
  try { const data = await applicationService.getJobApplications(req.user.id, req.params.job_id); res.json({ success: true, data, count: data.length }); }
  catch (err) { next(err); }
};
const updateApplicationStatus = async (req, res, next) => {
  try { res.json({ success: true, message: 'Status updated', data: await applicationService.updateApplicationStatus(req.user.id, req.params.application_id, req.body) }); }
  catch (err) { next(err); }
};
const getAllApplications = async (req, res, next) => {
  try { const data = await applicationService.getAllApplicationsAdmin(); res.json({ success: true, data, count: data.length }); }
  catch (err) { next(err); }
};

module.exports = { applyForJob, getMyApplications, getJobApplications, updateApplicationStatus, getAllApplications };
