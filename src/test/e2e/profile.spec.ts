import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('lajospaces_token', 'mock-token');
      localStorage.setItem('lajospaces_user', JSON.stringify({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: true,
        isProfileComplete: false,
      }));
    });

    // Mock API responses
    await page.route('**/api/profiles/me', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Profile not found',
        }),
      });
    });

    await page.goto('/profile/setup');
  });

  test('should display profile setup form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Complete Your Profile');
    await expect(page.locator('textarea[name="bio"]')).toBeVisible();
    await expect(page.locator('input[name="occupation"]')).toBeVisible();
    await expect(page.locator('input[name="education"]')).toBeVisible();
    await expect(page.locator('select[name="state"]')).toBeVisible();
    await expect(page.locator('input[name="city"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Bio is required')).toBeVisible();
    await expect(page.locator('text=Occupation is required')).toBeVisible();
    await expect(page.locator('text=Education is required')).toBeVisible();
    await expect(page.locator('text=State is required')).toBeVisible();
    await expect(page.locator('text=City is required')).toBeVisible();
  });

  test('should successfully create profile', async ({ page }) => {
    // Mock successful profile creation
    await page.route('**/api/profiles', (route) => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'profile-123',
            userId: 'user-123',
            bio: 'Software developer passionate about technology',
            occupation: 'Software Developer',
            education: 'Computer Science',
            location: {
              state: 'Lagos',
              city: 'Ikeja',
              address: '123 Test Street',
            },
            completionScore: 60,
          },
          message: 'Profile created successfully',
        }),
      });
    });

    // Fill out the form
    await page.fill('textarea[name="bio"]', 'Software developer passionate about technology');
    await page.fill('input[name="occupation"]', 'Software Developer');
    await page.fill('input[name="education"]', 'Computer Science');
    await page.selectOption('select[name="state"]', 'Lagos');
    await page.fill('input[name="city"]', 'Ikeja');
    await page.fill('input[name="address"]', '123 Test Street');

    await page.click('button[type="submit"]');

    // Should redirect to preferences setup
    await expect(page.url()).toContain('/profile/preferences');
    await expect(page.locator('h1')).toContainText('Set Your Preferences');
  });

  test('should handle preferences setup', async ({ page }) => {
    // Navigate to preferences (assuming profile is already created)
    await page.goto('/profile/preferences');

    await expect(page.locator('h2')).toContainText('Roommate Preferences');
    await expect(page.locator('input[name="ageRange.min"]')).toBeVisible();
    await expect(page.locator('input[name="ageRange.max"]')).toBeVisible();
    await expect(page.locator('select[name="genderPreference"]')).toBeVisible();
    await expect(page.locator('select[name="smokingPreference"]')).toBeVisible();

    // Mock preferences update
    await page.route('**/api/profiles/preferences', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            preferences: {
              ageRange: { min: 25, max: 35 },
              genderPreference: 'any',
              smokingPreference: 'no',
              drinkingPreference: 'socially',
              petPreference: 'no',
              lifestylePreferences: ['quiet', 'clean'],
            },
          },
          message: 'Preferences updated successfully',
        }),
      });
    });

    // Fill preferences
    await page.fill('input[name="ageRange.min"]', '25');
    await page.fill('input[name="ageRange.max"]', '35');
    await page.selectOption('select[name="genderPreference"]', 'any');
    await page.selectOption('select[name="smokingPreference"]', 'no');
    await page.selectOption('select[name="drinkingPreference"]', 'socially');
    await page.selectOption('select[name="petPreference"]', 'no');
    
    // Select lifestyle preferences
    await page.check('input[value="quiet"]');
    await page.check('input[value="clean"]');

    await page.click('button[type="submit"]');

    // Should redirect to photo upload
    await expect(page.url()).toContain('/profile/photos');
    await expect(page.locator('h1')).toContainText('Add Your Photos');
  });

  test('should handle photo upload', async ({ page }) => {
    await page.goto('/profile/photos');

    await expect(page.locator('text=Upload Photos')).toBeVisible();
    await expect(page.locator('text=Drag & drop photos here')).toBeVisible();

    // Mock photo upload
    await page.route('**/api/photos/upload', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            photo: {
              id: 'photo-123',
              url: 'https://example.com/photo.jpg',
              publicId: 'photo_123',
              isPrimary: true,
              uploadedAt: new Date().toISOString(),
            },
            sizes: {
              thumbnail: 'https://example.com/photo_thumb.jpg',
              small: 'https://example.com/photo_small.jpg',
              medium: 'https://example.com/photo_medium.jpg',
              large: 'https://example.com/photo_large.jpg',
            },
            profile: {
              totalPhotos: 1,
              completionScore: 85,
            },
          },
          message: 'Photo uploaded successfully',
        }),
      });
    });

    // Simulate file upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-photo.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    });

    await expect(page.locator('text=Photo uploaded successfully')).toBeVisible();
    await expect(page.locator('img[alt="Profile photo"]')).toBeVisible();

    // Skip photos and continue
    await page.click('text=Continue');

    // Should redirect to dashboard
    await expect(page.url()).toContain('/dashboard');
  });

  test('should display complete profile view', async ({ page }) => {
    // Mock complete profile
    await page.route('**/api/profiles/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'profile-123',
            userId: 'user-123',
            bio: 'Software developer passionate about technology',
            occupation: 'Software Developer',
            education: 'Computer Science',
            location: {
              state: 'Lagos',
              city: 'Ikeja',
              address: '123 Test Street',
            },
            preferences: {
              ageRange: { min: 25, max: 35 },
              genderPreference: 'any',
              smokingPreference: 'no',
              drinkingPreference: 'socially',
              petPreference: 'no',
              lifestylePreferences: ['quiet', 'clean'],
            },
            photos: [
              {
                id: 'photo-123',
                url: 'https://example.com/photo.jpg',
                isPrimary: true,
              },
            ],
            completionScore: 100,
          },
        }),
      });
    });

    await page.goto('/profile');

    await expect(page.locator('h1')).toContainText('John Doe');
    await expect(page.locator('text=Software Developer')).toBeVisible();
    await expect(page.locator('text=Computer Science')).toBeVisible();
    await expect(page.locator('text=Lagos, Ikeja')).toBeVisible();
    await expect(page.locator('text=Software developer passionate about technology')).toBeVisible();
    await expect(page.locator('img[alt="Profile photo"]')).toBeVisible();
  });

  test('should allow profile editing', async ({ page }) => {
    // Mock profile data
    await page.route('**/api/profiles/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'profile-123',
            userId: 'user-123',
            bio: 'Software developer passionate about technology',
            occupation: 'Software Developer',
            education: 'Computer Science',
            completionScore: 100,
          },
        }),
      });
    });

    await page.goto('/profile');

    // Click edit button
    await page.click('button:has-text("Edit Profile")');

    // Should show edit form
    await expect(page.locator('textarea[name="bio"]')).toHaveValue('Software developer passionate about technology');
    await expect(page.locator('input[name="occupation"]')).toHaveValue('Software Developer');
    await expect(page.locator('input[name="education"]')).toHaveValue('Computer Science');

    // Mock profile update
    await page.route('**/api/profiles/profile-123', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'profile-123',
            bio: 'Updated bio - Senior Software Developer',
            occupation: 'Senior Software Developer',
            education: 'Computer Science',
          },
          message: 'Profile updated successfully',
        }),
      });
    });

    // Update bio
    await page.fill('textarea[name="bio"]', 'Updated bio - Senior Software Developer');
    await page.fill('input[name="occupation"]', 'Senior Software Developer');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated bio - Senior Software Developer')).toBeVisible();
    await expect(page.locator('text=Senior Software Developer')).toBeVisible();
  });
});
