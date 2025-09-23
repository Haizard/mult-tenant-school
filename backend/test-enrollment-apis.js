const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function testEnrollmentFormAPIs() {
  try {
    console.log('🔍 Testing enrollment form APIs...');

    // Get a sample user token for authentication
    const user = await prisma.user.findFirst({
      where: { email: 'admin@school.com' },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      console.log('❌ No user found');
      return;
    }

    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`🔑 User roles: ${user.userRoles.map(ur => ur.role.name).join(', ')}`);

    const permissions = user.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => rp.permission.name)
    );
    console.log(`📋 User permissions count: ${permissions.length}`);
    console.log(`🎯 Has academic-years:read: ${permissions.includes('academic-years:read') ? '✅' : '❌'}`);
    console.log(`🎯 Has courses:read: ${permissions.includes('courses:read') ? '✅' : '❌'}`);
    console.log(`🎯 Has subjects:read: ${permissions.includes('subjects:read') ? '✅' : '❌'}`);
    console.log(`🎯 Has classes:read: ${permissions.includes('classes:read') ? '✅' : '❌'}`);
    console.log(`🎯 Has students:read: ${permissions.includes('students:read') ? '✅' : '❌'}`);

    // Check data availability
    console.log('\n📊 Data availability check:');
    
    const academicYears = await prisma.academicYear.findMany({
      where: { tenantId: user.tenantId }
    });
    console.log(`📅 Academic Years: ${academicYears.length} found`);
    
    const courses = await prisma.course.findMany({
      where: { tenantId: user.tenantId }
    });
    console.log(`📚 Courses: ${courses.length} found`);
    
    const subjects = await prisma.subject.findMany({
      where: { tenantId: user.tenantId }
    });
    console.log(`📖 Subjects: ${subjects.length} found`);
    
    const classes = await prisma.class.findMany({
      where: { tenantId: user.tenantId }
    });
    console.log(`🏫 Classes: ${classes.length} found`);
    
    const students = await prisma.student.findMany({
      where: { tenantId: user.tenantId }
    });
    console.log(`👥 Students: ${students.length} found`);

    // If no academic years exist, that could be the issue
    if (academicYears.length === 0) {
      console.log('\n🚨 NO ACADEMIC YEARS FOUND - This could be the issue!');
      console.log('📝 Creating a sample academic year...');
      
      const currentYear = new Date().getFullYear();
      const academicYear = await prisma.academicYear.create({
        data: {
          tenantId: user.tenantId,
          yearName: `${currentYear}-${currentYear + 1}`,
          startDate: new Date(`${currentYear}-01-01`),
          endDate: new Date(`${currentYear}-12-31`),
          isCurrent: true,
          status: 'ACTIVE'
        }
      });
      
      console.log(`✅ Created academic year: ${academicYear.yearName}`);
    }

    console.log('\n✅ Enrollment form API diagnosis completed!');
    
  } catch (error) {
    console.error('❌ Error during API diagnosis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEnrollmentFormAPIs();