const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTenantAdminRole() {
  try {
    console.log('🔧 Creating Tenant Admin role and updating user...');

    // Create Tenant Admin role
    const tenantAdminRole = await prisma.role.upsert({
      where: { name: 'Tenant Admin' },
      update: {},
      create: {
        name: 'Tenant Admin',
        description: 'Administrator of a specific school tenant'
      }
    });

    console.log('✅ Tenant Admin role created');

    // Get all permissions
    const allPermissions = await prisma.permission.findMany();

    // Assign all permissions to Tenant Admin role
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: tenantAdminRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: tenantAdminRole.id,
          permissionId: permission.id
        }
      });
    }

    console.log('✅ Assigned all permissions to Tenant Admin');

    // Update School Administrator users to Tenant Admin
    const schoolAdminUsers = await prisma.userRole.findMany({
      where: {
        role: {
          name: 'School Administrator'
        }
      },
      include: {
        user: true
      }
    });

    for (const userRole of schoolAdminUsers) {
      console.log(`Updating user ${userRole.user.email} to Tenant Admin`);
      
      await prisma.userRole.update({
        where: { id: userRole.id },
        data: { roleId: tenantAdminRole.id }
      });
    }

    console.log('✅ All users updated to Tenant Admin role');
    
  } catch (error) {
    console.error('❌ Error creating tenant admin role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTenantAdminRole();