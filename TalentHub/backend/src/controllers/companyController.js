const companyService = require('../services/companyService');

const getMyCompany = async (req, res, next) => {
  try { res.json({ success: true, data: await companyService.getMyCompany(req.user.id) }); }
  catch (err) { next(err); }
};
const updateMyCompany = async (req, res, next) => {
  try { res.json({ success: true, message: 'Company profile updated', data: await companyService.updateMyCompany(req.user.id, req.body) }); }
  catch (err) { next(err); }
};
const getAllCompanies = async (req, res, next) => {
  try { const data = await companyService.getAllCompanies(); res.json({ success: true, data, count: data.length }); }
  catch (err) { next(err); }
};
const getCompanyById = async (req, res, next) => {
  try { res.json({ success: true, data: await companyService.getCompanyById(req.params.company_id) }); }
  catch (err) { next(err); }
};

module.exports = { getMyCompany, updateMyCompany, getAllCompanies, getCompanyById };
