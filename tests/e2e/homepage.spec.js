// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Homepage Tests
 * Tests the main landing page functionality
 */
test.describe('Homepage', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should load homepage with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Adinath/i);
  });

  test('should display hospital branding', async ({ page }) => {
    // Logo/brand name should be visible - check for partial match
    const brandText = page.locator('text=/Adinath/i').first();
    await expect(brandText).toBeVisible();
  });

  test('should have navigation', async ({ page }) => {
    // Check navigation exists - use first() since there can be multiple
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('should display doctor information', async ({ page }) => {
    // Scroll down to doctor section and check for doctor cards
    const doctorCard = page.locator('.doctor-card, [class*="doctor"], h3:has-text("Dr.")').first();
    await doctorCard.scrollIntoViewIfNeeded();
    await expect(doctorCard).toBeVisible();
  });

  test('should have Book Appointment CTA', async ({ page }) => {
    // Look for any booking link
    const bookButton = page.locator('a[href*="book"], button:has-text("Book"), a:has-text("Book")').first();
    await expect(bookButton).toBeVisible();
  });

  test('should have phone contact', async ({ page }) => {
    // Phone link should exist
    const phoneLink = page.locator('a[href^="tel:"]').first();
    await expect(phoneLink).toBeVisible();
  });

  test('should have language switcher', async ({ page }) => {
    // Language buttons - any language indicator
    const langButton = page.locator('button:has-text("EN"), button:has-text("हि"), button:has-text("ગુ"), .lang-btn, [data-lang]').first();
    await expect(langButton).toBeVisible();
  });

  test('should display services', async ({ page }) => {
    // Services section - look for service-related content
    const servicesSection = page.locator('text=/service|orthopedic|gynecolog|yoga|pharmacy|सेवा|સેવા/i').first();
    await expect(servicesSection).toBeVisible();
  });

  test('should have WhatsApp contact', async ({ page }) => {
    // WhatsApp link or button
    const waButton = page.locator('a[href*="wa.me"], a[href*="whatsapp"], .whatsapp-float, .whatsapp').first();
    await expect(waButton).toBeVisible();
  });

  test('should have footer', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Page should render without errors at different sizes
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('body')).toBeVisible();
  });
});
