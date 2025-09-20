const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addExaminationPermissions() {
  try {
    console.log('Adding examination permissions...');

    // Create examination permissions if they don't exist
    const examinationPermissions = [
      { name: 'examinations:create', description: 'Create examinations', resource: 'examinations', action: 'create' },
      { name: 'examinations:read', description: 'Read examinations', resource: 'examinations', action: 'read' },
      { name: 'examinations:update', description: 'Update examinations', resource: 'examinations', action: 'update' },
      { name: 'examinations:delete', description: 'Delete examinations', resource: 'examinations', action: 'delete' },
    ];

    for (const perm of examinationPermissions) {
      const existingPermission = await prisma.permission.findUnique({
        where: { name: perm.name }
      });

      if (!existingPermission) {
        await prisma.permission.create({
          data: perm
        });
        console.log(`Created permission: ${perm.name}`);
      } else {
        console.log(`Permission already exists: ${perm.name}`);
      }
    }

    // Get all Tenant Admin roles
    const tenantAdminRoles = await prisma.role.findMany({
      where: {
        name: 'Tenant Admin'
      }
    });

    console.log(`Found ${tenantAdminRoles.length} Tenant Admin roles`);

    // Add examination permissions to all Tenant Admin roles
    for (const role of tenantAdminRoles) {
      for (const perm of examinationPermissions) {
        const permission = await prisma.permission.findUnique({
          where: { name: perm.name }
        });

        if (permission) {
          const existingRolePermission = await prisma.rolePermission.findUnique({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id
              }
            }
          });

          if (!existingRolePermission) {
            await prisma.rolePermission.create({
              data: {
                roleId: role.id,
                permissionId: permission.id
              }
            });
            console.log(`Added ${perm.name} to role ${role.name} (${role.tenantId})`);
          } else {
            console.log(`Permission ${perm.name} already assigned to role ${role.name} (${role.tenantId})`);
          }
        }
      }
    }

    console.log('Examination permissions added successfully!');
  } catch (error) {
    console.error('Error adding examination permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addExaminationPermissions();