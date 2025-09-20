const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('Starting user seeding...');

    // Create or get default tenant
    let tenant = await prisma.tenant.findFirst({
      where: { name: 'Default School' }
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'Default School',
          domain: 'default.school.com',
          email: 'admin@default.school.com',
          phone: '+1234567890',
          address: '123 School Street'
        }
      });
      console.log('Created default tenant:', tenant.name);
    }

    // Create roles
    const systemAdminRole = await prisma.role.upsert({
      where: { 
        tenantId_name: {
          tenantId: tenant.id,
          name: 'System Administrator'
        }
      },
      update: {},
      create: {
        name: 'System Administrator',
        description: 'Full system access',
        tenantId: tenant.id
      }
    });

    const schoolAdminRole = await prisma.role.upsert({
      where: { 
        tenantId_name: {
          tenantId: tenant.id,
          name: 'School Administrator'
        }
      },
      update: {},
      create: {
        name: 'School Administrator',
        description: 'School management access',
        tenantId: tenant.id
      }
    });

    console.log('Created roles');

    // Hash passwords
    const systemAdminPassword = await bcrypt.hash('admin123', 12);
    const schoolAdminPassword = await bcrypt.hash('school123', 12);

    // Create System Administrator
    const systemAdmin = await prisma.user.upsert({
      where: { 
        tenantId_email: {
          tenantId: tenant.id,
          email: 'sysadmin@school.com'
        }
      },
      update: {},
      create: {
        email: 'sysadmin@school.com',
        password: systemAdminPassword,
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+1234567890',
        address: '123 Admin Street',
        tenantId: tenant.id,
        status: 'ACTIVE'
      }
    });

    // Create School Administrator
    const schoolAdmin = await prisma.user.upsert({
      where: { 
        tenantId_email: {
          tenantId: tenant.id,
          email: 'admin@school.com'
        }
      },
      update: {},
      create: {
        email: 'admin@school.com',
        password: schoolAdminPassword,
        firstName: 'School',
        lastName: 'Administrator',
        phone: '+1234567891',
        address: '123 School Street',
        tenantId: tenant.id,
        status: 'ACTIVE'
      }
    });

    // Assign roles
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: systemAdmin.id,
          roleId: systemAdminRole.id
        }
      },
      update: {},
      create: {
        userId: systemAdmin.id,
        roleId: systemAdminRole.id,
        tenantId: tenant.id
      }
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: schoolAdmin.id,
          roleId: schoolAdminRole.id
        }
      },
      update: {},
      create: {
        userId: schoolAdmin.id,
        roleId: schoolAdminRole.id,
        tenantId: tenant.id
      }
    });

    console.log('✅ User seeding completed successfully!');
    console.log('\n📋 Created accounts:');
    console.log('System Administrator:');
    console.log('  Email: sysadmin@school.com');
    console.log('  Password: admin123');
    console.log('\nSchool Administrator:');
    console.log('  Email: admin@school.com');
    console.log('  Password: school123');
    console.log('\n⚠️  Please change these passwords after first login!');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();