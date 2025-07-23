// Authentication Integration Test Script
// This script tests the authentication flow between frontend and backend

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: `testuser${Date.now()}@example.com`, // Use unique email
  password: 'TestPassword123!',
  dateOfBirth: '1995-01-01',
  gender: 'male',
  agreeToTerms: true
};

const testLogin = {
  email: testUser.email, // Use the same email
  password: 'TestPassword123!',
  rememberMe: false
};

// Helper function to make API requests
async function makeRequest(endpoint, method = 'GET', data = null, token = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`\n🔄 ${method} ${endpoint}`);
    console.log('Request data:', data ? JSON.stringify(data, null, 2) : 'None');
    
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log('Response:', JSON.stringify(responseData, null, 2));
    
    return {
      status: response.status,
      data: responseData,
      success: response.ok
    };
  } catch (error) {
    console.error(`❌ Error making request to ${endpoint}:`, error.message);
    return {
      status: 0,
      data: { error: error.message },
      success: false
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  return await makeRequest('/health');
}

async function testAuthHealth() {
  console.log('\n🔐 Testing Auth Routes Health...');
  return await makeRequest('/auth/health');
}

async function testUserRegistration() {
  console.log('\n📝 Testing User Registration...');
  return await makeRequest('/auth/register', 'POST', testUser);
}

async function testUserLogin() {
  console.log('\n🔑 Testing User Login...');
  return await makeRequest('/auth/login', 'POST', testLogin);
}

async function testProtectedRoute(token) {
  console.log('\n🛡️ Testing Protected Route (Profile)...');
  return await makeRequest('/auth/profile', 'GET', null, token);
}

async function testTokenRefresh(refreshToken) {
  console.log('\n🔄 Testing Token Refresh...');
  return await makeRequest('/auth/refresh', 'POST', { refreshToken });
}

async function testLogout(token) {
  console.log('\n🚪 Testing Logout...');
  return await makeRequest('/auth/logout', 'POST', null, token);
}

// Main test runner
async function runAuthenticationTests() {
  console.log('🚀 Starting Authentication Integration Tests');
  console.log('='.repeat(50));

  let accessToken = null;
  let refreshToken = null;

  try {
    // 1. Health checks
    await testHealthCheck();
    await testAuthHealth();

    // 2. User registration
    const registerResult = await testUserRegistration();
    if (registerResult.success && registerResult.data.data) {
      accessToken = registerResult.data.data.token;
      refreshToken = registerResult.data.data.refreshToken;
      console.log('✅ Registration successful - tokens received');
    } else {
      console.log('ℹ️ Registration failed (user might already exist) - proceeding with login');
    }

    // 3. User login (if registration failed or to test login flow)
    if (!accessToken) {
      const loginResult = await testUserLogin();
      if (loginResult.success && loginResult.data.data) {
        accessToken = loginResult.data.data.token;
        refreshToken = loginResult.data.data.refreshToken;
        console.log('✅ Login successful - tokens received');
      } else {
        console.error('❌ Login failed - cannot continue with protected route tests');
        return;
      }
    }

    // 4. Test protected route
    if (accessToken) {
      await testProtectedRoute(accessToken);
    }

    // 5. Test token refresh
    if (refreshToken) {
      const refreshResult = await testTokenRefresh(refreshToken);
      if (refreshResult.success && refreshResult.data.data) {
        accessToken = refreshResult.data.data.token;
        console.log('✅ Token refresh successful');
      }
    }

    // 6. Test logout
    if (accessToken) {
      await testLogout(accessToken);
    }

    console.log('\n🎉 Authentication tests completed!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Run the tests
runAuthenticationTests();
