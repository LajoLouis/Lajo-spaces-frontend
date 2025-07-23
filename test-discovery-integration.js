// Discovery & Matching System Integration Test Script
// This script tests the roommate discovery and matching functionality

const API_BASE_URL = 'http://localhost:5000/api';

// Test users with different profiles for matching
const testUser1 = {
  email: `seeker1_${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Emma',
  lastName: 'Wilson',
  dateOfBirth: '1996-03-15',
  gender: 'female',
  agreeToTerms: true
};

const testUser2 = {
  email: `seeker2_${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'James',
  lastName: 'Brown',
  dateOfBirth: '1994-08-22',
  gender: 'male',
  agreeToTerms: true
};

// Profile data for discovery
const user1ProfileData = {
  bio: 'Clean, organized professional looking for a like-minded roommate.',
  occupation: 'Marketing Manager',
  education: 'Bachelor of Business Administration',
  languages: ['English'],
  interests: ['Fitness', 'Reading', 'Cooking', 'Travel'],
  lifestyle: {
    sleepSchedule: 'early-bird',
    cleanliness: 'very-clean',
    socialLevel: 'moderately-social',
    guestsPolicy: 'occasional-guests',
    smoking: 'non-smoker',
    drinking: 'social-drinker',
    pets: 'no-pets',
    workSchedule: 'traditional',
    workFromHome: false
  },
  housingPreferences: {
    housingType: ['apartment'],
    budgetRange: { min: 200000, max: 350000 },
    moveInDate: '2025-09-01',
    leaseDuration: 'long-term',
    preferredAreas: ['Victoria Island', 'Ikoyi'],
    maxCommuteTime: 30,
    transportationMode: ['car']
  },
  roommatePreferences: {
    ageRange: { min: 24, max: 32 },
    genderPreference: 'no-preference',
    lifestyle: {
      cleanliness: ['very-clean', 'moderately-clean'],
      socialLevel: ['moderately-social'],
      sleepSchedule: ['early-bird', 'flexible']
    },
    dealBreakers: {
      smoking: true,
      pets: false,
      parties: true,
      overnight_guests: false
    },
    mustHaves: ['Clean', 'Professional', 'Respectful'],
    niceToHaves: ['Similar interests', 'Good cook']
  }
};

const user2ProfileData = {
  bio: 'Tech professional seeking a clean and quiet living environment.',
  occupation: 'Software Engineer',
  education: 'Bachelor of Computer Science',
  languages: ['English'],
  interests: ['Technology', 'Gaming', 'Music', 'Fitness'],
  lifestyle: {
    sleepSchedule: 'flexible',
    cleanliness: 'moderately-clean',
    socialLevel: 'moderately-social',
    guestsPolicy: 'occasional-guests',
    smoking: 'non-smoker',
    drinking: 'social-drinker',
    pets: 'no-pets',
    workSchedule: 'flexible',
    workFromHome: true
  },
  housingPreferences: {
    housingType: ['apartment', 'house'],
    budgetRange: { min: 180000, max: 320000 },
    moveInDate: '2025-08-15',
    leaseDuration: 'long-term',
    preferredAreas: ['Lekki', 'Victoria Island'],
    maxCommuteTime: 45,
    transportationMode: ['car', 'public-transport']
  },
  roommatePreferences: {
    ageRange: { min: 22, max: 35 },
    genderPreference: 'no-preference',
    lifestyle: {
      cleanliness: ['very-clean', 'moderately-clean'],
      socialLevel: ['moderately-social', 'very-social'],
      sleepSchedule: ['flexible', 'early-bird']
    },
    dealBreakers: {
      smoking: true,
      pets: false,
      parties: false,
      overnight_guests: false
    },
    mustHaves: ['Respectful', 'Professional'],
    niceToHaves: ['Tech-savvy', 'Similar interests']
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
async function registerAndSetupUser(userData, profileData) {
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
    const token = loginResult.data.data.tokens.accessToken;
    const userId = loginResult.data.data.user.id;
    
    // Update profile for discovery
    await makeRequest('/profiles', 'PATCH', profileData, token);
    
    console.log(`✅ User ${userData.firstName} setup completed`);
    return { token, userId };
  }
  
  throw new Error(`Failed to setup user ${userData.firstName}`);
}

async function testGetDiscoveryProfiles(token) {
  console.log('\n🔍 Testing Get Discovery Profiles...');
  return await makeRequest('/discovery/profiles?page=1&limit=10', 'GET', null, token);
}

async function testDiscoveryWithFilters(token) {
  console.log('\n🎯 Testing Discovery with Filters...');
  return await makeRequest('/discovery/profiles?minAge=22&maxAge=35&city=Lagos&minBudget=150000&maxBudget=400000', 'GET', null, token);
}

async function testPerformMatchAction(token, profileId, action) {
  console.log(`\n💖 Testing Match Action: ${action}...`);
  const actionData = {
    profileId: profileId,
    action: action
  };
  return await makeRequest('/discovery/action', 'POST', actionData, token);
}

async function testGetMatches(token) {
  console.log('\n🤝 Testing Get Matches...');
  return await makeRequest('/matches?page=1&limit=10', 'GET', null, token);
}

async function testGetDiscoveryStats(token) {
  console.log('\n📊 Testing Discovery Stats...');
  return await makeRequest('/discovery/stats', 'GET', null, token);
}

// Main test runner
async function runDiscoveryTests() {
  console.log('🚀 Starting Discovery & Matching Integration Tests');
  console.log('='.repeat(60));

  let user1Token = null, user1Id = null;
  let user2Token = null, user2Id = null;

  try {
    // 1. Setup two test users with profiles
    const user1Auth = await registerAndSetupUser(testUser1, user1ProfileData);
    user1Token = user1Auth.token;
    user1Id = user1Auth.userId;

    const user2Auth = await registerAndSetupUser(testUser2, user2ProfileData);
    user2Token = user2Auth.token;
    user2Id = user2Auth.userId;

    // 2. Test discovery profiles (should show other users)
    await testGetDiscoveryProfiles(user1Token);

    // 3. Test discovery with filters
    await testDiscoveryWithFilters(user1Token);

    // 4. Test match actions (like, pass, super like)
    const discoveryResult = await testGetDiscoveryProfiles(user1Token);
    if (discoveryResult.success && discoveryResult.data.data && discoveryResult.data.data.profiles.length > 0) {
      const targetProfile = discoveryResult.data.data.profiles[0];
      const targetProfileId = targetProfile.id || targetProfile._id;
      
      if (targetProfileId) {
        // Test different match actions
        await testPerformMatchAction(user1Token, targetProfileId, 'like');
        await testPerformMatchAction(user2Token, user1Id, 'like'); // Mutual like to create match
      }
    }

    // 5. Test getting matches
    await testGetMatches(user1Token);
    await testGetMatches(user2Token);

    // 6. Test discovery stats
    await testGetDiscoveryStats(user1Token);

    console.log('\n🎉 Discovery & matching tests completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Run the tests
runDiscoveryTests();
