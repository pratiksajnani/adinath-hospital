// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Authentication Tests
 * Tests login flows and portal redirects for all user roles
 */
test.describe('Authentication', () => {

  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login.html');
      await page.waitForLoadState('networkidle');
    });

    test('should have login form with email and password fields', async ({ page }) => {
      await expect(page.locator('#username')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should have role selection tabs', async ({ page }) => {
      const hasRoleInfo = await page.locator('text=/doctor|staff|admin/i').count() > 0;
      expect(hasRoleInfo).toBeTruthy();
    });

    test('should have doctor selection dropdown', async ({ page }) => {
      await expect(page.locator('#doctorSelect')).toBeAttached();
      await expect(page.locator('#doctorSelect option[value="ashok"]')).toBeAttached();
      await expect(page.locator('#doctorSelect option[value="sunita"]')).toBeAttached();
    });
  });

  test.describe('Doctor Login', () => {
    test('should login as Dr. Ashok and redirect to doctor portal', async ({ page }) => {
      await page.goto('/login.html');
      await page.waitForLoadState('networkidle');

      await page.locator('#username').fill('drsajnani@gmail.com');
      await page.locator('#password').fill('doctor123');
      await page.locator('#doctorSelect').selectOption('ashok');
      await page.locator('button[type="submit"]').click();

      // Should redirect to doctor portal
      await page.waitForURL(/portal\/doctor/, { timeout: 5000 });
      expect(page.url()).toContain('portal/doctor');

      // Verify localStorage was set
      const role = await page.evaluate(() => localStorage.getItem('hms_role'));
      expect(role).toBe('doctor');
    });

    test('should login as Dr. Sunita and redirect to doctor portal', async ({ page }) => {
      await page.goto('/login.html');
      await page.waitForLoadState('networkidle');

      await page.locator('#username').fill('sunita.sajnani9@gmail.com');
      await page.locator('#password').fill('doctor123');
      await page.locator('#doctorSelect').selectOption('sunita');
      await page.locator('button[type="submit"]').click();

      await page.waitForURL(/portal\/doctor/, { timeout: 5000 });
      expect(page.url()).toContain('portal/doctor');
    });
  });

  test.describe('Admin Login', () => {
    test('should login as admin and redirect to admin portal', async ({ page }) => {
      await page.goto('/login.html');
      await page.waitForLoadState('networkidle');

      await page.locator('#username').fill('psaj');
      await page.locator('#password').fill('1234');
      await page.locator('button[type="submit"]').click();

      await page.waitForURL(/portal\/admin/, { timeout: 5000 });
      expect(page.url()).toContain('portal/admin');

      const role = await page.evaluate(() => localStorage.getItem('hms_role'));
      expect(role).toBe('admin');
    });
  });

  test.describe('Staff Login', () => {
    test('should login as receptionist and redirect to staff portal', async ({ page }) => {
      await page.goto('/login.html');
      await page.waitForLoadState('networkidle');

      // Click the Staff tab first
      await page.locator('button:has-text("Staff")').click();

      await page.locator('#username').fill('reception@adinathhealth.com');
      await page.locator('#password').fill('staff123');
      await page.locator('button[type="submit"]').click();

      await page.waitForURL(/portal\/staff/, { timeout: 5000 });
      expect(page.url()).toContain('portal/staff');

      const role = await page.evaluate(() => localStorage.getItem('hms_role'));
      expect(role).toBe('receptionist');
    });
  });

  test.describe('Invalid Login', () => {
    test('should show error for wrong credentials', async ({ page }) => {
      await page.goto('/login.html');
      await page.waitForLoadState('networkidle');

      await page.locator('#username').fill('nobody@example.com');
      await page.locator('#password').fill('wrongpassword');
      await page.locator('button[type="submit"]').click();

      // Should show error message and stay on login page
      await page.waitForTimeout(1000);
      const errorVisible = await page.locator('.error-message, .alert-error, [class*="error"]').first().isVisible();
      expect(errorVisible).toBeTruthy();
      expect(page.url()).toContain('login');
    });
  });

  test.describe('Session', () => {
    test('should persist login state in localStorage', async ({ page }) => {
      await page.goto('/login.html');
      await page.waitForLoadState('networkidle');

      await page.locator('#username').fill('psaj');
      await page.locator('#password').fill('1234');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(/portal/, { timeout: 5000 });

      // Verify all expected localStorage keys
      const loggedIn = await page.evaluate(() => localStorage.getItem('hms_logged_in'));
      const email = await page.evaluate(() => localStorage.getItem('hms_user_email'));
      const method = await page.evaluate(() => localStorage.getItem('hms_auth_method'));
      expect(loggedIn).toBe('true');
      expect(email).toBeTruthy();
      expect(method).toBe('password');
    });
  });
});
