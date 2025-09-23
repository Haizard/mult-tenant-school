const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSimpleClassCreation() {
  try {
    console.log('🧪 Testing Simple Class Creation...\n');

    // Step 1: Get tenant and user data
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

    console.log(`✅ Found tenant: ${tenant.name} (${tenant.id})`);
    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.id})`);

    // Step 2: Test class creation with basic fields only
    console.log('\n2️⃣ Testing class creation with basic fields...');

    const basicClass = await prisma.class.create({
      data: {
        tenantId: tenant.id,
        className: `Basic Test Class ${Date.now()}`,
        classCode: `BTC${Date.now().toString().slice(-4)}`,
        capacity: 30,
        description: 'Basic test class',
        createdBy: user.id,
        updatedBy: user.id
      }
    });

    console.log('✅ Basic class creation successful!');
    console.log(`   Class: ${basicClass.className} (${basicClass.id})`);

    // Step 3: Test class creation with new fields
    console.log('\n3️⃣ Testing class creation with new fields...');

    try {
      const advancedClass = await prisma.class.create({
        data: {
          tenantId: tenant.id,
          className: `Advanced Test Class ${Date.now()}`,
          classCode: `ATC${Date.now().toString().slice(-4)}`,
          academicLevel: 'O_LEVEL',
          teacherId: user.id,
          capacity: 35,
          description: 'Advanced test class with new fields',
          createdBy: user.id,
          updatedBy: user.id
        }
      });

      console.log('✅ Advanced class creation successful!');
      console.log(`   Class: ${advancedClass.className} (${advancedClass.id})`);
      console.log(`   Academic Level: ${advancedClass.academicLevel}`);
      console.log(`   Teacher ID: ${advancedClass.teacherId}`);

      // Clean up advanced class
      await prisma.class.delete({ where: { id: advancedClass.id } });
      console.log('🧹 Advanced test class cleaned up');

    } catch (advancedError) {
      console.log('❌ Advanced class creation failed:', advancedError.message);

      if (advancedError.message.includes('Unknown argument')) {
        console.log('\n🔍 Schema mismatch detected. The Prisma client needs to be regenerated.');
        console.log('💡 Solution: Restart your development environment or regenerate Prisma client');
      }
    }

    // Step 4: Test updating existing class with new fields
    console.log('\n4️⃣ Testing raw SQL update with new fields...');

    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "Class"
        SET
          "academicLevel" = 'A_LEVEL',
          "teacherId" = '${user.id}'
        WHERE "id" = '${basicClass.id}'
      `);

      const updatedClass = await prisma.class.findUnique({
        where: { id: basicClass.id }
      });

      console.log('✅ Raw SQL update successful!');
      console.log(`   Updated Academic Level: ${updatedClass.academicLevel || 'NULL'}`);
      console.log(`   Updated Teacher ID: ${updatedClass.teacherId || 'NULL'}`);

    } catch (sqlError) {
      console.log('❌ Raw SQL update failed:', sqlError.message);
    }

    // Clean up basic class
    await prisma.class.delete({ where: { id: basicClass.id } });
    console.log('🧹 Basic test class cleaned up');

    // Step 5: Test the API endpoint directly
    console.log('\n5️⃣ Testing API endpoint...');

    const jwt = require('jsonwebtoken');
    const fetch = require('node-fetch');

    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: tenant.id,
        email: user.email
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    const classData = {
      className: `API Test Class ${Date.now()}`,
      classCode: `API${Date.now().toString().slice(-4)}`,
      academicLevel: 'O_LEVEL',
      teacherId: user.id,
      capacity: 30,
      description: 'Test class created via API'
    };

    try {
      const response = await fetch('http://localhost:5000/api/academic/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(classData)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ API class creation successful!');
        console.log('📋 API Response:', JSON.stringify(result, null, 2));

        // Clean up API created class if successful
        if (result.success && result.data && result.data.id) {
          await prisma.class.delete({ where: { id: result.data.id } });
          console.log('🧹 API test class cleaned up');
        }
      } else {
        console.log('❌ API class creation failed');
        console.log('📋 Error Response:', JSON.stringify(result, null, 2));
      }

    } catch (apiError) {
      console.log('❌ API test failed:', apiError.message);
      console.log('💡 Make sure your backend server is running on http://localhost:5000');
    }

    console.log('\n🎉 Class Creation Test Completed!');

  } catch (error) {
    console.error('💥 Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
console.log('🚀 Starting Simple Class Creation Test...');
testSimpleClassCreation().catch(console.error);
