const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixRoleSystem() {
  try {
    console.log('🔧 Fixing the complete role system...');

    // 1. Check current roles
    const currentRoles = await prisma.role.findMany();
    console.log('Current roles:', currentRoles.map(r => r.name));

    // 2. Update System Administrator to Super Admin
    const systemAdminRole = await prisma.role.findFirst({
      where: { name: 'System Administrator' }
    });

    if (systemAdminRole) {
      await prisma.role.update({
        where: { id: systemAdminRole.id },
        data: { name: 'Super Admin' }
      });
      console.log('✅ Updated System Administrator to Super Admin');
    }

    // 3. Ensure Tenant Admin role exists (already done)
    const tenantAdminRole = await prisma.role.findFirst({
      where: { name: 'Tenant Admin' }
    });
    console.log('✅ Tenant Admin role exists');

    // 4. Create missing roles if needed
    const requiredRoles = ['Teacher', 'Student', 'Parent', 'Staff'];
    
    for (const roleName of requiredRoles) {
      const existingRole = await prisma.role.findFirst({
        where: { name: roleName }
      });
      
      if (!existingRole) {
        await prisma.role.create({
          data: {
            name: roleName,
            description: `${roleName} role`
          }
        });
        console.log(`✅ Created ${roleName} role`);
      }
    }

    // 5. Check user role assignments
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    console.log('\nUser role assignments:');
    users.forEach(user => {
      console.log(`- ${user.email}: ${user.userRoles.map(ur => ur.role.name).join(', ')}`);
    });

    console.log('\n✅ Role system fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing role system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRoleSystem();