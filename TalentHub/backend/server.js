require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    await sequelize.sync({ alter: false });
    console.log('✅ Database synced');

    app.listen(PORT, () => {
      console.log(`\n🚀 TalentHub server running at http://localhost:${PORT}`);
      console.log(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('\n📋 Demo Accounts (after seeding):');
      console.log('   Admin:   admin@talenthub.edu / password123');
      console.log('   Student: rahul@student.edu / password123');
      console.log('   Company: hr@abctech.com / password123\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
