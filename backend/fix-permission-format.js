const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPermissionFormat() {
  try {
    console.log('🔧 Fixing permission format from dots to colons...');

    // Get all permissions with dot format
    const permissions = await prisma.permission.findMany();
    
    console.log(`Found ${permissions.length} permissions to check`);

    for (const permission of permissions) {
      if (permission.name.includes('.')) {
        const newName = permission.name.replace('.', ':');
        
        console.log(`Updating: ${permission.name} → ${newName}`);
        
        await prisma.permission.update({
          where: { id: permission.id },
          data: { name: newName }
        });
      }
    }

    console.log('✅ Permission format fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing permission format:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPermissionFormat();