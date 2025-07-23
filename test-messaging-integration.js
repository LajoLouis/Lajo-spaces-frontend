// Messaging System Integration Test Script
// This script tests the messaging functionality between frontend and backend

const API_BASE_URL = 'http://localhost:5000/api';

// Test users
const testUser1 = {
  email: `testuser1_${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Alice',
  lastName: 'Smith',
  dateOfBirth: '1995-01-01',
  gender: 'female',
  agreeToTerms: true
};

const testUser2 = {
  email: `testuser2_${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Bob',
  lastName: 'Johnson',
  dateOfBirth: '1993-05-15',
  gender: 'male',
  agreeToTerms: true
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
async function registerAndLoginUser(userData) {
  console.log(`\n🔑 Setting up user: ${userData.firstName}...`);
  
  // Register user
  const registerResult = await makeRequest('/auth/register', 'POST', userData);
  if (!registerResult.success) {
    console.log('ℹ️ Registration failed (user might exist), trying login...');
  }
  
  // Login to get token
  const loginResult = await makeRequest('/auth/login', 'POST', {
    email: userData.email,
    password: userData.password,
    rememberMe: false
  });
  
  if (loginResult.success && loginResult.data.data) {
    console.log(`✅ User ${userData.firstName} authenticated successfully`);
    return {
      token: loginResult.data.data.tokens.accessToken,
      userId: loginResult.data.data.user.id
    };
  }
  
  throw new Error(`Failed to authenticate user ${userData.firstName}`);
}

async function testGetConversations(token) {
  console.log('\n📋 Testing Get Conversations...');
  return await makeRequest('/conversations', 'GET', null, token);
}

async function testCreateConversation(token, participantId) {
  console.log('\n💬 Testing Create Conversation...');
  const conversationData = {
    participantIds: [participantId], // Backend expects array, not single string
    conversationType: 'direct' // Backend expects 'conversationType', not 'type'
  };
  return await makeRequest('/conversations', 'POST', conversationData, token);
}

async function testSendMessage(token, conversationId, content) {
  console.log('\n📤 Testing Send Message...');
  const messageData = {
    conversationId: conversationId,
    content: content,
    messageType: 'text'
  };
  return await makeRequest('/messages', 'POST', messageData, token);
}

async function testGetMessages(token, conversationId) {
  console.log('\n📥 Testing Get Messages...');
  return await makeRequest(`/conversations/${conversationId}/messages`, 'GET', null, token);
}

async function testMarkAsRead(token, conversationId) {
  console.log('\n👁️ Testing Mark Messages as Read...');
  return await makeRequest(`/messages/${conversationId}/read`, 'PUT', {}, token);
}

// Main test runner
async function runMessagingTests() {
  console.log('🚀 Starting Messaging System Integration Tests');
  console.log('='.repeat(60));

  let user1Token = null, user1Id = null;
  let user2Token = null, user2Id = null;
  let conversationId = null;

  try {
    // 1. Setup two test users
    const user1Auth = await registerAndLoginUser(testUser1);
    user1Token = user1Auth.token;
    user1Id = user1Auth.userId;

    const user2Auth = await registerAndLoginUser(testUser2);
    user2Token = user2Auth.token;
    user2Id = user2Auth.userId;

    // 2. Test getting conversations (should be empty initially)
    await testGetConversations(user1Token);

    // 3. Test creating conversation between users
    const createConvResult = await testCreateConversation(user1Token, user2Id);
    if (createConvResult.success && createConvResult.data.data) {
      conversationId = createConvResult.data.data.conversation?.id || createConvResult.data.data.conversation?._id;
      console.log('✅ Conversation created successfully, ID:', conversationId);
    }

    // 4. Test sending messages
    if (conversationId) {
      const message1Result = await testSendMessage(user1Token, conversationId, 'Hello Bob! How are you?');
      if (message1Result.success) {
        console.log('✅ Message 1 sent successfully');
      }

      const message2Result = await testSendMessage(user2Token, conversationId, 'Hi Alice! I\'m doing great, thanks for asking!');
      if (message2Result.success) {
        console.log('✅ Message 2 sent successfully');
      }

      const message3Result = await testSendMessage(user1Token, conversationId, 'That\'s wonderful! Are you looking for a roommate?');
      if (message3Result.success) {
        console.log('✅ Message 3 sent successfully');
      }
    }

    // 5. Test getting messages
    if (conversationId) {
      await testGetMessages(user1Token, conversationId);
      await testGetMessages(user2Token, conversationId);
    }

    // 6. Test getting conversations again (should have the new conversation)
    await testGetConversations(user1Token);
    await testGetConversations(user2Token);

    // 7. Test marking messages as read
    if (conversationId) {
      await testMarkAsRead(user2Token, conversationId);
    }

    // 8. Test getting conversations after marking as read
    await testGetConversations(user2Token);

    console.log('\n🎉 Messaging system tests completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Run the tests
runMessagingTests();
