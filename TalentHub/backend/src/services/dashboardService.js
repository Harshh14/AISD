const { Student, Company, JobListing, Application, Interview, Offer, User } = require('../models');

const getStudentDashboard = async (userId) => {
  const student = await Student.findOne({ where: { userId } });
  if (!student) throw { statusCode: 404, message: 'Student profile not found' };
  const totalApplications = await Application.count({ where: { studentId: student.id } });
  const upcomingInterviews = await Interview.findAll({
    where: { studentId: student.id, status: 'Scheduled' },
    include: [{ model: JobListing, as: 'job', include: [{ model: Company, as: 'company' }] }],
    order: [['interviewDate', 'ASC']], limit: 5,
  });
  const offers = await Offer.findAll({
    where: { studentId: student.id },
    include: [{ model: JobListing, as: 'job' }, { model: Company, as: 'company' }],
    order: [['createdAt', 'DESC']], limit: 5,
  });
  const appsByStatus = await Application.findAll({ where: { studentId: student.id }, attributes: ['status'] });
  const statusCount = {};
  appsByStatus.forEach(a => { statusCount[a.status] = (statusCount[a.status] || 0) + 1; });
  return {
    student,
    stats: { totalApplications, upcomingInterviews: upcomingInterviews.length, offersReceived: offers.length, offersAccepted: offers.filter(o => o.status === 'Accepted').length, isPlaced: student.isPlaced },
    statusCount, upcomingInterviews, recentOffers: offers,
  };
};

const getCompanyDashboard = async (userId) => {
  const company = await Company.findOne({ where: { userId } });
  if (!company) throw { statusCode: 404, message: 'Company profile not found' };
  const totalJobs = await JobListing.count({ where: { companyId: company.id } });
  const activeJobs = await JobListing.count({ where: { companyId: company.id, status: 'Active' } });
  const totalApplications = await Application.count({ include: [{ model: JobListing, as: 'job', where: { companyId: company.id }, required: true }] });
  const interviews = await Interview.count({ where: { companyId: company.id } });
  const offersCount = await Offer.count({ where: { companyId: company.id } });
  const recentApplications = await Application.findAll({
    include: [
      { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
      { model: JobListing, as: 'job', where: { companyId: company.id }, required: true },
    ],
    order: [['createdAt', 'DESC']], limit: 5,
  });
  return { company, stats: { totalJobs, activeJobs, totalApplications, scheduledInterviews: interviews, offersIssued: offersCount }, recentApplications };
};

const getAdminDashboard = async () => {
  const totalStudents = await Student.count();
  const placedStudents = await Student.count({ where: { isPlaced: true } });
  const totalCompanies = await Company.count();
  const activeJobs = await JobListing.count({ where: { status: 'Active' } });
  const totalApplications = await Application.count();
  const totalOffers = await Offer.count();
  const acceptedOffers = await Offer.count({ where: { status: 'Accepted' } });
  const scheduledInterviews = await Interview.count({ where: { status: 'Scheduled' } });
  const placementPercentage = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;
  const recentStudents = await Student.findAll({ include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }], order: [['createdAt', 'DESC']], limit: 5 });
  const recentCompanies = await Company.findAll({ include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }], order: [['createdAt', 'DESC']], limit: 5 });
  return { stats: { totalStudents, placedStudents, totalCompanies, activeJobs, totalApplications, totalOffers, acceptedOffers, scheduledInterviews, placementPercentage }, recentStudents, recentCompanies };
};

module.exports = { getStudentDashboard, getCompanyDashboard, getAdminDashboard };
