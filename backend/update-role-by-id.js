const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateRoleById() {
  try {
    console.log('🔧 Updating School Administrator role to Tenant Admin by ID...');

    // Update the role by ID (from the previous check: cmfrajl300003mfi0m65y2bhp)
    const updatedRole = await prisma.role.update({
      where: { id: 'cmfrajl300003mfi0m65y2bhp' },
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

updateRoleById();