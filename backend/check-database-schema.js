const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking current database schema...');
    
    // Check if the new columns exist in the Class table
    const result = await prisma.$executeRaw`PRAGMA table_info(Class)`;
    console.log('Class table structure:', result);
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseSchema();