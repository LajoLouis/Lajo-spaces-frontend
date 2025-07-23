import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
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

  test('should load homepage within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              metrics.loadTime = entry.loadEventEnd - entry.loadEventStart;
              metrics.domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
            }
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.lcp = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              metrics.fid = entry.processingStart - entry.startTime;
            }
            if (entry.entryType === 'layout-shift') {
              metrics.cls = (metrics.cls || 0) + entry.value;
            }
          });
          
          resolve(metrics);
        }).observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000);
      });
    });
    
    console.log('Performance metrics:', metrics);
    
    // Core Web Vitals thresholds
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500); // LCP should be < 2.5s
    }
    if (metrics.fid) {
      expect(metrics.fid).toBeLessThan(100); // FID should be < 100ms
    }
    if (metrics.cls) {
      expect(metrics.cls).toBeLessThan(0.1); // CLS should be < 0.1
    }
  });

  test('should handle large property lists efficiently', async ({ page }) => {
    // Mock large property dataset
    const largePropertyList = Array.from({ length: 100 }, (_, i) => ({
      id: `property-${i}`,
      title: `Property ${i + 1}`,
      description: `Description for property ${i + 1}`,
      propertyType: 'apartment',
      location: {
        state: 'Lagos',
        city: 'Ikeja',
        address: `${i + 1} Test Street`,
      },
      pricing: { rent: 100000 + (i * 1000) },
      details: { bedrooms: 2, bathrooms: 2 },
      photos: [`https://example.com/photo${i}.jpg`],
      isActive: true,
    }));

    await page.route('**/api/properties', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            properties: largePropertyList,
            pagination: { page: 1, limit: 100, total: 100, pages: 1 },
          },
        }),
      });
    });

    const startTime = Date.now();
    await page.goto('/properties');
    
    // Wait for all properties to render
    await page.waitForSelector('[data-testid="property-card"]');
    await page.waitForLoadState('networkidle');
    
    const renderTime = Date.now() - startTime;
    
    // Should render large list within 5 seconds
    expect(renderTime).toBeLessThan(5000);
    
    // Check that all properties are rendered
    const propertyCards = await page.locator('[data-testid="property-card"]').count();
    expect(propertyCards).toBeGreaterThan(50); // Should render at least 50 items
    
    // Test scrolling performance
    const scrollStartTime = Date.now();
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(100);
    const scrollTime = Date.now() - scrollStartTime;
    
    expect(scrollTime).toBeLessThan(500); // Scrolling should be smooth
  });

  test('should handle rapid user interactions without lag', async ({ page }) => {
    await page.goto('/properties');
    
    // Test rapid clicking/navigation
    const interactions = [];
    
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      
      // Click filter button
      await page.click('button:has-text("Filters")');
      await page.waitForSelector('[data-testid="filter-modal"]');
      
      // Close filter
      await page.click('button:has-text("Close")');
      await page.waitForSelector('[data-testid="filter-modal"]', { state: 'hidden' });
      
      const interactionTime = Date.now() - startTime;
      interactions.push(interactionTime);
    }
    
    // Average interaction time should be under 200ms
    const avgTime = interactions.reduce((a, b) => a + b, 0) / interactions.length;
    expect(avgTime).toBeLessThan(200);
    
    // No interaction should take more than 500ms
    const maxTime = Math.max(...interactions);
    expect(maxTime).toBeLessThan(500);
  });

  test('should efficiently handle real-time message updates', async ({ page }) => {
    await page.goto('/messages/conversation-1');
    
    // Mock rapid message receiving
    await page.addInitScript(() => {
      window.messageCount = 0;
      window.renderTimes = [];
      
      window.mockSocket = {
        on: (event, callback) => {
          window.mockSocket.callbacks = window.mockSocket.callbacks || {};
          window.mockSocket.callbacks[event] = callback;
        },
        off: () => {},
        emit: () => {},
        connect: () => {},
        disconnect: () => {},
        connected: true,
        id: 'mock-socket-id',
      };
      
      window.io = () => window.mockSocket;
    });
    
    // Send 50 messages rapidly
    for (let i = 0; i < 50; i++) {
      const startTime = Date.now();
      
      await page.evaluate((messageIndex) => {
        const messageData = {
          message: {
            _id: `message-${messageIndex}`,
            conversationId: 'conversation-1',
            senderId: 'user-456',
            content: `Rapid message ${messageIndex}`,
            messageType: 'text',
            status: 'delivered',
            createdAt: new Date().toISOString(),
          },
          conversationId: 'conversation-1',
        };
        
        if (window.mockSocket.callbacks['new_message']) {
          window.mockSocket.callbacks['new_message'](messageData);
        }
      }, i);
      
      // Wait for message to appear
      await page.waitForSelector(`text=Rapid message ${i}`);
      
      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(100); // Each message should render quickly
    }
    
    // Check that all messages are visible
    const messageCount = await page.locator('[data-testid="message-bubble"]').count();
    expect(messageCount).toBe(50);
  });

  test('should handle memory usage efficiently', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
        };
      }
      return null;
    });
    
    if (initialMemory) {
      console.log('Initial memory usage:', initialMemory);
      
      // Navigate through multiple pages to test memory leaks
      const pages = ['/properties', '/messages', '/profile', '/dashboard'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Let page settle
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
      
      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
          };
        }
        return null;
      });
      
      if (finalMemory) {
        console.log('Final memory usage:', finalMemory);
        
        // Memory usage shouldn't increase by more than 50MB
        const memoryIncrease = finalMemory.used - initialMemory.used;
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
        
        // Memory usage shouldn't exceed 80% of available heap
        const memoryUsagePercent = (finalMemory.used / finalMemory.limit) * 100;
        expect(memoryUsagePercent).toBeLessThan(80);
      }
    }
  });

  test('should handle image loading efficiently', async ({ page }) => {
    // Mock property with many images
    await page.route('**/api/properties/property-with-images', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'property-with-images',
            title: 'Property with Many Images',
            photos: Array.from({ length: 20 }, (_, i) => 
              `https://picsum.photos/800/600?random=${i}`
            ),
          },
        }),
      });
    });
    
    const startTime = Date.now();
    await page.goto('/properties/property-with-images');
    
    // Wait for first image to load
    await page.waitForSelector('img[src*="picsum"]');
    
    const firstImageTime = Date.now() - startTime;
    expect(firstImageTime).toBeLessThan(2000); // First image should load quickly
    
    // Check lazy loading - not all images should be loaded immediately
    const loadedImages = await page.locator('img[src*="picsum"]').count();
    expect(loadedImages).toBeLessThan(20); // Should use lazy loading
    
    // Scroll to load more images
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    await page.waitForTimeout(1000);
    
    // More images should be loaded after scrolling
    const loadedImagesAfterScroll = await page.locator('img[src*="picsum"]').count();
    expect(loadedImagesAfterScroll).toBeGreaterThan(loadedImages);
  });

  test('should handle form validation efficiently', async ({ page }) => {
    await page.goto('/profile/setup');
    
    // Test rapid form input changes
    const inputs = [
      'textarea[name="bio"]',
      'input[name="occupation"]',
      'input[name="education"]',
      'input[name="city"]',
    ];
    
    const validationTimes = [];
    
    for (const input of inputs) {
      const startTime = Date.now();
      
      // Type rapidly
      await page.fill(input, 'a');
      await page.fill(input, '');
      await page.fill(input, 'test value');
      
      // Wait for validation
      await page.waitForTimeout(100);
      
      const validationTime = Date.now() - startTime;
      validationTimes.push(validationTime);
    }
    
    // Validation should be fast
    const avgValidationTime = validationTimes.reduce((a, b) => a + b, 0) / validationTimes.length;
    expect(avgValidationTime).toBeLessThan(200);
  });

  test('should handle search efficiently', async ({ page }) => {
    await page.goto('/properties');
    
    // Test search performance
    const searchTerms = ['apartment', 'lagos', 'furnished', 'parking', 'security'];
    const searchTimes = [];
    
    for (const term of searchTerms) {
      const startTime = Date.now();
      
      await page.fill('input[placeholder*="Search"]', term);
      
      // Wait for search results
      await page.waitForTimeout(500);
      
      const searchTime = Date.now() - startTime;
      searchTimes.push(searchTime);
      
      // Clear search
      await page.fill('input[placeholder*="Search"]', '');
      await page.waitForTimeout(200);
    }
    
    // Search should be responsive
    const avgSearchTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;
    expect(avgSearchTime).toBeLessThan(1000);
  });

  test('should handle bundle size efficiently', async ({ page }) => {
    // Monitor network requests during page load
    const requests = [];
    
    page.on('request', (request) => {
      if (request.resourceType() === 'script' || request.resourceType() === 'stylesheet') {
        requests.push({
          url: request.url(),
          type: request.resourceType(),
        });
      }
    });
    
    page.on('response', async (response) => {
      if (response.request().resourceType() === 'script') {
        const size = parseInt(response.headers()['content-length'] || '0');
        if (size > 0) {
          console.log(`Script bundle size: ${(size / 1024).toFixed(2)}KB - ${response.url()}`);
          
          // Main bundle shouldn't exceed 500KB
          if (response.url().includes('index') || response.url().includes('main')) {
            expect(size).toBeLessThan(500 * 1024); // 500KB
          }
        }
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log(`Total requests: ${requests.length}`);
    
    // Shouldn't load too many script files
    const scriptRequests = requests.filter(r => r.type === 'script');
    expect(scriptRequests.length).toBeLessThan(10);
  });
});
