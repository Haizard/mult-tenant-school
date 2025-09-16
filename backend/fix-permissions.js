const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPermissions() {
  try {
    console.log('🔍 Checking current user permissions...');

    // Get all users with their roles and permissions
    const users = await prisma.user.findMany({
      include: {
        tenant: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log('\n📊 Current Users and Permissions:');
    for (const user of users) {
      console.log(`\n👤 User: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`🏢 Tenant: ${user.tenant.name}`);
      console.log(`🔑 Roles: ${user.userRoles.map(ur => ur.role.name).join(', ')}`);
      
      const permissions = user.userRoles.flatMap(ur =>
        ur.role.rolePermissions.map(rp => rp.permission.name)
      );
      
      console.log(`📋 Permissions: ${permissions.join(', ')}`);
      console.log(`❓ Has students:read: ${permissions.includes('students:read')}`);
    }

    // Add missing students permissions to roles that should have them
    const rolesToUpdate = [
      { name: 'Tenant Admin', permissions: ['students:read', 'students:create', 'students:update', 'students:delete'] },
      { name: 'Super Admin', permissions: ['students:read', 'students:create', 'students:update', 'students:delete'] },
      { name: 'Teacher', permissions: ['students:read', 'students:create', 'students:update'] }
    ];
  
    for (const roleConfig of rolesToUpdate) {
      const role = await prisma.role.findFirst({
        where: { name: roleConfig.name },
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      });

      if (role) {
        for (const permissionName of roleConfig.permissions) {
          const [resource, action] = permissionName.split(':');
          
          // Check if role already has this permission
          const hasPermission = role.rolePermissions.some(rp => 
            rp.permission.resource === resource && rp.permission.action === action
          );

          if (!hasPermission) {
            // Find the permission
            const permission = await prisma.permission.findFirst({
              where: {
                resource: resource,
                action: action
              }
            });

            if (permission) {
              await prisma.rolePermission.create({
                data: {
                  roleId: role.id,
                  permissionId: permission.id
                }
              });
              console.log(`✅ Added ${permissionName} permission to ${roleConfig.name}`);
            } else {
              console.log(`❌ ${permissionName} permission not found`);
            }
          } else {
            console.log(`✅ ${roleConfig.name} already has ${permissionName} permission`);
          }
        }
      } else {
        console.log(`❌ Role ${roleConfig.name} not found`);
      }
    }
    console.log('\n🎉 Permission fix completed!');
    console.log('\n💡 Note: Users may need to log out and log back in for changes to take effect.');

  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPermissions();
