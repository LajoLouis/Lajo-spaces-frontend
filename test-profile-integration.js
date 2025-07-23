// Profile Management Integration Test Script
// This script tests the profile management functionality between frontend and backend

const API_BASE_URL = 'http://localhost:5000/api';

// Test user credentials (from previous auth test)
const testLogin = {
  email: `testuser${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  dateOfBirth: '1995-01-01',
  gender: 'male',
  agreeToTerms: true
};

// Test profile data
const testProfileData = {
  bio: 'I am a software developer looking for a clean and quiet roommate.',
  occupation: 'Software Developer',
  education: 'Bachelor of Computer Science',
  languages: ['English', 'Yoruba'],
  interests: ['Technology', 'Reading', 'Gaming', 'Music'],
  hobbies: ['Coding', 'Chess', 'Photography'],
  lifestyle: {
    sleepSchedule: 'early-bird',
    cleanliness: 'very-clean',
    socialLevel: 'moderately-social',
    guestsPolicy: 'occasional-guests',
    smoking: 'non-smoker',
    drinking: 'social-drinker',
    pets: 'no-pets',
    workSchedule: 'traditional',
    workFromHome: true,
    musicPreference: ['Jazz', 'Classical'],
    dietaryRestrictions: ['Vegetarian']
  },
  housingPreferences: {
    housingType: ['apartment', 'house'],
    budgetRange: { min: 150000, max: 300000 },
    moveInDate: '2025-09-01',
    leaseDuration: '12-months',
    preferredAreas: ['Victoria Island', 'Ikoyi', 'Lekki'],
    maxCommuteTime: 45,
    transportationMode: ['car', 'public-transport']
  },
  roommatePreferences: {
    ageRange: { min: 22, max: 35 },
    genderPreference: 'no-preference',
    lifestyle: {
      cleanliness: ['very-clean', 'moderately-clean'],
      socialLevel: ['moderately-social', 'very-social'],
      sleepSchedule: ['early-bird', 'flexible']
    },
    dealBreakers: {
      smoking: true,
      pets: false,
      parties: true,
      overnight_guests: false
    },
    mustHaves: ['Clean', 'Respectful', 'Professional'],
    niceToHaves: ['Similar interests', 'Good cook', 'Friendly']
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

async function testGetProfile(token) {
  console.log('\n📋 Testing Get Profile...');
  return await makeRequest('/profiles', 'GET', null, token);
}

async function testUpdateProfile(token) {
  console.log('\n✏️ Testing Update Profile (Full Update)...');
  return await makeRequest('/profiles', 'PATCH', testProfileData, token);
}

async function testPartialUpdateProfile(token) {
  console.log('\n✏️ Testing Partial Update Profile...');
  const updateData = {
    bio: 'Updated bio: I am a senior software developer with 5 years of experience.',
    occupation: 'Senior Software Developer',
    interests: ['Technology', 'Reading', 'Gaming', 'Music', 'Travel']
  };
  return await makeRequest('/profiles', 'PATCH', updateData, token);
}

async function testProfileCompletion(token) {
  console.log('\n📊 Testing Profile Completion Score...');
  return await makeRequest('/profiles/completion', 'GET', null, token);
}

// Main test runner
async function runProfileTests() {
  console.log('🚀 Starting Profile Management Integration Tests');
  console.log('='.repeat(60));

  let accessToken = null;

  try {
    // 1. Setup authentication
    accessToken = await registerAndLogin();

    // 2. Test getting profile (should be auto-created with defaults)
    await testGetProfile(accessToken);

    // 3. Test updating profile with full data
    const updateResult = await testUpdateProfile(accessToken);
    if (updateResult.success) {
      console.log('✅ Profile updated successfully');
    }

    // 4. Test getting profile again (should have updated data now)
    await testGetProfile(accessToken);

    // 5. Test partial profile update
    const partialUpdateResult = await testPartialUpdateProfile(accessToken);
    if (partialUpdateResult.success) {
      console.log('✅ Profile partially updated successfully');
    }

    // 6. Test profile completion score
    await testProfileCompletion(accessToken);

    // 7. Test getting final profile state
    await testGetProfile(accessToken);

    console.log('\n🎉 Profile management tests completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Run the tests
runProfileTests();
