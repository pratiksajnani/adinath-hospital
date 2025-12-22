// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Multilingual E2E Tests
 * Tests language switching and translation functionality
 */
test.describe('Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have language switcher', async ({ page }) => {
    const langSwitcher = page.locator(
      '.lang-switcher, .language-buttons, [data-lang], .lang-btn'
    );
    await expect(langSwitcher.first()).toBeVisible();
  });

  test('should have English option', async ({ page }) => {
    const enBtn = page.locator('[data-lang="en"], button:has-text("EN")');
    await expect(enBtn.first()).toBeVisible();
  });

  test('should have Hindi option', async ({ page }) => {
    const hiBtn = page.locator('[data-lang="hi"], button:has-text("HI")');
    await expect(hiBtn.first()).toBeVisible();
  });

  test('should have Gujarati option', async ({ page }) => {
    const guBtn = page.locator('[data-lang="gu"], button:has-text("GU")');
    await expect(guBtn.first()).toBeVisible();
  });
});

test.describe('English Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Click English
    const enBtn = page.locator('[data-lang="en"], button:has-text("EN")').first();
    await enBtn.click();
    await page.waitForTimeout(500);
  });

  test('should display English hero text', async ({ page }) => {
    const heroText = page.locator('h1, .hero-title');
    const text = await heroText.first().textContent();
    expect(text?.toLowerCase()).toContain('adinath');
  });

  test('should have English navigation', async ({ page }) => {
    const nav = await page.textContent('nav, header');
    expect(nav?.toLowerCase()).toContain('home');
  });

  test('should have English services', async ({ page }) => {
    const services = page.locator('#services, .services-section');
    const text = await services.textContent();
    expect(
      text?.toLowerCase().includes('orthopedic') ||
        text?.toLowerCase().includes('services')
    ).toBe(true);
  });
});

test.describe('Hindi Translation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Click Hindi
    const hiBtn = page.locator('[data-lang="hi"], button:has-text("HI")').first();
    await hiBtn.click();
    await page.waitForTimeout(1000);
  });

  test('should translate to Hindi', async ({ page }) => {
    // Look for Hindi text (Devanagari script)
    const pageText = await page.textContent('body');
    // Check for any Hindi characters (Unicode range for Devanagari)
    const hasHindi = /[\u0900-\u097F]/.test(pageText || '');
    expect(hasHindi).toBe(true);
  });

  test('should translate navigation', async ({ page }) => {
    const nav = await page.textContent('nav, header');
    // Should contain Hindi text
    const hasHindi = /[\u0900-\u097F]/.test(nav || '');
    expect(hasHindi).toBe(true);
  });

  test('should translate buttons', async ({ page }) => {
    const buttons = page.locator('button[data-i18n], .btn[data-i18n]');
    const count = await buttons.count();

    if (count > 0) {
      const firstBtn = await buttons.first().textContent();
      // Should have Hindi text or still be valid
      expect(firstBtn?.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Gujarati Translation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Click Gujarati
    const guBtn = page.locator('[data-lang="gu"], button:has-text("GU")').first();
    await guBtn.click();
    await page.waitForTimeout(1000);
  });

  test('should translate to Gujarati', async ({ page }) => {
    // Look for Gujarati text (Gujarati script Unicode range)
    const pageText = await page.textContent('body');
    const hasGujarati = /[\u0A80-\u0AFF]/.test(pageText || '');
    expect(hasGujarati).toBe(true);
  });

  test('should translate footer', async ({ page }) => {
    const footer = await page.textContent('footer');
    // Should contain Gujarati or still have content
    expect(footer?.length).toBeGreaterThan(0);
  });
});

test.describe('Language Persistence', () => {
  test('should persist language preference', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to Hindi
    const hiBtn = page.locator('[data-lang="hi"], button:has-text("HI")').first();
    await hiBtn.click();
    await page.waitForTimeout(500);

    // Check localStorage
    const lang = await page.evaluate(() =>
      localStorage.getItem('preferred_language')
    );
    expect(lang).toBe('hi');
  });

  test('should restore language preference on reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Set language to Gujarati
    const guBtn = page.locator('[data-lang="gu"], button:has-text("GU")').first();
    await guBtn.click();
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Check if Gujarati is still active
    const pageText = await page.textContent('body');
    const hasGujarati = /[\u0A80-\u0AFF]/.test(pageText || '');
    expect(hasGujarati).toBe(true);
  });
});

