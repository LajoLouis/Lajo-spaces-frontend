// File Upload Integration Test Script
// This script tests the complete file upload functionality including Cloudinary integration

const API_BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const testLogin = {
  email: `uploadtest${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Upload',
  lastName: 'Tester',
  dateOfBirth: '1995-01-01',
  gender: 'male',
  agreeToTerms: true
};

// Helper function to make API requests
async function makeRequest(endpoint, method = 'GET', data = null, token = null, isFormData = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {},
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    if (isFormData) {
      options.body = data; // FormData sets its own Content-Type
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

// Create a test image file
function createTestImageFile(name = 'test-image.jpg', size = 1024 * 1024) {
  // Create a simple canvas image
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  
  // Draw a simple test pattern
  ctx.fillStyle = '#4F46E5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Test Image', canvas.width / 2, canvas.height / 2);
  ctx.fillText(new Date().toLocaleString(), canvas.width / 2, canvas.height / 2 + 60);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], name, { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg', 0.8);
  });
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

async function testSingleImageUpload(token) {
  console.log('\n📸 Testing Single Image Upload...');
  
  const testFile = await createTestImageFile('single-test.jpg');
  const formData = new FormData();
  formData.append('image', testFile);
  
  return await makeRequest('/uploads/image', 'POST', formData, token, true);
}

async function testAvatarUpload(token) {
  console.log('\n👤 Testing Avatar Upload...');
  
  const testFile = await createTestImageFile('avatar-test.jpg');
  const formData = new FormData();
  formData.append('avatar', testFile);
  
  return await makeRequest('/uploads/avatar', 'POST', formData, token, true);
}

async function testProfilePhotoUpload(token) {
  console.log('\n📷 Testing Profile Photo Upload...');
  
  const testFile = await createTestImageFile('profile-photo.jpg');
  const formData = new FormData();
  formData.append('photo', testFile);
  
  return await makeRequest('/photos/upload', 'POST', formData, token, true);
}

async function testGetUserPhotos(token) {
  console.log('\n📋 Testing Get User Photos...');
  return await makeRequest('/photos', 'GET', null, token);
}

async function testDeletePhoto(photoId, token) {
  console.log('\n🗑️ Testing Delete Photo...');
  return await makeRequest(`/photos/${photoId}`, 'DELETE', null, token);
}

async function testSetPrimaryPhoto(photoId, token) {
  console.log('\n⭐ Testing Set Primary Photo...');
  return await makeRequest(`/photos/${photoId}/primary`, 'PATCH', {}, token);
}

async function testBulkImageUpload(token) {
  console.log('\n📚 Testing Bulk Image Upload...');
  
  const files = await Promise.all([
    createTestImageFile('bulk-1.jpg'),
    createTestImageFile('bulk-2.jpg'),
    createTestImageFile('bulk-3.jpg')
  ]);
  
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });
  formData.append('folder', 'test-bulk');
  
  return await makeRequest('/uploads/bulk', 'POST', formData, token, true);
}

async function testUploadGuidelines(token) {
  console.log('\n📋 Testing Upload Guidelines...');
  return await makeRequest('/photos/guidelines', 'GET', null, token);
}

async function testGenerateUploadUrl(token) {
  console.log('\n🔗 Testing Generate Upload URL...');
  return await makeRequest('/uploads/generate-url', 'POST', {
    folder: 'test-direct',
    resourceType: 'image'
  }, token);
}

// Main test runner
async function runFileUploadTests() {
  console.log('🚀 Starting File Upload Integration Tests');
  console.log('='.repeat(60));

  let accessToken = null;
  let uploadedPhotoId = null;

  try {
    // 1. Setup authentication
    accessToken = await registerAndLogin();

    // 2. Test upload guidelines
    await testUploadGuidelines(accessToken);

    // 3. Test single image upload
    const singleUploadResult = await testSingleImageUpload(accessToken);
    if (singleUploadResult.success) {
      console.log('✅ Single image upload successful');
    }

    // 4. Test avatar upload
    const avatarUploadResult = await testAvatarUpload(accessToken);
    if (avatarUploadResult.success) {
      console.log('✅ Avatar upload successful');
    }

    // 5. Test profile photo upload
    const profilePhotoResult = await testProfilePhotoUpload(accessToken);
    if (profilePhotoResult.success && profilePhotoResult.data.data) {
      uploadedPhotoId = profilePhotoResult.data.data.photo?.id;
      console.log('✅ Profile photo upload successful, ID:', uploadedPhotoId);
    }

    // 6. Test get user photos
    await testGetUserPhotos(accessToken);

    // 7. Test set primary photo
    if (uploadedPhotoId) {
      const setPrimaryResult = await testSetPrimaryPhoto(uploadedPhotoId, accessToken);
      if (setPrimaryResult.success) {
        console.log('✅ Set primary photo successful');
      }
    }

    // 8. Test bulk image upload
    const bulkUploadResult = await testBulkImageUpload(accessToken);
    if (bulkUploadResult.success) {
      console.log('✅ Bulk image upload successful');
    }

    // 9. Test generate upload URL
    const generateUrlResult = await testGenerateUploadUrl(accessToken);
    if (generateUrlResult.success) {
      console.log('✅ Generate upload URL successful');
    }

    // 10. Test get photos again to see all uploaded photos
    await testGetUserPhotos(accessToken);

    // 11. Test delete photo (optional - comment out to keep test data)
    // if (uploadedPhotoId) {
    //   await testDeletePhoto(uploadedPhotoId, accessToken);
    // }

    console.log('\n🎉 File upload tests completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Check if we're in a browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Browser environment - run tests
  runFileUploadTests();
} else {
  console.log('❌ This test requires a browser environment with Canvas support');
  console.log('Please run this script in a browser console or as part of a web page');
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runFileUploadTests };
}
