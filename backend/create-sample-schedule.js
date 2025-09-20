const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleSchedule() {
  try {
    console.log('Creating sample schedule...');
    
    // Get the first tenant
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      console.log('No tenant found. Please create a tenant first.');
      return;
    }
    
    // Get the first user from this tenant
    const user = await prisma.user.findFirst({
      where: { tenantId: tenant.id }
    });
    if (!user) {
      console.log('No user found for tenant. Please create a user first.');
      return;
    }
    
    // Create a sample schedule
    const schedule = await prisma.schedule.create({
      data: {
        title: 'Mathematics Class',
        type: 'CLASS',
        startTime: new Date('2024-01-22T09:00:00Z'),
        endTime: new Date('2024-01-22T10:00:00Z'),
        date: new Date('2024-01-22'),
        location: 'Room 101',
        description: 'Basic Mathematics lesson',
        status: 'ACTIVE',
        tenantId: tenant.id,
        createdBy: user.id,
        updatedBy: user.id
      }
    });
    
    console.log('Sample schedule created:', {
      id: schedule.id,
      title: schedule.title,
      type: schedule.type,
      date: schedule.date,
      tenantId: schedule.tenantId
    });
    
  } catch (error) {
    console.error('Error creating sample schedule:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleSchedule();