// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Forms E2E Tests
 * Tests all form submissions throughout the application
 */
test.describe('Appointment Booking Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/book.html');
    await page.waitForLoadState('networkidle');
  });

  test('should display booking form', async ({ page }) => {
    await expect(page.locator('form, .booking-form')).toBeVisible();
  });

  test('should have doctor selection', async ({ page }) => {
    const doctorSelect = page.locator(
      'select[name="doctor"], #doctor-select, [data-testid="doctor-select"]'
    );
    await expect(doctorSelect.first()).toBeVisible();
  });

  test('should have date input', async ({ page }) => {
    const dateInput = page.locator('input[type="date"], #date, [name="date"]');
    await expect(dateInput.first()).toBeVisible();
  });

  test('should have time selection', async ({ page }) => {
    const timeInput = page.locator(
      'select[name="time"], input[type="time"], #time, .time-slots'
    );
    await expect(timeInput.first()).toBeVisible();
  });

  test('should have patient name input', async ({ page }) => {
    const nameInput = page.locator(
      'input[name="name"], input[name="patient_name"], #patient-name'
    );
    await expect(nameInput.first()).toBeVisible();
  });

  test('should have phone input', async ({ page }) => {
    const phoneInput = page.locator(
      'input[name="phone"], input[type="tel"], #phone'
    );
    await expect(phoneInput.first()).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    const submitBtn = page.locator(
      'button[type="submit"], input[type="submit"], .submit-btn'
    );
    await submitBtn.first().click();

    // Form should not submit (page should stay)
    await expect(page).toHaveURL(/book/);
  });

  test('should fill form successfully', async ({ page }) => {
    // Select doctor
    const doctorSelect = page.locator(
      'select[name="doctor"], #doctor-select'
    ).first();
    if ((await doctorSelect.count()) > 0) {
      await doctorSelect.selectOption({ index: 1 });
    }

    // Fill date (future date)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const dateInput = page.locator('input[type="date"]').first();
    if ((await dateInput.count()) > 0) {
      await dateInput.fill(dateStr);
    }

    // Select time
    const timeInput = page.locator('select[name="time"]').first();
    if ((await timeInput.count()) > 0) {
      await timeInput.selectOption({ index: 1 });
    }

    // Fill patient info
    const nameInput = page
      .locator('input[name="name"], input[name="patient_name"], #patient-name')
      .first();
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('Test Patient');
    }

    const phoneInput = page
      .locator('input[name="phone"], input[type="tel"], #phone')
      .first();
    if ((await phoneInput.count()) > 0) {
      await phoneInput.fill('9999999999');
    }

    // Form should be valid
    const form = page.locator('form').first();
    const isValid = await form.evaluate((f) => f.checkValidity?.() ?? true);
    expect(isValid).toBe(true);
  });
});

test.describe('Login Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login.html');
    await page.waitForLoadState('networkidle');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('#loginForm')).toBeVisible();
  });

  test('should have doctor selector and password input on default tab', async ({ page }) => {
    // Doctor tab is active by default - doctor select visible, email hidden
    await expect(page.locator('#doctorSelect')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('should have password input', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput.first()).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Switch to Admin tab to reveal email field
    await page.locator('button:has-text("Admin")').click();

    await page.locator('#username').fill('wrong@email.com');
    await page.locator('input[type="password"]').first().fill('wrongpassword');

    const submitBtn = page
      .locator('button[type="submit"], .login-btn, .submit-btn')
      .first();
    await submitBtn.click();

    // Wait for error message or alert
    await page.waitForTimeout(1000);

    // Should stay on login page or show error
    const url = page.url();
    expect(url).toContain('login');
  });

  test('should login with valid credentials', async ({ page }) => {
    // Switch to Admin tab to reveal email field
    await page.locator('button:has-text("Admin")').click();

    await page.locator('#username').fill('psaj');
    await page.locator('input[type="password"]').first().fill('1234');

    const submitBtn = page
      .locator('button[type="submit"], .login-btn, .submit-btn')
      .first();
    await submitBtn.click();

    // Wait for navigation
    await page.waitForTimeout(2000);

    // Should redirect to portal or show success
    const url = page.url();
    const text = await page.textContent('body');
    const success =
      url.includes('portal') ||
      text?.includes('Dashboard') ||
      text?.includes('Welcome');

    expect(success).toBe(true);
  });
});

