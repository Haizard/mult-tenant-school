const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createProperRoles() {
  try {
    console.log('🔧 Creating proper role system...');

    // 1. Get the default tenant
    const defaultTenant = await prisma.tenant.findFirst();
    if (!defaultTenant) {
      console.error('No tenant found! Please create a tenant first.');
      return;
    }

    console.log(`Using tenant: ${defaultTenant.name} (${defaultTenant.id})`);

    // 2. Create system roles for this tenant
    const systemRoles = [
      { name: 'Super Admin', description: 'System-wide administrator', isSystem: true },
      { name: 'Tenant Admin', description: 'School administrator', isSystem: false },
      { name: 'Teacher', description: 'Teacher role', isSystem: false },
      { name: 'Student', description: 'Student role', isSystem: false },
      { name: 'Parent', description: 'Parent role', isSystem: false },
      { name: 'Staff', description: 'Staff role', isSystem: false }
    ];

    for (const roleData of systemRoles) {
      const existingRole = await prisma.role.findFirst({
        where: { 
          tenantId: defaultTenant.id,
          name: roleData.name 
        }
      });

      if (!existingRole) {
        await prisma.role.create({
          data: {
            tenantId: defaultTenant.id,
            name: roleData.name,
            description: roleData.description,
            isSystem: roleData.isSystem
          }
        });
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`✅ Role already exists: ${roleData.name}`);
      }
    }

    // 3. Get all permissions and assign to roles
    const allPermissions = await prisma.permission.findMany();
    console.log(`Found ${allPermissions.length} permissions`);

    // 4. Get the roles we just created
    const superAdminRole = await prisma.role.findFirst({
      where: { tenantId: defaultTenant.id, name: 'Super Admin' }
    });

    const tenantAdminRole = await prisma.role.findFirst({
      where: { tenantId: defaultTenant.id, name: 'Tenant Admin' }
    });

    // 5. Assign all permissions to both Super Admin and Tenant Admin
    for (const role of [superAdminRole, tenantAdminRole]) {
      if (role) {
        for (const permission of allPermissions) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id
              }
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id
            }
          });
        }
        console.log(`✅ Assigned all permissions to ${role.name}`);
      }
    }

    // 6. Update user role assignments
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: { role: true }
        }
      }
    });

    for (const user of users) {
      // Remove old role assignments
      await prisma.userRole.deleteMany({
        where: { userId: user.id }
      });

      // Assign new roles based on email
      let newRoleId;
      if (user.email === 'sysadmin@school.com') {
        newRoleId = superAdminRole.id;
      } else {
        newRoleId = tenantAdminRole.id;
      }

      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: newRoleId,
          tenantId: defaultTenant.id
        }
      });

      console.log(`✅ Assigned role to ${user.email}`);
    }

    console.log('\n✅ Role system setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error creating proper roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createProperRoles();