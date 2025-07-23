import { test, expect } from '@playwright/test';

test.describe('Error Handling & Edge Cases', () => {
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

  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/**', (route) => {
      route.abort('failed');
    });

    await page.goto('/properties');

    // Should show network error message
    await expect(page.locator('text=Network error')).toBeVisible();
    await expect(page.locator('text=Please check your connection')).toBeVisible();
    
    // Should show retry button
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();
  });

  test('should handle API server errors (500)', async ({ page }) => {
    await page.route('**/api/properties', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Internal server error',
        }),
      });
    });

    await page.goto('/properties');

    await expect(page.locator('text=Something went wrong')).toBeVisible();
    await expect(page.locator('text=Please try again later')).toBeVisible();
  });

  test('should handle unauthorized access (401)', async ({ page }) => {
    await page.route('**/api/profiles/me', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Unauthorized access',
        }),
      });
    });

    await page.goto('/profile');

    // Should redirect to login
    await expect(page.url()).toContain('/login');
    await expect(page.locator('text=Please log in to continue')).toBeVisible();
  });

  test('should handle forbidden access (403)', async ({ page }) => {
    await page.route('**/api/properties/restricted-property', (route) => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Access forbidden',
        }),
      });
    });

    await page.goto('/properties/restricted-property');

    await expect(page.locator('text=Access denied')).toBeVisible();
    await expect(page.locator('text=You don\'t have permission')).toBeVisible();
  });

  test('should handle not found errors (404)', async ({ page }) => {
    await page.route('**/api/properties/non-existent', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Property not found',
        }),
      });
    });

    await page.goto('/properties/non-existent');

    await expect(page.locator('text=Property not found')).toBeVisible();
    await expect(page.locator('button:has-text("Go Back")')).toBeVisible();
  });

  test('should handle malformed API responses', async ({ page }) => {
    await page.route('**/api/properties', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json response',
      });
    });

    await page.goto('/properties');

    await expect(page.locator('text=Unable to load data')).toBeVisible();
    await expect(page.locator('text=Please refresh the page')).toBeVisible();
  });

  test('should handle slow API responses', async ({ page }) => {
    await page.route('**/api/properties', async (route) => {
      // Delay response by 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { properties: [] },
        }),
      });
    });

    await page.goto('/properties');

    // Should show loading state
    await expect(page.locator('text=Loading')).toBeVisible();
    
    // Should show timeout message after delay
    await expect(page.locator('text=Request timed out')).toBeVisible({ timeout: 15000 });
  });

  test('should handle form validation errors', async ({ page }) => {
    await page.goto('/profile/setup');

    // Submit form with invalid data
    await page.fill('textarea[name="bio"]', 'a'); // Too short
    await page.fill('input[name="occupation"]', ''); // Empty
    await page.fill('input[name="education"]', 'x'.repeat(101)); // Too long

    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=Bio must be at least 10 characters')).toBeVisible();
    await expect(page.locator('text=Occupation is required')).toBeVisible();
    await expect(page.locator('text=Education must be less than 100 characters')).toBeVisible();
  });

  test('should handle file upload errors', async ({ page }) => {
    await page.goto('/profile/photos');

    // Mock file upload failure
    await page.route('**/api/photos/upload', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'File too large',
        }),
      });
    });

    // Try to upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'large-file.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-large-file-content'),
    });

    await expect(page.locator('text=File too large')).toBeVisible();
    await expect(page.locator('text=Please choose a smaller file')).toBeVisible();
  });

  test('should handle Socket.IO connection failures', async ({ page }) => {
    await page.addInitScript(() => {
      window.io = () => ({
        on: (event, callback) => {
          if (event === 'connect_error') {
            setTimeout(() => callback(new Error('Connection failed')), 100);
          }
        },
        off: () => {},
        emit: () => {},
        connect: () => {},
        disconnect: () => {},
        connected: false,
        id: null,
      });
    });

    await page.goto('/messages');

    await expect(page.locator('text=Connection failed')).toBeVisible();
    await expect(page.locator('text=Real-time features unavailable')).toBeVisible();
    await expect(page.locator('button:has-text("Reconnect")')).toBeVisible();
  });

  test('should handle empty data states', async ({ page }) => {
    // Mock empty responses
    await page.route('**/api/properties', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { properties: [] },
        }),
      });
    });

    await page.route('**/api/conversations', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { conversations: [] },
        }),
      });
    });

    // Test empty properties
    await page.goto('/properties');
    await expect(page.locator('text=No properties found')).toBeVisible();
    await expect(page.locator('text=Try adjusting your filters')).toBeVisible();

    // Test empty conversations
    await page.goto('/messages');
    await expect(page.locator('text=No conversations yet')).toBeVisible();
    await expect(page.locator('text=Start a conversation')).toBeVisible();
  });

  test('should handle browser storage limitations', async ({ page }) => {
    // Fill localStorage to capacity
    await page.addInitScript(() => {
      try {
        const largeData = 'x'.repeat(5 * 1024 * 1024); // 5MB
        for (let i = 0; i < 100; i++) {
          localStorage.setItem(`large_item_${i}`, largeData);
        }
      } catch (e) {
        console.log('Storage quota exceeded');
      }
    });

    await page.goto('/dashboard');

    // App should still function with storage limitations
    await expect(page.locator('h1')).toBeVisible();
    
    // Should show warning about storage
    await expect(page.locator('text=Storage limit reached')).toBeVisible();
  });

  test('should handle concurrent user actions', async ({ page }) => {
    await page.goto('/properties');

    // Simulate rapid concurrent actions
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
      promises.push(
        page.click('button:has-text("Filters")').catch(() => {})
      );
    }

    await Promise.allSettled(promises);

    // Should handle concurrent actions gracefully
    await expect(page.locator('[data-testid="filter-modal"]')).toBeVisible();
  });

  test('should handle invalid URL parameters', async ({ page }) => {
    // Test with invalid property ID
    await page.goto('/properties/invalid-id-format');
    await expect(page.locator('text=Invalid property ID')).toBeVisible();

    // Test with invalid conversation ID
    await page.goto('/messages/invalid-conversation-id');
    await expect(page.locator('text=Conversation not found')).toBeVisible();
  });

  test('should handle browser back/forward navigation edge cases', async ({ page }) => {
    await page.goto('/properties');
    await page.goto('/profile');
    await page.goto('/messages');

    // Rapid back navigation
    await page.goBack();
    await page.goBack();
    await page.goForward();

    // Should handle navigation gracefully
    await expect(page.url()).toContain('/profile');
  });

  test('should handle component error boundaries', async ({ page }) => {
    // Mock a component error
    await page.addInitScript(() => {
      window.addEventListener('error', (event) => {
        console.log('Component error caught:', event.error);
      });
    });

    // Trigger an error in a component
    await page.evaluate(() => {
      // Simulate a React component error
      const errorEvent = new ErrorEvent('error', {
        error: new Error('Component crashed'),
        message: 'Component crashed',
      });
      window.dispatchEvent(errorEvent);
    });

    await page.goto('/dashboard');

    // Should show error boundary fallback
    await expect(page.locator('text=Something went wrong')).toBeVisible();
    await expect(page.locator('button:has-text("Reload Page")')).toBeVisible();
  });

  test('should handle memory pressure scenarios', async ({ page }) => {
    // Simulate memory pressure
    await page.addInitScript(() => {
      // Create memory pressure
      window.memoryHog = [];
      for (let i = 0; i < 1000; i++) {
        window.memoryHog.push(new Array(10000).fill('memory-test'));
      }
    });

    await page.goto('/properties');

    // App should still function under memory pressure
    await expect(page.locator('h1')).toBeVisible();
    
    // Clean up memory
    await page.evaluate(() => {
      window.memoryHog = null;
      if (window.gc) window.gc();
    });
  });

  test('should handle offline/online transitions', async ({ page }) => {
    await page.goto('/messages');

    // Simulate going offline
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });

    await expect(page.locator('text=You\'re offline')).toBeVisible();

    // Simulate coming back online
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    await expect(page.locator('text=Back online')).toBeVisible();
  });

  test('should handle session expiration', async ({ page }) => {
    await page.goto('/dashboard');

    // Mock session expiration
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Session expired',
        }),
      });
    });

    // Try to perform an action that requires authentication
    await page.click('button:has-text("Profile")');

    // Should redirect to login with session expired message
    await expect(page.url()).toContain('/login');
    await expect(page.locator('text=Session expired')).toBeVisible();
    await expect(page.locator('text=Please log in again')).toBeVisible();
  });
});
