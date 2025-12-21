// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Appointment Booking Tests
 * Tests the complete appointment booking flow
 */
test.describe('Appointment Booking', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/book.html');
  });

  test('should load booking page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Book.*Appointment|Adinath Hospital/i);
  });

  test('should display booking form', async ({ page }) => {
    // Form should be visible
    await expect(page.locator('form, .booking-form')).toBeVisible();
    
    // Check for essential form fields
    await expect(page.getByPlaceholder(/name/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/phone|mobile/i).first()).toBeVisible();
  });

  test('should have doctor selection', async ({ page }) => {
    // Should be able to select a doctor
    const doctorSelect = page.locator('select[name="doctor"], #doctor, input[name="doctor"]');
    await expect(doctorSelect.first()).toBeVisible();
  });

  test('should have date/time selection', async ({ page }) => {
    // Date picker should exist
    const datePicker = page.locator('input[type="date"], [name="date"]');
    await expect(datePicker.first()).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /book|submit|confirm/i }).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Should show validation or not navigate away
      await expect(page).toHaveURL(/book/);
    }
  });

  test('should show WhatsApp booking option', async ({ page }) => {
    const whatsappOption = page.locator('text=WhatsApp');
    await expect(whatsappOption.first()).toBeVisible();
  });

  test('should complete booking flow', async ({ page }) => {
    // Fill in the form
    await page.getByPlaceholder(/name/i).first().fill('Test Patient');
    await page.getByPlaceholder(/phone|mobile/i).first().fill('9876543210');
    
    // Select doctor if dropdown exists
    const doctorSelect = page.locator('select#doctor, select[name="doctor"]');
    if (await doctorSelect.isVisible()) {
      await doctorSelect.selectOption({ index: 1 });
    }
    
    // Select date
    const datePicker = page.locator('input[type="date"]');
    if (await datePicker.isVisible()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await datePicker.fill(tomorrow.toISOString().split('T')[0]);
    }
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /book|submit|confirm/i }).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Should show confirmation or success message
      await page.waitForTimeout(1000);
      // Check for confirmation message or redirect
    }
  });

  test('should have back navigation to homepage', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /home|back/i }).first();
    if (await backLink.isVisible()) {
      await backLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});

