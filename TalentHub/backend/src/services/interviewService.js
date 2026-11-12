const { Interview, Application, Student, JobListing, Company, User } = require('../models');

const getInterviewById = async (id) => Interview.findByPk(id, {
  include: [
    { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
    { model: JobListing, as: 'job', include: [{ model: Company, as: 'company' }] },
  ],
});

const scheduleInterview = async (userId, data) => {
  const company = await Company.findOne({ where: { userId } });
  if (!company) throw { statusCode: 404, message: 'Company profile not found' };
  const application = await Application.findByPk(data.applicationId, { include: [{ model: JobListing, as: 'job' }] });
  if (!application) throw { statusCode: 404, message: 'Application not found' };
  if (application.job.companyId !== company.id) throw { statusCode: 403, message: 'Unauthorized' };
  const interview = await Interview.create({
    applicationId: data.applicationId, studentId: application.studentId,
    jobId: application.jobId, companyId: company.id,
    interviewDate: data.interviewDate, interviewType: data.interviewType || 'Online',
    venue: data.venue, meetingLink: data.meetingLink,
    round: data.round || 1, instructions: data.instructions,
  });
  await application.update({ status: 'Interview Scheduled' });
  return getInterviewById(interview.id);
};

const getMyInterviews = async (userId) => {
  const student = await Student.findOne({ where: { userId } });
  if (!student) throw { statusCode: 404, message: 'Student profile not found' };
  return Interview.findAll({
    where: { studentId: student.id },
    include: [
      { model: JobListing, as: 'job', include: [{ model: Company, as: 'company' }] },
      { model: Application, as: 'application' },
    ],
    order: [['interviewDate', 'ASC']],
  });
};

const getCompanyInterviews = async (userId) => {
  const company = await Company.findOne({ where: { userId } });
  if (!company) throw { statusCode: 404, message: 'Company profile not found' };
  return Interview.findAll({
    where: { companyId: company.id },
    include: [
      { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
      { model: JobListing, as: 'job' },
      { model: Application, as: 'application' },
    ],
    order: [['interviewDate', 'ASC']],
  });
};

const updateInterview = async (userId, interviewId, data) => {
  const company = await Company.findOne({ where: { userId } });
  if (!company) throw { statusCode: 404, message: 'Company profile not found' };
  const interview = await Interview.findByPk(interviewId);
  if (!interview) throw { statusCode: 404, message: 'Interview not found' };
  if (interview.companyId !== company.id) throw { statusCode: 403, message: 'Unauthorized' };
  const allowedFields = ['interviewDate','status','result','feedback','score','venue','meetingLink','instructions','interviewType'];
  const updateData = {};
  allowedFields.forEach(f => { if (data[f] !== undefined) updateData[f] = data[f]; });
  await interview.update(updateData);
  if (data.status === 'Completed' && data.result) {
    const application = await Application.findByPk(interview.applicationId);
    if (application) {
      let appStatus = 'Interview Completed';
      if (data.result === 'Passed') appStatus = 'Selected';
      else if (data.result === 'Failed') appStatus = 'Rejected';
      await application.update({ status: appStatus });
    }
  }
  return getInterviewById(interviewId);
};

const getAllInterviewsAdmin = async () => {
  return Interview.findAll({
    include: [
      { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
      { model: JobListing, as: 'job', include: [{ model: Company, as: 'company' }] },
    ],
    order: [['interviewDate', 'ASC']],
  });
};

module.exports = { scheduleInterview, getMyInterviews, getCompanyInterviews, updateInterview, getAllInterviewsAdmin };
