const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleAcademicYear() {
  try {
    console.log('🔧 Creating sample academic year...');

    const tenant = await prisma.tenant.findFirst();
    
    if (!tenant) {
      console.log('❌ No tenant found');
      return;
    }

    const existingYear = await prisma.academicYear.findFirst({
      where: { tenantId: tenant.id }
    });

    if (existingYear) {
      console.log(`✅ Academic year already exists: ${existingYear.yearName}`);
      return;
    }

    // Get a user to be the creator
    const user = await prisma.user.findFirst({
      where: { tenantId: tenant.id }
    });

    if (!user) {
      console.log('❌ No user found for tenant');
      return;
    }

    const currentYear = new Date().getFullYear();
    const academicYear = await prisma.academicYear.create({
      data: {
        tenantId: tenant.id,
        yearName: `${currentYear}-${currentYear + 1}`,
        startDate: new Date(`${currentYear}-09-01`),
        endDate: new Date(`${currentYear + 1}-06-30`),
        isCurrent: true,
        status: 'ACTIVE',
        createdBy: user.id,
        updatedBy: user.id
      }
    });

    console.log(`✅ Created academic year: ${academicYear.yearName}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleAcademicYear();