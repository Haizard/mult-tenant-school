const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRoles() {
  try {
    console.log('🔍 Checking existing roles...');

    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('Available roles:');
    roles.forEach(role => {
      console.log(`- ${role.name} (ID: ${role.id})`);
    });

    console.log('\n🔍 Checking users with School Administrator role...');
    const schoolAdminUsers = await prisma.userRole.findMany({
      where: {
        role: {
          name: 'School Administrator'
        }
      },
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true }
        },
        role: true
      }
    });

    console.log('Users with School Administrator role:');
    schoolAdminUsers.forEach(userRole => {
      console.log(`- ${userRole.user.email} (${userRole.user.firstName} ${userRole.user.lastName})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoles();