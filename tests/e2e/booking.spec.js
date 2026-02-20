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

  test('should load booking page with form', async ({ page }) => {
    await expect(page).toHaveTitle(/Book|Appointment|Adinath/i);
    await expect(page.locator('#bookingForm')).toBeVisible();
  });

  test('should have both doctors as options', async ({ page }) => {
    await expect(page.locator('#dr-ashok')).toBeAttached();
    await expect(page.locator('#dr-sunita')).toBeAttached();
  });

  test('should have date and time selection', async ({ page }) => {
    await expect(page.locator('#date')).toBeVisible();
    await expect(page.locator('input[name="time"]').first()).toBeAttached();
  });

  test('should have patient info fields', async ({ page }) => {
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
    await expect(page.locator('#age')).toBeVisible();
    await expect(page.locator('#gender')).toBeVisible();
  });

  test('should complete booking and show confirmation', async ({ page }) => {
    // Select doctor
    await page.locator('label[for="dr-ashok"]').click();

    // Set date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.locator('#date').fill(dateStr);

    // Select time
    await page.locator('label[for="time-11"]').click();

    // Fill patient info
    await page.locator('#name').fill('Test Patient');
    await page.locator('#phone').fill('9876543210');
    await page.locator('#age').fill('35');
    await page.locator('#gender').selectOption('Male');
    await page.locator('#reason').fill('Knee pain');

    // Submit
    await page.locator('button[type="submit"]').click();

    // Should show confirmation
    const confirmation = page.locator('#confirmationSection');
    await expect(confirmation).toBeVisible({ timeout: 5000 });
    await expect(confirmation).toContainText('Dr. Ashok Sajnani');
    await expect(confirmation).toContainText('Test Patient');

    // Booking form should be hidden
    await expect(page.locator('#bookingForm')).not.toBeVisible();
  });

  test('should show confirmation after successful booking', async ({ page }) => {
    // Select doctor and fill form
    await page.locator('label[for="dr-sunita"]').click();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.locator('#date').fill(tomorrow.toISOString().split('T')[0]);
    await page.locator('label[for="time-2"]').click();

    await page.locator('#name').fill('Data Test Patient');
    await page.locator('#phone').fill('9999888877');
    await page.locator('#age').fill('28');
    await page.locator('#gender').selectOption('Female');
    await page.locator('#reason').fill('Routine checkup');

    await page.locator('button[type="submit"]').click();

    // Appointment data is now stored in Supabase, not localStorage.
    // Verify the success confirmation is shown in the UI instead.
    const confirmation = page.locator('#confirmationSection');
    await expect(confirmation).toBeVisible({ timeout: 5000 });
    await expect(confirmation).toContainText('Sunita');
    await expect(confirmation).toContainText('Data Test Patient');
  });

  test('should have WhatsApp booking option', async ({ page }) => {
    const whatsappBtn = page.locator('a[href*="wa.me"], button:has-text("WhatsApp")').first();
    await expect(whatsappBtn).toBeVisible();
  });

  test('should have navigation back to home', async ({ page }) => {
    const homeLink = page.locator('a[href="/"], a[href="./"], a[href="../"], a:has-text("Home"), header a').first();
    await expect(homeLink).toBeVisible();
  });
});
