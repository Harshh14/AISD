require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Student, Company, JobListing } = require('../models');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('🌱 Seeding database...');

    const hashedPass = await bcrypt.hash('password123', 12);

    // Admin
    await User.create({ name: 'Admin User', email: 'admin@talenthub.edu', password: hashedPass, role: 'admin' });
    console.log('✅ Admin created');

    // Students
    const studentData = [
      { name: 'Rahul Sharma',  email: 'rahul@student.edu',  branch: 'CSE',  cgpa: 8.2, activeBacklogs: 0, phone: '9876543210', graduationYear: 2025, degree: 'B.Tech' },
      { name: 'Priya Singh',   email: 'priya@student.edu',  branch: 'CSAI', cgpa: 7.5, activeBacklogs: 1, phone: '9876543211', graduationYear: 2025, degree: 'B.Tech' },
      { name: 'Amit Kumar',    email: 'amit@student.edu',   branch: 'ECE',  cgpa: 6.8, activeBacklogs: 2, phone: '9876543212', graduationYear: 2025, degree: 'B.Tech' },
      { name: 'Sneha Patel',   email: 'sneha@student.edu',  branch: 'IT',   cgpa: 9.1, activeBacklogs: 0, phone: '9876543213', graduationYear: 2025, degree: 'B.Tech' },
      { name: 'Rohit Verma',   email: 'rohit@student.edu',  branch: 'ME',   cgpa: 5.5, activeBacklogs: 3, phone: '9876543214', graduationYear: 2025, degree: 'B.Tech' },
      { name: 'Anjali Mishra', email: 'anjali@student.edu', branch: 'CSE',  cgpa: 7.8, activeBacklogs: 1, phone: '9876543215', graduationYear: 2025, degree: 'B.Tech' },
    ];

    for (let i = 0; i < studentData.length; i++) {
      const s = studentData[i];
      const user = await User.create({ name: s.name, email: s.email, password: hashedPass, role: 'student' });
      await Student.create({
        userId: user.id, branch: s.branch, cgpa: s.cgpa, activeBacklogs: s.activeBacklogs,
        phone: s.phone, graduationYear: s.graduationYear, degree: s.degree,
        profileComplete: true, rollNumber: `ROLL2025${String(i + 1).padStart(3, '0')}`,
        skills: JSON.stringify(['JavaScript', 'Python', 'SQL']),
      });
    }
    console.log('✅ Students created');

    // Companies
    const companyData = [
      { name: 'ABC Technologies', email: 'hr@abctech.com',  companyName: 'ABC Technologies', industry: 'IT Services',    location: 'Bangalore', hrName: 'Anjali Mehta' },
      { name: 'XYZ Corp',         email: 'hr@xyzcorp.com',  companyName: 'XYZ Corp',         industry: 'Product',         location: 'Hyderabad', hrName: 'Vikram Nair' },
      { name: 'DataSoft',         email: 'hr@datasoft.com', companyName: 'DataSoft Solutions',industry: 'Data Analytics', location: 'Pune',      hrName: 'Meera Joshi' },
    ];

    for (const c of companyData) {
      const user = await User.create({ name: c.name, email: c.email, password: hashedPass, role: 'company' });
      await Company.create({ userId: user.id, companyName: c.companyName, industry: c.industry, location: c.location, hrName: c.hrName, isVerified: true, website: 'https://example.com', description: `Leading ${c.industry} company.` });
    }
    console.log('✅ Companies created');

    // Jobs
    const companies = await Company.findAll();
    await JobListing.bulkCreate([
      { companyId: companies[0].id, title: 'Software Engineer',      description: 'Develop scalable web applications using Node.js and React.',  jobType: 'Full-Time',  location: 'Bangalore', salaryMin: 600000, salaryMax: 900000,  minCgpa: 7.0, maxBacklogs: 1, eligibleBranches: JSON.stringify(['CSE','CSAI','IT']), openings: 5, status: 'Active' },
      { companyId: companies[0].id, title: 'Frontend Developer',      description: 'Build modern UIs with React, Vue, and TypeScript.',           jobType: 'Full-Time',  location: 'Bangalore', salaryMin: 500000, salaryMax: 800000,  minCgpa: 6.5, maxBacklogs: 2, eligibleBranches: JSON.stringify(['CSE','CSAI','IT','ECE']), openings: 3, status: 'Active' },
      { companyId: companies[1].id, title: 'Product Manager Intern',  description: 'Work with product teams on roadmap and user research.',       jobType: 'Internship', location: 'Hyderabad', salaryMin: 25000,  salaryMax: 40000,   minCgpa: 7.5, maxBacklogs: 0, eligibleBranches: JSON.stringify(['CSE','CSAI']), openings: 2, status: 'Active' },
      { companyId: companies[2].id, title: 'Data Analyst',            description: 'Analyze business data and create insightful dashboards.',     jobType: 'Full-Time',  location: 'Pune',      salaryMin: 450000, salaryMax: 700000,  minCgpa: 6.0, maxBacklogs: 2, eligibleBranches: JSON.stringify(['CSE','CSAI','IT','ECE','ME']), openings: 4, status: 'Active' },
      { companyId: companies[2].id, title: 'ML Engineer',             description: 'Build and deploy machine learning models.',                   jobType: 'Full-Time',  location: 'Pune',      salaryMin: 800000, salaryMax: 1200000, minCgpa: 8.0, maxBacklogs: 0, eligibleBranches: JSON.stringify(['CSE','CSAI']), openings: 2, status: 'Active' },
    ]);
    console.log('✅ Jobs created');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📋 Demo Accounts:');
    console.log('   Admin:   admin@talenthub.edu  / password123');
    console.log('   Student: rahul@student.edu    / password123  (CSE, CGPA 8.2)');
    console.log('   Student: priya@student.edu    / password123  (CSAI, CGPA 7.5)');
    console.log('   Student: rohit@student.edu    / password123  (ME, CGPA 5.5 - ineligible for most)');
    console.log('   Company: hr@abctech.com       / password123');
    console.log('   Company: hr@xyzcorp.com       / password123');
    console.log('   Company: hr@datasoft.com      / password123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
