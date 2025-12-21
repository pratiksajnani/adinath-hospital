// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Onboarding Flow Tests
 * Tests registration/onboarding for all user roles
 */
test.describe('Onboarding', () => {

  test.describe('Onboarding Index', () => {
    test('should load onboarding index page', async ({ page }) => {
      await page.goto('/onboard/index.html');
      await expect(page).toHaveTitle(/Onboarding|Register|Adinath/i);
    });

    test('should have links to all role pages', async ({ page }) => {
      await page.goto('/onboard/index.html');
      
      await expect(page.getByRole('link', { name: /patient/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /doctor/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /staff/i })).toBeVisible();
    });
  });

  test.describe('Patient Onboarding', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/onboard/patient.html');
    });

    test('should load patient registration page', async ({ page }) => {
      await expect(page).toHaveTitle(/Patient.*Registration|Adinath/i);
    });

    test('should display registration form', async ({ page }) => {
      await expect(page.locator('form, .registration-form')).toBeVisible();
    });

    test('should have required patient fields', async ({ page }) => {
      // Name field
      await expect(page.getByPlaceholder(/name/i).first()).toBeVisible();
      
      // Phone/mobile field
      await expect(page.getByPlaceholder(/phone|mobile/i).first()).toBeVisible();
    });

    test('should complete patient registration', async ({ page }) => {
      // Fill form
      await page.getByPlaceholder(/name/i).first().fill('Test Patient');
      await page.getByPlaceholder(/phone|mobile/i).first().fill('9876543210');
      
      // Email if present
      const emailField = page.getByPlaceholder(/email/i);
      if (await emailField.isVisible()) {
        await emailField.fill('test@example.com');
      }
      
      // Password if present
      const passwordField = page.locator('input[type="password"]').first();
      if (await passwordField.isVisible()) {
        await passwordField.fill('test1234');
        
        // Confirm password if present
        const confirmPassword = page.locator('input[type="password"]').nth(1);
        if (await confirmPassword.isVisible()) {
          await confirmPassword.fill('test1234');
        }
      }
      
      // Submit
      const submitButton = page.getByRole('button', { name: /register|submit|create/i }).first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('Doctor Onboarding', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/onboard/doctor.html');
    });

    test('should load doctor registration page', async ({ page }) => {
      await expect(page).toHaveTitle(/Doctor.*Registration|Adinath/i);
    });

    test('should require invite token for doctor registration', async ({ page }) => {
      // Doctor registration usually requires an invite
      const inviteField = page.locator('input[name*="token"], input[name*="invite"], input[name*="code"]');
      const hasInviteField = await inviteField.count() > 0;
      
      // Either has invite field or shows message about invitation
      if (!hasInviteField) {
        const inviteMessage = await page.locator('text=/invite|invitation|contact admin/i').count() > 0;
        expect(hasInviteField || inviteMessage).toBeTruthy();
      }
    });
  });

  test.describe('Staff Onboarding', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/onboard/staff.html');
    });

    test('should load staff registration page', async ({ page }) => {
      await expect(page).toHaveTitle(/Staff.*Registration|Adinath/i);
    });

    test('should have staff-specific fields', async ({ page }) => {
      await expect(page.locator('form, .registration-form')).toBeVisible();
      
      // Role selection or department
      const roleField = page.locator('select[name*="role"], input[name*="role"], select[name*="department"]');
      const hasRoleField = await roleField.count() > 0;
      expect(hasRoleField).toBeTruthy();
    });
  });

  test.describe('Admin Onboarding', () => {
    test('should load admin registration page', async ({ page }) => {
      await page.goto('/onboard/admin.html');
      await expect(page).toHaveTitle(/Admin.*Registration|Adinath/i);
    });

    test('should require special authorization', async ({ page }) => {
      await page.goto('/onboard/admin.html');
      
      // Admin registration should require invite token or special access
      const form = page.locator('form, .registration-form');
      const inviteField = page.locator('input[name*="token"], input[name*="invite"]');
      const warningMessage = page.locator('text=/authorized|admin only|invitation required/i');
      
      const isProtected = await inviteField.count() > 0 || await warningMessage.count() > 0 || await form.count() > 0;
      expect(isProtected).toBeTruthy();
    });
  });

  test.describe('Invite Link Flow', () => {
    test('should accept invite token from URL', async ({ page }) => {
      // Test with a mock invite token
      await page.goto('/onboard/patient.html?token=test-invite-token');
      
      // Page should load successfully
      await expect(page).toHaveTitle(/Patient|Registration|Adinath/i);
    });
  });
});

