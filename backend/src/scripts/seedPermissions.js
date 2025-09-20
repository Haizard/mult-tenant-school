const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedPermissions() {
  try {
    console.log('Starting permissions seeding...');

    // Create basic permissions
    const permissions = [
      { name: 'users.create', description: 'Create users', resource: 'users', action: 'create' },
      { name: 'users.read', description: 'Read users', resource: 'users', action: 'read' },
      { name: 'users.update', description: 'Update users', resource: 'users', action: 'update' },
      { name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
      { name: 'teachers.create', description: 'Create teachers', resource: 'teachers', action: 'create' },
      { name: 'teachers.read', description: 'Read teachers', resource: 'teachers', action: 'read' },
      { name: 'teachers.update', description: 'Update teachers', resource: 'teachers', action: 'update' },
      { name: 'teachers.delete', description: 'Delete teachers', resource: 'teachers', action: 'delete' },
      { name: 'students.create', description: 'Create students', resource: 'students', action: 'create' },
      { name: 'students.read', description: 'Read students', resource: 'students', action: 'read' },
      { name: 'students.update', description: 'Update students', resource: 'students', action: 'update' },
      { name: 'students.delete', description: 'Delete students', resource: 'students', action: 'delete' },
      { name: 'system.admin', description: 'System administration', resource: 'system', action: 'admin' }
    ];

    for (const perm of permissions) {
      await prisma.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: perm
      });
    }

    console.log('Created permissions');

    // Get roles and permissions
    const systemAdminRole = await prisma.role.findFirst({
      where: { name: 'System Administrator' }
    });

    const schoolAdminRole = await prisma.role.findFirst({
      where: { name: 'School Administrator' }
    });

    const allPermissions = await prisma.permission.findMany();

    // Assign all permissions to System Administrator
    if (systemAdminRole) {
      for (const permission of allPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: systemAdminRole.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            roleId: systemAdminRole.id,
            permissionId: permission.id
          }
        });
      }
      console.log('Assigned all permissions to System Administrator');
    }

    // Assign school-related permissions to School Administrator
    if (schoolAdminRole) {
      const schoolPermissions = allPermissions.filter(p => 
        p.resource === 'teachers' || p.resource === 'students' || p.name === 'users.read'
      );

      for (const permission of schoolPermissions) {
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
      }
      console.log('Assigned school permissions to School Administrator');
    }

    console.log('✅ Permissions seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPermissions();