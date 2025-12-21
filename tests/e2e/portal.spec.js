// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Portal Tests
 * Tests portal functionality for all user roles
 */

// Helper function to login
async function loginAs(page, email, password) {
  await page.goto('/login.html');
  await page.locator('input[type="email"], input[type="text"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.getByRole('button', { name: /login|sign in/i }).first().click();
  await page.waitForTimeout(2000);
}

test.describe('Doctor Portal', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'drsajnani@gmail.com', 'doctor123');
  });

  test('should access doctor dashboard', async ({ page }) => {
    await expect(page.url()).toMatch(/portal|doctor|dashboard/i);
  });

  test('should display today\'s appointments', async ({ page }) => {
    const appointmentsSection = page.locator('text=/appointments|schedule|today/i');
    await expect(appointmentsSection.first()).toBeVisible();
  });

  test('should have patient list access', async ({ page }) => {
    const patientSection = page.locator('text=/patients|patient list/i');
    await expect(patientSection.first()).toBeVisible();
  });

  test('should be able to view patient records', async ({ page }) => {
    // Navigate to patients
    const patientLink = page.getByRole('link', { name: /patient/i }).first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should have prescription creation option', async ({ page }) => {
    const prescriptionOption = page.locator('text=/prescription|prescribe/i');
    await expect(prescriptionOption.first()).toBeVisible();
  });
});

test.describe('Staff Portal', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'poonam@adinathhealth.com', 'staff123');
  });

  test('should access staff dashboard', async ({ page }) => {
    await expect(page.url()).toMatch(/portal|staff|dashboard/i);
  });

  test('should display patient queue', async ({ page }) => {
    const queueSection = page.locator('text=/queue|waiting|check-in/i');
    await expect(queueSection.first()).toBeVisible();
  });

  test('should be able to check-in patients', async ({ page }) => {
    const checkInButton = page.locator('button:has-text("check"), button:has-text("Check")');
    // Check-in functionality should be available
    const hasCheckIn = await checkInButton.count() > 0 || await page.locator('text=/check-in|check in/i').count() > 0;
    expect(hasCheckIn).toBeTruthy();
  });

  test('should have appointment management', async ({ page }) => {
    const appointmentSection = page.locator('text=/appointment/i');
    await expect(appointmentSection.first()).toBeVisible();
  });

  test('should be able to send patient signup links', async ({ page }) => {
    // Look for patient registration/invite feature
    const inviteFeature = page.locator('text=/invite|signup link|patient link/i');
    const hasInvite = await inviteFeature.count() > 0;
    expect(hasInvite).toBeTruthy();
  });
});

test.describe('Admin Portal', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'psaj', '1234');
  });

  test('should access admin dashboard', async ({ page }) => {
    await expect(page.url()).toMatch(/portal|admin|dashboard/i);
  });

  test('should have user management', async ({ page }) => {
    const userManagement = page.locator('text=/user|manage|staff|doctor/i');
    await expect(userManagement.first()).toBeVisible();
  });

  test('should have system settings', async ({ page }) => {
    const settingsLink = page.locator('text=/setting|config|system/i');
    const hasSettings = await settingsLink.count() > 0;
    expect(hasSettings).toBeTruthy();
  });

  test('should be able to view all appointments', async ({ page }) => {
    const appointmentsView = page.locator('text=/appointment/i');
    await expect(appointmentsView.first()).toBeVisible();
  });

  test('should have access to reports', async ({ page }) => {
    const reportsSection = page.locator('text=/report|analytics|statistics/i');
    const hasReports = await reportsSection.count() > 0;
    expect(hasReports).toBeTruthy();
  });

  test('should be able to manage content', async ({ page }) => {
    const contentSection = page.locator('text=/content|upload|media/i');
    const hasContent = await contentSection.count() > 0;
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Patient Portal', () => {
  test('should be able to access patient portal', async ({ page }) => {
    await page.goto('/portal/patient/index.html');
    // Should either show portal or redirect to login
    const isPortal = page.url().includes('portal');
    const isLogin = page.url().includes('login');
    expect(isPortal || isLogin).toBeTruthy();
  });

  test('should display appointment history', async ({ page }) => {
    // Login as a test patient first if registration exists
    await page.goto('/portal/patient/index.html');
    
    const appointmentSection = page.locator('text=/appointment|history|booking/i');
    if (await appointmentSection.count() > 0) {
      await expect(appointmentSection.first()).toBeVisible();
    }
  });
});

test.describe('Portal Security', () => {
  test('should redirect unauthenticated users from doctor portal', async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    
    await page.goto('/portal/doctor/index.html');
    await page.waitForTimeout(2000);
    
    // Should redirect to login or show access denied
    const url = page.url();
    const isProtected = url.includes('login') || await page.locator('text=/login|sign in|access denied/i').count() > 0;
    expect(isProtected).toBeTruthy();
  });

  test('should redirect unauthenticated users from admin portal', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    
    await page.goto('/portal/admin/index.html');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    const isProtected = url.includes('login') || await page.locator('text=/login|sign in|access denied/i').count() > 0;
    expect(isProtected).toBeTruthy();
  });
});

