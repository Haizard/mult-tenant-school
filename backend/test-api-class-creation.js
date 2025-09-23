const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function testAPIClassCreation() {
  try {
    console.log('🧪 Testing API Class Creation...\n');

    // Step 1: Get test data
    console.log('1️⃣ Getting test data...');

    const tenant = await prisma.tenant.findFirst({
      where: { status: 'ACTIVE' }
    });

    if (!tenant) {
      throw new Error('No active tenant found');
    }

    const user = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        status: 'ACTIVE'
      }
    });

    if (!user) {
      throw new Error('No active user found');
    }

    const academicYear = await prisma.academicYear.findFirst({
      where: { tenantId: tenant.id }
    });

    console.log(`✅ Found tenant: ${tenant.name} (${tenant.id})`);
    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.id})`);
    console.log(`✅ Found academic year: ${academicYear?.yearName || 'None'} (${academicYear?.id || 'N/A'})`);

    // Step 2: Create JWT token
    console.log('\n2️⃣ Creating JWT token...');

    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: tenant.id,
        email: user.email
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    console.log('✅ JWT token created');

    // Step 3: Test API class creation
    console.log('\n3️⃣ Testing API class creation...');

    const classData = {
      className: `API Test Class ${Date.now()}`,
      classCode: `API${Date.now().toString().slice(-4)}`,
      academicLevel: 'O_LEVEL',
      academicYearId: academicYear?.id || null,
      teacherId: user.id,
      capacity: 30,
      description: 'Test class created via API with new fields'
    };

    console.log('📝 Class data to send:', JSON.stringify(classData, null, 2));

    const response = await fetch('http://localhost:5000/api/academic/classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(classData)
    });

    const result = await response.json();

    console.log(`📡 API Response Status: ${response.status}`);
    console.log('📡 API Response Data:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ API class creation successful!');
      console.log(`   Class Name: ${result.data.className}`);
      console.log(`   Class Code: ${result.data.classCode}`);
      console.log(`   Academic Level: ${result.data.academicLevel || 'Not set'}`);
      console.log(`   Teacher ID: ${result.data.teacherId || 'Not set'}`);
      console.log(`   Capacity: ${result.data.capacity}`);
      console.log(`   Current Enrollment: ${result.data.currentEnrollment || 0}`);

      // Clean up API created class if successful
      if (result.success && result.data && result.data.id) {
        await prisma.class.delete({ where: { id: result.data.id } });
        console.log('🧹 API test class cleaned up');
      }
    } else {
      console.log('\n❌ API class creation failed');
      console.log('Error details:', result);

      if (response.status === 500) {
        console.log('\n💡 Troubleshooting:');
        console.log('1. Make sure your backend server is running on http://localhost:5000');
        console.log('2. Check if the Prisma client has been regenerated');
        console.log('3. Verify the database schema includes the new fields');
      }
    }

  } catch (error) {
    console.error('\n💥 API test failed:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Backend server is not running!');
      console.log('Please start your backend server with: npm run dev (in backend directory)');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
console.log('🚀 Starting API Class Creation Test...');
testAPIClassCreation().catch(console.error);
