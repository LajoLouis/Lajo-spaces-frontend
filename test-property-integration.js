// Property System Integration Test Script
// This script tests the property management functionality between frontend and backend

const API_BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const testLogin = {
  email: `testuser${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  dateOfBirth: '1995-01-01',
  gender: 'male',
  agreeToTerms: true
};

// Test property data (matching backend validation schema)
const testPropertyData = {
  title: 'Beautiful 2-Bedroom Apartment in Victoria Island',
  description: 'A modern, fully furnished 2-bedroom apartment located in the heart of Victoria Island. Perfect for young professionals.',
  propertyType: 'apartment',
  listingType: 'rent',
  bedrooms: 2,
  bathrooms: 2,
  totalRooms: 4, // Required by backend
  floorArea: 120,
  location: {
    address: '123 Ahmadu Bello Way',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    area: 'Victoria Island'
  },
  pricing: {
    rentPerMonth: 250000, // Backend expects 'rentPerMonth', not 'rent'
    securityDeposit: 500000,
    electricityIncluded: false,
    waterIncluded: false,
    internetIncluded: false
  },
  furnishing: {
    furnished: true
  },
  amenities: {
    // Backend expects object with boolean properties, not array
    airConditioning: true,
    wifi: true,
    parking: true,
    security: true,
    generator: true
  },
  availableFrom: '2025-08-01', // Required at root level
  leaseDuration: 'long-term',
  rules: {
    smokingAllowed: false,
    petsAllowed: false,
    partiesAllowed: false,
    guestsAllowed: true,
    maximumOccupants: 2 // Required by backend
  }
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
    if (data) console.log('Request data:', JSON.stringify(data, null, 2));
    
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
async function registerAndLogin() {
  console.log('\n🔑 Setting up test user...');
  
  // Register user
  const registerResult = await makeRequest('/auth/register', 'POST', testLogin);
  if (!registerResult.success) {
    console.log('ℹ️ Registration failed (user might exist), trying login...');
  }
  
  // Login to get token
  const loginResult = await makeRequest('/auth/login', 'POST', {
    email: testLogin.email,
    password: testLogin.password,
    rememberMe: false
  });
  
  if (loginResult.success && loginResult.data.data) {
    console.log('✅ User authenticated successfully');
    return loginResult.data.data.tokens.accessToken;
  }
  
  throw new Error('Failed to authenticate user');
}

async function testGetProperties(token) {
  console.log('\n📋 Testing Get Properties...');
  return await makeRequest('/properties?page=1&limit=10', 'GET', null, token);
}

async function testCreateProperty(token) {
  console.log('\n📝 Testing Create Property...');
  return await makeRequest('/properties', 'POST', testPropertyData, token);
}

async function testGetProperty(propertyId, token) {
  console.log('\n🏠 Testing Get Single Property...');
  return await makeRequest(`/properties/${propertyId}`, 'GET', null, token);
}

async function testUpdateProperty(propertyId, token) {
  console.log('\n✏️ Testing Update Property...');
  const updateData = {
    title: 'Updated: Beautiful 2-Bedroom Apartment in Victoria Island',
    pricing: {
      rentPerMonth: 280000, // Backend expects 'rentPerMonth'
      securityDeposit: 560000,
      electricityIncluded: true
    }
  };
  return await makeRequest(`/properties/${propertyId}`, 'PUT', updateData, token);
}

async function testSearchProperties(token) {
  console.log('\n🔍 Testing Search Properties...');
  // Backend uses POST for search, not GET
  const searchData = {
    query: 'apartment',
    location: { city: 'Lagos' },
    minPrice: 200000,
    maxPrice: 300000,
    page: 1,
    limit: 10
  };
  return await makeRequest('/properties/search', 'POST', searchData, token);
}

async function testGetUserProperties(token) {
  console.log('\n👤 Testing Get User Properties...');
  // Backend uses '/properties/owner', not '/my-properties'
  return await makeRequest('/properties/owner', 'GET', null, token);
}

async function testDeleteProperty(propertyId, token) {
  console.log('\n🗑️ Testing Delete Property...');
  return await makeRequest(`/properties/${propertyId}`, 'DELETE', null, token);
}

// Main test runner
async function runPropertyTests() {
  console.log('🚀 Starting Property System Integration Tests');
  console.log('='.repeat(60));

  let accessToken = null;
  let createdPropertyId = null;

  try {
    // 1. Setup authentication
    accessToken = await registerAndLogin();

    // 2. Test getting properties (should be empty or have existing properties)
    await testGetProperties(accessToken);

    // 3. Test creating property
    const createResult = await testCreateProperty(accessToken);
    if (createResult.success && createResult.data.data) {
      createdPropertyId = createResult.data.data.property?.id || createResult.data.data.property?._id;
      console.log('✅ Property created successfully, ID:', createdPropertyId);
    }

    // 4. Test getting single property
    if (createdPropertyId) {
      await testGetProperty(createdPropertyId, accessToken);
    }

    // 5. Test updating property
    if (createdPropertyId) {
      const updateResult = await testUpdateProperty(createdPropertyId, accessToken);
      if (updateResult.success) {
        console.log('✅ Property updated successfully');
      }
    }

    // 6. Test search functionality
    await testSearchProperties(accessToken);

    // 7. Test getting user's properties
    await testGetUserProperties(accessToken);

    // 8. Test getting updated property
    if (createdPropertyId) {
      await testGetProperty(createdPropertyId, accessToken);
    }

    // 9. Test deleting property (optional - comment out to keep test data)
    // if (createdPropertyId) {
    //   await testDeleteProperty(createdPropertyId, accessToken);
    // }

    console.log('\n🎉 Property system tests completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Run the tests
runPropertyTests();
