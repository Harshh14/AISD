const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createJob, getAllJobs, getJobById, updateJob, deleteJob, getCompanyJobs } = require('../controllers/jobController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job listing management
 */

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all active jobs (with eligibility check for students)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a job listing (Company only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               jobType:
 *                 type: string
 *                 enum: [Full-Time, Internship, Part-Time, Contract]
 *               location:
 *                 type: string
 *               salaryMin:
 *                 type: number
 *               salaryMax:
 *                 type: number
 *               minCgpa:
 *                 type: number
 *                 example: 7.0
 *               maxBacklogs:
 *                 type: integer
 *                 example: 1
 *               eligibleBranches:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["CSE", "CSAI", "IT"]
 *               openings:
 *                 type: integer
 *               applicationDeadline:
 *                 type: string
 *                 format: date
 */
router.get('/', authenticate, getAllJobs);
router.post('/', authenticate, authorize('company'),
  [body('title').trim().notEmpty(), body('minCgpa').optional().isFloat({ min: 0, max: 10 }), body('maxBacklogs').optional().isInt({ min: 0 }), body('eligibleBranches').optional().isArray(), validate],
  createJob
);

/**
 * @swagger
 * /api/jobs/my:
 *   get:
 *     summary: Get my company jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my', authenticate, authorize('company'), getCompanyJobs);

/**
 * @swagger
 * /api/jobs/{job_id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: job_id
 *         schema:
 *           type: integer
 *   put:
 *     summary: Update job (Company only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete job (Company only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:job_id', authenticate, getJobById);
router.put('/:job_id', authenticate, authorize('company'), updateJob);
router.delete('/:job_id', authenticate, authorize('company'), deleteJob);

module.exports = router;
