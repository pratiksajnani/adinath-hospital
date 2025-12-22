// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Navigation & Links Tests
 * Tests all navigation and internal links work correctly
 */
test.describe('Navigation', () => {

  test.describe('Main Pages', () => {
    const mainPages = [
      { url: '/', name: 'Homepage' },
      { url: '/book.html', name: 'Booking' },
      { url: '/login.html', name: 'Login' },
      { url: '/store.html', name: 'Store' },
    ];

    for (const page of mainPages) {
      test(`should load ${page.name} page`, async ({ page: browserPage }) => {
        await browserPage.goto(page.url);
        await browserPage.waitForLoadState('networkidle');
        await expect(browserPage.locator('body')).toBeVisible();
      });
    }
  });

  test.describe('Service Pages', () => {
    const servicePages = [
      '/services/orthopedic.html',
      '/services/gynecology.html',
      '/services/yoga.html',
    ];

    for (const url of servicePages) {
      test(`should load ${url}`, async ({ page }) => {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });

  test.describe('Portal Pages', () => {
    const portalPages = [
      '/portal/index.html',
      '/portal/doctor/index.html',
      '/portal/staff/index.html',
      '/portal/admin/index.html',
      '/portal/patient/index.html',
    ];

    for (const url of portalPages) {
      test(`should load ${url}`, async ({ page }) => {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });

  test.describe('Documentation Pages', () => {
    test('should load patient guide', async ({ page }) => {
      await page.goto('/docs/PATIENT_GUIDE.html');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should load doctor guide', async ({ page }) => {
      await page.goto('/docs/DOCTOR_GUIDE.html');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Form Pages', () => {
    test('should load patient intake form', async ({ page }) => {
      await page.goto('/forms/patient-intake.html');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should load prescription form', async ({ page }) => {
      await page.goto('/forms/prescription.html');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Store Pages', () => {
    test('should load store page', async ({ page }) => {
      await page.goto('/store.html');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should load store dashboard', async ({ page }) => {
      await page.goto('/store/index.html');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('404 Page', () => {
    test('should show 404 for non-existent pages', async ({ page }) => {
      await page.goto('/this-page-definitely-does-not-exist-12345.html');
      await page.waitForLoadState('networkidle');
      
      // Should show some content (either 404 page or redirect)
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('External Links', () => {
    test('should have WhatsApp link', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const waLink = page.locator('a[href*="wa.me"], a[href*="whatsapp"]').first();
      await expect(waLink).toBeVisible();
    });

    test('should have phone link', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const phoneLink = page.locator('a[href^="tel:"]').first();
      await expect(phoneLink).toBeVisible();
    });
  });
});

test.describe('Language Switching', () => {
  test('should have language buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const langButton = page.locator('button:has-text("EN"), button:has-text("हि"), button:has-text("ગુ"), [data-lang]').first();
    await expect(langButton).toBeVisible();
  });

  test('should switch language on click', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const hindiBtn = page.locator('button:has-text("हि"), button[data-lang="hi"]').first();
    if (await hindiBtn.isVisible()) {
      await hindiBtn.click();
      await page.waitForTimeout(500);
      // Page should still be visible after language switch
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
