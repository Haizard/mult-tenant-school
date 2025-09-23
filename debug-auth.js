// Authentication Debug Script for Multi-Tenant School System
// Run this in browser console or as a Node.js script to debug auth issues

console.log('🔐 Authentication Debug Tool Starting...');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:3000';

// Check if running in browser or Node.js
const isBrowser = typeof window !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions?.node;

if (isNode) {
  console.log('🖥️  Running in Node.js environment');
  // For Node.js, we'll need to simulate the checks
} else {
  console.log('🌐 Running in Browser environment');
}

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  if (isBrowser) {
    // Browser console styling
    const styles = {
      red: 'color: #ff4444; font-weight: bold;',
      green: 'color: #44ff44; font-weight: bold;',
      yellow: 'color: #ffff44; font-weight: bold;',
      blue: 'color: #4444ff; font-weight: bold;',
      cyan: 'color: #44ffff; font-weight: bold;'
    };
    console.log(`%c${message}`, styles[color] || '');
  } else {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log('blue', title);
  console.log('='.repeat(50));
}

// 1. Check Local Storage for Auth Token
function checkLocalStorageAuth() {
  logSection('📱 LOCAL STORAGE CHECK');

  if (!isBrowser) {
    log('yellow', '⚠️  Cannot check localStorage in Node.js environment');
    return null;
  }

  try {
    const token = localStorage.getItem('auth_token');
    const authToken = localStorage.getItem('authToken');
    const userToken = localStorage.getItem('token');

    log('cyan', 'Checking common token storage keys:');
    console.log('  auth_token:', token ? `Found (${token.length} chars)` : 'Not found');
    console.log('  authToken:', authToken ? `Found (${authToken.length} chars)` : 'Not found');
    console.log('  token:', userToken ? `Found (${userToken.length} chars)` : 'Not found');

    const foundToken = token || authToken || userToken;

    if (foundToken) {
      log('green', '✅ Auth token found in localStorage');
      return foundToken;
    } else {
      log('red', '❌ No auth token found in localStorage');
      return null;
    }
  } catch (error) {
    log('red', `❌ Error checking localStorage: ${error.message}`);
    return null;
  }
}

// 2. Decode JWT Token (without verification)
function decodeJWT(token) {
  logSection('🔍 JWT TOKEN ANALYSIS');

  if (!token) {
    log('red', '❌ No token provided for analysis');
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      log('red', '❌ Invalid JWT format - should have 3 parts');
      return null;
    }

    // Decode header
    const header = JSON.parse(atob(parts[0]));
    console.log('📋 JWT Header:', header);

    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    console.log('📋 JWT Payload:', payload);

    // Check expiration
    if (payload.exp) {
      const expirationDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expirationDate < now;

      console.log('⏰ Token Expiration:', expirationDate.toLocaleString());
      console.log('🕐 Current Time:', now.toLocaleString());

      if (isExpired) {
        log('red', '❌ Token is EXPIRED');
      } else {
        log('green', '✅ Token is still valid');
        const timeLeft = Math.round((expirationDate - now) / (1000 * 60));
        console.log(`⏱️  Time remaining: ${timeLeft} minutes`);
      }
    }

    return { header, payload };
  } catch (error) {
    log('red', `❌ Error decoding JWT: ${error.message}`);
    return null;
  }
}

// 3. Test API Call with Token
async function testAPICall(token, endpoint = '/auth/me') {
  logSection(`🌐 API CALL TEST: ${endpoint}`);

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🎯 Testing URL:', url);

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Using Authorization header');
  } else {
    console.log('⚠️  No token provided - testing without auth');
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    console.log('📡 Response Status:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('📄 Raw Response:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('📦 Parsed Response:', responseData);
    } catch (e) {
      console.log('⚠️  Response is not valid JSON');
      responseData = { error: 'Invalid JSON response', rawResponse: responseText };
    }

    if (response.ok) {
      log('green', '✅ API call successful');
    } else {
      log('red', `❌ API call failed: ${response.status} ${response.statusText}`);
    }

    return { status: response.status, data: responseData };
  } catch (error) {
    log('red', `❌ Network error: ${error.message}`);
    return { error: error.message };
  }
}

