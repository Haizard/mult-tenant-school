/**
 * Website API Test Script
 * Tests all website management endpoints
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api/website';
let authToken = '';
let testPageId = '';
let testImageId = '';

// Mock user for testing
const mockUser = {
  id: 'test-user-123',
  tenantId: 'test-tenant-123',
  email: 'test@school.com',
  firstName: 'Test',
  lastName: 'User',
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    console.error(`Error calling ${method} ${endpoint}:`, error.message);
    return { status: 500, data: { error: error.message } };
  }
}

// Test functions
async function testCreatePage() {
  console.log('\n📝 Testing: Create Page');
  const response = await apiCall('POST', '/pages', {
    pageName: 'Home',
    pageSlug: 'home',
    pageType: 'HOME',
    description: 'Home page for the school',
  });

  if (response.status === 201 && response.data.success) {
    testPageId = response.data.data.id;
    console.log('✅ Page created successfully:', testPageId);
    return true;
  } else {
    console.log('❌ Failed to create page:', response.data);
    return false;
  }
}

async function testGetPages() {
  console.log('\n📋 Testing: Get All Pages');
  const response = await apiCall('GET', '/pages');

  if (response.status === 200 && response.data.success) {
    console.log(`✅ Retrieved ${response.data.count} pages`);
    return true;
  } else {
    console.log('❌ Failed to get pages:', response.data);
    return false;
  }
}

async function testGetPage() {
  console.log('\n🔍 Testing: Get Single Page');
  if (!testPageId) {
    console.log('⚠️ Skipping: No page ID available');
    return false;
  }

  const response = await apiCall('GET', `/pages/${testPageId}`);

  if (response.status === 200 && response.data.success) {
    console.log('✅ Page retrieved successfully');
    return true;
  } else {
    console.log('❌ Failed to get page:', response.data);
    return false;
  }
}

async function testUpdatePage() {
  console.log('\n✏️ Testing: Update Page');
  if (!testPageId) {
    console.log('⚠️ Skipping: No page ID available');
    return false;
  }

  const response = await apiCall('PUT', `/pages/${testPageId}`, {
    pageName: 'Home Updated',
    description: 'Updated home page',
  });

  if (response.status === 200 && response.data.success) {
    console.log('✅ Page updated successfully');
    return true;
  } else {
    console.log('❌ Failed to update page:', response.data);
    return false;
  }
}

async function testCreatePageContent() {
  console.log('\n📄 Testing: Create Page Content');
  if (!testPageId) {
    console.log('⚠️ Skipping: No page ID available');
    return false;
  }

  const response = await apiCall('POST', `/content/${testPageId}`, {
    contentType: 'TEXT',
    contentData: {
      title: 'Welcome to Our School',
      body: '<p>Welcome to our school website</p>',
    },
  });

  if (response.status === 201 && response.data.success) {
    console.log('✅ Page content created successfully');
    return true;
  } else {
    console.log('❌ Failed to create page content:', response.data);
    return false;
  }
}

async function testGetPageContent() {
  console.log('\n📖 Testing: Get Page Content');
  if (!testPageId) {
    console.log('⚠️ Skipping: No page ID available');
    return false;
  }

  const response = await apiCall('GET', `/content/${testPageId}`);

  if (response.status === 200 && response.data.success) {
    console.log(`✅ Retrieved ${response.data.data.length} content versions`);
    return true;
  } else {
    console.log('❌ Failed to get page content:', response.data);
    return false;
  }
}

async function testUploadGalleryImage() {
  console.log('\n🖼️ Testing: Upload Gallery Image');
  const response = await apiCall('POST', '/gallery', {
    imageUrl: 'https://example.com/school-building.jpg',
    imageTitle: 'School Building',
    imageDescription: 'Main school building',
    imageAltText: 'School building exterior',
    displayOrder: 1,
  });

  if (response.status === 201 && response.data.success) {
    testImageId = response.data.data.id;
    console.log('✅ Gallery image uploaded successfully:', testImageId);
    return true;
  } else {
    console.log('❌ Failed to upload gallery image:', response.data);
    return false;
  }
}

async function testGetGalleryImages() {
  console.log('\n🎨 Testing: Get Gallery Images');
  const response = await apiCall('GET', '/gallery');

  if (response.status === 200 && response.data.success) {
    console.log(`✅ Retrieved ${response.data.data.length} gallery images`);
    return true;
  } else {
    console.log('❌ Failed to get gallery images:', response.data);
    return false;
  }
}

async function testGetWebsiteSettings() {
  console.log('\n⚙️ Testing: Get Website Settings');
  const response = await apiCall('GET', '/settings');

  if (response.status === 200 && response.data.success) {
    console.log('✅ Website settings retrieved successfully');
    return true;
  } else {
    console.log('❌ Failed to get website settings:', response.data);
    return false;
  }
}

async function testUpdateWebsiteSettings() {
  console.log('\n🎨 Testing: Update Website Settings');
  const response = await apiCall('PUT', '/settings', {
    websiteTitle: 'My School',
    websiteDescription: 'Welcome to our school',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    contactEmail: 'contact@school.com',
    contactPhone: '+1 (555) 000-0000',
  });

  if (response.status === 200 && response.data.success) {
    console.log('✅ Website settings updated successfully');
    return true;
  } else {
    console.log('❌ Failed to update website settings:', response.data);
    return false;
  }
}

async function testPublishPage() {
  console.log('\n🚀 Testing: Publish Page');
  if (!testPageId) {
    console.log('⚠️ Skipping: No page ID available');
    return false;
  }

  const response = await apiCall('POST', `/pages/${testPageId}/publish`, {});

  if (response.status === 200 && response.data.success) {
    console.log('✅ Page published successfully');
    return true;
  } else {
    console.log('❌ Failed to publish page:', response.data);
    return false;
  }
}

async function testTrackPageView() {
  console.log('\n📊 Testing: Track Page View');
  const response = await apiCall('POST', '/analytics/track', {
    pageId: testPageId,
    visitorIp: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    referrer: 'https://google.com',
  });

  if (response.status === 201 && response.data.success) {
    console.log('✅ Page view tracked successfully');
    return true;
  } else {
    console.log('❌ Failed to track page view:', response.data);
    return false;
  }
}

async function testGetAnalytics() {
  console.log('\n📈 Testing: Get Analytics');
  const response = await apiCall('GET', '/analytics');

  if (response.status === 200 && response.data.success) {
    console.log(`✅ Retrieved ${response.data.data.length} analytics records`);
    return true;
  } else {
    console.log('❌ Failed to get analytics:', response.data);
    return false;
  }
}

async function testDeleteGalleryImage() {
  console.log('\n🗑️ Testing: Delete Gallery Image');
  if (!testImageId) {
    console.log('⚠️ Skipping: No image ID available');
    return false;
  }

  const response = await apiCall('DELETE', `/gallery/${testImageId}`);

  if (response.status === 200 && response.data.success) {
    console.log('✅ Gallery image deleted successfully');
    return true;
  } else {
    console.log('❌ Failed to delete gallery image:', response.data);
    return false;
  }
}

async function testDeletePage() {
  console.log('\n🗑️ Testing: Delete Page');
  if (!testPageId) {
    console.log('⚠️ Skipping: No page ID available');
    return false;
  }

  const response = await apiCall('DELETE', `/pages/${testPageId}`);

  if (response.status === 200 && response.data.success) {
    console.log('✅ Page deleted successfully');
    return true;
  } else {
    console.log('❌ Failed to delete page:', response.data);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Website API Tests...\n');
  console.log('Note: This test requires a valid JWT token.');
  console.log('Update the authToken variable with a real token.\n');

  // TODO: Get a real JWT token from your authentication system
  authToken = 'your-jwt-token-here';

  if (authToken === 'your-jwt-token-here') {
    console.log('❌ Please update the authToken variable with a real JWT token');
    return;
  }

  const tests = [
    testCreatePage,
    testGetPages,
    testGetPage,
    testUpdatePage,
    testCreatePageContent,
    testGetPageContent,
    testUploadGalleryImage,
    testGetGalleryImages,
    testGetWebsiteSettings,
    testUpdateWebsiteSettings,
    testPublishPage,
    testTrackPageView,
    testGetAnalytics,
    testDeleteGalleryImage,
    testDeletePage,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) passed++;
      else failed++;
    } catch (error) {
      console.error('Test error:', error);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${tests.length}`);
  console.log('='.repeat(50));
}

// Run tests
runTests().catch(console.error);

