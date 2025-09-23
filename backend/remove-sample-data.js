const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeSampleData() {
  try {
    console.log('🗑️ Removing sample data...');

    const tenant = await prisma.tenant.findFirst();
    
    // Remove sample classes I created (Form 1A, Form 2A, Form 5A)
    const sampleClasses = await prisma.class.findMany({
      where: { 
        tenantId: tenant.id,
        classCode: { in: ['F1A', 'F2A', 'F5A'] }
      }
    });

    console.log(`Found ${sampleClasses.length} sample classes to remove`);

    for (const cls of sampleClasses) {
      await prisma.class.delete({
        where: { id: cls.id }
      });
      console.log(`✅ Removed sample class: ${cls.className}`);
    }

    // Check what real data remains
    const remainingClasses = await prisma.class.findMany({
      where: { tenantId: tenant.id }
    });

    console.log(`\n📊 Remaining real classes: ${remainingClasses.length}`);
    remainingClasses.forEach(cls => {
      console.log(`- ${cls.className} (${cls.classCode})`);
    });

    console.log('\n✅ Sample data cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeSampleData();