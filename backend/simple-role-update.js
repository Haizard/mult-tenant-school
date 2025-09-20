const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simpleRoleUpdate() {
  try {
    console.log('🔧 Simply updating School Administrator role name to Tenant Admin...');

    // Update the existing School Administrator role to Tenant Admin
    const updatedRole = await prisma.role.update({
      where: { name: 'School Administrator' },
      data: { 
        name: 'Tenant Admin',
        description: 'Administrator of a specific school tenant'
      }
    });

    console.log('✅ Role updated successfully:', updatedRole.name);
    
  } catch (error) {
    console.error('❌ Error updating role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleRoleUpdate();