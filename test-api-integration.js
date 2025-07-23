// Standalone API Integration Test Script
// This script tests all API endpoints without requiring the full frontend application

const API_BASE_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
  email: `apitest${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'API',
  lastName: 'Tester',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  agreeToTerms: true,
};

let authToken = null;
let userId = null;
let profileId = null;
let propertyId = null;
let conversationId = null;

// Helper function to make API requests
async function makeRequest(endpoint, method = 'GET', data = null, isFormData = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {},
  };

  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (data) {
    if (isFormData) {
      options.body = data;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
  }

  try {
    console.log(`\n🔄 ${method} ${endpoint}`);
    if (data && !isFormData) console.log('Request data:', JSON.stringify(data, null, 2));
    
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log('Response:', JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseData.message || 'Request failed'}`);
    }
    
    return responseData;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    throw error;
  }
}

// Test functions
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication API...');
  
  try {
    // Test user registration
    console.log('\n📝 Testing user registration...');
    const registerResponse = await makeRequest('/auth/register', 'POST', testUser);
    
    if (registerResponse.success) {
      authToken = registerResponse.data.tokens.accessToken;
      userId = registerResponse.data.user.id;
      console.log('✅ Registration successful');
    }
    
    // Test user login
    console.log('\n🔑 Testing user login...');
    const loginResponse = await makeRequest('/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password,
      rememberMe: false,
    });
    
    if (loginResponse.success) {
      authToken = loginResponse.data.tokens.accessToken;
      console.log('✅ Login successful');
    }
    
    // Test get current user
    console.log('\n👤 Testing get current user...');
    const userResponse = await makeRequest('/auth/me');
    
    if (userResponse.success) {
      console.log('✅ Get current user successful');
    }
    
    // Test token refresh
    console.log('\n🔄 Testing token refresh...');
    const refreshResponse = await makeRequest('/auth/refresh', 'POST');
    
    if (refreshResponse.success) {
      authToken = refreshResponse.data.accessToken;
      console.log('✅ Token refresh successful');
    }
    
  } catch (error) {
    console.error('❌ Authentication tests failed:', error.message);
    throw error;
  }
}

async function testProfileAPI() {
  console.log('\n👤 Testing Profile API...');
  
  try {
    // Test profile creation
    console.log('\n📝 Testing profile creation...');
    const profileData = {
      bio: 'Test bio for API integration testing',
      occupation: 'Software Tester',
      education: 'Computer Science',
      location: {
        state: 'Lagos',
        city: 'Ikeja',
        address: '123 Test API Street',
      },
    };
    
    const createResponse = await makeRequest('/profiles', 'POST', profileData);
    
    if (createResponse.success) {
      profileId = createResponse.data.id;
      console.log('✅ Profile creation successful');
    }
    
    // Test get profile
    console.log('\n📖 Testing get profile...');
    const getResponse = await makeRequest('/profiles/me');
    
    if (getResponse.success) {
      console.log('✅ Get profile successful');
    }
    
    // Test profile update
    console.log('\n✏️ Testing profile update...');
    const updateData = {
      bio: 'Updated bio for API testing',
      occupation: 'Senior Software Tester',
    };
    
    const updateResponse = await makeRequest(`/profiles/${profileId}`, 'PUT', updateData);
    
    if (updateResponse.success) {
      console.log('✅ Profile update successful');
    }
    
    // Test preferences update
    console.log('\n⚙️ Testing preferences update...');
    const preferences = {
      ageRange: { min: 25, max: 35 },
      genderPreference: 'any',
      smokingPreference: 'no',
      drinkingPreference: 'socially',
      petPreference: 'no',
      lifestylePreferences: ['quiet', 'clean'],
    };
    
    const preferencesResponse = await makeRequest('/profiles/preferences', 'PUT', preferences);
    
    if (preferencesResponse.success) {
      console.log('✅ Preferences update successful');
    }
    
  } catch (error) {
    console.error('❌ Profile tests failed:', error.message);
    throw error;
  }
}

