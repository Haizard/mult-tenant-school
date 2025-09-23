const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkExaminationsSetup() {
  try {
    console.log('=== Checking Examinations Setup ===\n');

    // Check tenants
    const tenants = await prisma.tenant.findMany();
    console.log(`🏢 Tenants: ${tenants.length}`);
    tenants.forEach(t => console.log(`  - ${t.name} (${t.id})`));

    // Check users
    const users = await prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    console.log(`\n👥 Users: ${users.length}`);
    users.forEach(u => {
      const roleNames = u.roles.map(ur => ur.role.name).join(', ');
      console.log(`  - ${u.firstName} ${u.lastName} (${u.email}) - Roles: ${roleNames}`);
    });

    // Check academic years
    const academicYears = await prisma.academicYear.findMany();
    console.log(`\n📅 Academic Years: ${academicYears.length}`);
    academicYears.forEach(ay => console.log(`  - ${ay.yearName} (Current: ${ay.isCurrent})`));

    // Check subjects
    const subjects = await prisma.subject.findMany();
    console.log(`\n📚 Subjects: ${subjects.length}`);
    subjects.forEach(s => console.log(`  - ${s.subjectName} (${s.subjectCode}) - Level: ${s.subjectLevel}`));

    // Check examinations
    const examinations = await prisma.examination.findMany({
      include: {
        subject: true,
        academicYear: true,
        createdByUser: true,
        _count: {
          select: {
            grades: true
          }
        }
      }
    });
    console.log(`\n📝 Examinations: ${examinations.length}`);
    examinations.forEach(e => {
      console.log(`  - ${e.examName} (${e.examType}) - Subject: ${e.subject?.subjectName || 'None'} - Grades: ${e._count.grades}`);
    });

    // Check grading scales
    const gradingScales = await prisma.gradingScale.findMany();
    console.log(`\n⭐ Grading Scales: ${gradingScales.length}`);
    gradingScales.forEach(gs => console.log(`  - ${gs.scaleName} (${gs.examLevel}) - Default: ${gs.isDefault}`));

    // Check grades
    const grades = await prisma.grade.findMany();
    console.log(`\n📊 Grades: ${grades.length}`);

    // Check examination permissions
    const examinationPermissions = await prisma.permission.findMany({
      where: {
        name: {
          startsWith: 'examinations:'
        }
      }
    });
    console.log(`\n🔐 Examination Permissions: ${examinationPermissions.length}`);
    examinationPermissions.forEach(p => console.log(`  - ${p.name}: ${p.description}`));

    // Check role permissions for examination
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        permission: {
          name: {
            startsWith: 'examinations:'
          }
        }
      },
      include: {
        role: true,
        permission: true
      }
    });
    console.log(`\n🔗 Role-Permission Assignments for Examinations: ${rolePermissions.length}`);
    rolePermissions.forEach(rp => {
      console.log(`  - ${rp.role.name} -> ${rp.permission.name}`);
    });

    console.log('\n=== Summary ===');
    console.log('✅ Database is set up for examinations');

    if (subjects.length === 0) {
      console.log('⚠️  Warning: No subjects found. You may need to create subjects first.');
    }

    if (academicYears.length === 0) {
      console.log('⚠️  Warning: No academic years found. You may need to create academic years first.');
    }

    if (gradingScales.length === 0) {
      console.log('⚠️  Warning: No grading scales found. Default grading will be used.');
    }

  } catch (error) {
    console.error('❌ Error checking examinations setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExaminationsSetup();
