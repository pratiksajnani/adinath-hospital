// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Smoke Tests - Critical Path Verification
 * Fast tests that verify critical functionality after deployment
 * Run these after every deploy to catch immediate issues
 * 
 * Run: npm run test:smoke
 */

// Run tests in serial order with shorter timeout
test.describe.configure({ mode: 'serial', timeout: 10000 });

test.describe('Smoke Tests - Critical Paths', () => {
  
  test('homepage loads with 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('homepage has essential elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Header should be visible
    await expect(page.locator('header').first()).toBeVisible();
    // Footer should be visible
    await expect(page.locator('footer').first()).toBeVisible();
    // Navigation should exist
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('booking flow accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on book appointment
    const bookLink = page.locator('a:has-text("Book"), a[href*="book"]').first();
    await bookLink.click();
    
    // Should navigate to booking page
    await expect(page).toHaveURL(/book/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    const response = await page.goto('/login.html');
    expect(response.status()).toBe(200);
    
    // Should have password input (login form)
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('portal accessible', async ({ page }) => {
    const response = await page.goto('/portal/index.html');
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('store page loads', async ({ page }) => {
    const response = await page.goto('/store.html');
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('service pages load', async ({ page }) => {
    // Orthopedic
    let response = await page.goto('/services/orthopedic.html');
    expect(response.status()).toBe(200);
    
    // Gynecology
    response = await page.goto('/services/gynecology.html');
    expect(response.status()).toBe(200);
    
    // Yoga
    response = await page.goto('/services/yoga.html');
    expect(response.status()).toBe(200);
  });

  test('forms are accessible', async ({ page }) => {
    // Patient intake form
    const response = await page.goto('/forms/patient-intake.html');
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('documentation loads', async ({ page }) => {
    const response = await page.goto('/docs/PATIENT_GUIDE.html');
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('health endpoint returns OK', async ({ request }) => {
    const response = await request.get('/health.json');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('phone link exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const phoneLink = page.locator('a[href^="tel:"]').first();
    await expect(phoneLink).toBeVisible();
  });

  test('WhatsApp link exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const waLink = page.locator('a[href*="wa.me"]').first();
    await expect(waLink).toBeVisible();
  });
});

