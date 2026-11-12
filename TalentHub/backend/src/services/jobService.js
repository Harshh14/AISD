const { JobListing, Company, Student } = require('../models');
const { checkEligibility } = require('./eligibilityService');

// Helper: ensure array fields are always real arrays
const normalizeJob = (job) => {
  const j = job.toJSON ? job.toJSON() : { ...job };
  j.eligibleBranches = Array.isArray(j.eligibleBranches) ? j.eligibleBranches : (() => { try { return JSON.parse(j.eligibleBranches || '[]'); } catch { return []; } })();
  j.skills = Array.isArray(j.skills) ? j.skills : (() => { try { return JSON.parse(j.skills || '[]'); } catch { return []; } })();
  return j;
};

const createJob = async (userId, data) => {
  const company = await Company.findOne({ where: { userId } });
  if (!company) throw { statusCode: 404, message: 'Company profile not found' };
  const job = await JobListing.create({ ...data, companyId: company.id });
  return normalizeJob(job);
};

const getAllJobs = async (studentUserId) => {
  const jobs = await JobListing.findAll({
    where: { status: 'Active' },
    include: [{ model: Company, as: 'company' }],
    order: [['createdAt', 'DESC']],
  });
  if (!studentUserId) return jobs.map(normalizeJob);
  const student = await Student.findOne({ where: { userId: studentUserId } });
  if (!student) return jobs.map(normalizeJob);
  return jobs.map(job => ({ ...normalizeJob(job), eligibility: checkEligibility(student, job) }));
};

const getJobById = async (jobId, studentUserId) => {
  const job = await JobListing.findByPk(jobId, { include: [{ model: Company, as: 'company' }] });
  if (!job) throw { statusCode: 404, message: 'Job not found' };
  if (studentUserId) {
    const student = await Student.findOne({ where: { userId: studentUserId } });
    if (student) return { ...normalizeJob(job), eligibility: checkEligibility(student, job) };
  }
  return normalizeJob(job);
};

const updateJob = async (userId, jobId, data) => {
  const company = await Company.findOne({ where: { userId } });
  if (!company) throw { statusCode: 404, message: 'Company profile not found' };
  const job = await JobListing.findOne({ where: { id: jobId, companyId: company.id } });
  if (!job) throw { statusCode: 404, message: 'Job not found or unauthorized' };
  await job.update(data);
  return normalizeJob(job);
};

const deleteJob = async (userId, jobId) => {
  const company = await Company.findOne({ where: { userId } });
  if (!company) throw { statusCode: 404, message: 'Company profile not found' };
  const job = await JobListing.findOne({ where: { id: jobId, companyId: company.id } });
  if (!job) throw { statusCode: 404, message: 'Job not found or unauthorized' };
  await job.destroy();
  return { message: 'Job deleted successfully' };
};

const getCompanyJobs = async (userId) => {
  const company = await Company.findOne({ where: { userId } });
  if (!company) throw { statusCode: 404, message: 'Company profile not found' };
  const jobs = await JobListing.findAll({ where: { companyId: company.id }, order: [['createdAt', 'DESC']] });
  return jobs.map(normalizeJob);
};

module.exports = { createJob, getAllJobs, getJobById, updateJob, deleteJob, getCompanyJobs };

