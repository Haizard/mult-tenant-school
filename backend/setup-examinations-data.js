const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupExaminationsData() {
  try {
    console.log('🚀 Setting up examinations data...\n');

    // Get the first tenant (for demo purposes)
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      console.log('❌ No tenant found. Please create a tenant first.');
      return;
    }
    console.log(`📍 Using tenant: ${tenant.name}`);

    // Get a user to set as creator
    const user = await prisma.user.findFirst({
      where: { tenantId: tenant.id }
    });
    if (!user) {
      console.log('❌ No user found for tenant. Please create users first.');
      return;
    }
    console.log(`👤 Using creator: ${user.firstName} ${user.lastName}`);

    // 1. Create Academic Years
    console.log('\n📅 Creating Academic Years...');
    const academicYearsData = [
      { yearName: '2024/2025', startDate: new Date('2024-09-01'), endDate: new Date('2025-08-31'), isCurrent: true },
      { yearName: '2023/2024', startDate: new Date('2023-09-01'), endDate: new Date('2024-08-31'), isCurrent: false },
      { yearName: '2025/2026', startDate: new Date('2025-09-01'), endDate: new Date('2026-08-31'), isCurrent: false }
    ];

    for (const yearData of academicYearsData) {
      const existing = await prisma.academicYear.findFirst({
        where: { yearName: yearData.yearName, tenantId: tenant.id }
      });

      if (!existing) {
        await prisma.academicYear.create({
          data: {
            ...yearData,
            tenantId: tenant.id,
            createdBy: user.id,
            updatedBy: user.id,
            status: 'ACTIVE'
          }
        });
        console.log(`  ✅ Created: ${yearData.yearName}`);
      } else {
        console.log(`  ℹ️  Already exists: ${yearData.yearName}`);
      }
    }

    // 2. Create Subjects
    console.log('\n📚 Creating Subjects...');
    const subjectsData = [
      // Primary Level
      { subjectName: 'Mathematics', subjectCode: 'MATH_P', subjectLevel: 'PRIMARY', subjectType: 'CORE', description: 'Primary Mathematics' },
      { subjectName: 'English Language', subjectCode: 'ENG_P', subjectLevel: 'PRIMARY', subjectType: 'CORE', description: 'Primary English' },
      { subjectName: 'Science', subjectCode: 'SCI_P', subjectLevel: 'PRIMARY', subjectType: 'CORE', description: 'Primary Science' },
      { subjectName: 'Social Studies', subjectCode: 'SS_P', subjectLevel: 'PRIMARY', subjectType: 'CORE', description: 'Primary Social Studies' },
      { subjectName: 'Swahili', subjectCode: 'SW_P', subjectLevel: 'PRIMARY', subjectType: 'CORE', description: 'Primary Swahili' },

      // O-Level
      { subjectName: 'Mathematics', subjectCode: 'MATH_O', subjectLevel: 'O_LEVEL', subjectType: 'CORE', description: 'O-Level Mathematics' },
      { subjectName: 'English Language', subjectCode: 'ENG_O', subjectLevel: 'O_LEVEL', subjectType: 'CORE', description: 'O-Level English' },
      { subjectName: 'Physics', subjectCode: 'PHY_O', subjectLevel: 'O_LEVEL', subjectType: 'SCIENCE', description: 'O-Level Physics' },
      { subjectName: 'Chemistry', subjectCode: 'CHEM_O', subjectLevel: 'O_LEVEL', subjectType: 'SCIENCE', description: 'O-Level Chemistry' },
      { subjectName: 'Biology', subjectCode: 'BIO_O', subjectLevel: 'O_LEVEL', subjectType: 'SCIENCE', description: 'O-Level Biology' },
      { subjectName: 'History', subjectCode: 'HIST_O', subjectLevel: 'O_LEVEL', subjectType: 'HUMANITIES', description: 'O-Level History' },
      { subjectName: 'Geography', subjectCode: 'GEO_O', subjectLevel: 'O_LEVEL', subjectType: 'HUMANITIES', description: 'O-Level Geography' },
      { subjectName: 'Computer Science', subjectCode: 'CS_O', subjectLevel: 'O_LEVEL', subjectType: 'TECHNICAL', description: 'O-Level Computer Science' },

      // A-Level
      { subjectName: 'Advanced Mathematics', subjectCode: 'AMATH_A', subjectLevel: 'A_LEVEL', subjectType: 'CORE', description: 'A-Level Advanced Mathematics' },
      { subjectName: 'Physics', subjectCode: 'PHY_A', subjectLevel: 'A_LEVEL', subjectType: 'SCIENCE', description: 'A-Level Physics' },
      { subjectName: 'Chemistry', subjectCode: 'CHEM_A', subjectLevel: 'A_LEVEL', subjectType: 'SCIENCE', description: 'A-Level Chemistry' },
      { subjectName: 'Biology', subjectCode: 'BIO_A', subjectLevel: 'A_LEVEL', subjectType: 'SCIENCE', description: 'A-Level Biology' },
      { subjectName: 'Economics', subjectCode: 'ECON_A', subjectLevel: 'A_LEVEL', subjectType: 'HUMANITIES', description: 'A-Level Economics' },
      { subjectName: 'History', subjectCode: 'HIST_A', subjectLevel: 'A_LEVEL', subjectType: 'HUMANITIES', description: 'A-Level History' }
    ];

    for (const subjectData of subjectsData) {
      const existing = await prisma.subject.findFirst({
        where: {
          subjectCode: subjectData.subjectCode,
          tenantId: tenant.id
        }
      });

      if (!existing) {
        await prisma.subject.create({
          data: {
            ...subjectData,
            tenantId: tenant.id,
            createdBy: user.id,
            updatedBy: user.id,
            status: 'ACTIVE'
          }
        });
        console.log(`  ✅ Created: ${subjectData.subjectName} (${subjectData.subjectLevel})`);
      } else {
        console.log(`  ℹ️  Already exists: ${subjectData.subjectName} (${subjectData.subjectLevel})`);
      }
    }

    // 3. Create Grading Scales
    console.log('\n⭐ Creating Grading Scales...');

    const gradingScalesData = [
      {
        scaleName: 'Primary School Grading',
        examLevel: 'PRIMARY',
        isDefault: true,
        gradeRanges: [
          { grade: 'A', min: 80, max: 100, points: 5 },
          { grade: 'B', min: 65, max: 79, points: 4 },
          { grade: 'C', min: 50, max: 64, points: 3 },
          { grade: 'D', min: 30, max: 49, points: 2 },
          { grade: 'F', min: 0, max: 29, points: 1 }
        ]
      },
      {
        scaleName: 'O-Level Grading (NECTA)',
        examLevel: 'O_LEVEL',
        isDefault: true,
        gradeRanges: [
          { grade: 'A', min: 80, max: 100, points: 5 },
          { grade: 'B', min: 65, max: 79, points: 4 },
          { grade: 'C', min: 50, max: 64, points: 3 },
          { grade: 'D', min: 30, max: 49, points: 2 },
          { grade: 'F', min: 0, max: 29, points: 1 }
        ]
      },
      {
        scaleName: 'A-Level Grading (NECTA)',
        examLevel: 'A_LEVEL',
        isDefault: true,
        gradeRanges: [
          { grade: 'A', min: 80, max: 100, points: 5 },
          { grade: 'B', min: 70, max: 79, points: 4 },
          { grade: 'C', min: 60, max: 69, points: 3 },
          { grade: 'D', min: 50, max: 59, points: 2 },
          { grade: 'E', min: 40, max: 49, points: 1 },
          { grade: 'F', min: 0, max: 39, points: 0 }
        ]
      },
      {
        scaleName: 'University Grading',
        examLevel: 'UNIVERSITY',
        isDefault: true,
        gradeRanges: [
          { grade: 'A+', min: 95, max: 100, points: 4.0 },
          { grade: 'A', min: 90, max: 94, points: 4.0 },
          { grade: 'A-', min: 85, max: 89, points: 3.7 },
          { grade: 'B+', min: 80, max: 84, points: 3.3 },
          { grade: 'B', min: 75, max: 79, points: 3.0 },
          { grade: 'B-', min: 70, max: 74, points: 2.7 },
          { grade: 'C+', min: 65, max: 69, points: 2.3 },
          { grade: 'C', min: 60, max: 64, points: 2.0 },
          { grade: 'C-', min: 55, max: 59, points: 1.7 },
          { grade: 'D+', min: 50, max: 54, points: 1.3 },
          { grade: 'D', min: 45, max: 49, points: 1.0 },
          { grade: 'F', min: 0, max: 44, points: 0.0 }
        ]
      }
    ];

    for (const scaleData of gradingScalesData) {
      const existing = await prisma.gradingScale.findFirst({
        where: {
          scaleName: scaleData.scaleName,
          tenantId: tenant.id
        }
      });

      if (!existing) {
        await prisma.gradingScale.create({
          data: {
            scaleName: scaleData.scaleName,
            examLevel: scaleData.examLevel,
            gradeRanges: scaleData.gradeRanges,
            isDefault: scaleData.isDefault,
            tenantId: tenant.id,
            createdBy: user.id,
            updatedBy: user.id
          }
        });
        console.log(`  ✅ Created: ${scaleData.scaleName}`);
      } else {
        console.log(`  ℹ️  Already exists: ${scaleData.scaleName}`);
      }
    }

    // 4. Create sample examinations
    console.log('\n📝 Creating Sample Examinations...');

    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true, tenantId: tenant.id }
    });

    if (currentAcademicYear) {
      const mathSubject = await prisma.subject.findFirst({
        where: { subjectCode: 'MATH_O', tenantId: tenant.id }
      });

      const englishSubject = await prisma.subject.findFirst({
        where: { subjectCode: 'ENG_O', tenantId: tenant.id }
      });

      const sampleExams = [
        {
          examName: 'Mid-Term Mathematics',
          examType: 'MID_TERM',
          examLevel: 'O_LEVEL',
          subjectId: mathSubject?.id,
          academicYearId: currentAcademicYear.id,
          startDate: new Date('2024-11-15'),
          endDate: new Date('2024-11-15'),
          maxMarks: 100,
          weight: 0.3,
          status: 'SCHEDULED',
          description: 'Mid-term examination for O-Level Mathematics'
        },
        {
          examName: 'Final English Examination',
          examType: 'FINAL',
          examLevel: 'O_LEVEL',
          subjectId: englishSubject?.id,
          academicYearId: currentAcademicYear.id,
          startDate: new Date('2024-12-01'),
          endDate: new Date('2024-12-01'),
          maxMarks: 100,
          weight: 0.5,
          status: 'DRAFT',
          description: 'Final examination for O-Level English Language'
        }
      ];

      for (const examData of sampleExams) {
        if (examData.subjectId) {
          const existing = await prisma.examination.findFirst({
            where: {
              examName: examData.examName,
              tenantId: tenant.id
            }
          });

          if (!existing) {
            await prisma.examination.create({
              data: {
                ...examData,
                tenantId: tenant.id,
                createdBy: user.id,
                updatedBy: user.id
              }
            });
            console.log(`  ✅ Created: ${examData.examName}`);
          } else {
            console.log(`  ℹ️  Already exists: ${examData.examName}`);
          }
        }
      }
    } else {
      console.log('  ⚠️  No current academic year found. Skipping sample examinations.');
    }

    console.log('\n🎉 Examinations data setup completed successfully!');
    console.log('\n📊 Summary:');

    const counts = {
      academicYears: await prisma.academicYear.count({ where: { tenantId: tenant.id } }),
      subjects: await prisma.subject.count({ where: { tenantId: tenant.id } }),
      gradingScales: await prisma.gradingScale.count({ where: { tenantId: tenant.id } }),
      examinations: await prisma.examination.count({ where: { tenantId: tenant.id } })
    };

    console.log(`  📅 Academic Years: ${counts.academicYears}`);
    console.log(`  📚 Subjects: ${counts.subjects}`);
    console.log(`  ⭐ Grading Scales: ${counts.gradingScales}`);
    console.log(`  📝 Examinations: ${counts.examinations}`);

  } catch (error) {
    console.error('❌ Error setting up examinations data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupExaminationsData();