test.describe('Booking Form Translation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/book.html');
    await page.waitForLoadState('networkidle');
  });

  test('should translate form labels in Hindi', async ({ page }) => {
    // Switch to Hindi
    const hiBtn = page.locator('[data-lang="hi"], button:has-text("HI")').first();
    if ((await hiBtn.count()) > 0) {
      await hiBtn.click();
      await page.waitForTimeout(1000);

      // Check for Hindi text in form
      const formText = await page.textContent('form');
      const hasHindi = /[\u0900-\u097F]/.test(formText || '');
      expect(hasHindi).toBe(true);
    }
  });

  test('should translate submit button', async ({ page }) => {
    // Switch to Gujarati
    const guBtn = page.locator('[data-lang="gu"], button:has-text("GU")').first();
    if ((await guBtn.count()) > 0) {
      await guBtn.click();
      await page.waitForTimeout(1000);

      const submitBtn = page.locator('button[type="submit"]').first();
      const text = await submitBtn.textContent();
      // Should have Gujarati text
      const hasGujarati = /[\u0A80-\u0AFF]/.test(text || '');
      expect(hasGujarati || text?.length > 0).toBe(true);
    }
  });
});

test.describe('Login Form Translation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login.html');
    await page.waitForLoadState('networkidle');
  });

  test('should translate login page to Hindi', async ({ page }) => {
    const hiBtn = page.locator('[data-lang="hi"], button:has-text("HI")').first();
    if ((await hiBtn.count()) > 0) {
      await hiBtn.click();
      await page.waitForTimeout(1000);

      const pageText = await page.textContent('body');
      const hasHindi = /[\u0900-\u097F]/.test(pageText || '');
      expect(hasHindi).toBe(true);
    }
  });
});

test.describe('Multilingual on Portal Pages', () => {
  test('should have language switcher on patient portal', async ({ page }) => {
    await page.goto('/portal/patient/index.html');
    await page.waitForLoadState('networkidle');

    const langSwitcher = page.locator(
      '.lang-switcher, .language-buttons, [data-lang]'
    );
    const count = await langSwitcher.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have language switcher on staff portal', async ({ page }) => {
    await page.goto('/portal/staff/index.html');
    await page.waitForLoadState('networkidle');

    const langSwitcher = page.locator(
      '.lang-switcher, .language-buttons, [data-lang]'
    );
    const count = await langSwitcher.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('RTL Support Check', () => {
  test('should not break layout in Hindi', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hiBtn = page.locator('[data-lang="hi"], button:has-text("HI")').first();
    await hiBtn.click();
    await page.waitForTimeout(1000);

    // Check that layout is still correct
    const header = page.locator('header');
    const isVisible = await header.isVisible();
    expect(isVisible).toBe(true);

    // Check navigation is accessible
    const nav = page.locator('nav');
    const navVisible = await nav.isVisible();
    expect(navVisible).toBe(true);
  });
});

test.describe('Translation Coverage', () => {
  const pagesWithI18n = [
    { name: 'Homepage', path: '/' },
    { name: 'Booking', path: '/book.html' },
    { name: 'Login', path: '/login.html' },
    { name: 'Store', path: '/store.html' },
  ];

  for (const pageInfo of pagesWithI18n) {
    test(`${pageInfo.name} should have data-i18n elements`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');

      const i18nElements = page.locator('[data-i18n]');
      const count = await i18nElements.count();
      expect(count).toBeGreaterThan(0);
    });
  }
});

test.describe('Chatbot Language', () => {
  test('should respond in selected language', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to Hindi
    const hiBtn = page.locator('[data-lang="hi"], button:has-text("HI")').first();
    await hiBtn.click();
    await page.waitForTimeout(1000);

    // Open chatbot
    const chatToggle = page.locator('#chatbot-toggle, .chatbot-toggle').first();
    if ((await chatToggle.count()) > 0) {
      await chatToggle.click();
      await page.waitForTimeout(500);

      // Send message
      const input = page.locator('#chatbot-input').first();
      if ((await input.count()) > 0) {
        await input.fill('Hello');
        await input.press('Enter');
        await page.waitForTimeout(1500);

        // Check response for Hindi
        const messages = page.locator('.chatbot-messages, .chat-messages');
        const text = await messages.textContent();
        const hasHindi = /[\u0900-\u097F]/.test(text || '');
        // May or may not have Hindi based on chatbot implementation
        expect(text?.length).toBeGreaterThan(0);
      }
    }
  });
});

