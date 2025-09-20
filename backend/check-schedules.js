const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSchedules() {
  try {
    console.log('Checking schedules in database...');
    
    const schedules = await prisma.schedule.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log(`Found ${schedules.length} schedules:`);
    schedules.forEach(schedule => {
      console.log(`- ${schedule.title} (${schedule.type}) - Tenant: ${schedule.tenant.name} (${schedule.tenantId})`);
      console.log(`  Date: ${schedule.date}, Time: ${schedule.startTime} - ${schedule.endTime}`);
      console.log(`  Status: ${schedule.status}`);
    });
    
    if (schedules.length === 0) {
      console.log('No schedules found in database. Try creating a schedule first.');
    }
    
  } catch (error) {
    console.error('Error checking schedules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchedules();