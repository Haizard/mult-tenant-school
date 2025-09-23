const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndFixTenantData() {
  try {
    console.log('🔍 Checking Tenant and User Data...\n');

    // Step 1: Check tenants
    console.log('1️⃣ Checking tenants...');
    const tenants = await prisma.tenant.findMany();

    console.log(`Found ${tenants.length} tenants:`);
    tenants.forEach((tenant, index) => {
      console.log(`  ${index + 1}. ${tenant.name} (${tenant.id}) - Status: ${tenant.status}`);
    });

    if (tenants.length === 0) {
      console.log('\n❌ No tenants found! Creating a sample tenant...');

      const sampleTenant = await prisma.tenant.create({
        data: {
          name: 'Sample School',
          email: 'admin@sampleschool.com',
          phone: '+255123456789',
          address: '123 School Street, Dar es Salaam',
          city: 'Dar es Salaam',
          region: 'Dar es Salaam',
          country: 'Tanzania',
          postalCode: '12345',
          website: 'https://sampleschool.com',
          status: 'ACTIVE',
          subscriptionType: 'BASIC',
          subscriptionStatus: 'ACTIVE'
        }
      });

      console.log(`✅ Created sample tenant: ${sampleTenant.name} (${sampleTenant.id})`);
      tenants.push(sampleTenant);
    }

    // Step 2: Check active tenants
    const activeTenants = tenants.filter(t => t.status === 'ACTIVE');
    console.log(`\n📊 Active tenants: ${activeTenants.length}`);

    if (activeTenants.length === 0) {
      console.log('\n⚠️ No active tenants found! Activating the first tenant...');
      const firstTenant = tenants[0];

      await prisma.tenant.update({
        where: { id: firstTenant.id },
        data: { status: 'ACTIVE' }
      });

      console.log(`✅ Activated tenant: ${firstTenant.name}`);
      activeTenants.push({ ...firstTenant, status: 'ACTIVE' });
    }

    // Step 3: Check users for each active tenant
    for (const tenant of activeTenants) {
      console.log(`\n2️⃣ Checking users for tenant: ${tenant.name}...`);

      const users = await prisma.user.findMany({
        where: { tenantId: tenant.id }
      });

      console.log(`  Found ${users.length} users in ${tenant.name}:`);
      users.forEach((user, index) => {
        console.log(`    ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Status: ${user.status}`);
      });

      if (users.length === 0) {
        console.log(`\n❌ No users found for ${tenant.name}! Creating a sample admin user...`);

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const sampleUser = await prisma.user.create({
          data: {
            email: 'admin@sampleschool.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            phone: '+255123456789',
            address: '123 Admin Street',
            status: 'ACTIVE',
            tenantId: tenant.id
          }
        });

        console.log(`✅ Created sample admin user: ${sampleUser.firstName} ${sampleUser.lastName} (${sampleUser.email})`);
      }

      // Check active users
      const activeUsers = users.filter(u => u.status === 'ACTIVE');
      console.log(`  📊 Active users: ${activeUsers.length}`);

      if (activeUsers.length === 0) {
        console.log(`\n⚠️ No active users found for ${tenant.name}! Activating the first user...`);
        const firstUser = users[0];

        await prisma.user.update({
          where: { id: firstUser.id },
          data: { status: 'ACTIVE' }
        });

        console.log(`✅ Activated user: ${firstUser.firstName} ${firstUser.lastName}`);
      }
    }

    // Step 4: Check academic years
    console.log(`\n3️⃣ Checking academic years...`);

    for (const tenant of activeTenants) {
      const academicYears = await prisma.academicYear.findMany({
        where: { tenantId: tenant.id }
      });

      console.log(`  Found ${academicYears.length} academic years for ${tenant.name}:`);
      academicYears.forEach((year, index) => {
        console.log(`    ${index + 1}. ${year.yearName} (${year.isCurrent ? 'Current' : 'Not Current'}) - Status: ${year.status}`);
      });

      if (academicYears.length === 0) {
        console.log(`\n❌ No academic years found for ${tenant.name}! Creating sample academic year...`);

        const sampleAcademicYear = await prisma.academicYear.create({
          data: {
            yearName: '2024/2025',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            isCurrent: true,
            status: 'ACTIVE',
            tenantId: tenant.id
          }
        });

        console.log(`✅ Created sample academic year: ${sampleAcademicYear.yearName} for ${tenant.name}`);
      }
    }

    // Step 5: Test class creation
    console.log(`\n4️⃣ Testing class creation...`);

    const testTenant = activeTenants[0];
    const testUser = await prisma.user.findFirst({
      where: {
        tenantId: testTenant.id,
        status: 'ACTIVE'
      }
    });

    const testAcademicYear = await prisma.academicYear.findFirst({
      where: { tenantId: testTenant.id }
    });

    console.log(`Using test data:`);
    console.log(`  Tenant: ${testTenant.name} (${testTenant.id})`);
    console.log(`  User: ${testUser.firstName} ${testUser.lastName} (${testUser.id})`);
    console.log(`  Academic Year: ${testAcademicYear?.yearName || 'None'} (${testAcademicYear?.id || 'N/A'})`);

    const testClassName = `Test Class ${Date.now()}`;

    try {
      const testClass = await prisma.class.create({
        data: {
          tenantId: testTenant.id,
          className: testClassName,
          classCode: `TC${Date.now().toString().slice(-4)}`,
          academicLevel: 'O_LEVEL',
          academicYearId: testAcademicYear?.id || null,
          teacherId: testUser.id,
          capacity: 35,
          description: 'Test class for verification',
          createdBy: testUser.id,
          updatedBy: testUser.id
        }
      });

      console.log(`✅ Test class creation successful!`);
      console.log(`  Class: ${testClass.className} (${testClass.id})`);
      console.log(`  Academic Level: ${testClass.academicLevel}`);
      console.log(`  Academic Year: ${testClass.academicYearId || 'Not set'}`);
      console.log(`  Teacher: ${testClass.teacherId}`);

      // Clean up test class
      await prisma.class.delete({ where: { id: testClass.id } });
      console.log(`🧹 Test class cleaned up`);

    } catch (error) {
      console.error(`❌ Test class creation failed:`, error.message);

      // Check if it's a schema issue
      if (error.message.includes('Unknown argument')) {
        console.log('\n🔍 Schema mismatch detected. Checking table schema...');
        try {
          const tableInfo = await prisma.$queryRaw`PRAGMA table_info(Class)`;
          console.log('Class table columns:');
          tableInfo.forEach(col => {
            console.log(`  - ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : '(NULL)'}`);
          });
        } catch (schemaError) {
          console.log('Could not get schema info:', schemaError.message);
        }
      }
    }

    console.log('\n🎉 Data check and fix completed!');
    console.log('\n📋 Summary:');
    console.log(`✅ Active tenants: ${activeTenants.length}`);
    for (const tenant of activeTenants) {
      const userCount = await prisma.user.count({
        where: {
          tenantId: tenant.id,
          status: 'ACTIVE'
        }
      });
      const yearCount = await prisma.academicYear.count({
        where: { tenantId: tenant.id }
      });
      console.log(`  - ${tenant.name}: ${userCount} active users, ${yearCount} academic years`);
    }

  } catch (error) {
    console.error('💥 Check failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
console.log('🚀 Starting Tenant Data Check and Fix...');
checkAndFixTenantData().catch(console.error);
