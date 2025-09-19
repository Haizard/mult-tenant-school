// Test student creation with proper authentication
const API_BASE = 'http://localhost:5000/api';

async function testStudentCreation() {
  try {
    console.log('🧪 Testing student creation...');
    
    // First login to get token
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: process.env.TEST_ADMIN_EMAIL || 'superadmin@system.com', 
        password: process.env.TEST_ADMIN_PASSWORD || 'superadmin123' 
      }),
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok || !loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }

    console.log('✅ Login successful!');
    const token = loginData.data.token;

    // Test student creation
    const studentData = {
      firstName: 'Test',
      lastName: 'Student',
      email: 'test.student@example.com',
      studentId: 'STU001',
      dateOfBirth: '2005-01-15',
      gender: 'MALE',
      address: '123 Test Street',
      city: 'Test City',
      region: 'Test Region',
      emergencyContact: 'Test Parent',
      emergencyPhone: '+255123456789'
    };

    console.log('📝 Creating student with data:', studentData);

    const createResponse = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });

    const createData = await createResponse.json();
    
    console.log('📊 Create response status:', createResponse.status);
    console.log('📊 Create response data:', createData);

    if (createResponse.ok && createData.success) {
      console.log('✅ Student created successfully!');
      console.log('👤 Student:', createData.data);
    } else {
      console.log('❌ Student creation failed:', createData.message);
      console.log('🔍 Error details:', createData.error);
    }

  } catch (error) {
    console.log('💥 Network error:', error.message);
  }
}

testStudentCreation();
