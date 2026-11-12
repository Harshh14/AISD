const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getStudentDashboard, getCompanyDashboard, getAdminDashboard } = require('../controllers/dashboardController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics for each user role
 */

/**
 * @swagger
 * /api/dashboard/student:
 *   get:
 *     summary: Student dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/student', authenticate, authorize('student'), getStudentDashboard);

/**
 * @swagger
 * /api/dashboard/company:
 *   get:
 *     summary: Company dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/company', authenticate, authorize('company'), getCompanyDashboard);

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Admin dashboard data with all statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/admin', authenticate, authorize('admin'), getAdminDashboard);

module.exports = router;
