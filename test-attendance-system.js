const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Test configuration
const testConfig = {
  // You'll need to replace these with actual values from your system
  tenantId: 'test-tenant-id',
  userId: 'test-user-id',
  studentId: 'test-student-id',
  classId: 'test-class-id',
  // You'll need a valid JWT token for testing
  authToken: 'your-jwt-token-here'
};

// Test data
const sampleAttendanceData = [
  {
    studentId: testConfig.studentId,
    classId: testConfig.classId,
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    period: 'FULL_DAY',
    notes: 'Test attendance record'
  }
];

// Helper function to make API calls
async function apiCall(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BACKEND_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${testConfig.authToken}`,
        'Content-Type': 'application/json',
        'X-Tenant-ID': testConfig.tenantId
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test functions
async function testGetAttendanceRecords() {
  console.log('\n🔍 Testing: Get Attendance Records');
  console.log('='.repeat(50));

  const result = await apiCall('GET', '/api/attendance');

  if (result.success) {
    console.log('✅ SUCCESS: Retrieved attendance records');
    console.log(`📊 Records found: ${result.data.data?.length || 0}`);
    if (result.data.pagination) {
      console.log(`📄 Pagination: Page ${result.data.pagination.page} of ${result.data.pagination.pages}`);
    }
  } else {
    console.log('❌ FAILED: Could not retrieve attendance records');
    console.log(`Error: ${JSON.stringify(result.error, null, 2)}`);
  }

  return result.success;
}

async function testMarkAttendance() {
  console.log('\n✏️ Testing: Mark Attendance');
  console.log('='.repeat(50));

  const result = await apiCall('POST', '/api/attendance', {
    attendanceData: sampleAttendanceData
  });

  if (result.success) {
    console.log('✅ SUCCESS: Attendance marked successfully');
    console.log(`📝 Records created: ${result.data.data?.length || 0}`);
    if (result.data.errors && result.data.errors.length > 0) {
      console.log(`⚠️ Warnings: ${result.data.errors.length} errors occurred`);
    }
    return result.data.data[0]?.id; // Return the ID for further testing
  } else {
    console.log('❌ FAILED: Could not mark attendance');
    console.log(`Error: ${JSON.stringify(result.error, null, 2)}`);
    return null;
  }
}

async function testGetAttendanceStats() {
  console.log('\n📊 Testing: Get Attendance Statistics');
  console.log('='.repeat(50));

  const today = new Date().toISOString().split('T')[0];
  const result = await apiCall('GET', `/api/attendance/stats?date=${today}`);

  if (result.success) {
    console.log('✅ SUCCESS: Retrieved attendance statistics');
    const stats = result.data.data?.stats;
    if (stats) {
      console.log(`👥 Present: ${stats.PRESENT}`);
      console.log(`❌ Absent: ${stats.ABSENT}`);
      console.log(`⏰ Late: ${stats.LATE}`);
      console.log(`📋 Excused: ${stats.EXCUSED}`);
      console.log(`🤒 Sick: ${stats.SICK}`);
      console.log(`📈 Attendance Rate: ${result.data.data.attendanceRate}%`);
    }
  } else {
    console.log('❌ FAILED: Could not retrieve attendance statistics');
    console.log(`Error: ${JSON.stringify(result.error, null, 2)}`);
  }

  return result.success;
}

async function testUpdateAttendance(recordId) {
  if (!recordId) {
    console.log('\n⚠️ Skipping: Update Attendance (no record ID)');
    return false;
  }

  console.log('\n✏️ Testing: Update Attendance');
  console.log('='.repeat(50));

  const result = await apiCall('PUT', `/api/attendance/${recordId}`, {
    status: 'LATE',
    reason: 'Traffic delay',
    notes: 'Updated test record'
  });

  if (result.success) {
    console.log('✅ SUCCESS: Attendance record updated');
    console.log(`📝 Updated status: ${result.data.data?.status}`);
  } else {
    console.log('❌ FAILED: Could not update attendance record');
    console.log(`Error: ${JSON.stringify(result.error, null, 2)}`);
  }

  return result.success;
}

async function testGetStudentAttendanceHistory() {
  console.log('\n📚 Testing: Get Student Attendance History');
  console.log('='.repeat(50));

  const result = await apiCall('GET', `/api/attendance/student/${testConfig.studentId}`);

  if (result.success) {
    console.log('✅ SUCCESS: Retrieved student attendance history');
    console.log(`📊 History records: ${result.data.data?.history?.length || 0}`);
    const stats = result.data.data?.stats;
    if (stats) {
      console.log(`📈 Student attendance rate: ${result.data.data.attendanceRate}%`);
    }
  } else {
    console.log('❌ FAILED: Could not retrieve student attendance history');
    console.log(`Error: ${JSON.stringify(result.error, null, 2)}`);
  }

  return result.success;
}

async function testDeleteAttendance(recordId) {
  if (!recordId) {
    console.log('\n⚠️ Skipping: Delete Attendance (no record ID)');
    return false;
  }

  console.log('\n🗑️ Testing: Delete Attendance');
  console.log('='.repeat(50));

  const result = await apiCall('DELETE', `/api/attendance/${recordId}`);

  if (result.success) {
    console.log('✅ SUCCESS: Attendance record deleted');
  } else {
    console.log('❌ FAILED: Could not delete attendance record');
    console.log(`Error: ${JSON.stringify(result.error, null, 2)}`);
  }

  return result.success;
}

// Main test runner
async function runAllTests() {
  console.log('🧪 ATTENDANCE SYSTEM TEST SUITE');
  console.log('='.repeat(50));
  console.log(`🌐 Backend URL: ${BACKEND_URL}`);
  console.log(`🏢 Tenant ID: ${testConfig.tenantId}`);
  console.log(`📅 Test Date: ${new Date().toISOString()}`);

  // Check configuration
  if (!testConfig.authToken || testConfig.authToken === 'your-jwt-token-here') {
    console.log('\n❌ ERROR: Please configure a valid JWT token in testConfig.authToken');
    console.log('You can get a token by logging into the system and copying it from the browser dev tools.');
    return;
  }

  const results = [];
  let recordId = null;

  try {
    // Test 1: Get attendance records
    results.push(await testGetAttendanceRecords());

    // Test 2: Mark attendance
    recordId = await testMarkAttendance();
    results.push(recordId !== null);

    // Test 3: Get attendance statistics
    results.push(await testGetAttendanceStats());

    // Test 4: Update attendance (if we have a record)
    results.push(await testUpdateAttendance(recordId));

    // Test 5: Get student attendance history
    results.push(await testGetStudentAttendanceHistory());

    // Test 6: Delete attendance (cleanup)
    results.push(await testDeleteAttendance(recordId));

  } catch (error) {
    console.log(`\n💥 UNEXPECTED ERROR: ${error.message}`);
    results.push(false);
  }

  // Test summary
  console.log('\n📋 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));

  const testNames = [
    'Get Attendance Records',
    'Mark Attendance',
    'Get Attendance Statistics',
    'Update Attendance',
    'Get Student History',
    'Delete Attendance'
  ];

  let passedTests = 0;
  results.forEach((passed, index) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${testNames[index]}`);
    if (passed) passedTests++;
  });

  console.log('\n📊 FINAL SCORE');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passedTests}/${results.length} tests`);
  console.log(`📈 Success Rate: ${Math.round((passedTests / results.length) * 100)}%`);

  if (passedTests === results.length) {
    console.log('\n🎉 ALL TESTS PASSED! Attendance system is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the configuration and error messages above.');
  }
}

// Configuration validation
function validateConfig() {
  console.log('\n🔧 CONFIGURATION CHECK');
  console.log('='.repeat(50));

  const requiredFields = ['tenantId', 'userId', 'studentId', 'classId', 'authToken'];
  let isValid = true;

  requiredFields.forEach(field => {
    const value = testConfig[field];
    const hasValue = value && value !== `test-${field}` && value !== 'your-jwt-token-here';
    console.log(`${hasValue ? '✅' : '❌'} ${field}: ${hasValue ? '✓' : 'Not configured'}`);
    if (!hasValue) isValid = false;
  });

  if (!isValid) {
    console.log('\n⚠️ Please update the testConfig object with real values from your system:');
    console.log('1. Get a valid JWT token by logging into the system');
    console.log('2. Find actual tenant, user, student, and class IDs from your database');
    console.log('3. Update the testConfig object at the top of this file');
    return false;
  }

  return true;
}

// Run the tests
if (require.main === module) {
  console.log('Starting attendance system tests...\n');

  if (validateConfig()) {
    runAllTests().catch(error => {
      console.error('\n💥 Test suite crashed:', error);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
}

module.exports = {
  runAllTests,
  testConfig,
  apiCall
};
