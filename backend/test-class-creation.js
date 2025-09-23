const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testClassCreation() {
  try {
    console.log('🧪 Testing class creation with new fields...');

    const tenant = await prisma.tenant.findFirst();
    const user = await prisma.user.findFirst({ where: { tenantId: tenant.id } });
    const academicYear = await prisma.academicYear.findFirst({ where: { tenantId: tenant.id } });
    
    // Check if we have a teacher
    const teacher = await prisma.teacher.findFirst({ where: { tenantId: tenant.id } });
    
    console.log(`Found data: tenant=${!!tenant}, user=${!!user}, academicYear=${!!academicYear}, teacher=${!!teacher}`);

    if (!tenant || !user || !academicYear) {
      console.log('❌ Missing required data for test');
      return;
    }

    // Test creating a class with the new fields
    const testClass = await prisma.class.create({
      data: {
        className: 'Test Class',
        classCode: 'TC1',
        academicLevel: 'O_LEVEL',
        academicYearId: academicYear.id,
        teacherId: teacher?.id || null,
        capacity: 30,
        description: 'Test class with new fields',
        tenantId: tenant.id,
        status: 'ACTIVE',
        createdBy: user.id,
        updatedBy: user.id
      }
    });

    console.log('✅ Test class created successfully:');
    console.log({
      id: testClass.id,
      className: testClass.className,
      classCode: testClass.classCode,
      academicLevel: testClass.academicLevel,
      academicYearId: testClass.academicYearId,
      teacherId: testClass.teacherId,
      capacity: testClass.capacity
    });

    // Clean up test class
    await prisma.class.delete({
      where: { id: testClass.id }
    });
    
    console.log('✅ Test class deleted - cleanup complete');
    console.log('\n🎉 Class creation with new fields is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing class creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testClassCreation();