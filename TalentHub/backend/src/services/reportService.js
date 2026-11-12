const { Student, Company, JobListing, Application, Offer, User } = require('../models');

const getPlacementStatistics = async () => {
  const totalStudents = await Student.count();
  const placedStudents = await Student.count({ where: { isPlaced: true } });
  const totalCompanies = await Company.count();
  const totalJobs = await JobListing.count();
  const totalApplications = await Application.count();
  const totalOffers = await Offer.count();
  const acceptedOffers = await Offer.count({ where: { status: 'Accepted' } });
  const placementPercentage = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;
  const students = await Student.findAll({ attributes: ['branch', 'isPlaced'] });
  const branchStats = {};
  students.forEach(s => {
    if (!s.branch) return;
    if (!branchStats[s.branch]) branchStats[s.branch] = { total: 0, placed: 0 };
    branchStats[s.branch].total++;
    if (s.isPlaced) branchStats[s.branch].placed++;
  });
  const acceptedOffersData = await Offer.findAll({ where: { status: 'Accepted' }, attributes: ['ctc'] });
  const ctcValues = acceptedOffersData.map(o => o.ctc).filter(v => v > 0);
  const avgCTC = ctcValues.length > 0 ? ctcValues.reduce((a, b) => a + b, 0) / ctcValues.length : 0;
  const maxCTC = ctcValues.length > 0 ? Math.max(...ctcValues) : 0;
  return {
    totalStudents, placedStudents, placementPercentage, totalCompanies, totalJobs,
    totalApplications, totalOffers, acceptedOffers, avgCTC: Math.round(avgCTC), maxCTC,
    branchWisePlacement: Object.entries(branchStats).map(([branch, s]) => ({
      branch, total: s.total, placed: s.placed,
      percentage: s.total > 0 ? Math.round((s.placed / s.total) * 100) : 0,
    })),
  };
};

const getPlacedStudents = async () => {
  return Student.findAll({
    where: { isPlaced: true },
    include: [
      { model: User, as: 'user', attributes: { exclude: ['password'] } },
      { model: Offer, as: 'offers', where: { status: 'Accepted' }, required: false, include: [{ model: JobListing, as: 'job' }, { model: Company, as: 'company' }] },
    ],
    order: [['updatedAt', 'DESC']],
  });
};

module.exports = { getPlacementStatistics, getPlacedStudents };
