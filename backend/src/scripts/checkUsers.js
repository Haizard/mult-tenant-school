const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking users and their roles...\n');

    const users = await prisma.user.findMany({
      include: {
        tenant: true,
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    users.forEach(user => {
      console.log(`User: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`Tenant: ${user.tenant.name}`);
      console.log(`Roles: ${user.userRoles.length > 0 ? user.userRoles.map(ur => ur.role.name).join(', ') : 'No roles assigned'}`);
      console.log('---');
    });

    // Check roles
    console.log('\nAll roles:');
    const roles = await prisma.role.findMany({
      include: {
        tenant: true,
        userRoles: {
          include: {
            user: true
          }
        }
      }
    });

    roles.forEach(role => {
      console.log(`Role: ${role.name} (${role.tenant.name})`);
      console.log(`Users: ${role.userRoles.length > 0 ? role.userRoles.map(ur => ur.user.email).join(', ') : 'No users assigned'}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();