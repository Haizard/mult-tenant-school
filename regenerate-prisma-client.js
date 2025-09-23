const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Regenerating Prisma Client...\n');

// Change to the backend directory where schema.prisma is located
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);

console.log(`📂 Changed directory to: ${process.cwd()}`);
console.log(`📋 Looking for schema.prisma at: ${path.join(process.cwd(), 'schema.prisma')}`);

// Step 1: Generate Prisma client
console.log('\n1️⃣ Generating Prisma client...');
exec('npx prisma generate', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error generating Prisma client:', error.message);
    return;
  }

  console.log('✅ Prisma generate completed!');
  if (stdout) {
    console.log('📝 Output:', stdout);
  }
  if (stderr) {
    console.log('⚠️ Warnings:', stderr);
  }

  // Step 2: Push schema to database to ensure sync
  console.log('\n2️⃣ Pushing schema to database...');
  exec('npx prisma db push', (pushError, pushStdout, pushStderr) => {
    if (pushError) {
      console.error('❌ Error pushing schema:', pushError.message);
      return;
    }

    console.log('✅ Database schema synchronized!');
    if (pushStdout) {
      console.log('📝 Output:', pushStdout);
    }
    if (pushStderr) {
      console.log('⚠️ Warnings:', pushStderr);
    }

    // Step 3: Test the updated client
    console.log('\n3️⃣ Testing updated Prisma client...');
    testPrismaClient();
  });
});

async function testPrismaClient() {
  try {
    // Import the newly generated client
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    console.log('🧪 Testing Prisma client with new fields...');

    // Test that we can access the new fields
    const testTenant = await prisma.tenant.findFirst({
      where: { status: 'ACTIVE' }
    });

    if (!testTenant) {
      throw new Error('No active tenant found');
    }

    const testUser = await prisma.user.findFirst({
      where: {
        tenantId: testTenant.id,
        status: 'ACTIVE'
      }
    });

    if (!testUser) {
      throw new Error('No active user found');
    }

    console.log(`✅ Found test data - Tenant: ${testTenant.name}, User: ${testUser.firstName} ${testUser.lastName}`);

    // Test creating a class with the new fields
    const testClassName = `Test Class ${Date.now()}`;

    const testClass = await prisma.class.create({
      data: {
        tenantId: testTenant.id,
        className: testClassName,
        classCode: `TC${Date.now().toString().slice(-4)}`,
        academicLevel: 'O_LEVEL',
        academicYearId: null, // Optional field
        teacherId: testUser.id,
        capacity: 30,
        description: 'Test class for Prisma client verification',
        createdBy: testUser.id,
        updatedBy: testUser.id
      },
      include: {
        tenant: {
          select: { name: true }
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log('✅ Test class creation successful!');
    console.log(`   Class: ${testClass.className} (${testClass.id})`);
    console.log(`   Academic Level: ${testClass.academicLevel}`);
    console.log(`   Teacher: ${testClass.teacher?.firstName} ${testClass.teacher?.lastName}`);
    console.log(`   Tenant: ${testClass.tenant.name}`);

    // Clean up test class
    await prisma.class.delete({
      where: { id: testClass.id }
    });

    console.log('🧹 Test class cleaned up');

    await prisma.$disconnect();

    console.log('\n🎉 Prisma Client Regeneration Completed Successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Restart your backend server');
    console.log('2. Test class creation from the frontend');
    console.log('3. The new fields (academicLevel, academicYearId, teacherId) should now work properly');

  } catch (error) {
    console.error('❌ Prisma client test failed:', error.message);
    console.error('Error details:', error);
  }
}
