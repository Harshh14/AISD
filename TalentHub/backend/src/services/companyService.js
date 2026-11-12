const { Company, User, JobListing } = require('../models');

const getMyCompany = async (userId) => {
  const company = await Company.findOne({
    where: { userId },
    include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }],
  });
  if (!company) throw { statusCode: 404, message: 'Company profile not found' };
  return company;
};

const updateMyCompany = async (userId, data) => {
  let company = await Company.findOne({ where: { userId } });
  if (!company) throw { statusCode: 404, message: 'Company profile not found' };
  const allowedFields = ['companyName','industry','website','description','hrName','hrEmail','hrPhone','location','logoUrl'];
  const updateData = {};
  allowedFields.forEach(f => { if (data[f] !== undefined) updateData[f] = data[f]; });
  await company.update(updateData);
  return getMyCompany(userId);
};

const getAllCompanies = async () => {
  return Company.findAll({
    include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }],
    order: [['createdAt', 'DESC']],
  });
};

const getCompanyById = async (companyId) => {
  const company = await Company.findByPk(companyId, {
    include: [
      { model: User, as: 'user', attributes: { exclude: ['password'] } },
      { model: JobListing, as: 'jobs' },
    ],
  });
  if (!company) throw { statusCode: 404, message: 'Company not found' };
  return company;
};

module.exports = { getMyCompany, updateMyCompany, getAllCompanies, getCompanyById };
