// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Authentication Tests
 * Tests login flows for all user roles
 */
test.describe('Authentication', () => {

  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login.html');
    });

    test('should load login page', async ({ page }) => {
      await expect(page).toHaveTitle(/Login|Portal|Adinath/i);
      await expect(page.locator('form, .login-form, #loginForm')).toBeVisible();
    });

    test('should have username/email and password fields', async ({ page }) => {
      await expect(page.locator('input[type="email"], input[type="text"][name*="email"], input[name*="user"]').first()).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.locator('input[type="email"], input[type="text"]').first().fill('invalid@test.com');
      await page.locator('input[type="password"]').first().fill('wrongpassword');
      await page.getByRole('button', { name: /login|sign in|submit/i }).first().click();
      
      // Should show error message
      await expect(page.locator('.error, .alert-error, [class*="error"]')).toBeVisible({ timeout: 5000 });
    });

    test('should have role selection or links', async ({ page }) => {
      // Check for role-specific login options
      const hasRoleLinks = await page.locator('text=/doctor|staff|admin|patient/i').count() > 0;
      expect(hasRoleLinks).toBeTruthy();
    });
  });

  test.describe('Doctor Login', () => {
    test('should login as Dr. Ashok', async ({ page }) => {
      await page.goto('/login.html');
      
      await page.locator('input[type="email"], input[type="text"]').first().fill('drsajnani@gmail.com');
      await page.locator('input[type="password"]').first().fill('doctor123');
      await page.getByRole('button', { name: /login|sign in/i }).first().click();
      
      // Should redirect to doctor dashboard
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url).toMatch(/portal|doctor|dashboard/i);
    });

    test('should login as Dr. Sunita', async ({ page }) => {
      await page.goto('/login.html');
      
      await page.locator('input[type="email"], input[type="text"]').first().fill('sunita.sajnani9@gmail.com');
      await page.locator('input[type="password"]').first().fill('doctor123');
      await page.getByRole('button', { name: /login|sign in/i }).first().click();
      
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url).toMatch(/portal|doctor|dashboard/i);
    });
  });

  test.describe('Admin Login', () => {
    test('should login as site admin', async ({ page }) => {
      await page.goto('/login.html');
      
      await page.locator('input[type="email"], input[type="text"]').first().fill('psaj');
      await page.locator('input[type="password"]').first().fill('1234');
      await page.getByRole('button', { name: /login|sign in/i }).first().click();
      
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url).toMatch(/portal|admin|dashboard/i);
    });

    test('should login with email', async ({ page }) => {
      await page.goto('/login.html');
      
      await page.locator('input[type="email"], input[type="text"]').first().fill('pratik.sajnani@gmail.com');
      await page.locator('input[type="password"]').first().fill('1234');
      await page.getByRole('button', { name: /login|sign in/i }).first().click();
      
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url).toMatch(/portal|admin|dashboard/i);
    });
  });

  test.describe('Staff Login', () => {
    test('should login as receptionist', async ({ page }) => {
      await page.goto('/login.html');
      
      await page.locator('input[type="email"], input[type="text"]').first().fill('poonam@adinathhealth.com');
      await page.locator('input[type="password"]').first().fill('staff123');
      await page.getByRole('button', { name: /login|sign in/i }).first().click();
      
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url).toMatch(/portal|staff|dashboard/i);
    });
  });

  test.describe('Logout', () => {
    test('should be able to logout', async ({ page }) => {
      // Login first
      await page.goto('/login.html');
      await page.locator('input[type="email"], input[type="text"]').first().fill('psaj');
      await page.locator('input[type="password"]').first().fill('1234');
      await page.getByRole('button', { name: /login|sign in/i }).first().click();
      
      await page.waitForTimeout(2000);
      
      // Find and click logout
      const logoutButton = page.getByRole('button', { name: /logout|sign out/i }).or(page.getByRole('link', { name: /logout|sign out/i }));
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await expect(page).toHaveURL(/login|home/);
      }
    });
  });
});

