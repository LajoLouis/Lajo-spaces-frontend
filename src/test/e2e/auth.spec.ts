import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page by default', async ({ page }) => {
    await expect(page).toHaveTitle(/LajoSpaces/);
    await expect(page.locator('h1')).toContainText('Welcome to LajoSpaces');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('text=Create an account');
    await expect(page.url()).toContain('/register');
    await expect(page.locator('h1')).toContainText('Create Your Account');
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Try invalid email format
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Please enter a valid email')).toBeVisible();
  });

  test('should show validation errors for invalid registration', async ({ page }) => {
    await page.click('text=Create an account');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Test password mismatch
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'different');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    // Mock API response for invalid login
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Invalid email or password',
        }),
      });
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Mock successful login response
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
              firstName: 'John',
              lastName: 'Doe',
              isEmailVerified: true,
              isProfileComplete: false,
            },
            tokens: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
            },
          },
          message: 'Login successful',
        }),
      });
    });

    // Mock profile check
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

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect to profile setup since profile is incomplete
    await expect(page.url()).toContain('/profile/setup');
    await expect(page.locator('h1')).toContainText('Complete Your Profile');
  });

  test('should successfully register new user', async ({ page }) => {
    await page.click('text=Create an account');

    // Mock successful registration response
    await page.route('**/api/auth/register', (route) => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: 'user-123',
              email: 'newuser@example.com',
              firstName: 'Jane',
              lastName: 'Smith',
              isEmailVerified: false,
              isProfileComplete: false,
            },
            tokens: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
            },
          },
          message: 'Registration successful',
        }),
      });
    });

    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Smith');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="dateOfBirth"]', '1990-01-01');
    await page.selectOption('select[name="gender"]', 'female');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.check('input[name="agreeToTerms"]');
    await page.click('button[type="submit"]');

    // Should redirect to email verification
    await expect(page.url()).toContain('/verify-email');
    await expect(page.locator('h1')).toContainText('Verify Your Email');
  });

  test('should handle logout', async ({ page }) => {
    // First login
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
              firstName: 'John',
              lastName: 'Doe',
              isEmailVerified: true,
              isProfileComplete: true,
            },
            tokens: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
            },
          },
          message: 'Login successful',
        }),
      });
    });

    // Mock profile response
    await page.route('**/api/profiles/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'profile-123',
            userId: 'user-123',
            bio: 'Test bio',
            completionScore: 100,
          },
        }),
      });
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');

    // Mock logout response
    await page.route('**/api/auth/logout', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Logout successful',
        }),
      });
    });

    // Click user menu and logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');

    // Should redirect back to login
    await expect(page.url()).toContain('/login');
    await expect(page.locator('h1')).toContainText('Welcome to LajoSpaces');
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.click('text=Forgot password?');
    await expect(page.url()).toContain('/forgot-password');
    await expect(page.locator('h1')).toContainText('Reset Your Password');

    // Mock password reset request
    await page.route('**/api/auth/forgot-password', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Password reset email sent',
        }),
      });
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Password reset email sent')).toBeVisible();
  });
});
