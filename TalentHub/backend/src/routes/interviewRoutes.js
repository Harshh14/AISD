const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { scheduleInterview, getMyInterviews, getCompanyInterviews, updateInterview, getAllInterviews } = require('../controllers/interviewController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Interviews
 *   description: Interview scheduling and results
 */

/**
 * @swagger
 * /api/interviews:
 *   post:
 *     summary: Schedule an interview (Company only)
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [applicationId, interviewDate]
 *             properties:
 *               applicationId:
 *                 type: integer
 *               interviewDate:
 *                 type: string
 *                 format: date-time
 *               interviewType:
 *                 type: string
 *                 enum: [Online, Offline, Phone, Group Discussion, Technical, HR]
 *               venue:
 *                 type: string
 *               meetingLink:
 *                 type: string
 *               round:
 *                 type: integer
 *               instructions:
 *                 type: string
 *   get:
 *     summary: Get all interviews (Admin only)
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, authorize('company'), [body('applicationId').isInt({ min: 1 }), body('interviewDate').isISO8601(), validate], scheduleInterview);
router.get('/', authenticate, authorize('admin'), getAllInterviews);

/**
 * @swagger
 * /api/interviews/me:
 *   get:
 *     summary: Get my interview schedule (Student only)
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticate, authorize('student'), getMyInterviews);

/**
 * @swagger
 * /api/interviews/company:
 *   get:
 *     summary: Get company interviews (Company only)
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 */
router.get('/company', authenticate, authorize('company'), getCompanyInterviews);

/**
 * @swagger
 * /api/interviews/{interview_id}:
 *   put:
 *     summary: Update interview result/status (Company only)
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Scheduled, Completed, Cancelled, Rescheduled, No Show]
 *               result:
 *                 type: string
 *                 enum: [Pending, Passed, Failed, On Hold]
 *               feedback:
 *                 type: string
 *               score:
 *                 type: number
 */
router.put('/:interview_id', authenticate, authorize('company'), updateInterview);

module.exports = router;