// 4. Test Multiple Endpoints
async function testMultipleEndpoints(token) {
  logSection('🎯 MULTIPLE ENDPOINT TESTS');

  const endpoints = [
    '/auth/me',
    '/academic/subjects/test',
    '/academic/subjects',
    '/examinations',
    '/auth/refresh'
  ];

  const results = {};

  for (const endpoint of endpoints) {
    console.log(`\n🔄 Testing ${endpoint}...`);
    const result = await testAPICall(token, endpoint);
    results[endpoint] = result;

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

// 5. Check if User is Logged In (Browser only)
function checkUserSessionState() {
  logSection('👤 USER SESSION STATE');

  if (!isBrowser) {
    log('yellow', '⚠️  Cannot check session state in Node.js environment');
    return null;
  }

  try {
    // Check various session storage methods
    const sessionKeys = [
      'user',
      'currentUser',
      'auth_user',
      'userSession',
      'loggedInUser'
    ];

    console.log('🔍 Checking session storage for user data...');

    for (const key of sessionKeys) {
      const localData = localStorage.getItem(key);
      const sessionData = sessionStorage.getItem(key);

      if (localData) {
        console.log(`📱 localStorage.${key}:`, JSON.parse(localData));
      }
      if (sessionData) {
        console.log(`🗃️  sessionStorage.${key}:`, JSON.parse(sessionData));
      }
    }

    // Check if there are any auth-related items
    const allLocalStorageKeys = Object.keys(localStorage);
    const authKeys = allLocalStorageKeys.filter(key =>
      key.toLowerCase().includes('auth') ||
      key.toLowerCase().includes('token') ||
      key.toLowerCase().includes('user')
    );

    console.log('🗝️  All auth-related localStorage keys:', authKeys);

  } catch (error) {
    log('red', `❌ Error checking session state: ${error.message}`);
  }
}

// 6. Login Test (Browser only)
async function testLogin(email = 'admin@school.com', password = 'password123') {
  logSection('🔐 LOGIN TEST');

  console.log(`🔑 Attempting login with: ${email}`);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    console.log('📡 Login Response Status:', response.status, response.statusText);

    const data = await response.json();
    console.log('📦 Login Response Data:', data);

    if (response.ok && data.token) {
      log('green', '✅ Login successful');

      // Store token if in browser
      if (isBrowser) {
        localStorage.setItem('auth_token', data.token);
        log('green', '✅ Token stored in localStorage');
      }

      return data.token;
    } else {
      log('red', '❌ Login failed');
      return null;
    }
  } catch (error) {
    log('red', `❌ Login error: ${error.message}`);
    return null;
  }
}

// 7. Full Diagnostic
async function runFullDiagnostic() {
  console.log('🚀 Starting Full Authentication Diagnostic...\n');

  // Check current auth state
  const existingToken = checkLocalStorageAuth();
  checkUserSessionState();

  if (existingToken) {
    // Analyze existing token
    decodeJWT(existingToken);

    // Test API calls with existing token
    await testMultipleEndpoints(existingToken);
  } else {
    log('yellow', '⚠️  No existing token found, testing login...');

    // Test login
    const newToken = await testLogin();

    if (newToken) {
      // Test with new token
      await testMultipleEndpoints(newToken);
    }
  }

  // Provide recommendations
  logSection('💡 RECOMMENDATIONS');

  console.log('📋 Based on the diagnostic results:');
  console.log('');
  console.log('1. If no token found:');
  console.log('   - Navigate to login page and log in');
  console.log('   - Check if login API is working');
  console.log('');
  console.log('2. If token exists but API calls fail:');
  console.log('   - Check if token is expired');
  console.log('   - Verify backend server is running on port 5000');
  console.log('   - Check CORS settings');
  console.log('');
  console.log('3. If login fails:');
  console.log('   - Verify credentials are correct');
  console.log('   - Check backend database has users');
  console.log('   - Verify backend auth routes are working');
  console.log('');
  console.log('🔧 Quick fixes to try:');
  console.log('   - Clear localStorage and login again');
  console.log('   - Restart backend server');
  console.log('   - Check browser console for CORS errors');

  log('green', '✅ Diagnostic complete!');
}

// Auto-run if in browser
if (isBrowser) {
  // Export functions to window for manual testing
  window.authDebug = {
    checkLocalStorageAuth,
    decodeJWT,
    testAPICall,
    testMultipleEndpoints,
    checkUserSessionState,
    testLogin,
    runFullDiagnostic
  };

  log('green', '🛠️  Auth debug tools available as window.authDebug');
  log('cyan', '📖 Usage examples:');
  console.log('   window.authDebug.runFullDiagnostic()');
  console.log('   window.authDebug.checkLocalStorageAuth()');
  console.log('   window.authDebug.testLogin("your@email.com", "password")');

  // Auto-run basic checks
  setTimeout(() => {
    log('blue', '🔍 Running basic authentication checks...');
    runFullDiagnostic();
  }, 1000);
} else {
  // Node.js environment - just export functions
  module.exports = {
    checkLocalStorageAuth,
    decodeJWT,
    testAPICall,
    testMultipleEndpoints,
    testLogin,
    runFullDiagnostic
  };

  // Auto-run for Node.js
  runFullDiagnostic();
}
