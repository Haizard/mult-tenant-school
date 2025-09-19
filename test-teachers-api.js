// Test teachers API endpoint with authentication
const API_BASE = 'http://localhost:5000/api';

async function testTeachersAPI() {
  try {
    console.log('🧪 Testing teachers API endpoint...');
    
    // First login to get token
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'superadmin@system.com', 
        password: 'superadmin123' 
      }),
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok || !loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }

    console.log('✅ Login successful!');
    console.log('🔑 User permissions:', loginData.data.user.permissions?.length || 'No permissions array');
    
    const token = loginData.data.token;
    
    // Test teachers endpoint
    console.log('\n🧪 Testing /api/teachers with token...');
    
    const teachersResponse = await fetch(`${API_BASE}/teachers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const teachersData = await teachersResponse.json();
    
    if (teachersResponse.ok) {
      console.log('✅ Teachers API successful!');
      console.log('📊 Response:', teachersData);
    } else {
      console.log('❌ Teachers API failed:', teachersData.message);
      console.log('🔍 Required permissions:', teachersData.required);
      console.log('👤 User permissions:', teachersData.userPermissions);
    }
    
  } catch (error) {
    console.log('💥 Network error:', error.message);
  }
}

// Run the test
testTeachersAPI().catch(console.error);
