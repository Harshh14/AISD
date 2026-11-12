const { Offer, Application, Student, JobListing, Company, User } = require('../models');

const getOfferById = async (id) => Offer.findByPk(id, {
  include: [
    { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
    { model: JobListing, as: 'job' }, { model: Company, as: 'company' }, { model: Application, as: 'application' },
  ],
});

const issueOffer = async (userId, data) => {
  const company = await Company.findOne({ where: { userId } });
  if (!company) throw { statusCode: 404, message: 'Company profile not found' };
  const application = await Application.findByPk(data.applicationId, { include: [{ model: JobListing, as: 'job' }] });
  if (!application) throw { statusCode: 404, message: 'Application not found' };
  if (application.job.companyId !== company.id) throw { statusCode: 403, message: 'Unauthorized' };
  const existingOffer = await Offer.findOne({ where: { applicationId: data.applicationId } });
  if (existingOffer) throw { statusCode: 409, message: 'Offer already issued for this application' };
  const offer = await Offer.create({
    applicationId: data.applicationId, studentId: application.studentId,
    jobId: application.jobId, companyId: company.id,
    ctc: data.ctc, currency: data.currency || 'INR',
    joiningDate: data.joiningDate, expiryDate: data.expiryDate,
    designation: data.designation, offerLocation: data.offerLocation,
    remarks: data.remarks, status: 'Issued',
  });
  await application.update({ status: 'Offer Issued' });
  return getOfferById(offer.id);
};

const getMyOffers = async (userId) => {
  const student = await Student.findOne({ where: { userId } });
  if (!student) throw { statusCode: 404, message: 'Student profile not found' };
  return Offer.findAll({
    where: { studentId: student.id },
    include: [{ model: JobListing, as: 'job' }, { model: Company, as: 'company' }, { model: Application, as: 'application' }],
    order: [['createdAt', 'DESC']],
  });
};

const makeOfferDecision = async (userId, offerId, decision) => {
  const student = await Student.findOne({ where: { userId } });
  if (!student) throw { statusCode: 404, message: 'Student profile not found' };
  const offer = await Offer.findByPk(offerId);
  if (!offer) throw { statusCode: 404, message: 'Offer not found' };
  if (offer.studentId !== student.id) throw { statusCode: 403, message: 'Unauthorized' };
  if (offer.status !== 'Issued') throw { statusCode: 400, message: 'Offer is no longer pending decision' };
  const newStatus = decision === 'accept' ? 'Accepted' : 'Declined';
  await offer.update({ status: newStatus, studentDecisionAt: new Date() });
  const application = await Application.findByPk(offer.applicationId);
  if (application) await application.update({ status: decision === 'accept' ? 'Offer Accepted' : 'Offer Declined' });
  if (decision === 'accept') await student.update({ isPlaced: true });
  return getOfferById(offerId);
};

const getCompanyOffers = async (userId) => {
  const company = await Company.findOne({ where: { userId } });
  if (!company) throw { statusCode: 404, message: 'Company profile not found' };
  return Offer.findAll({
    where: { companyId: company.id },
    include: [
      { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
      { model: JobListing, as: 'job' }, { model: Application, as: 'application' },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const getAllOffersAdmin = async () => {
  return Offer.findAll({
    include: [
      { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
      { model: JobListing, as: 'job' }, { model: Company, as: 'company' },
    ],
    order: [['createdAt', 'DESC']],
  });
};

module.exports = { issueOffer, getMyOffers, makeOfferDecision, getCompanyOffers, getAllOffersAdmin };
