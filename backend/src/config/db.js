const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/indiadits_db?schema=public';
const isRemoteDb = connectionString.includes('supabase') || connectionString.includes('pooler') || connectionString.includes('neon') || process.env.NODE_ENV === 'production';

let prisma;
let pool;

try {
  pool = new Pool({ 
    connectionString,
    ssl: isRemoteDb ? { rejectUnauthorized: false } : false
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
} catch (error) {
  console.error('Prisma client failed to instantiate:', error.message);
}

module.exports = { prisma, pool };

