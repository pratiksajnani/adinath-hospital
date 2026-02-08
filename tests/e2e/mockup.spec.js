// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Mockup Page Tests
 * Tests the design mockup page and feedback widget
 */
test.describe('Mockup Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/mockup/');
    await page.waitForLoadState('networkidle');
  });

  test('should load without auth gate on localhost', async ({ page }) => {
    const gate = page.locator('#auth-gate');
    await expect(gate).toHaveCount(0);
  });

  test('should display all main sections', async ({ page }) => {
    await expect(page.locator('[data-section="hero"]')).toBeVisible();
    await expect(page.locator('[data-section="nav"]')).toBeVisible();
    await expect(page.locator('#services')).toBeVisible();
    await expect(page.locator('#doctors')).toBeVisible();
    await expect(page.locator('#testimonials')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('should display both doctors', async ({ page }) => {
    await expect(page.locator('text=Dr. Ashok Sajnani').first()).toBeVisible();
    const sunita = page.locator('text=Dr. Sunita Sajnani').first();
    await sunita.scrollIntoViewIfNeeded();
    await expect(sunita).toBeVisible();
  });

  test('should display hospital phone number', async ({ page }) => {
    await expect(page.locator('a[href="tel:+919925450425"]').first()).toBeVisible();
  });

  test('should open and close feedback panel', async ({ page }) => {
    await page.locator('#feedbackFab').click();
    await expect(page.locator('#feedbackPanel')).toBeVisible();
    await expect(page.locator('#feedbackFab')).not.toBeVisible();

    await page.locator('.feedback-close').click();
    await expect(page.locator('#feedbackPanel')).not.toBeVisible();
    await expect(page.locator('#feedbackFab')).toBeVisible();
  });

  test('should require sentiment before submit', async ({ page }) => {
    await page.locator('#feedbackFab').click();

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('select');
      await dialog.accept();
    });
    await page.locator('#feedbackSubmit').click();
  });

  test('should require text before submit', async ({ page }) => {
    await page.locator('#feedbackFab').click();
    await page.locator('label[for="sent-love"]').click();

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('thoughts');
      await dialog.accept();
    });
    await page.locator('#feedbackSubmit').click();
  });

  test('should submit feedback and show success', async ({ page }) => {
    await page.locator('#feedbackFab').click();

    // Fill out the form
    await page.locator('label[for="sec-hero"]').click();
    await page.locator('label[for="sent-work"]').click();
    await page.locator('#feedbackText').fill('The hero section needs more contrast');

    await page.locator('#feedbackSubmit').click();

    // Should show success message
    await expect(page.locator('#feedbackSuccess')).toBeVisible();
    await expect(page.locator('#feedbackSuccess')).toContainText('Thank You');

    // Form should be hidden
    await expect(page.locator('#feedbackForm')).not.toBeVisible();
  });

  test('should save feedback to localStorage when Supabase is unavailable', async ({ page }) => {
    // Block both Supabase API and CDN so localStorage fallback is used
    await page.route('**/*supabase*/**', route => route.abort());
    await page.route('**/supabase.co/**', route => route.abort());

    await page.goto('/mockup/');
    await page.waitForLoadState('load');

    await page.locator('#feedbackFab').click();

    await page.locator('label[for="sec-doctors"]').click();
    await page.locator('label[for="sent-love"]').click();
    await page.locator('#feedbackText').fill('Doctors section looks great');
    await page.locator('#feedbackSubmit').click();

    // Wait for success
    await expect(page.locator('#feedbackSuccess')).toBeVisible();

    // Verify data was saved to localStorage
    const stored = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('design_feedback') || '[]');
    });

    expect(stored.length).toBeGreaterThan(0);
    const last = stored[stored.length - 1];
    expect(last.section).toBe('doctors');
    expect(last.sentiment).toBe('love');
    expect(last.feedback).toBe('Doctors section looks great');
    expect(last.submitted_by).toBeTruthy();
    expect(last.status).toBe('new');
  });

  test('should auto-select section when clicking page area', async ({ page }) => {
    await page.locator('[data-section="hero"] .hero-title').click();
    await expect(page.locator('#feedbackPanel')).toBeVisible();
    await expect(page.locator('#sec-hero')).toBeChecked();
  });
});
