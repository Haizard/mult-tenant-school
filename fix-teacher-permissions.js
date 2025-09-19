const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTeacherPermissions() {
  try {
    console.log('🔧 Fixing teacher permissions for School Admin...');

    // Get School Admin role (Tenant Admin)
    const schoolAdminRole = await prisma.role.findFirst({
      where: { name: 'Tenant Admin' }
    });

    if (!schoolAdminRole) {
      console.log('❌ School Admin (Tenant Admin) role not found');
      return;
    }

    console.log('✅ Found School Admin role:', schoolAdminRole.id);

    // Get all teacher permissions
    const teacherPermissions = await prisma.permission.findMany({
      where: {
        resource: 'teachers'
      }
    });

    console.log('📝 Found teacher permissions:', teacherPermissions.map(p => p.name));

    // Add each teacher permission to School Admin role
    for (const permission of teacherPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: schoolAdminRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: schoolAdminRole.id,
          permissionId: permission.id
        }
      });
      console.log(`✅ Added ${permission.name} to School Admin`);
    }

    // Also add attendance and parent permissions that might be missing
    const additionalPermissions = await prisma.permission.findMany({
      where: {
        OR: [
          { resource: 'attendance' },
          { resource: 'parents' }
        ]
      }
    });

    for (const permission of additionalPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: schoolAdminRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: schoolAdminRole.id,
          permissionId: permission.id
        }
      });
      console.log(`✅ Added ${permission.name} to School Admin`);
    }

    console.log('🎉 Successfully fixed teacher permissions for School Admin!');
    console.log('📧 School Admin permissions have been updated. Please use your configured admin credentials.');

  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTeacherPermissions();
