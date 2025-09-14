// Simple authentication test script
const API_BASE = 'http://localhost:5000/api';

async function testLogin(email, password) {
  try {
    console.log(`\n🧪 Testing login with: ${email}`);
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Login successful!');
      console.log('👤 User:', data.data.user.firstName, data.data.user.lastName);
      console.log('🏢 Tenant:', data.data.user.tenant.name);
      console.log('🔑 Roles:', data.data.user.roles.map(r => r.name).join(', '));
      console.log('🎫 Token preview:', data.data.token.substring(0, 50) + '...');
      return { success: true, data: data.data };
    } else {
      console.log('❌ Login failed:', data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.log('💥 Network error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testStudentsAPI(token) {
  try {
    console.log('\n🧪 Testing /api/students with token...');
    
    const response = await fetch(`${API_BASE}/students`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Students API successful!');
      console.log('📊 Response:', data);
      return { success: true, data };
    } else {
      console.log('❌ Students API failed:', data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.log('💥 Network error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication Tests\n');
  console.log('=' .repeat(50));
  
  const credentials = [
    { email: 'superadmin@system.com', password: 'superadmin123' },
    { email: 'admin@schoolsystem.com', password: 'admin123' },
    { email: 'admin@school.com', password: 'admin123' },
    { email: 'teacher1@schoolsystem.com', password: 'teacher123' },
    { email: 'student1@schoolsystem.com', password: 'student123' },
  ];

  for (const cred of credentials) {
    const result = await testLogin(cred.email, cred.password);
    
    if (result.success) {
      // Test the API with this token
      await testStudentsAPI(result.data.token);
      console.log('\n✨ SUCCESS! Use these credentials in the browser:');
      console.log(`   Email: ${cred.email}`);
      console.log(`   Password: ${cred.password}`);
      break;
    }
    
    // Wait a bit between attempts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Tests completed');
}

// Run the tests
runTests().catch(console.error);