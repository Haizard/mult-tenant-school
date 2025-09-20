const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addAcademicPermissions() {
  try {
    console.log('🔧 Adding academic permissions...');

    // Academic permissions to add
    const academicPermissions = [
      { name: 'courses:create', description: 'Create courses', resource: 'courses', action: 'create' },
      { name: 'courses:read', description: 'Read courses', resource: 'courses', action: 'read' },
      { name: 'courses:update', description: 'Update courses', resource: 'courses', action: 'update' },
      { name: 'courses:delete', description: 'Delete courses', resource: 'courses', action: 'delete' },
      { name: 'subjects:create', description: 'Create subjects', resource: 'subjects', action: 'create' },
      { name: 'subjects:read', description: 'Read subjects', resource: 'subjects', action: 'read' },
      { name: 'subjects:update', description: 'Update subjects', resource: 'subjects', action: 'update' },
      { name: 'subjects:delete', description: 'Delete subjects', resource: 'subjects', action: 'delete' },
      { name: 'classes:create', description: 'Create classes', resource: 'classes', action: 'create' },
      { name: 'classes:read', description: 'Read classes', resource: 'classes', action: 'read' },
      { name: 'classes:update', description: 'Update classes', resource: 'classes', action: 'update' },
      { name: 'classes:delete', description: 'Delete classes', resource: 'classes', action: 'delete' },
      { name: 'grades:create', description: 'Create grades', resource: 'grades', action: 'create' },
      { name: 'grades:read', description: 'Read grades', resource: 'grades', action: 'read' },
      { name: 'grades:update', description: 'Update grades', resource: 'grades', action: 'update' },
      { name: 'grades:delete', description: 'Delete grades', resource: 'grades', action: 'delete' },
      { name: 'schedules:create', description: 'Create schedules', resource: 'schedules', action: 'create' },
      { name: 'schedules:read', description: 'Read schedules', resource: 'schedules', action: 'read' },
      { name: 'schedules:update', description: 'Update schedules', resource: 'schedules', action: 'update' },
      { name: 'schedules:delete', description: 'Delete schedules', resource: 'schedules', action: 'delete' }
    ];

    // Create permissions
    for (const perm of academicPermissions) {
      await prisma.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: perm
      });
    }

    console.log('✅ Academic permissions created');

    // Get School Administrator role
    const schoolAdminRole = await prisma.role.findFirst({
      where: { name: 'School Administrator' }
    });

    if (schoolAdminRole) {
      const allPermissions = await prisma.permission.findMany();
      
      // Assign all permissions to School Administrator
      for (const permission of allPermissions) {
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
      console.log('✅ Assigned all permissions to School Administrator');
    }

    console.log('✅ Academic permissions setup completed!');
    
  } catch (error) {
    console.error('❌ Error adding academic permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAcademicPermissions();