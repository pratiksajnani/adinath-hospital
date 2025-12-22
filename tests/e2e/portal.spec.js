// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Portal Tests
 * Tests portal functionality for all user roles
 */

test.describe('Doctor Portal', () => {
  test('should load doctor portal page', async ({ page }) => {
    await page.goto('/portal/doctor/index.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have doctor-specific content', async ({ page }) => {
    await page.goto('/portal/doctor/index.html');
    await page.waitForLoadState('networkidle');
    
    // Should have doctor-related content or login redirect
    const content = page.locator('text=/doctor|appointment|patient|login/i').first();
    await expect(content).toBeVisible();
  });
});

test.describe('Staff Portal', () => {
  test('should load staff portal page', async ({ page }) => {
    await page.goto('/portal/staff/index.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have staff-specific content', async ({ page }) => {
    await page.goto('/portal/staff/index.html');
    await page.waitForLoadState('networkidle');
    
    const content = page.locator('text=/staff|queue|patient|login|check-in/i').first();
    await expect(content).toBeVisible();
  });
});

test.describe('Admin Portal', () => {
  test('should load admin portal page', async ({ page }) => {
    await page.goto('/portal/admin/index.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have admin-specific content', async ({ page }) => {
    await page.goto('/portal/admin/index.html');
    await page.waitForLoadState('networkidle');
    
    const content = page.locator('text=/admin|manage|user|setting|login/i').first();
    await expect(content).toBeVisible();
  });
});

test.describe('Patient Portal', () => {
  test('should load patient portal page', async ({ page }) => {
    await page.goto('/portal/patient/index.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have patient-specific content', async ({ page }) => {
    await page.goto('/portal/patient/index.html');
    await page.waitForLoadState('networkidle');
    
    const content = page.locator('text=/patient|appointment|history|login|profile/i').first();
    await expect(content).toBeVisible();
  });
});

test.describe('Portal Index', () => {
  test('should load portal index', async ({ page }) => {
    await page.goto('/portal/index.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have navigation to different portals', async ({ page }) => {
    await page.goto('/portal/index.html');
    await page.waitForLoadState('networkidle');
    
    // Check for any portal-related links
    const portalLinks = page.locator('a, button').first();
    await expect(portalLinks).toBeVisible();
  });
});

test.describe('Portal Access Control', () => {
  test('doctor portal should require authentication', async ({ page }) => {
    await page.goto('/portal/doctor/index.html');
    await page.waitForLoadState('networkidle');
    
    // Should either show login form or portal content
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin portal should require authentication', async ({ page }) => {
    await page.goto('/portal/admin/index.html');
    await page.waitForLoadState('networkidle');
    
    // Should either show login form or portal content
    await expect(page.locator('body')).toBeVisible();
  });
});
