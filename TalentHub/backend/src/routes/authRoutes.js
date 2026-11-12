const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { register, login, getMe } = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration and login
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rahul Sharma
 *               email:
 *                 type: string
 *                 example: rahul@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [student, company, admin]
 *                 example: student
 *     responses:
 *       201:
 *         description: Registered successfully
 *       409:
 *         description: Email already exists
 */
router.post('/register',
  [body('name').trim().isLength({ min: 2 }).withMessage('Name required'), body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 6 }).withMessage('Min 6 chars'), body('role').isIn(['student','company','admin']), validate],
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: rahul@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: JWT token returned
 *       401:
 *         description: Invalid credentials
 */
router.post('/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty(), validate],
  login
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 */
router.get('/me', authenticate, getMe);

module.exports = router;
