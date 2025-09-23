const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function testClassCreation() {
  try {
    console.log('🧪 Testing Class Creation API...');

    // First, get a valid tenant and user for testing
    const tenant = await prisma.tenant.findFirst({
      where: { status: 'ACTIVE' }
    });

    if (!tenant) {
      throw new Error('No active tenant found for testing');
    }

    const user = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        status: 'ACTIVE'
      }
    });

    if (!user) {
      throw new Error('No active user found for testing');
    }

    console.log(`📍 Using tenant: ${tenant.name} (${tenant.id})`);
    console.log(`👤 Using user: ${user.firstName} ${user.lastName} (${user.id})`);

    // Test data for class creation
    const classData = {
      className: 'Test Class A',
      classCode: 'TCA',
      capacity: 30,
      description: 'Test class for API validation'
    };

    console.log('📝 Class data to send:', classData);

    // Create a simple JWT token for testing (this is a simplified approach)
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: tenant.id,
        email: user.email
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    console.log('🔑 Generated test token');

    // Make API call to create class
    const response = await fetch('http://localhost:5000/api/academic/classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(classData)
    });

    const responseData = await response.json();

    console.log('📡 API Response Status:', response.status);
    console.log('📡 API Response Data:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('✅ Class created successfully!');

      // Clean up: delete the test class
      if (responseData.success && responseData.data && responseData.data.id) {
        await prisma.class.delete({
          where: { id: responseData.data.id }
        });
        console.log('🧹 Test class cleaned up');
      }
    } else {
      console.log('❌ Class creation failed');

      // Let's check what's in the database to understand the schema
      console.log('\n📊 Current classes in database:');
      const existingClasses = await prisma.class.findMany({
        where: { tenantId: tenant.id },
        take: 3
      });
      console.log('Existing classes:', JSON.stringify(existingClasses, null, 2));

      // Let's also check the schema
      console.log('\n🏗️ Database Schema Information:');
      const result = await prisma.$queryRaw`PRAGMA table_info(Class)`;
      console.log('Class table schema:', result);
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error);

    // Additional debugging information
    if (error.message.includes('Unknown argument')) {
      console.log('\n🔍 Debugging schema mismatch...');

      try {
        // Try to get schema info
        const result = await prisma.$queryRaw`PRAGMA table_info(Class)`;
        console.log('Actual Class table columns:', result);
      } catch (schemaError) {
        console.log('Could not get schema info:', schemaError.message);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testClassCreation();
