const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { issueOffer, getMyOffers, makeOfferDecision, getCompanyOffers, getAllOffers } = require('../controllers/offerController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Offers
 *   description: Offer issuance and student decisions
 */

/**
 * @swagger
 * /api/offers:
 *   post:
 *     summary: Issue an offer to a student (Company only)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [applicationId, ctc]
 *             properties:
 *               applicationId:
 *                 type: integer
 *               ctc:
 *                 type: number
 *                 example: 800000
 *               designation:
 *                 type: string
 *               joiningDate:
 *                 type: string
 *                 format: date
 *               offerLocation:
 *                 type: string
 *               remarks:
 *                 type: string
 *   get:
 *     summary: Get all offers (Admin only)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, authorize('company'), [body('applicationId').isInt({ min: 1 }), body('ctc').isFloat({ min: 0 }), validate], issueOffer);
router.get('/', authenticate, authorize('admin'), getAllOffers);

/**
 * @swagger
 * /api/offers/me:
 *   get:
 *     summary: Get my offers (Student only)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticate, authorize('student'), getMyOffers);

/**
 * @swagger
 * /api/offers/company:
 *   get:
 *     summary: Get offers issued by my company
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/company', authenticate, authorize('company'), getCompanyOffers);

/**
 * @swagger
 * /api/offers/{offer_id}/decision:
 *   put:
 *     summary: Accept or decline an offer (Student only)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offer_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decision]
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [accept, decline]
 */
router.put('/:offer_id/decision', authenticate, authorize('student'), [body('decision').isIn(['accept','decline']), validate], makeOfferDecision);

module.exports = router;
