// Test backend connection
const API_BASE = 'http://localhost:5000';

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...');
  
  try {
    // Test health endpoint
    console.log('📡 Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Backend is running!');
      console.log('📊 Health data:', healthData);
    } else {
      console.log('❌ Health check failed:', healthResponse.status, healthResponse.statusText);
    }
  } catch (error) {
    console.log('💥 Connection failed:', error.message);
    console.log('🔧 Make sure the backend server is running on port 5000');
    console.log('🚀 Run: cd backend && npm run dev');
  }
  
  try {
    // Test API base endpoint
    console.log('📡 Testing API base endpoint...');
    const apiResponse = await fetch(`${API_BASE}/api`);
    
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log('✅ API endpoint is accessible!');
      console.log('📊 API data:', apiData);
    } else {
      console.log('❌ API endpoint failed:', apiResponse.status, apiResponse.statusText);
    }
  } catch (error) {
    console.log('💥 API connection failed:', error.message);
  }
}

testBackendConnection();