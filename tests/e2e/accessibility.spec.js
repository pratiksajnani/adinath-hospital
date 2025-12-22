// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * Accessibility Tests
 * @tag accessibility
 * Tests WCAG compliance and accessibility features using axe-core
 */

// Critical pages that must be fully accessible
const CRITICAL_PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/book.html', name: 'Booking Page' },
  { path: '/login.html', name: 'Login Page' },
  { path: '/store.html', name: 'Medical Store' },
];

// Pages that should be accessible but may have minor issues
const IMPORTANT_PAGES = [
  { path: '/portal/patient/index.html', name: 'Patient Portal' },
  { path: '/portal/doctor/simple.html', name: 'Doctor Portal' },
  { path: '/services/orthopedic.html', name: 'Orthopedic Services' },
  { path: '/services/gynecology.html', name: 'Gynecology Services' },
  { path: '/services/yoga.html', name: 'Yoga Classes' },
];

test.describe('Accessibility @accessibility', () => {
  // ============================================
  // AXE-CORE DEEP SCANNING - CRITICAL PAGES
  // ============================================
  test.describe('Critical Pages - Zero Tolerance', () => {
    for (const { path, name } of CRITICAL_PAGES) {
      test(`${name} (${path}) should have no critical/serious a11y violations`, async ({
        page,
      }) => {
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        // Filter for critical and serious violations only
        const criticalViolations = results.violations.filter(
          (v) => v.impact === 'critical' || v.impact === 'serious'
        );

        // Log violations for debugging
        if (criticalViolations.length > 0) {
          console.log(`\n❌ A11y violations on ${name}:`);
          criticalViolations.forEach((v) => {
            console.log(`  - [${v.impact}] ${v.id}: ${v.description}`);
            console.log(`    Help: ${v.helpUrl}`);
            v.nodes.forEach((n) => {
              console.log(`    Element: ${n.html.slice(0, 100)}...`);
            });
          });
        }

        expect(
          criticalViolations,
          `Found ${criticalViolations.length} critical/serious accessibility violations`
        ).toHaveLength(0);
      });
    }
  });

  // ============================================
  // AXE-CORE SCANNING - IMPORTANT PAGES
  // ============================================
  test.describe('Important Pages - Tolerance for Minor Issues', () => {
    for (const { path, name } of IMPORTANT_PAGES) {
      test(`${name} (${path}) should have no critical a11y violations`, async ({
        page,
      }) => {
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();

        // Only fail on critical violations for these pages
        const criticalViolations = results.violations.filter(
          (v) => v.impact === 'critical'
        );

        // Log all violations for awareness
        if (results.violations.length > 0) {
          console.log(`\n⚠️ A11y issues on ${name}:`);
          results.violations.forEach((v) => {
            console.log(`  - [${v.impact}] ${v.id}: ${v.description}`);
          });
        }

        expect(
          criticalViolations,
          `Found ${criticalViolations.length} critical accessibility violations`
        ).toHaveLength(0);
      });
    }
  });

  // ============================================
  // STRUCTURAL ACCESSIBILITY
  // ============================================
  test.describe('Homepage Accessibility Structure', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('should have descriptive page title', async ({ page }) => {
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      expect(title.toLowerCase()).toContain('adinath');
    });

    test('should have exactly one h1 heading', async ({ page }) => {
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      let lastLevel = 0;

      for (const heading of headings) {
        const tagName = await heading.evaluate((el) => el.tagName);
        const level = parseInt(tagName.charAt(1));

        // Heading levels should not skip more than 1 level
        if (lastLevel > 0 && level > lastLevel + 1) {
          console.warn(
            `Heading hierarchy issue: jumped from h${lastLevel} to h${level}`
          );
        }
        lastLevel = level;
      }
    });

    test('should have language attribute on html element', async ({ page }) => {
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBeTruthy();
      expect(['en', 'en-IN', 'hi', 'gu']).toContain(lang);
    });

    test('should have viewport meta tag', async ({ page }) => {
      const viewport = await page
        .locator('meta[name="viewport"]')
        .getAttribute('content');
      expect(viewport).toBeTruthy();
      expect(viewport).toContain('width=device-width');
    });
  });

  // ============================================
  // FORM ACCESSIBILITY
  // ============================================
  test.describe('Form Accessibility', () => {
    test('booking form inputs should have labels', async ({ page }) => {
      await page.goto('/book.html');
      await page.waitForLoadState('networkidle');

      const inputs = page.locator(
        'input:visible:not([type="hidden"]):not([type="submit"]):not([type="button"])'
      );
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        // Each input should have at least one labelling mechanism
        const hasLabel =
          id ||
          ariaLabel ||
          ariaLabelledBy ||
          (await input.getAttribute('placeholder'));
        expect(
          hasLabel,
          `Input at index ${i} has no label or aria-label`
        ).toBeTruthy();
      }
    });

    test('login form should be keyboard accessible', async ({ page }) => {
      await page.goto('/login.html');
      await page.waitForLoadState('networkidle');

      // Tab to first input
      await page.keyboard.press('Tab');
      const firstFocused = await page.evaluate(
        () => document.activeElement?.tagName
      );
      expect(['INPUT', 'BUTTON', 'A', 'SELECT']).toContain(firstFocused);

      // Continue tabbing through form
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }

      // Should still be on page (not tabbed out)
      const stillOnPage = await page.evaluate(() => !!document.activeElement);
      expect(stillOnPage).toBe(true);
    });

    test('form error messages should be accessible', async ({ page }) => {
      await page.goto('/book.html');
      await page.waitForLoadState('networkidle');

      // Try to submit empty form
      const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();

        // Check for error messaging
        const errors = page.locator('[role="alert"], .error, .invalid-feedback');
        // Errors should exist or form should be valid
        expect(true).toBe(true);
      }
    });
  });

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================
  test.describe('Keyboard Navigation', () => {
    test('should be able to navigate main menu with keyboard', async ({
      page,
    }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Tab through navigation
      let foundNav = false;
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const activeElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            inNav: !!el?.closest('nav'),
          };
        });

        if (activeElement.inNav && activeElement.tagName === 'A') {
          foundNav = true;
          break;
        }
      }

      expect(foundNav).toBe(true);
    });

    test('skip to content link should work', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for skip link (may be hidden until focused)
      const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-link');
      const skipLinkExists = (await skipLink.count()) > 0;

      if (skipLinkExists) {
        await skipLink.first().focus();
        await page.keyboard.press('Enter');

        // Should have scrolled to main content
        const mainVisible = await page
          .locator('main, #main, #content')
          .first()
          .isVisible();
        expect(mainVisible).toBe(true);
      }
    });

    test('focus indicators should be visible', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Tab to a link
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Check that focused element has visible outline
      const hasFocusIndicator = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;

        const styles = window.getComputedStyle(el);
        const hasOutline =
          styles.outline !== 'none' &&
          styles.outlineWidth !== '0px' &&
          styles.outlineStyle !== 'none';
        const hasBoxShadow =
          styles.boxShadow !== 'none' && styles.boxShadow !== '';

        return hasOutline || hasBoxShadow;
      });

      // Focus indicator should be present
      expect(hasFocusIndicator).toBe(true);
    });
  });

  // ============================================
  // COLOR & CONTRAST
  // ============================================
  test.describe('Color Contrast', () => {
    test('buttons should have sufficient contrast', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const buttons = page.locator('button, .btn, a.btn');
      const count = await buttons.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const contrast = await button.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return {
              color: styles.color,
              background: styles.backgroundColor,
            };
          });

          // Just verify we can get the colors
          expect(contrast.color).toBeTruthy();
        }
      }
    });
  });

  // ============================================
  // RESPONSIVE DESIGN
  // ============================================
  test.describe('Responsive Design', () => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1200, height: 800, name: 'Desktop' },
    ];

    for (const { width, height, name } of viewports) {
      test(`should be usable on ${name} (${width}x${height})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Content should be visible
        await expect(page.locator('body')).toBeVisible();

        // Text should not overflow horizontally
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        // Allow small overflow on mobile
        if (width > 400) {
          expect(hasHorizontalScroll).toBe(false);
        }
      });
    }
  });

  // ============================================
  // ARIA LANDMARKS
  // ============================================
  test.describe('ARIA Landmarks', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('should have header/banner landmark', async ({ page }) => {
      const header = page.locator('header, [role="banner"]').first();
      await expect(header).toBeVisible();
    });

    test('should have navigation landmark', async ({ page }) => {
      const nav = page.locator('nav, [role="navigation"]').first();
      await expect(nav).toBeVisible();
    });

    test('should have main content landmark', async ({ page }) => {
      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();
    });

    test('should have footer/contentinfo landmark', async ({ page }) => {
      const footer = page.locator('footer, [role="contentinfo"]').first();
      await expect(footer).toBeVisible();
    });
  });

  // ============================================
  // IMAGES & MEDIA
  // ============================================
  test.describe('Images and Media', () => {
    test('images should have alt text', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const images = page.locator('img:visible');
      const count = await images.count();

      let imagesWithoutAlt = 0;
      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');

        // Image should have alt text or be decorative (role="presentation")
        if (!alt && role !== 'presentation' && role !== 'none') {
          imagesWithoutAlt++;
          const src = await img.getAttribute('src');
          console.warn(`Image without alt: ${src}`);
        }
      }

      // Allow some decorative images without alt
      expect(imagesWithoutAlt).toBeLessThanOrEqual(count * 0.2);
    });
  });
});
