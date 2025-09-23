const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showRealData() {
  try {
    console.log('🔍 Checking real data in database...');

    const tenant = await prisma.tenant.findFirst();
    
    // Check real students
    const students = await prisma.student.findMany({
      where: { tenantId: tenant.id },
      include: {
        user: true
      }
    });
    
    console.log('\n👥 REAL STUDENTS:');
    students.forEach(student => {
      console.log(`- ${student.user.firstName} ${student.user.lastName} (${student.studentId}) - ${student.user.email}`);
    });

    // Check real classes
    const classes = await prisma.class.findMany({
      where: { tenantId: tenant.id }
    });
    
    console.log('\n🏫 REAL CLASSES:');
    classes.forEach(cls => {
      console.log(`- ${cls.className} (${cls.classCode}) - Capacity: ${cls.capacity}`);
    });

    // Check real academic years
    const academicYears = await prisma.academicYear.findMany({
      where: { tenantId: tenant.id }
    });
    
    console.log('\n📅 ACADEMIC YEARS:');
    academicYears.forEach(year => {
      console.log(`- ${year.yearName} (${year.isCurrent ? 'Current' : 'Not Current'}) - Status: ${year.status}`);
    });

    // Check real courses
    const courses = await prisma.course.findMany({
      where: { tenantId: tenant.id }
    });
    
    console.log('\n📚 REAL COURSES:');
    courses.forEach(course => {
      console.log(`- ${course.courseName} (${course.courseCode}) - Credits: ${course.credits}`);
    });

    // Check real subjects
    const subjects = await prisma.subject.findMany({
      where: { tenantId: tenant.id }
    });
    
    console.log('\n📖 REAL SUBJECTS:');
    subjects.forEach(subject => {
      console.log(`- ${subject.subjectName} (${subject.subjectCode || 'No Code'}) - Level: ${subject.subjectLevel}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showRealData();