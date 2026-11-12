const { Application, Student, JobListing, Company, User, Offer, Interview } = require('../models');
const { checkEligibility } = require('./eligibilityService');

const applyForJob = async (userId, { jobId, coverLetter }) => {
  const student = await Student.findOne({ where: { userId } });
  if (!student) throw { statusCode: 404, message: 'Student profile not found' };
  if (!student.profileComplete) throw { statusCode: 400, message: 'Please complete your profile before applying' };
  const job = await JobListing.findByPk(jobId);
  if (!job) throw { statusCode: 404, message: 'Job not found' };
  if (job.status !== 'Active') throw { statusCode: 400, message: 'Job is no longer accepting applications' };
  if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) throw { statusCode: 400, message: 'Application deadline has passed' };
  const existing = await Application.findOne({ where: { studentId: student.id, jobId } });
  if (existing) throw { statusCode: 409, message: 'You have already applied for this job' };
  const eligibility = checkEligibility(student, job);
  if (!eligibility.isEligible) throw { statusCode: 400, message: `Not eligible: ${eligibility.message}` };
  const application = await Application.create({ studentId: student.id, jobId, coverLetter, isEligible: true, eligibilityReason: eligibility.message, status: 'Applied' });
  return Application.findByPk(application.id, { include: [{ model: JobListing, as: 'job', include: [{ model: Company, as: 'company' }] }] });
};

const getMyApplications = async (userId) => {
  const student = await Student.findOne({ where: { userId } });
  if (!student) throw { statusCode: 404, message: 'Student profile not found' };
  return Application.findAll({
    where: { studentId: student.id },
    include: [
      { model: JobListing, as: 'job', include: [{ model: Company, as: 'company' }] },
      { model: Interview, as: 'interviews' },
      { model: Offer, as: 'offer' },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const getJobApplications = async (userId, jobId) => {
  const company = await Company.findOne({ where: { userId } });
  if (!company) throw { statusCode: 404, message: 'Company profile not found' };
  const job = await JobListing.findOne({ where: { id: jobId, companyId: company.id } });
  if (!job) throw { statusCode: 404, message: 'Job not found or unauthorized' };
  return Application.findAll({
    where: { jobId },
    include: [
      { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
      { model: Interview, as: 'interviews' },
      { model: Offer, as: 'offer' },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const updateApplicationStatus = async (userId, applicationId, { status, companyNotes }) => {
  const company = await Company.findOne({ where: { userId } });
  if (!company) throw { statusCode: 404, message: 'Company profile not found' };
  const application = await Application.findByPk(applicationId, { include: [{ model: JobListing, as: 'job' }] });
  if (!application) throw { statusCode: 404, message: 'Application not found' };
  if (application.job.companyId !== company.id) throw { statusCode: 403, message: 'Unauthorized' };
  const updateData = { status };
  if (companyNotes !== undefined) updateData.companyNotes = companyNotes;
  await application.update(updateData);
  return application;
};

const getAllApplicationsAdmin = async () => {
  return Application.findAll({
    include: [
      { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
      { model: JobListing, as: 'job', include: [{ model: Company, as: 'company' }] },
    ],
    order: [['createdAt', 'DESC']],
  });
};

module.exports = { applyForJob, getMyApplications, getJobApplications, updateApplicationStatus, getAllApplicationsAdmin };
