const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

let studentToken, companyToken, adminToken;
let jobId, applicationId, interviewId, offerId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('1. Authentication Tests', () => {
  test('Register student successfully', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Test Student', email: 'teststudent@test.com', password: 'password123', role: 'student' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    studentToken = res.body.data.token;
  });

  test('Register company successfully', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Test Company', email: 'testcompany@test.com', password: 'password123', role: 'company' });
    expect(res.status).toBe(201);
    companyToken = res.body.data.token;
  });

  test('Register admin successfully', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Admin User', email: 'admin@test.com', password: 'password123', role: 'admin' });
    expect(res.status).toBe(201);
    adminToken = res.body.data.token;
  });

  test('Login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'teststudent@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  test('Login with wrong password should return 401', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'teststudent@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  test('Duplicate email registration should return 409', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Dup', email: 'teststudent@test.com', password: 'password123', role: 'student' });
    expect(res.status).toBe(409);
  });
});

describe('2. Student Profile Tests', () => {
  test('Update student profile', async () => {
    const res = await request(app).put('/api/students/me')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ branch: 'CSE', cgpa: 8.5, activeBacklogs: 0, phone: '9999999999', graduationYear: 2025, degree: 'B.Tech', rollNumber: 'ROLL001' });
    expect(res.status).toBe(200);
    expect(res.body.data.branch).toBe('CSE');
    expect(res.body.data.cgpa).toBe(8.5);
    expect(res.body.data.profileComplete).toBe(true);
  });

  test('Get student profile', async () => {
    const res = await request(app).get('/api/students/me')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.cgpa).toBe(8.5);
  });
});

describe('3. Job Listing Tests', () => {
  test('Company creates job listing', async () => {
    const res = await request(app).post('/api/jobs')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({
        title: 'Software Engineer', description: 'Build great software', jobType: 'Full-Time',
        location: 'Bangalore', salaryMin: 700000, salaryMax: 1000000,
        minCgpa: 7.0, maxBacklogs: 1, eligibleBranches: ['CSE', 'CSAI', 'IT'], openings: 5,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Software Engineer');
    jobId = res.body.data.id;
  });

  test('Student can get jobs with eligibility info', async () => {
    const res = await request(app).get('/api/jobs')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    const job = res.body.data.find(j => j.id === jobId);
    expect(job).toBeDefined();
    expect(job.eligibility).toBeDefined();
    expect(job.eligibility.isEligible).toBe(true); // CSE, CGPA 8.5, 0 backlogs should pass
  });
});

describe('4. Eligibility Checking Tests', () => {
  test('Ineligible student (wrong branch + low CGPA) cannot apply', async () => {
    // Register ineligible student
    const regRes = await request(app).post('/api/auth/register')
      .send({ name: 'Ineligible Student', email: 'ineligible@test.com', password: 'password123', role: 'student' });
    const ineligibleToken = regRes.body.data.token;
    // Complete profile with ME branch and low CGPA
    await request(app).put('/api/students/me')
      .set('Authorization', `Bearer ${ineligibleToken}`)
      .send({ branch: 'ME', cgpa: 5.0, activeBacklogs: 3, phone: '8888888888', graduationYear: 2025, degree: 'B.Tech' });
    // Try to apply - should be rejected
    const res = await request(app).post('/api/applications')
      .set('Authorization', `Bearer ${ineligibleToken}`)
      .send({ jobId });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Eligible student can apply successfully', async () => {
    const res = await request(app).post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId, coverLetter: 'I am very interested in this position.' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('Applied');
    applicationId = res.body.data.id;
  });

  test('Duplicate application should return 409', async () => {
    const res = await request(app).post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId });
    expect(res.status).toBe(409);
  });
});

describe('5. Company Workflow Tests', () => {
  test('Company views job applicants', async () => {
    const res = await request(app).get(`/api/applications/job/${jobId}`)
      .set('Authorization', `Bearer ${companyToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('Company shortlists applicant', async () => {
    const res = await request(app).put(`/api/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ status: 'Shortlisted', companyNotes: 'Strong candidate with good CGPA' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Shortlisted');
  });

  test('Company schedules interview', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const res = await request(app).post('/api/interviews')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ applicationId, interviewDate: futureDate, interviewType: 'Technical', round: 1, instructions: 'Prepare DSA topics' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('Scheduled');
    interviewId = res.body.data.id;
  });

  test('Company records interview result as Passed', async () => {
    const res = await request(app).put(`/api/interviews/${interviewId}`)
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ status: 'Completed', result: 'Passed', feedback: 'Excellent performance', score: 85 });
    expect(res.status).toBe(200);
    expect(res.body.data.result).toBe('Passed');
  });

  test('Company issues offer to selected student', async () => {
    const res = await request(app).post('/api/offers')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ applicationId, ctc: 800000, designation: 'Software Engineer', joiningDate: '2025-07-01', offerLocation: 'Bangalore' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('Issued');
    offerId = res.body.data.id;
  });
});

describe('6. Student Offer Decision Tests', () => {
  test('Student accepts offer', async () => {
    const res = await request(app).put(`/api/offers/${offerId}/decision`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ decision: 'accept' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Accepted');
  });

  test('Student profile marked as placed after accepting offer', async () => {
    const res = await request(app).get('/api/students/me')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.body.data.isPlaced).toBe(true);
  });
});

describe('7. Admin & Reports Tests', () => {
  test('Admin gets placement statistics', async () => {
    const res = await request(app).get('/api/reports/placement-statistics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalStudents).toBeGreaterThan(0);
    expect(res.body.data.placedStudents).toBeGreaterThan(0);
    expect(res.body.data.placementPercentage).toBeGreaterThan(0);
  });

  test('Admin gets dashboard', async () => {
    const res = await request(app).get('/api/dashboard/admin')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.stats.totalStudents).toBeGreaterThan(0);
  });

  test('Admin gets all students', async () => {
    const res = await request(app).get('/api/students')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });
});

describe('8. Role-Based Authorization Tests', () => {
  test('Student cannot access admin dashboard', async () => {
    const res = await request(app).get('/api/dashboard/admin')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  test('Company cannot access student-only endpoints', async () => {
    const res = await request(app).get('/api/students/me')
      .set('Authorization', `Bearer ${companyToken}`);
    expect(res.status).toBe(403);
  });

  test('Unauthenticated request returns 401', async () => {
    const res = await request(app).get('/api/students/me');
    expect(res.status).toBe(401);
  });

  test('Invalid token returns 401', async () => {
    const res = await request(app).get('/api/students/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});
