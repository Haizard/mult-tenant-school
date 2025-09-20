const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignTenantAdminRole() {
  try {
    console.log('🔧 Assigning Tenant Admin role to users...');

    // Get Tenant Admin role
    const tenantAdminRole = await prisma.role.findFirst({
      where: { name: 'Tenant Admin' }
    });

    if (!tenantAdminRole) {
      console.error('Tenant Admin role not found!');
      return;
    }

    // Find users without roles (excluding system admin)
    const usersWithoutRoles = await prisma.user.findMany({
      where: {
        userRoles: {
          none: {}
        },
        email: {
          not: 'sysadmin@school.com' // Don't assign to system admin
        }
      },
      include: {
        tenant: true
      }
    });

    console.log(`Found ${usersWithoutRoles.length} users without roles`);

    // Assign Tenant Admin role to these users
    for (const user of usersWithoutRoles) {
      console.log(`Assigning Tenant Admin role to ${user.email}`);
      
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: tenantAdminRole.id,
          tenantId: user.tenantId
        }
      });
    }

    console.log('✅ Tenant Admin role assigned to all users');
    
  } catch (error) {
    console.error('❌ Error assigning tenant admin role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignTenantAdminRole();