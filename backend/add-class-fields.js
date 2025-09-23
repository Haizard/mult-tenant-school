const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addClassFields() {
  try {
    console.log('🔧 Adding missing fields to Class table...');

    // Add the columns using raw SQL (try-catch for each to handle if they already exist)
    try {
      await prisma.$executeRaw`ALTER TABLE "Class" ADD COLUMN "academicLevel" TEXT`;
      console.log('✅ Added academicLevel field');
    } catch (error) {
      console.log('⚠️ academicLevel field already exists or failed to add');
    }

    try {
      await prisma.$executeRaw`ALTER TABLE "Class" ADD COLUMN "academicYearId" TEXT`;
      console.log('✅ Added academicYearId field');
    } catch (error) {
      console.log('⚠️ academicYearId field already exists or failed to add');
    }

    try {
      await prisma.$executeRaw`ALTER TABLE "Class" ADD COLUMN "teacherId" TEXT`;
      console.log('✅ Added teacherId field');
    } catch (error) {
      console.log('⚠️ teacherId field already exists or failed to add');
    }

    // Try to add foreign key constraints (these might fail if they already exist)
    try {
      await prisma.$executeRaw`ALTER TABLE "Class" ADD CONSTRAINT "Class_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE`;
      console.log('✅ Added academicYearId foreign key constraint');
    } catch (error) {
      console.log('⚠️ academicYearId foreign key constraint already exists or failed to add');
    }

    try {
      await prisma.$executeRaw`ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE`;
      console.log('✅ Added teacherId foreign key constraint');
    } catch (error) {
      console.log('⚠️ teacherId foreign key constraint already exists or failed to add');
    }

    console.log('\n✅ Class table migration completed!');
    
  } catch (error) {
    console.error('❌ Error adding class fields:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addClassFields();