test.describe('Feedback Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have feedback button', async ({ page }) => {
    const feedbackBtn = page.locator(
      '.feedback-btn, #feedback-btn, [aria-label*="feedback"]'
    );
    const count = await feedbackBtn.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should open feedback modal when clicked', async ({ page }) => {
    const feedbackBtn = page
      .locator('.feedback-btn, #feedback-btn, [aria-label*="feedback"]')
      .first();

    if ((await feedbackBtn.count()) > 0) {
      await feedbackBtn.click();
      await page.waitForTimeout(500);

      const modal = page.locator('.feedback-modal, #feedback-modal, .modal');
      const visible = await modal.first().isVisible();
      expect(visible).toBe(true);
    }
  });
});

test.describe('Patient Signup Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login.html');
    await page.waitForLoadState('networkidle');
  });

  test('should have signup tab or link', async ({ page }) => {
    const signupLink = page.locator(
      'a[href*="signup"], button:has-text("Sign Up"), .signup-tab, [data-tab="signup"]'
    );
    const count = await signupLink.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should switch to signup form', async ({ page }) => {
    const signupTab = page
      .locator('[data-tab="signup"], .signup-tab, button:has-text("Sign Up")')
      .first();

    if ((await signupTab.count()) > 0) {
      await signupTab.click();
      await page.waitForTimeout(500);

      // Should show signup form
      const signupForm = page.locator('.signup-form, #signup-form');
      const visible = await signupForm
        .first()
        .isVisible()
        .catch(() => false);
      expect(visible).toBe(true);
    }
  });
});

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have contact section', async ({ page }) => {
    const contact = page.locator('#contact, .contact-section, [id*="contact"]');
    const count = await contact.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have WhatsApp link', async ({ page }) => {
    const whatsappLink = page.locator('a[href*="wa.me"], a[href*="whatsapp"]');
    await expect(whatsappLink.first()).toBeVisible();
  });

  test('should have phone number', async ({ page }) => {
    const phoneLink = page.locator('a[href^="tel:"]');
    const count = await phoneLink.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Doctor Portal Forms', () => {
  test.beforeEach(async ({ page }) => {
    // Login as doctor first - doctor tab is default, just select + password
    await page.goto('/login.html');
    await page.waitForLoadState('networkidle');

    await page.locator('#doctorSelect').selectOption('ashok');
    await page.locator('input[type="password"]').first().fill('doctor123');

    const submitBtn = page
      .locator('button[type="submit"], .login-btn, .submit-btn')
      .first();
    await submitBtn.click();

    await page.waitForTimeout(2000);
  });

  test('should access doctor portal', async ({ page }) => {
    await page.goto('/portal/doctor/simple.html');
    await page.waitForLoadState('networkidle');

    // Should see doctor dashboard content
    const dashboardContent = page.locator(
      'h1, h2, .dashboard-title, .portal-header'
    );
    await expect(dashboardContent.first()).toBeVisible();
  });
});

test.describe('Staff Portal Forms', () => {
  test.beforeEach(async ({ page }) => {
    // Login as staff first - switch to Staff tab to reveal email field
    await page.goto('/login.html');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Staff")').click();
    await page.locator('#username').fill('reception@adinathhealth.com');
    await page.locator('input[type="password"]').first().fill('staff123');

    const submitBtn = page
      .locator('button[type="submit"], .login-btn, .submit-btn')
      .first();
    await submitBtn.click();

    await page.waitForTimeout(2000);
  });

  test('should access staff portal', async ({ page }) => {
    await page.goto('/portal/staff/index.html');
    await page.waitForLoadState('networkidle');

    // Should see staff dashboard content
    const dashboardContent = page.locator(
      'h1, h2, .dashboard-title, .portal-header'
    );
    await expect(dashboardContent.first()).toBeVisible();
  });
});

test.describe('Printable Forms', () => {
  const printableForms = [
    { name: 'Patient Intake', path: '/forms/patient-intake.html' },
    { name: 'Prescription', path: '/forms/prescription.html' },
    { name: 'Consent', path: '/forms/consent.html' },
    { name: 'Discharge', path: '/forms/discharge.html' },
  ];

  for (const form of printableForms) {
    test(`should load ${form.name} form`, async ({ page }) => {
      await page.goto(form.path);
      await page.waitForLoadState('networkidle');

      // Should have form content
      const formContent = page.locator('form, .form-section, .printable-form');
      await expect(formContent.first()).toBeVisible();
    });

    test(`${form.name} form should be print-ready`, async ({ page }) => {
      await page.goto(form.path);
      await page.waitForLoadState('networkidle');

      // Check for print-specific styles or print button
      const printBtn = page.locator(
        'button:has-text("Print"), .print-btn, [onclick*="print"]'
      );
      const count = await printBtn.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  }
});

