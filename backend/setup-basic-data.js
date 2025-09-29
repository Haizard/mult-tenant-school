const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupBasicData() {
  try {
    console.log('Setting up basic data...');

    // Create tenant if none exists
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'Sample School',
          email: 'admin@sampleschool.com',
          domain: 'sampleschool.com',
          address: '123 School Street, Dar es Salaam',
          phone: '+255123456789',
          status: 'ACTIVE',
          currency: 'TZS',
        },
      });
      console.log(`Created tenant: ${tenant.name}`);
    }

    // Create users if none exist
    const users = await prisma.user.findMany({ where: { tenantId: tenant.id } });
    if (users.length === 0) {
      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'admin@sampleschool.com',
          password: '$2b$10$example.hash',
          firstName: 'School',
          lastName: 'Admin',
          status: 'ACTIVE',
        },
      });
      console.log(`Created user: ${user.email}`);
    }

    // Create academic year if none exists
    const academicYears = await prisma.academicYear.findMany({ where: { tenantId: tenant.id } });
    if (academicYears.length === 0) {
      const currentYear = new Date().getFullYear();
      const academicYear = await prisma.academicYear.create({
        data: {
          tenantId: tenant.id,
          yearName: `${currentYear}/${currentYear + 1}`,
          startDate: new Date(currentYear, 0, 1),
          endDate: new Date(currentYear + 1, 11, 31),
          isCurrent: true,
          status: 'ACTIVE',
          createdBy: users[0]?.id || (await prisma.user.findFirst({ where: { tenantId: tenant.id } }))?.id,
          updatedBy: users[0]?.id || (await prisma.user.findFirst({ where: { tenantId: tenant.id } }))?.id,
        },
      });
      console.log(`Created academic year: ${academicYear.yearName}`);
    }

    // Create classes if none exist
    const classes = await prisma.class.findMany({ where: { tenantId: tenant.id } });
    if (classes.length === 0) {
      const firstUser = await prisma.user.findFirst({ where: { tenantId: tenant.id } });
      const firstAcademicYear = await prisma.academicYear.findFirst({ where: { tenantId: tenant.id } });
      
      const sampleClasses = [
        { className: 'Form 1', classCode: 'F1', academicLevel: 'O_LEVEL' },
        { className: 'Form 2', classCode: 'F2', academicLevel: 'O_LEVEL' },
        { className: 'Form 3', classCode: 'F3', academicLevel: 'O_LEVEL' },
        { className: 'Form 4', classCode: 'F4', academicLevel: 'O_LEVEL' },
      ];

      for (const classData of sampleClasses) {
        await prisma.class.create({
          data: {
            tenantId: tenant.id,
            className: classData.className,
            classCode: classData.classCode,
            academicLevel: classData.academicLevel,
            academicYearId: firstAcademicYear?.id,
            description: `${classData.className} class`,
            capacity: 30,
            createdBy: firstUser?.id || '',
            updatedBy: firstUser?.id || '',
          },
        });
        console.log(`Created class: ${classData.className}`);
      }
    }

    console.log('✅ Basic data setup completed!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupBasicData();