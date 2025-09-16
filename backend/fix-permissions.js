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

    // Get students permission
    const studentsReadPermission = await prisma.permission.findUnique({
      where: { name: 'students:read' }
    });

    if (!studentsReadPermission) {
      console.log('\n❌ students:read permission not found in database');
      return;
    }

    // Get all roles that should have students:read permission
    const rolesToUpdate = await prisma.role.findMany({
      where: {
        OR: [
          { name: 'Super Admin' },
          { name: 'Tenant Admin' },
          { name: 'Teacher' }
        ]
      },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    console.log('\n🔧 Fixing role permissions...');
    for (const role of rolesToUpdate) {
      const hasStudentsRead = role.rolePermissions.some(rp => rp.permission.name === 'students:read');
      
      if (!hasStudentsRead) {
        console.log(`➕ Adding students:read permission to ${role.name}`);
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: studentsReadPermission.id
          }
        });
      } else {
        console.log(`✅ ${role.name} already has students:read permission`);
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
