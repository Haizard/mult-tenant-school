const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const TEST_CREDENTIALS = {
  email: 'admin@school.com',
  password: 'password123'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Server Health Check
async function testServerHealth() {
  log('blue', '\n=== SERVER HEALTH CHECK ===');

  try {
    const response = await axios.get('http://localhost:5000/health');
    log('green', '✅ Server is running');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    log('red', '❌ Server is not responding');
    console.log('Error:', error.message);
    return false;
  }
}

// Test 2: Login and Get Token
async function testLogin() {
  log('blue', '\n=== LOGIN TEST ===');

  try {
    console.log(`Attempting login with: ${TEST_CREDENTIALS.email}`);

    const response = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CREDENTIALS);

    if (response.data.success && response.data.token) {
      log('green', '✅ Login successful');
      console.log('User:', response.data.user?.email);
      console.log('Token length:', response.data.token.length);

      // Decode token (without verification)
      try {
        const decoded = jwt.decode(response.data.token);
        console.log('Token payload:', {
          userId: decoded.userId,
          exp: decoded.exp ? new Date(decoded.exp * 1000).toLocaleString() : 'No expiration'
        });
      } catch (e) {
        console.log('Could not decode token');
      }

      return response.data.token;
    } else {
      log('red', '❌ Login failed - no token received');
      return null;
    }
  } catch (error) {
    log('red', '❌ Login failed');
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

// Test 3: Test API Endpoints with Token
async function testAPIEndpoints(token) {
  log('blue', '\n=== API ENDPOINTS TEST ===');

  if (!token) {
    log('red', '❌ No token available for testing');
    return;
  }

  const endpoints = [
    { path: '/auth/me', name: 'User Profile' },
    { path: '/academic/subjects', name: 'Subjects' },
    { path: '/examinations', name: 'Examinations' },
    { path: '/academic/subjects/test', name: 'Subjects Test' }
  ];

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${endpoint.name} (${endpoint.path})...`);

      const response = await axios.get(`${API_BASE_URL}${endpoint.path}`, { headers });

      if (response.status === 200) {
        log('green', `✅ ${endpoint.name} - Success`);
        console.log('Response:', {
          success: response.data.success,
          dataType: Array.isArray(response.data.data) ? 'array' : typeof response.data.data,
          dataLength: Array.isArray(response.data.data) ? response.data.data.length : 'N/A'
        });
      } else {
        log('yellow', `⚠️ ${endpoint.name} - Unexpected status: ${response.status}`);
      }
    } catch (error) {
      log('red', `❌ ${endpoint.name} - Failed`);
      console.log('Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
    }
  }
}

// Test 4: Test Without Token
async function testWithoutToken() {
  log('blue', '\n=== NO TOKEN TEST ===');

  try {
    const response = await axios.get(`${API_BASE_URL}/academic/subjects`);
    log('yellow', '⚠️ Request succeeded without token (unexpected)');
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      log('green', '✅ Correctly rejected request without token');
      console.log('Error message:', error.response.data.message);
    } else {
      log('red', `❌ Unexpected error: ${error.response?.status || error.message}`);
      console.log('Error data:', error.response?.data);
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 TOKEN AUTHENTICATION TEST SUITE');
  console.log('=====================================');

  try {
    // Test 1: Server Health
    const serverHealthy = await testServerHealth();
    if (!serverHealthy) {
      log('red', '\n💥 Server not running - start your backend first!');
      log('yellow', 'Run: cd backend && npm start');
      return;
    }

    // Test 2: Test without token (should fail)
    await testWithoutToken();

    // Test 3: Login
    const token = await testLogin();

    // Test 4: Test with valid token
    if (token) {
      await testAPIEndpoints(token);
    }

    // Summary
    log('blue', '\n=== SUMMARY ===');
    if (token) {
      log('green', '🎉 Authentication is working!');
      log('cyan', 'Your API should now work with proper authentication');
      log('cyan', 'Make sure your frontend is storing and sending tokens correctly');
    } else {
      log('red', '💥 Authentication failed!');
      log('yellow', 'Check:');
      console.log('  1. Backend server is running');
      console.log('  2. Database has users');
      console.log('  3. Login credentials are correct');
      console.log('  4. JWT_SECRET is set in backend .env');
    }

  } catch (error) {
    log('red', '💥 Test suite failed');
    console.error('Error:', error.message);
  }
}

// Handle errors
process.on('uncaughtException', (error) => {
  log('red', '\n💥 Uncaught Exception:');
  console.error(error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log('red', '\n💥 Unhandled Rejection:');
  console.error(reason);
  process.exit(1);
});

// Run the tests
console.log('Starting token tests...');
console.log(`API Base URL: ${API_BASE_URL}`);
console.log(`Test Credentials: ${TEST_CREDENTIALS.email}`);
console.log('');

runTests();
