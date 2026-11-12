const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getMyProfile, updateMyProfile, getAllStudents, getStudentById } = require('../controllers/studentController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student profile management
 */

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students (Admin only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, authorize('admin'), getAllStudents);

/**
 * @swagger
 * /api/students/me:
 *   get:
 *     summary: Get my student profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update my student profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rollNumber:
 *                 type: string
 *               branch:
 *                 type: string
 *                 example: CSE
 *               cgpa:
 *                 type: number
 *                 example: 8.5
 *               activeBacklogs:
 *                 type: integer
 *                 example: 0
 *               phone:
 *                 type: string
 *               graduationYear:
 *                 type: integer
 *                 example: 2025
 *               degree:
 *                 type: string
 */
router.get('/me', authenticate, authorize('student'), getMyProfile);
router.put('/me', authenticate, authorize('student'), updateMyProfile);

/**
 * @swagger
 * /api/students/{student_id}:
 *   get:
 *     summary: Get student by ID (Admin or Company)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:student_id', authenticate, authorize('admin','company'), getStudentById);

module.exports = router;