async function testPropertyAPI() {
  console.log('\n🏠 Testing Property API...');
  
  try {
    // Test property creation
    console.log('\n📝 Testing property creation...');
    const propertyData = {
      title: 'API Test Property',
      description: 'A test property created via API integration test',
      propertyType: 'apartment',
      listingType: 'rent',
      location: {
        state: 'Lagos',
        city: 'Lekki',
        address: '456 API Test Avenue',
        coordinates: { lat: 6.5244, lng: 3.3792 },
      },
      pricing: {
        rent: 200000,
        deposit: 400000,
        agentFee: 100000,
        utilityDeposit: 50000,
      },
      details: {
        bedrooms: 2,
        bathrooms: 2,
        totalRooms: 4,
        maximumOccupants: 2,
        furnishingStatus: 'furnished',
      },
      amenities: ['wifi', 'parking', 'security'],
    };
    
    const createResponse = await makeRequest('/properties', 'POST', propertyData);
    
    if (createResponse.success) {
      propertyId = createResponse.data.id;
      console.log('✅ Property creation successful');
    }
    
    // Test get all properties
    console.log('\n📋 Testing get all properties...');
    const getAllResponse = await makeRequest('/properties');
    
    if (getAllResponse.success) {
      console.log(`✅ Get all properties successful (${getAllResponse.data.properties.length} properties)`);
    }
    
    // Test get property by ID
    console.log('\n🔍 Testing get property by ID...');
    const getByIdResponse = await makeRequest(`/properties/${propertyId}`);
    
    if (getByIdResponse.success) {
      console.log('✅ Get property by ID successful');
    }
    
    // Test property search with filters
    console.log('\n🔎 Testing property search...');
    const searchResponse = await makeRequest('/properties?state=Lagos&city=Lekki&minPrice=100000&maxPrice=300000');
    
    if (searchResponse.success) {
      console.log(`✅ Property search successful (${searchResponse.data.properties.length} results)`);
    }
    
    // Test property update
    console.log('\n✏️ Testing property update...');
    const updateData = {
      title: 'Updated API Test Property',
      pricing: {
        rent: 250000,
        deposit: 500000,
      },
    };
    
    const updateResponse = await makeRequest(`/properties/${propertyId}`, 'PUT', updateData);
    
    if (updateResponse.success) {
      console.log('✅ Property update successful');
    }
    
    // Test get user properties
    console.log('\n👤 Testing get user properties...');
    const userPropertiesResponse = await makeRequest('/properties/owner');
    
    if (userPropertiesResponse.success) {
      console.log(`✅ Get user properties successful (${userPropertiesResponse.data.properties.length} properties)`);
    }
    
  } catch (error) {
    console.error('❌ Property tests failed:', error.message);
    throw error;
  }
}

async function testMessagingAPI() {
  console.log('\n💬 Testing Messaging API...');
  
  try {
    // Test conversation creation
    console.log('\n📝 Testing conversation creation...');
    const conversationData = {
      participantIds: [userId],
      conversationType: 'direct',
      title: 'Test Conversation',
    };
    
    const createResponse = await makeRequest('/conversations', 'POST', conversationData);
    
    if (createResponse.success) {
      conversationId = createResponse.data.conversation._id;
      console.log('✅ Conversation creation successful');
    }
    
    // Test get conversations
    console.log('\n📋 Testing get conversations...');
    const getConversationsResponse = await makeRequest('/conversations');
    
    if (getConversationsResponse.success) {
      console.log(`✅ Get conversations successful (${getConversationsResponse.data.conversations.length} conversations)`);
    }
    
    // Test send message
    console.log('\n📤 Testing send message...');
    const messageData = {
      conversationId,
      content: 'Test message from API integration test',
      type: 'text',
    };
    
    const sendMessageResponse = await makeRequest(`/conversations/${conversationId}/messages`, 'POST', messageData);
    
    if (sendMessageResponse.success) {
      console.log('✅ Send message successful');
    }
    
    // Test get messages
    console.log('\n📥 Testing get messages...');
    const getMessagesResponse = await makeRequest(`/conversations/${conversationId}/messages`);
    
    if (getMessagesResponse.success) {
      console.log(`✅ Get messages successful (${getMessagesResponse.data.messages.length} messages)`);
    }
    
  } catch (error) {
    console.error('❌ Messaging tests failed:', error.message);
    throw error;
  }
}

