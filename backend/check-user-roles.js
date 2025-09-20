const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRoles() {
  try {
    console.log('🔍 Checking user role assignments...');

    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true
          }
        },
        tenant: true
      }
    });

    console.log('Current users and their roles:');
    users.forEach(user => {
      console.log(`\n- ${user.email} (${user.firstName} ${user.lastName})`);
      console.log(`  Tenant: ${user.tenant?.name || 'No tenant'}`);
      console.log(`  Roles: ${user.userRoles.map(ur => ur.role.name).join(', ') || 'No roles'}`);
    });

    // Check if Tenant Admin role exists
    const tenantAdminRole = await prisma.role.findFirst({
      where: { name: 'Tenant Admin' }
    });

    if (tenantAdminRole) {
      console.log(`\n✅ Tenant Admin role exists (ID: ${tenantAdminRole.id})`);
    } else {
      console.log('\n❌ Tenant Admin role not found!');
    }
    
  } catch (error) {
    console.error('❌ Error checking user roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRoles();