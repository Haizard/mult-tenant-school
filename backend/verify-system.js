const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifySystem() {
  try {
    console.log('🔍 Verifying system setup...\n');

    // 1. Check tenants
    const tenants = await prisma.tenant.findMany();
    console.log('📋 Tenants:');
    tenants.forEach(tenant => {
      console.log(`  - ${tenant.name} (${tenant.id})`);
    });

    // 2. Check roles
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' }
    });
    console.log('\n🎭 Roles:');
    roles.forEach(role => {
      console.log(`  - ${role.name} (${role.isSystem ? 'System' : 'Custom'})`);
    });

    // 3. Check users and their roles
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

    console.log('\n👥 Users and Roles:');
    users.forEach(user => {
      const userRoles = user.userRoles.map(ur => ur.role.name).join(', ');
      console.log(`  - ${user.email} (${user.firstName} ${user.lastName})`);
      console.log(`    Tenant: ${user.tenant.name}`);
      console.log(`    Roles: ${userRoles}`);
      console.log('');
    });

    // 4. Check permissions
    const permissions = await prisma.permission.findMany();
    console.log(`📜 Total Permissions: ${permissions.length}`);

    // 5. Check role permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      include: {
        role: true,
        permission: true
      }
    });

    console.log('\n🔐 Role Permission Summary:');
    const rolePermissionCount = {};
    rolePermissions.forEach(rp => {
      if (!rolePermissionCount[rp.role.name]) {
        rolePermissionCount[rp.role.name] = 0;
      }
      rolePermissionCount[rp.role.name]++;
    });

    Object.entries(rolePermissionCount).forEach(([roleName, count]) => {
      console.log(`  - ${roleName}: ${count} permissions`);
    });

    console.log('\n✅ System verification completed!');
    
  } catch (error) {
    console.error('❌ Error verifying system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySystem();