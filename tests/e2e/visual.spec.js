// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Visual Regression Tests
 * Captures screenshots for visual comparison
 * First run creates baseline images, subsequent runs compare against them
 * 
 * Update baselines: npm run test:visual:update
 */
test.describe('Visual Regression', () => {
  
  test.beforeEach(async ({ page }) => {
    // Wait for fonts and images to load
    await page.waitForLoadState('networkidle');
  });

  test('homepage desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Wait a bit for animations to settle
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('homepage-desktop.png', { 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('homepage mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('homepage-mobile.png', { 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('booking page', async ({ page }) => {
    await page.goto('/book.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('booking.png', { 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('login page', async ({ page }) => {
    await page.goto('/login.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('login.png', { 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('store page', async ({ page }) => {
    await page.goto('/store.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('store.png', { 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('portal index', async ({ page }) => {
    await page.goto('/portal/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('portal-index.png', { 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('orthopedic service page', async ({ page }) => {
    await page.goto('/services/orthopedic.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('service-orthopedic.png', { 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('gynecology service page', async ({ page }) => {
    await page.goto('/services/gynecology.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('service-gynecology.png', { 
      fullPage: true,
      animations: 'disabled'
    });
  });
});

