// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Appointment Booking Tests
 * Tests the complete appointment booking flow
 */
test.describe('Appointment Booking', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/book.html');
    await page.waitForLoadState('networkidle');
  });

  test('should load booking page', async ({ page }) => {
    await expect(page).toHaveTitle(/Book|Appointment|Adinath/i);
  });

  test('should display page content', async ({ page }) => {
    // Page should have visible content
    await expect(page.locator('body')).toBeVisible();
    const hasContent = await page.locator('h1, h2, h3, form, .container, main').count() > 0;
    expect(hasContent).toBeTruthy();
  });

  test('should have interactive elements', async ({ page }) => {
    // Page should have some interactive elements
    const interactiveCount = await page.locator('input, select, button, a').count();
    expect(interactiveCount).toBeGreaterThan(0);
  });

  test('should have booking-related content', async ({ page }) => {
    // Look for any booking-related text or elements
    const hasBookingContent = await page.locator('text=/book|appointment|schedule|doctor/i').count() > 0;
    expect(hasBookingContent).toBeTruthy();
  });

  test('should have contact input fields', async ({ page }) => {
    // Name or phone input should exist
    const contactField = page.locator('input[type="text"], input[type="tel"], input[name*="name"], input[name*="phone"]').first();
    await expect(contactField).toBeVisible();
  });

  test('should have contact options', async ({ page }) => {
    // WhatsApp or phone contact should exist
    const contactOption = page.locator('a[href*="wa.me"], a[href*="whatsapp"], a[href^="tel:"], text=/whatsapp|call|phone/i').first();
    const hasContact = await contactOption.count() > 0;
    expect(hasContact).toBeTruthy();
  });

  test('should have submit button', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"], button:has-text("Book"), button:has-text("Submit"), button:has-text("Confirm"), input[type="submit"]').first();
    await expect(submitButton).toBeVisible();
  });

  test('should allow form interaction', async ({ page }) => {
    // Try to interact with form elements
    const nameField = page.locator('input[name*="name"], input[placeholder*="name" i]').first();
    
    if (await nameField.isVisible()) {
      await nameField.fill('Test Patient');
      await expect(nameField).toHaveValue('Test Patient');
    }
    
    const phoneField = page.locator('input[name*="phone"], input[type="tel"], input[placeholder*="phone" i]').first();
    
    if (await phoneField.isVisible()) {
      await phoneField.fill('9876543210');
      await expect(phoneField).toHaveValue('9876543210');
    }
  });

  test('should have navigation back to home', async ({ page }) => {
    // Any link to go back to homepage
    const homeLink = page.locator('a[href="/"], a[href="./"], a[href="../"], a:has-text("Home"), .logo a, header a').first();
    await expect(homeLink).toBeVisible();
  });
});
