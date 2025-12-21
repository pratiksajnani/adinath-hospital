// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Homepage Tests
 * Tests the main landing page functionality
 */
test.describe('Homepage', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Adinath Hospital/);
  });

  test('should display hospital branding', async ({ page }) => {
    // Logo/brand name should be visible
    await expect(page.locator('text=Adinath Hospital')).toBeVisible();
    await expect(page.locator('text=Care with Compassion')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Check main navigation items exist
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByRole('link', { name: /Home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Service/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Doctor/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Contact/i })).toBeVisible();
  });

  test('should display both doctors', async ({ page }) => {
    await expect(page.locator('text=Dr. Ashok Sajnani')).toBeVisible();
    await expect(page.locator('text=Dr. Sunita Sajnani')).toBeVisible();
  });

  test('should have working Book Appointment CTA', async ({ page }) => {
    const bookButton = page.getByRole('link', { name: /Book Appointment/i }).first();
    await expect(bookButton).toBeVisible();
    await bookButton.click();
    await expect(page).toHaveURL(/book/);
  });

  test('should have working phone call link', async ({ page }) => {
    const phoneLink = page.getByRole('link', { name: /\+91 99254 50425/i }).first();
    await expect(phoneLink).toBeVisible();
    await expect(phoneLink).toHaveAttribute('href', /tel:/);
  });

  test('should have language switcher buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'EN' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'हि' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ગુ' })).toBeVisible();
  });

  test('should display services section', async ({ page }) => {
    await expect(page.locator('text=Orthopedic')).toBeVisible();
    await expect(page.locator('text=Gynecology')).toBeVisible();
    await expect(page.locator('text=Pharmacy')).toBeVisible();
  });

  test('should have WhatsApp floating button', async ({ page }) => {
    const waButton = page.locator('.whatsapp-float');
    await expect(waButton).toBeVisible();
  });

  test('should display FAQ section', async ({ page }) => {
    await expect(page.locator('text=hospital timing')).toBeVisible();
    await expect(page.locator('text=book an appointment')).toBeVisible();
  });

  test('should have working footer links', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer >> text=Quick Link')).toBeVisible();
    await expect(page.locator('footer >> text=Services')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Mobile menu toggle should be visible
      await expect(page.locator('button[aria-label="Toggle menu"]')).toBeVisible();
    }
  });
});

