import { test, expect } from '@playwright/test';

test.describe('Property Management', () => {
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
        isProfileComplete: true,
      }));
    });
  });

  test('should display properties list', async ({ page }) => {
    // Mock properties API
    await page.route('**/api/properties', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            properties: [
              {
                id: 'property-1',
                title: 'Beautiful 2BR Apartment',
                description: 'A lovely apartment in a great location',
                propertyType: 'apartment',
                listingType: 'rent',
                location: {
                  state: 'Lagos',
                  city: 'Ikeja',
                  address: '123 Property Street',
                },
                pricing: {
                  rent: 150000,
                  deposit: 300000,
                },
                details: {
                  bedrooms: 2,
                  bathrooms: 2,
                  totalRooms: 4,
                },
                photos: ['https://example.com/photo1.jpg'],
                isActive: true,
              },
              {
                id: 'property-2',
                title: 'Cozy Studio Apartment',
                description: 'Perfect for a single person',
                propertyType: 'studio',
                listingType: 'rent',
                location: {
                  state: 'Lagos',
                  city: 'Victoria Island',
                  address: '456 Studio Lane',
                },
                pricing: {
                  rent: 80000,
                  deposit: 160000,
                },
                details: {
                  bedrooms: 1,
                  bathrooms: 1,
                  totalRooms: 2,
                },
                photos: ['https://example.com/photo2.jpg'],
                isActive: true,
              },
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 2,
              pages: 1,
            },
          },
        }),
      });
    });

    await page.goto('/properties');

    await expect(page.locator('h1')).toContainText('Find Your Perfect Space');
    await expect(page.locator('text=Beautiful 2BR Apartment')).toBeVisible();
    await expect(page.locator('text=Cozy Studio Apartment')).toBeVisible();
    await expect(page.locator('text=₦150,000/month')).toBeVisible();
    await expect(page.locator('text=₦80,000/month')).toBeVisible();
    await expect(page.locator('text=Lagos, Ikeja')).toBeVisible();
    await expect(page.locator('text=Lagos, Victoria Island')).toBeVisible();
  });

  test('should filter properties by location', async ({ page }) => {
    // Mock filtered properties API
    await page.route('**/api/properties?state=Lagos&city=Ikeja', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            properties: [
              {
                id: 'property-1',
                title: 'Beautiful 2BR Apartment',
                location: {
                  state: 'Lagos',
                  city: 'Ikeja',
                },
                pricing: { rent: 150000 },
                details: { bedrooms: 2, bathrooms: 2 },
              },
            ],
            pagination: { page: 1, limit: 10, total: 1, pages: 1 },
          },
        }),
      });
    });

    await page.goto('/properties');

    // Use filters
    await page.selectOption('select[name="state"]', 'Lagos');
    await page.selectOption('select[name="city"]', 'Ikeja');
    await page.click('button:has-text("Apply Filters")');

    await expect(page.locator('text=Beautiful 2BR Apartment')).toBeVisible();
    await expect(page.locator('text=Cozy Studio Apartment')).not.toBeVisible();
  });

  test('should filter properties by price range', async ({ page }) => {
    await page.goto('/properties');

    // Set price range
    await page.fill('input[name="minPrice"]', '100000');
    await page.fill('input[name="maxPrice"]', '200000');
    await page.click('button:has-text("Apply Filters")');

    // Should filter properties within price range
    await expect(page.locator('text=Beautiful 2BR Apartment')).toBeVisible();
  });

  test('should display property details', async ({ page }) => {
    // Mock property details API
    await page.route('**/api/properties/property-1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'property-1',
            title: 'Beautiful 2BR Apartment',
            description: 'A lovely apartment in a great location with modern amenities',
            propertyType: 'apartment',
            listingType: 'rent',
            location: {
              state: 'Lagos',
              city: 'Ikeja',
              address: '123 Property Street',
              coordinates: { lat: 6.5244, lng: 3.3792 },
            },
            pricing: {
              rent: 150000,
              deposit: 300000,
              agentFee: 75000,
              utilityDeposit: 50000,
            },
            details: {
              bedrooms: 2,
              bathrooms: 2,
              totalRooms: 4,
              maximumOccupants: 2,
              furnishingStatus: 'furnished',
            },
            amenities: ['wifi', 'parking', 'security', 'generator'],
            photos: [
              'https://example.com/photo1.jpg',
              'https://example.com/photo2.jpg',
              'https://example.com/photo3.jpg',
            ],
            owner: {
              id: 'owner-123',
              firstName: 'Jane',
              lastName: 'Smith',
              profilePhoto: 'https://example.com/owner.jpg',
            },
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        }),
      });
    });

    await page.goto('/properties/property-1');

    await expect(page.locator('h1')).toContainText('Beautiful 2BR Apartment');
    await expect(page.locator('text=A lovely apartment in a great location with modern amenities')).toBeVisible();
    await expect(page.locator('text=₦150,000/month')).toBeVisible();
    await expect(page.locator('text=₦300,000 deposit')).toBeVisible();
    await expect(page.locator('text=2 bedrooms')).toBeVisible();
    await expect(page.locator('text=2 bathrooms')).toBeVisible();
    await expect(page.locator('text=Furnished')).toBeVisible();
    await expect(page.locator('text=WiFi')).toBeVisible();
    await expect(page.locator('text=Parking')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();
    await expect(page.locator('text=Generator')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).toBeVisible();
  });

  test('should allow contacting property owner', async ({ page }) => {
    // Mock property details
    await page.route('**/api/properties/property-1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'property-1',
            title: 'Beautiful 2BR Apartment',
            owner: {
              id: 'owner-123',
              firstName: 'Jane',
              lastName: 'Smith',
            },
          },
        }),
      });
    });

    // Mock conversation creation
    await page.route('**/api/conversations', (route) => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            conversation: {
              _id: 'conversation-123',
              participants: ['user-123', 'owner-123'],
              conversationType: 'direct',
            },
          },
          message: 'Conversation created successfully',
        }),
      });
    });

    await page.goto('/properties/property-1');

    await page.click('button:has-text("Contact Owner")');

    // Should open message modal or redirect to messages
    await expect(page.locator('text=Send Message')).toBeVisible();
    
    await page.fill('textarea[placeholder*="message"]', 'Hi, I\'m interested in this property. Is it still available?');
    await page.click('button:has-text("Send Message")');

    await expect(page.locator('text=Message sent successfully')).toBeVisible();
  });

  test('should allow adding property to favorites', async ({ page }) => {
    // Mock add to favorites API
    await page.route('**/api/wishlist', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Property added to favorites',
          }),
        });
      }
    });

    await page.goto('/properties/property-1');

    await page.click('button[aria-label="Add to favorites"]');

    await expect(page.locator('text=Property added to favorites')).toBeVisible();
    await expect(page.locator('button[aria-label="Remove from favorites"]')).toBeVisible();
  });

  test('should create new property listing', async ({ page }) => {
    await page.goto('/properties/create');

    await expect(page.locator('h1')).toContainText('List Your Property');

    // Fill basic information
    await page.fill('input[name="title"]', 'My Amazing Apartment');
    await page.fill('textarea[name="description"]', 'A beautiful apartment with great amenities');
    await page.selectOption('select[name="propertyType"]', 'apartment');
    await page.selectOption('select[name="listingType"]', 'rent');

    // Fill location
    await page.selectOption('select[name="state"]', 'Lagos');
    await page.fill('input[name="city"]', 'Lekki');
    await page.fill('input[name="address"]', '789 New Property Avenue');

    // Fill pricing
    await page.fill('input[name="rent"]', '200000');
    await page.fill('input[name="deposit"]', '400000');
    await page.fill('input[name="agentFee"]', '100000');

    // Fill details
    await page.fill('input[name="bedrooms"]', '3');
    await page.fill('input[name="bathrooms"]', '2');
    await page.fill('input[name="totalRooms"]', '5');
    await page.fill('input[name="maximumOccupants"]', '3');
    await page.selectOption('select[name="furnishingStatus"]', 'furnished');

    // Select amenities
    await page.check('input[value="wifi"]');
    await page.check('input[value="parking"]');
    await page.check('input[value="security"]');

    // Mock property creation
    await page.route('**/api/properties', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'property-new',
              title: 'My Amazing Apartment',
              description: 'A beautiful apartment with great amenities',
            },
            message: 'Property created successfully',
          }),
        });
      }
    });

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Property created successfully')).toBeVisible();
    await expect(page.url()).toContain('/properties/property-new');
  });

  test('should edit existing property', async ({ page }) => {
    // Mock user's properties
    await page.route('**/api/properties/owner', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            properties: [
              {
                id: 'property-owned',
                title: 'My Property',
                description: 'My property description',
                propertyType: 'apartment',
                pricing: { rent: 150000 },
                details: { bedrooms: 2, bathrooms: 2 },
                isActive: true,
              },
            ],
          },
        }),
      });
    });

    // Mock property details for editing
    await page.route('**/api/properties/property-owned', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'property-owned',
            title: 'My Property',
            description: 'My property description',
            propertyType: 'apartment',
            pricing: { rent: 150000, deposit: 300000 },
            details: { bedrooms: 2, bathrooms: 2, totalRooms: 4 },
            amenities: ['wifi', 'parking'],
            ownerId: 'user-123',
          },
        }),
      });
    });

    await page.goto('/dashboard/properties');

    await page.click('button:has-text("Edit")');

    // Should navigate to edit form
    await expect(page.url()).toContain('/properties/property-owned/edit');
    await expect(page.locator('input[name="title"]')).toHaveValue('My Property');

    // Update title
    await page.fill('input[name="title"]', 'Updated Property Title');

    // Mock property update
    await page.route('**/api/properties/property-owned', (route) => {
      if (route.request().method() === 'PUT') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'property-owned',
              title: 'Updated Property Title',
            },
            message: 'Property updated successfully',
          }),
        });
      }
    });

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Property updated successfully')).toBeVisible();
  });
});
