const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSuperAdmin() {
  try {
    const superAdmin = await prisma.user.findFirst({
      where: { email: 'superadmin@system.com' },
      include: { 
        tenant: true, 
        userRoles: { 
          include: { 
            role: true 
          } 
        } 
      }
    });

    if (superAdmin) {
      console.log('🎉 Super Admin Details:');
      console.log('📧 Email:', superAdmin.email);
      console.log('👤 Name:', superAdmin.firstName, superAdmin.lastName);
      console.log('🏢 Tenant:', superAdmin.tenant.name);
      console.log('🔑 Roles:', superAdmin.userRoles.map(ur => ur.role.name).join(', '));
      console.log('📊 Status:', superAdmin.status);
      console.log('🆔 User ID:', superAdmin.id);
    } else {
      console.log('❌ Super Admin not found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperAdmin();
