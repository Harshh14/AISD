const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { applyForJob, getMyApplications, getJobApplications, updateApplicationStatus, getAllApplications } = require('../controllers/applicationController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Job application workflow
 */

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Apply for a job (Student only - eligibility auto-checked)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobId]
 *             properties:
 *               jobId:
 *                 type: integer
 *               coverLetter:
 *                 type: string
 */
router.post('/', authenticate, authorize('student'), [body('jobId').isInt({ min: 1 }), validate], applyForJob);

/**
 * @swagger
 * /api/applications/me:
 *   get:
 *     summary: Get my applications (Student only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticate, authorize('student'), getMyApplications);

/**
 * @swagger
 * /api/applications/all:
 *   get:
 *     summary: Get all applications (Admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/all', authenticate, authorize('admin'), getAllApplications);

/**
 * @swagger
 * /api/applications/job/{job_id}:
 *   get:
 *     summary: Get applications for a specific job (Company only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: job_id
 *         schema:
 *           type: integer
 */
router.get('/job/:job_id', authenticate, authorize('company'), getJobApplications);

/**
 * @swagger
 * /api/applications/{application_id}/status:
 *   put:
 *     summary: Update application status (Company only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Applied, Under Review, Shortlisted, Interview Scheduled, Interview Completed, Selected, Rejected, Offer Issued, Offer Accepted, Offer Declined, Withdrawn]
 *               companyNotes:
 *                 type: string
 */
router.put('/:application_id/status', authenticate, authorize('company'),
  [body('status').isIn(['Applied','Under Review','Shortlisted','Interview Scheduled','Interview Completed','Selected','Rejected','Offer Issued','Offer Accepted','Offer Declined','Withdrawn']), validate],
  updateApplicationStatus
);

module.exports = router;
