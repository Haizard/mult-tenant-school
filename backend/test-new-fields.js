const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNewFields() {
  try {
    console.log('🔍 Testing if new fields were added to Class table...');
    
    // Try to query the Class table to see all fields
    const classes = await prisma.class.findMany({
      select: {
        id: true,
        className: true,
        classCode: true,
        capacity: true,
        description: true,
        tenantId: true,
        status: true,
        createdBy: true,
        updatedBy: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log(`Found ${classes.length} classes in database`);
    if (classes.length > 0) {
      console.log('Sample class structure:', Object.keys(classes[0]));
    }
    
    // Try to use raw SQL to check if the new columns exist
    const result = await prisma.$queryRaw`SELECT * FROM Class LIMIT 1`;
    
    if (result && result.length > 0) {
      console.log('Actual database columns:', Object.keys(result[0]));
      
      const hasAcademicLevel = 'academicLevel' in result[0];
      const hasAcademicYearId = 'academicYearId' in result[0];  
      const hasTeacherId = 'teacherId' in result[0];
      
      console.log(`✅ New fields status:`);
      console.log(`   academicLevel: ${hasAcademicLevel ? '✅ EXISTS' : '❌ MISSING'}`);
      console.log(`   academicYearId: ${hasAcademicYearId ? '✅ EXISTS' : '❌ MISSING'}`);
      console.log(`   teacherId: ${hasTeacherId ? '✅ EXISTS' : '❌ MISSING'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewFields();