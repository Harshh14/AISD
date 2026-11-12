const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getMyCompany, updateMyCompany, getAllCompanies, getCompanyById } = require('../controllers/companyController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Company profile management
 */

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, getAllCompanies);

/**
 * @swagger
 * /api/companies/me:
 *   get:
 *     summary: Get my company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update my company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               industry:
 *                 type: string
 *               website:
 *                 type: string
 *               hrName:
 *                 type: string
 *               hrEmail:
 *                 type: string
 *               hrPhone:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 */
router.get('/me', authenticate, authorize('company'), getMyCompany);
router.put('/me', authenticate, authorize('company'), updateMyCompany);

/**
 * @swagger
 * /api/companies/{company_id}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         schema:
 *           type: integer
 */
router.get('/:company_id', authenticate, getCompanyById);

module.exports = router;
