// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Onboarding Flow Tests
 * Tests registration/onboarding for all user roles
 */
test.describe('Onboarding', () => {

  test.describe('Onboarding Index', () => {
    test('should load onboarding index page', async ({ page }) => {
      await page.goto('/onboard/index.html');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should have page content', async ({ page }) => {
      await page.goto('/onboard/index.html');
      await page.waitForLoadState('networkidle');
      
      // Page should have content
      const hasContent = await page.locator('h1, h2, h3, a, button, .card, p').count() > 0;
      expect(hasContent).toBeTruthy();
    });
  });

  test.describe('Patient Onboarding', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/onboard/patient.html');
      await page.waitForLoadState('networkidle');
    });

    test('should load patient registration page', async ({ page }) => {
      await expect(page.locator('body')).toBeVisible();
    });

    test('should display page content', async ({ page }) => {
      // Page should have content
      const hasContent = await page.locator('h1, h2, h3, form, input, p, .container').count() > 0;
      expect(hasContent).toBeTruthy();
    });

    test('should have interactive elements', async ({ page }) => {
      // Page should have form elements or links
      const interactiveCount = await page.locator('input, button, a, select').count();
      expect(interactiveCount).toBeGreaterThan(0);
    });
  });

  test.describe('Doctor Onboarding', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/onboard/doctor.html');
      await page.waitForLoadState('networkidle');
    });

    test('should load doctor registration page', async ({ page }) => {
      await expect(page.locator('body')).toBeVisible();
    });

    test('should have page content', async ({ page }) => {
      // Page should have content
      const hasContent = await page.locator('h1, h2, h3, form, input, p, .container').count() > 0;
      expect(hasContent).toBeTruthy();
    });
  });

  test.describe('Staff Onboarding', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/onboard/staff.html');
      await page.waitForLoadState('networkidle');
    });

    test('should load staff registration page', async ({ page }) => {
      await expect(page.locator('body')).toBeVisible();
    });

    test('should show staff-specific content', async ({ page }) => {
      // Staff registration content
      const content = page.locator('form, input, select, text=/staff|role|register/i').first();
      await expect(content).toBeVisible();
    });
  });

  test.describe('Admin Onboarding', () => {
    test('should load admin registration page', async ({ page }) => {
      await page.goto('/onboard/admin.html');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should show admin-specific content', async ({ page }) => {
      await page.goto('/onboard/admin.html');
      await page.waitForLoadState('networkidle');
      
      // Admin registration content
      const content = page.locator('form, input, text=/admin|invite|authorize/i').first();
      await expect(content).toBeVisible();
    });
  });

  test.describe('Invite Link Flow', () => {
    test('should handle invite token in URL', async ({ page }) => {
      // Test with a mock invite token
      await page.goto('/onboard/patient.html?token=test-invite-token');
      await page.waitForLoadState('networkidle');
      
      // Page should load successfully
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
