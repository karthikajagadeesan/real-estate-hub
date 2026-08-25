require('dotenv').config();
const app = require('./app');
const StoreService = require('./services/storeService');

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`===================================================`);
    console.log(`🚀 IndiaDits Backend API running on port ${PORT}`);
    console.log(`📚 Swagger API Docs available at http://localhost:${PORT}/api-docs`);
    console.log(`===================================================`);

    try {
      const connected = await StoreService.checkConnection();
      if (connected) {
        console.log('✅ PostgreSQL Database connected successfully via Prisma ORM.');
      } else {
        console.warn('⚠️ WARNING: PostgreSQL Database connection failed!');
      }
    } catch (err) {
      console.error('❌ Error checking database connection:', err.message);
    }
  });
}

module.exports = app;

