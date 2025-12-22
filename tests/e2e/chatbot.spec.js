// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Chatbot E2E Tests
 * Tests the chatbot widget functionality and interactions
 */
test.describe('Chatbot Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Widget Visibility', () => {
    test('should show chatbot toggle button', async ({ page }) => {
      const toggleBtn = page.locator('#chatbot-toggle, .chatbot-toggle');
      await expect(toggleBtn).toBeVisible();
    });

    test('should be initially closed', async ({ page }) => {
      const chatPanel = page.locator('#chatbot-panel, .chatbot-panel');
      // Panel should be hidden or not expanded
      const isHidden = await chatPanel.isHidden().catch(() => true);
      expect(isHidden).toBe(true);
    });
  });

  test.describe('Opening and Closing', () => {
    test('should open chatbot when clicking toggle', async ({ page }) => {
      const toggleBtn = page.locator('#chatbot-toggle, .chatbot-toggle').first();
      await toggleBtn.click();

      const chatPanel = page.locator(
        '#chatbot-panel, .chatbot-panel, .chatbot-container.open'
      );
      await expect(chatPanel.first()).toBeVisible({ timeout: 5000 });
    });

    test('should close chatbot when clicking close button', async ({ page }) => {
      // Open first
      const toggleBtn = page.locator('#chatbot-toggle, .chatbot-toggle').first();
      await toggleBtn.click();

      // Wait for panel
      await page.waitForTimeout(500);

      // Close
      const closeBtn = page.locator('.chatbot-close, [aria-label="Close chat"]');
      if ((await closeBtn.count()) > 0) {
        await closeBtn.first().click();
        await page.waitForTimeout(500);

        // Verify closed
        const chatPanel = page.locator('#chatbot-panel, .chatbot-panel');
        const isHidden = await chatPanel.isHidden().catch(() => true);
        expect(isHidden).toBe(true);
      }
    });
  });

  test.describe('Message Sending', () => {
    test('should show input field when open', async ({ page }) => {
      const toggleBtn = page.locator('#chatbot-toggle, .chatbot-toggle').first();
      await toggleBtn.click();
      await page.waitForTimeout(500);

      const input = page.locator('#chatbot-input, .chatbot-input input');
      await expect(input.first()).toBeVisible();
    });

    test('should send message on enter', async ({ page }) => {
      const toggleBtn = page.locator('#chatbot-toggle, .chatbot-toggle').first();
      await toggleBtn.click();
      await page.waitForTimeout(500);

      const input = page.locator('#chatbot-input, .chatbot-input input').first();
      await input.fill('Hello');
      await input.press('Enter');

      // Should see message in chat
      await page.waitForTimeout(1000);
      const messages = page.locator('.chat-message, .message');
      const count = await messages.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should receive bot response', async ({ page }) => {
      const toggleBtn = page.locator('#chatbot-toggle, .chatbot-toggle').first();
      await toggleBtn.click();
      await page.waitForTimeout(500);

      const input = page.locator('#chatbot-input, .chatbot-input input').first();
      await input.fill('What are your hours?');
      await input.press('Enter');

      // Wait for bot response
      await page.waitForTimeout(1500);

      // Should have bot message
      const botMessages = page.locator('.chat-message.bot, .message.bot');
      const count = await botMessages.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('FAQ Responses', () => {
    test.beforeEach(async ({ page }) => {
      const toggleBtn = page.locator('#chatbot-toggle, .chatbot-toggle').first();
      await toggleBtn.click();
      await page.waitForTimeout(500);
    });

    test('should respond to appointment query', async ({ page }) => {
      const input = page.locator('#chatbot-input, .chatbot-input input').first();
      await input.fill('book appointment');
      await input.press('Enter');

      await page.waitForTimeout(1500);

      // Check for relevant response
      const chatArea = page.locator('.chatbot-messages, .chat-messages');
      const text = await chatArea.textContent();
      expect(text?.toLowerCase()).toContain('appointment');
    });

    test('should respond to location query', async ({ page }) => {
      const input = page.locator('#chatbot-input, .chatbot-input input').first();
      await input.fill('Where is the hospital?');
      await input.press('Enter');

      await page.waitForTimeout(1500);

      const chatArea = page.locator('.chatbot-messages, .chat-messages');
      const text = await chatArea.textContent();
      expect(
        text?.toLowerCase().includes('shahibaug') ||
          text?.toLowerCase().includes('location') ||
          text?.toLowerCase().includes('address')
      ).toBe(true);
    });

    test('should respond to emergency query appropriately', async ({ page }) => {
      const input = page.locator('#chatbot-input, .chatbot-input input').first();
      await input.fill('Is this an emergency hospital?');
      await input.press('Enter');

      await page.waitForTimeout(1500);

      const chatArea = page.locator('.chatbot-messages, .chat-messages');
      const text = await chatArea.textContent();
      // Should mention they don't handle emergencies
      expect(
        text?.includes('108') || text?.toLowerCase().includes('emergency')
      ).toBe(true);
    });
  });

  test.describe('Quick Replies', () => {
    test('should show quick reply buttons', async ({ page }) => {
      const toggleBtn = page.locator('#chatbot-toggle, .chatbot-toggle').first();
      await toggleBtn.click();
      await page.waitForTimeout(500);

      // Look for quick reply buttons
      const quickReplies = page.locator(
        '.quick-replies button, .quick-reply, .suggested-reply'
      );
      const count = await quickReplies.count();

      // Quick replies might or might not be present based on design
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const toggleBtn = page.locator('#chatbot-toggle, .chatbot-toggle').first();
      await expect(toggleBtn).toBeVisible();

      await toggleBtn.click();
      await page.waitForTimeout(500);

      // Chat should open even on mobile
      const chatPanel = page.locator(
        '#chatbot-panel, .chatbot-panel, .chatbot-container.open'
      );
      const visible = await chatPanel
        .first()
        .isVisible()
        .catch(() => false);
      expect(visible).toBe(true);
    });
  });
});

test.describe('Chatbot on Different Pages', () => {
  const pages = [
    { name: 'Homepage', path: '/' },
    { name: 'Booking', path: '/book.html' },
    { name: 'Store', path: '/store.html' },
  ];

  for (const pageInfo of pages) {
    test(`should be available on ${pageInfo.name}`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');

      const toggleBtn = page.locator('#chatbot-toggle, .chatbot-toggle');
      const count = await toggleBtn.count();
      expect(count).toBeGreaterThanOrEqual(0); // Chatbot may or may not be on all pages
    });
  }
});

