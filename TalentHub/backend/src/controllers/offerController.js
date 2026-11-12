const offerService = require('../services/offerService');

const issueOffer = async (req, res, next) => {
  try { res.status(201).json({ success: true, message: 'Offer issued', data: await offerService.issueOffer(req.user.id, req.body) }); }
  catch (err) { next(err); }
};
const getMyOffers = async (req, res, next) => {
  try { const data = await offerService.getMyOffers(req.user.id); res.json({ success: true, data, count: data.length }); }
  catch (err) { next(err); }
};
const makeOfferDecision = async (req, res, next) => {
  try {
    const { decision } = req.body;
    if (!['accept', 'decline'].includes(decision)) return res.status(400).json({ success: false, message: "Decision must be 'accept' or 'decline'" });
    res.json({ success: true, message: `Offer ${decision}d`, data: await offerService.makeOfferDecision(req.user.id, req.params.offer_id, decision) });
  } catch (err) { next(err); }
};
const getCompanyOffers = async (req, res, next) => {
  try { const data = await offerService.getCompanyOffers(req.user.id); res.json({ success: true, data, count: data.length }); }
  catch (err) { next(err); }
};
const getAllOffers = async (req, res, next) => {
  try { const data = await offerService.getAllOffersAdmin(); res.json({ success: true, data, count: data.length }); }
  catch (err) { next(err); }
};

module.exports = { issueOffer, getMyOffers, makeOfferDecision, getCompanyOffers, getAllOffers };
