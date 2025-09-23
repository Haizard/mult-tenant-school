const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_TOKEN = 'your-test-token-here'; // You'll need to get this from your login

// Test helper function
async function testEndpoint(name, method, url, token = null, data = null) {
  console.log(`\n🧪 Testing ${name}:`);
  console.log(`   ${method.toUpperCase()} ${url}`);

  try {
    const config = {
      method,
      url,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    console.log(`   ✅ Success: ${response.status} ${response.statusText}`);
    console.log(`   📦 Data:`, JSON.stringify(response.data, null, 2));
    return { success: true, data: response.data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.response?.status || 'Network'} ${error.response?.statusText || error.message}`);
    if (error.response?.data) {
      console.log(`   📦 Error Data:`, JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, error: error.message, status: error.response?.status };
  }
}

// Test server health
async function testServerHealth() {
  console.log('\n=== 🏥 SERVER HEALTH TESTS ===');

  await testEndpoint('Server Root', 'GET', `http://localhost:5000/`);
  await testEndpoint('Health Check', 'GET', `http://localhost:5000/health`);
}

// Test authentication endpoints
async function testAuth() {
  console.log('\n=== 🔐 AUTHENTICATION TESTS ===');

  // Test login endpoint
  const loginData = {
    email: 'admin@example.com', // Replace with valid test credentials
    password: 'password123'
  };

  const loginResult = await testEndpoint('Login', 'POST', `${BASE_URL}/auth/login`, null, loginData);

  if (loginResult.success && loginResult.data.token) {
    console.log('\n✅ Login successful, using token for subsequent tests');
    return loginResult.data.token;
  }

  console.log('\n⚠️  Login failed, using TEST_TOKEN for subsequent tests');
  return TEST_TOKEN;
}

// Test examination endpoints (the ones failing with 404)
async function testExaminationEndpoints(token) {
  console.log('\n=== 📋 EXAMINATION ENDPOINT TESTS ===');

  // Test the problematic examinations endpoint
  await testEndpoint('Get Examinations (Root)', 'GET', `${BASE_URL}/examinations`, token);
  await testEndpoint('Get Examinations (With Query)', 'GET', `${BASE_URL}/examinations?`, token);
  await testEndpoint('Get Examinations (Full Path)', 'GET', `${BASE_URL}/examinations/examinations`, token);

  // Test grades endpoint
  await testEndpoint('Get Grades', 'GET', `${BASE_URL}/examinations/grades`, token);

  // Test grading scales
  await testEndpoint('Get Grading Scales', 'GET', `${BASE_URL}/examinations/grading-scales`, token);
}

// Test academic endpoints (the ones failing with 500)
async function testAcademicEndpoints(token) {
  console.log('\n=== 🎓 ACADEMIC ENDPOINT TESTS ===');

  // Test the problematic subjects endpoint
  await testEndpoint('Get Subjects', 'GET', `${BASE_URL}/academic/subjects`, token);
  await testEndpoint('Get Subjects (With Params)', 'GET', `${BASE_URL}/academic/subjects?page=1&limit=10`, token);

  // Test other academic endpoints
  await testEndpoint('Get Courses', 'GET', `${BASE_URL}/academic/courses`, token);
  await testEndpoint('Get Classes', 'GET', `${BASE_URL}/academic/classes`, token);
  await testEndpoint('Get Academic Years', 'GET', `${BASE_URL}/academic/academic-years`, token);
}

// Test without authentication (should fail)
async function testWithoutAuth() {
  console.log('\n=== 🚫 NO AUTHENTICATION TESTS ===');

  await testEndpoint('Subjects Without Auth', 'GET', `${BASE_URL}/academic/subjects`);
  await testEndpoint('Examinations Without Auth', 'GET', `${BASE_URL}/examinations`);
}

// Test with invalid token
async function testWithInvalidAuth() {
  console.log('\n=== 🔒 INVALID AUTHENTICATION TESTS ===');

  const invalidToken = 'invalid-token-12345';
  await testEndpoint('Subjects Invalid Token', 'GET', `${BASE_URL}/academic/subjects`, invalidToken);
  await testEndpoint('Examinations Invalid Token', 'GET', `${BASE_URL}/examinations`, invalidToken);
}

// Database connectivity test
async function testDatabaseConnectivity() {
  console.log('\n=== 💾 DATABASE CONNECTIVITY TESTS ===');

  // Try to hit endpoints that should work if DB is connected
  await testEndpoint('Health Check (DB)', 'GET', `http://localhost:5000/health`);
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting API Endpoint Tests...\n');
  console.log('Base URL:', BASE_URL);
  console.log('Test Token:', TEST_TOKEN ? 'SET' : 'NOT SET');

  try {
    // Test server health first
    await testServerHealth();

    // Test authentication and get token
    const token = await testAuth();

    // Test without authentication (should fail appropriately)
    await testWithoutAuth();

    // Test with invalid authentication
    await testWithInvalidAuth();

    // Test database connectivity
    await testDatabaseConnectivity();

    // Test the problematic endpoints with valid token
    if (token && token !== TEST_TOKEN) {
      await testExaminationEndpoints(token);
      await testAcademicEndpoints(token);
    } else {
      console.log('\n⚠️  Skipping authenticated endpoint tests - no valid token');
    }

    console.log('\n=== 📊 TEST SUMMARY ===');
    console.log('✅ Tests completed. Check results above for issues.');
    console.log('\n💡 TROUBLESHOOTING TIPS:');
    console.log('1. Make sure backend server is running on port 5000');
    console.log('2. Check database connection and schema');
    console.log('3. Verify JWT_SECRET is set in environment variables');
    console.log('4. Ensure test user exists in database');
    console.log('5. Check that routes are properly mounted in server.js');

  } catch (error) {
    console.error('\n💥 Test runner failed:', error.message);
  }
}

// Error handling for the script
process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Check if axios is available
if (!axios) {
  console.error('❌ axios is not available. Please install it with: npm install axios');
  process.exit(1);
}

// Run the tests
console.log('📋 API Endpoint Diagnostic Tool');
console.log('================================');

// You can also run specific test suites by uncommenting:
// testServerHealth();
// testAuth().then(token => testExaminationEndpoints(token));
// testAuth().then(token => testAcademicEndpoints(token));

runAllTests();
