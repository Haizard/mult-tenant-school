const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleClasses() {
  try {
    console.log('🔧 Creating sample classes...');

    const tenant = await prisma.tenant.findFirst();
    const user = await prisma.user.findFirst({ where: { tenantId: tenant.id } });
    const academicYear = await prisma.academicYear.findFirst({ where: { tenantId: tenant.id } });

    if (!tenant || !user || !academicYear) {
      console.log('❌ Missing required data (tenant, user, or academic year)');
      return;
    }

    // Check if classes already exist
    const existingClasses = await prisma.class.findMany({
      where: { tenantId: tenant.id }
    });

    if (existingClasses.length > 0) {
      console.log(`✅ Classes already exist: ${existingClasses.length} found`);
      return;
    }

    const classesToCreate = [
      {
        className: 'Form 1A',
        classCode: 'F1A',
        capacity: 40,
        description: 'Form 1 Section A'
      },
      {
        className: 'Form 2A', 
        classCode: 'F2A',
        capacity: 40,
        description: 'Form 2 Section A'
      },
      {
        className: 'Form 5A',
        classCode: 'F5A', 
        capacity: 30,
        description: 'Form 5 Section A'
      }
    ];

    for (const classData of classesToCreate) {
      const newClass = await prisma.class.create({
        data: {
          ...classData,
          tenantId: tenant.id,
          status: 'ACTIVE',
          createdBy: user.id,
          updatedBy: user.id
        }
      });
      console.log(`✅ Created class: ${newClass.className}`);
    }

    console.log('✅ Sample classes created successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleClasses();