const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSchoolAdminRole() {
  try {
    console.log('🔧 Fixing School Administrator role to Tenant Admin...');

    // Find users with School Administrator role
    const schoolAdminUsers = await prisma.userRole.findMany({
      where: {
        role: {
          name: 'School Administrator'
        }
      },
      include: {
        user: true,
        role: true
      }
    });

    console.log(`Found ${schoolAdminUsers.length} users with School Administrator role`);

    // Find Tenant Admin role
    const tenantAdminRole = await prisma.role.findFirst({
      where: { name: 'Tenant Admin' }
    });

    if (!tenantAdminRole) {
      console.error('Tenant Admin role not found!');
      return;
    }

    // Update each user's role
    for (const userRole of schoolAdminUsers) {
      console.log(`Updating user ${userRole.user.email} from School Administrator to Tenant Admin`);
      
      await prisma.userRole.update({
        where: { id: userRole.id },
        data: { roleId: tenantAdminRole.id }
      });
    }

    console.log('✅ All School Administrator users updated to Tenant Admin');

    // Now update the frontend to use Tenant Admin instead of School Administrator
    console.log('✅ Role fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing school admin role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSchoolAdminRole();