const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getPlacementStatistics, getPlacedStudents } = require('../controllers/reportController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Placement statistics and reports
 */

/**
 * @swagger
 * /api/reports/placement-statistics:
 *   get:
 *     summary: Get overall placement statistics (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/placement-statistics', authenticate, authorize('admin'), getPlacementStatistics);

/**
 * @swagger
 * /api/reports/placed-students:
 *   get:
 *     summary: Get list of all placed students (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/placed-students', authenticate, authorize('admin'), getPlacedStudents);

module.exports = router;