async function testUploadAPI() {
  console.log('\n📁 Testing Upload API...');
  
  try {
    // Test upload guidelines
    console.log('\n📋 Testing upload guidelines...');
    const guidelinesResponse = await makeRequest('/photos/guidelines');
    
    if (guidelinesResponse.success) {
      console.log('✅ Upload guidelines successful');
    }
    
    // Test generate upload URL
    console.log('\n🔗 Testing generate upload URL...');
    const generateUrlData = {
      folder: 'test-api',
      resourceType: 'image',
    };
    
    const generateUrlResponse = await makeRequest('/uploads/generate-url', 'POST', generateUrlData);
    
    if (generateUrlResponse.success) {
      console.log('✅ Generate upload URL successful');
    }
    
  } catch (error) {
    console.error('❌ Upload tests failed:', error.message);
    throw error;
  }
}

async function testErrorHandling() {
  console.log('\n⚠️ Testing Error Handling...');
  
  try {
    // Test 404 error
    console.log('\n🔍 Testing 404 error...');
    try {
      await makeRequest('/properties/non-existent-id');
      console.log('❌ Should have thrown 404 error');
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        console.log('✅ 404 error handling successful');
      } else {
        throw error;
      }
    }
    
    // Test unauthorized error
    console.log('\n🔒 Testing unauthorized error...');
    const originalToken = authToken;
    authToken = 'invalid-token';
    
    try {
      await makeRequest('/profiles/me');
      console.log('❌ Should have thrown unauthorized error');
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        console.log('✅ Unauthorized error handling successful');
      } else {
        throw error;
      }
    } finally {
      authToken = originalToken;
    }
    
    // Test validation error
    console.log('\n✅ Testing validation error...');
    try {
      await makeRequest('/profiles', 'POST', {
        bio: '', // Invalid: empty bio
        occupation: '',
        education: '',
      });
      console.log('❌ Should have thrown validation error');
    } catch (error) {
      if (error.message.includes('400') || error.message.includes('validation')) {
        console.log('✅ Validation error handling successful');
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('❌ Error handling tests failed:', error.message);
    throw error;
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete test property
    if (propertyId) {
      await makeRequest(`/properties/${propertyId}`, 'DELETE');
      console.log('✅ Test property deleted');
    }
    
    // Delete test profile
    if (profileId) {
      await makeRequest(`/profiles/${profileId}`, 'DELETE');
      console.log('✅ Test profile deleted');
    }
    
    // Logout
    await makeRequest('/auth/logout', 'POST');
    console.log('✅ Logout successful');
    
  } catch (error) {
    console.warn('⚠️ Cleanup failed:', error.message);
  }
}

// Main test runner
async function runAPIIntegrationTests() {
  console.log('🚀 Starting API Integration Tests');
  console.log('='.repeat(60));

  try {
    await testAuthentication();
    await testProfileAPI();
    await testPropertyAPI();
    await testMessagingAPI();
    await testUploadAPI();
    await testErrorHandling();
    
    console.log('\n🎉 All API integration tests passed!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n💥 API integration tests failed:', error.message);
    console.log('='.repeat(60));
  } finally {
    await cleanup();
  }
}

// Check if we're in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  global.fetch = fetch;
  runAPIIntegrationTests();
} else {
  // Browser environment
  console.log('🌐 Running API integration tests in browser...');
  runAPIIntegrationTests();
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAPIIntegrationTests };
}
