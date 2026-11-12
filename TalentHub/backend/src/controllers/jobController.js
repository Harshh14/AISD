const jobService = require('../services/jobService');

const createJob = async (req, res, next) => {
  try { res.status(201).json({ success: true, message: 'Job created', data: await jobService.createJob(req.user.id, req.body) }); }
  catch (err) { next(err); }
};
const getAllJobs = async (req, res, next) => {
  try {
    const studentUserId = req.user && req.user.role === 'student' ? req.user.id : null;
    const data = await jobService.getAllJobs(studentUserId);
    res.json({ success: true, data, count: data.length });
  } catch (err) { next(err); }
};
const getJobById = async (req, res, next) => {
  try {
    const studentUserId = req.user && req.user.role === 'student' ? req.user.id : null;
    res.json({ success: true, data: await jobService.getJobById(req.params.job_id, studentUserId) });
  } catch (err) { next(err); }
};
const updateJob = async (req, res, next) => {
  try { res.json({ success: true, message: 'Job updated', data: await jobService.updateJob(req.user.id, req.params.job_id, req.body) }); }
  catch (err) { next(err); }
};
const deleteJob = async (req, res, next) => {
  try { const data = await jobService.deleteJob(req.user.id, req.params.job_id); res.json({ success: true, ...data }); }
  catch (err) { next(err); }
};
const getCompanyJobs = async (req, res, next) => {
  try { const data = await jobService.getCompanyJobs(req.user.id); res.json({ success: true, data, count: data.length }); }
  catch (err) { next(err); }
};

module.exports = { createJob, getAllJobs, getJobById, updateJob, deleteJob, getCompanyJobs };
