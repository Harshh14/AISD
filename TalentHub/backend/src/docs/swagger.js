const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TalentHub – Campus Placement Management System',
      version: '1.0.0',
      description: 'Complete REST API for TalentHub. Supports Student, Company, and Admin roles with full placement workflow from registration to offer acceptance.',
      contact: { name: 'TalentHub Support', email: 'support@talenthub.edu' },
    },
    servers: [{ url: 'http://localhost:5000', description: 'Development Server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from POST /api/auth/login',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
