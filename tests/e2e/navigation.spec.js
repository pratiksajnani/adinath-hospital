// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Navigation & Links Tests
 * Tests all navigation and internal links work correctly
 */
test.describe('Navigation', () => {

  test.describe('Main Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('should navigate to Services pages', async ({ page }) => {
      // Orthopedic
      await page.goto('/services/orthopedic.html');
      await expect(page).not.toHaveURL(/404/);
      await expect(page).toHaveTitle(/Orthopedic|Adinath/i);
    });

    test('should navigate to Gynecology page', async ({ page }) => {
      await page.goto('/services/gynecology.html');
      await expect(page).not.toHaveURL(/404/);
      await expect(page).toHaveTitle(/Gynecology|OB-GYN|Adinath/i);
    });

    test('should navigate to Yoga page', async ({ page }) => {
      await page.goto('/services/yoga.html');
      await expect(page).not.toHaveURL(/404/);
      await expect(page).toHaveTitle(/Yoga|Adinath/i);
    });

    test('should navigate to Pharmacy page', async ({ page }) => {
      await page.goto('/services/pharmacy.html');
      await expect(page).not.toHaveURL(/404/);
    });
  });

  test.describe('Critical Pages', () => {
    const criticalPages = [
      { url: '/', name: 'Homepage' },
      { url: '/book.html', name: 'Booking' },
      { url: '/login.html', name: 'Login' },
      { url: '/store.html', name: 'Store' },
      { url: '/check-status.html', name: 'Check Status' },
    ];

    for (const page of criticalPages) {
      test(`should load ${page.name} page`, async ({ page: browserPage }) => {
        await browserPage.goto(page.url);
        await expect(browserPage).not.toHaveURL(/404/);
        await expect(browserPage.locator('body')).toBeVisible();
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
        // Should load (may redirect to login, but not 404)
        await expect(page).not.toHaveURL(/404/);
      });
    }
  });

  test.describe('Onboarding Pages', () => {
    const onboardPages = [
      '/onboard/index.html',
      '/onboard/patient.html',
      '/onboard/doctor.html',
      '/onboard/staff.html',
      '/onboard/admin.html',
    ];

    for (const url of onboardPages) {
      test(`should load ${url}`, async ({ page }) => {
        await page.goto(url);
        await expect(page).not.toHaveURL(/404/);
      });
    }
  });

  test.describe('Documentation Pages', () => {
    test('should load docs index', async ({ page }) => {
      await page.goto('/docs/index.html');
      await expect(page).not.toHaveURL(/404/);
    });

    test('should load demo guides', async ({ page }) => {
      await page.goto('/docs/PATIENT_GUIDE.html');
      await expect(page).not.toHaveURL(/404/);
    });
  });

  test.describe('Form Pages', () => {
    const formPages = [
      '/forms/patient-intake.html',
      '/forms/prescription.html',
      '/forms/consent-form.html',
    ];

    for (const url of formPages) {
      test(`should load ${url}`, async ({ page }) => {
        await page.goto(url);
        await expect(page).not.toHaveURL(/404/);
      });
    }
  });

  test.describe('404 Page', () => {
    test('should show 404 for non-existent pages', async ({ page }) => {
      await page.goto('/this-page-does-not-exist-12345.html');
      // Should show our custom 404 page
      await expect(page.locator('text=/404|not found|page.*exist/i')).toBeVisible();
    });

    test('should have navigation back to home on 404', async ({ page }) => {
      await page.goto('/nonexistent-page');
      const homeLink = page.getByRole('link', { name: /home|back|return/i });
      await expect(homeLink.first()).toBeVisible();
    });
  });

  test.describe('External Links', () => {
    test('should have correct WhatsApp link', async ({ page }) => {
      await page.goto('/');
      const waLink = page.locator('a[href*="wa.me"], a[href*="whatsapp"]');
      await expect(waLink.first()).toBeVisible();
      const href = await waLink.first().getAttribute('href');
      expect(href).toContain('wa.me');
    });

    test('should have correct Google Maps link', async ({ page }) => {
      await page.goto('/');
      const mapsLink = page.locator('a[href*="maps.google"], a[href*="goo.gl/maps"]');
      await expect(mapsLink.first()).toBeVisible();
    });

    test('should have LinkedIn links for doctors', async ({ page }) => {
      await page.goto('/');
      const linkedinLinks = page.locator('a[href*="linkedin"]');
      expect(await linkedinLinks.count()).toBeGreaterThan(0);
    });
  });
});

test.describe('Language Switching', () => {
  test('should switch to Hindi', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'हि' }).click();
    
    // Some text should change to Hindi
    await page.waitForTimeout(500);
    const hindiText = await page.locator('text=/स्वागत|सेवाएं|डॉक्टर/').count();
    expect(hindiText).toBeGreaterThan(0);
  });

  test('should switch to Gujarati', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'ગુ' }).click();
    
    await page.waitForTimeout(500);
    const gujaratiText = await page.locator('text=/સ્વાગત|સેવાઓ|ડોક્ટર/').count();
    expect(gujaratiText).toBeGreaterThan(0);
  });

  test('should switch back to English', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'ગુ' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'EN' }).click();
    await page.waitForTimeout(500);
    
    const englishText = await page.locator('text=/Services|Doctors|Contact/').count();
    expect(englishText).toBeGreaterThan(0);
  });
});

