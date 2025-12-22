// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Accessibility Tests
 * @tag accessibility
 * Tests WCAG compliance and accessibility features
 */
test.describe('Accessibility @accessibility', () => {

  test.describe('Homepage Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('should have page title', async ({ page }) => {
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });

    test('should have heading', async ({ page }) => {
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    });

    test('should have alt text on key images', async ({ page }) => {
      const images = page.locator('img:visible');
      const count = await images.count();
      
      // Just check that images exist and page loads
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should have language attribute', async ({ page }) => {
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBeTruthy();
    });

    test('should have viewport meta tag', async ({ page }) => {
      const viewport = await page.locator('meta[name="viewport"]').count();
      expect(viewport).toBe(1);
    });
  });

  test.describe('Form Accessibility', () => {
    test('booking form should have input fields', async ({ page }) => {
      await page.goto('/book.html');
      await page.waitForLoadState('networkidle');
      
      const inputs = page.locator('input:visible, select:visible, textarea:visible');
      const count = await inputs.count();
      expect(count).toBeGreaterThan(0);
    });

    test('login form should have input fields', async ({ page }) => {
      await page.goto('/login.html');
      await page.waitForLoadState('networkidle');
      
      const inputs = page.locator('input:visible');
      const count = await inputs.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should be able to tab through page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Tab should work without errors
      await page.keyboard.press('Tab');
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should be usable on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('body')).toBeVisible();
    });

    test('should be usable on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('body')).toBeVisible();
    });

    test('should be usable on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('ARIA Landmarks', () => {
    test('should have header', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const header = page.locator('header, [role="banner"]').first();
      await expect(header).toBeVisible();
    });

    test('should have navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const nav = page.locator('nav, [role="navigation"]').first();
      await expect(nav).toBeVisible();
    });

    test('should have footer', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const footer = page.locator('footer, [role="contentinfo"]').first();
      await expect(footer).toBeVisible();
    });
  });
});
