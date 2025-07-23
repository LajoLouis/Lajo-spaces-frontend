import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';
import { propertyService } from '@/services/property.service';
import { messageService } from '@/services/message.service';
import { uploadService } from '@/services/upload.service';

// Test configuration
const TEST_API_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: `apitest${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'API',
  lastName: 'Tester',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  agreeToTerms: true,
};

let authToken: string;
let userId: string;
let profileId: string;
let propertyId: string;
let conversationId: string;

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Set API base URL for testing
    process.env.VITE_API_URL = TEST_API_URL;
  });

  afterAll(async () => {
    // Cleanup: Delete test user and associated data
    if (authToken) {
      try {
        // Delete test property if created
        if (propertyId) {
          await propertyService.deleteProperty(propertyId);
        }
        
        // Delete test profile if created
        if (profileId) {
          await profileService.deleteProfile(profileId);
        }
        
        // Logout to cleanup session
        await authService.logout();
      } catch (error) {
        console.warn('Cleanup failed:', error);
      }
    }
  });

  describe('Authentication API', () => {
    it('should register a new user', async () => {
      const response = await authService.register(TEST_USER);
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.user).toBeDefined();
      expect(response.data.user.email).toBe(TEST_USER.email);
      expect(response.data.user.firstName).toBe(TEST_USER.firstName);
      expect(response.data.tokens).toBeDefined();
      expect(response.data.tokens.accessToken).toBeDefined();
      
      authToken = response.data.tokens.accessToken;
      userId = response.data.user.id;
    });

    it('should login with valid credentials', async () => {
      const response = await authService.login({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberMe: false,
      });
      
      expect(response.success).toBe(true);
      expect(response.data.user.email).toBe(TEST_USER.email);
      expect(response.data.tokens.accessToken).toBeDefined();
      
      authToken = response.data.tokens.accessToken;
    });

    it('should reject login with invalid credentials', async () => {
      try {
        await authService.login({
          email: TEST_USER.email,
          password: 'wrongpassword',
          rememberMe: false,
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Invalid');
      }
    });

    it('should refresh access token', async () => {
      const response = await authService.refreshToken();
      
      expect(response.success).toBe(true);
      expect(response.data.accessToken).toBeDefined();
      expect(response.data.accessToken).not.toBe(authToken);
      
      authToken = response.data.accessToken;
    });

    it('should get current user info', async () => {
      const response = await authService.getCurrentUser();
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe(userId);
      expect(response.data.email).toBe(TEST_USER.email);
    });
  });

  describe('Profile API', () => {
    beforeEach(() => {
      // Ensure we have auth token for profile tests
      if (!authToken) {
        throw new Error('Auth token required for profile tests');
      }
    });

    it('should create a new profile', async () => {
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

      const response = await profileService.createProfile(profileData);
      
      expect(response.success).toBe(true);
      expect(response.data.bio).toBe(profileData.bio);
      expect(response.data.occupation).toBe(profileData.occupation);
      expect(response.data.location.state).toBe(profileData.location.state);
      
      profileId = response.data.id;
    });

    it('should get user profile', async () => {
      const response = await profileService.getProfile();
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe(profileId);
      expect(response.data.bio).toBe('Test bio for API integration testing');
    });

    it('should update profile', async () => {
      const updateData = {
        bio: 'Updated bio for API testing',
        occupation: 'Senior Software Tester',
      };

      const response = await profileService.updateProfile(profileId, updateData);
      
      expect(response.success).toBe(true);
      expect(response.data.bio).toBe(updateData.bio);
      expect(response.data.occupation).toBe(updateData.occupation);
    });

    it('should update profile preferences', async () => {
      const preferences = {
        ageRange: { min: 25, max: 35 },
        genderPreference: 'any',
        smokingPreference: 'no',
        drinkingPreference: 'socially',
        petPreference: 'no',
        lifestylePreferences: ['quiet', 'clean'],
      };

      const response = await profileService.updatePreferences(preferences);
      
      expect(response.success).toBe(true);
      expect(response.data.preferences.ageRange.min).toBe(25);
      expect(response.data.preferences.genderPreference).toBe('any');
    });

    it('should handle profile validation errors', async () => {
      try {
        await profileService.createProfile({
          bio: '', // Invalid: empty bio
          occupation: '',
          education: '',
          location: {
            state: '',
            city: '',
            address: '',
          },
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('validation');
      }
    });
  });

  describe('Property API', () => {
    it('should create a new property', async () => {
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

      const response = await propertyService.createProperty(propertyData);
      
      expect(response.success).toBe(true);
      expect(response.data.title).toBe(propertyData.title);
      expect(response.data.propertyType).toBe(propertyData.propertyType);
      expect(response.data.pricing.rent).toBe(propertyData.pricing.rent);
      
      propertyId = response.data.id;
    });

    it('should get all properties', async () => {
      const response = await propertyService.getProperties();
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data.properties)).toBe(true);
      expect(response.data.properties.length).toBeGreaterThan(0);
    });

    it('should get property by ID', async () => {
      const response = await propertyService.getProperty(propertyId);
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe(propertyId);
      expect(response.data.title).toBe('API Test Property');
    });

    it('should search properties with filters', async () => {
      const filters = {
        state: 'Lagos',
        city: 'Lekki',
        minPrice: 100000,
        maxPrice: 300000,
        propertyType: 'apartment',
      };

      const response = await propertyService.searchProperties(filters);
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data.properties)).toBe(true);
      
      // Should include our test property
      const testProperty = response.data.properties.find(p => p.id === propertyId);
      expect(testProperty).toBeDefined();
    });

    it('should update property', async () => {
      const updateData = {
        title: 'Updated API Test Property',
        pricing: {
          rent: 250000,
          deposit: 500000,
        },
      };

      const response = await propertyService.updateProperty(propertyId, updateData);
      
      expect(response.success).toBe(true);
      expect(response.data.title).toBe(updateData.title);
      expect(response.data.pricing.rent).toBe(updateData.pricing.rent);
    });

    it('should get user properties', async () => {
      const response = await propertyService.getUserProperties();
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data.properties)).toBe(true);
      
      // Should include our test property
      const testProperty = response.data.properties.find(p => p.id === propertyId);
      expect(testProperty).toBeDefined();
    });
  });

  describe('Messaging API', () => {
    it('should create a conversation', async () => {
      // First, we need another user to create conversation with
      // For testing, we'll create a conversation with the same user
      const conversationData = {
        participantIds: [userId],
        conversationType: 'direct',
        title: 'Test Conversation',
      };

      const response = await messageService.createConversation(conversationData);

      expect(response.success).toBe(true);
      expect(response.data.conversation).toBeDefined();
      expect(response.data.conversation.participants).toContain(userId);

      conversationId = response.data.conversation._id;
    });

    it('should get user conversations', async () => {
      const response = await messageService.getConversations();

      expect(response.success).toBe(true);
      expect(Array.isArray(response.data.conversations)).toBe(true);

      // Should include our test conversation
      const testConversation = response.data.conversations.find(c => c._id === conversationId);
      expect(testConversation).toBeDefined();
    });

    it('should send a message', async () => {
      const messageData = {
        conversationId,
        content: 'Test message from API integration test',
        type: 'text',
      };

      const response = await messageService.sendMessage(messageData);

      expect(response.success).toBe(true);
      expect(response.data.message.content).toBe(messageData.content);
      expect(response.data.message.conversationId).toBe(conversationId);
    });

    it('should get conversation messages', async () => {
      const response = await messageService.getMessages(conversationId);

      expect(response.success).toBe(true);
      expect(Array.isArray(response.data.messages)).toBe(true);
      expect(response.data.messages.length).toBeGreaterThan(0);

      // Should include our test message
      const testMessage = response.data.messages.find(m =>
        m.content === 'Test message from API integration test'
      );
      expect(testMessage).toBeDefined();
    });
  });

  describe('File Upload API', () => {
    it('should validate file upload guidelines', async () => {
      const response = await uploadService.getUploadGuidelines();

      expect(response.success).toBe(true);
      expect(response.data.maxFileSize).toBeDefined();
      expect(response.data.allowedTypes).toBeDefined();
      expect(Array.isArray(response.data.allowedTypes)).toBe(true);
    });

    it('should handle file validation', async () => {
      // Test file validation without actual upload
      const validFile = new File(['test content'], 'test.jpg', {
        type: 'image/jpeg',
      });

      const validation = uploadService.validateFile(validFile, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png'],
      });

      expect(validation.isValid).toBe(true);
    });

    it('should reject invalid file types', async () => {
      const invalidFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });

      const validation = uploadService.validateFile(invalidFile, {
        allowedTypes: ['image/jpeg', 'image/png'],
      });

      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('type');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      try {
        await propertyService.getProperty('non-existent-id');
        expect.fail('Should have thrown 404 error');
      } catch (error: any) {
        expect(error.message).toContain('not found');
      }
    });

    it('should handle unauthorized requests', async () => {
      // Temporarily clear auth token
      const originalToken = authToken;
      authToken = '';
      
      try {
        await profileService.getProfile();
        expect.fail('Should have thrown unauthorized error');
      } catch (error: any) {
        expect(error.message).toContain('unauthorized');
      } finally {
        // Restore auth token
        authToken = originalToken;
      }
    });

    it('should handle network errors', async () => {
      // Mock network failure
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      try {
        await propertyService.getProperties();
        expect.fail('Should have thrown network error');
      } catch (error: any) {
        expect(error.message).toContain('Network');
      } finally {
        // Restore fetch
        global.fetch = originalFetch;
      }
    });
  });
});
