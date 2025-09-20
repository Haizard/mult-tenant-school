const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleSubjects() {
  try {
    const tenantId = 'cmfrak0gt0003mfqs2dtca4cc';
    const userId = 'cmfrak0gu0007mfqsi2lw4adj';

    const subjects = [
      {
        subjectName: 'Mathematics',
        subjectCode: 'MATH',
        subjectLevel: 'O_LEVEL',
        subjectType: 'CORE',
        description: 'Basic mathematics for O-Level students',
        credits: 4,
        tenantId,
        createdBy: userId,
        updatedBy: userId
      },
      {
        subjectName: 'English Language',
        subjectCode: 'ENG',
        subjectLevel: 'O_LEVEL',
        subjectType: 'CORE',
        description: 'English language and literature',
        credits: 4,
        tenantId,
        createdBy: userId,
        updatedBy: userId
      },
      {
        subjectName: 'Physics',
        subjectCode: 'PHY',
        subjectLevel: 'O_LEVEL',
        subjectType: 'OPTIONAL',
        description: 'Basic physics concepts',
        credits: 3,
        tenantId,
        createdBy: userId,
        updatedBy: userId
      },
      {
        subjectName: 'Chemistry',
        subjectCode: 'CHEM',
        subjectLevel: 'O_LEVEL',
        subjectType: 'OPTIONAL',
        description: 'Basic chemistry concepts',
        credits: 3,
        tenantId,
        createdBy: userId,
        updatedBy: userId
      },
      {
        subjectName: 'Biology',
        subjectCode: 'BIO',
        subjectLevel: 'O_LEVEL',
        subjectType: 'OPTIONAL',
        description: 'Basic biology concepts',
        credits: 3,
        tenantId,
        createdBy: userId,
        updatedBy: userId
      }
    ];

    for (const subject of subjects) {
      await prisma.subject.create({
        data: subject
      });
      console.log(`Created subject: ${subject.subjectName}`);
    }

    console.log('Sample subjects created successfully!');
  } catch (error) {
    console.error('Error creating sample subjects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleSubjects();