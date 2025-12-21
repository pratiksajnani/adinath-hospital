// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Medical Store Tests
 * Tests the pharmacy/store functionality
 */
test.describe('Medical Store', () => {

  test.describe('Public Store Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/store.html');
    });

    test('should load store page', async ({ page }) => {
      await expect(page).toHaveTitle(/Store|Pharmacy|Medicine|Adinath/i);
    });

    test('should display store information', async ({ page }) => {
      const storeInfo = page.locator('text=/medicine|pharmacy|store/i');
      await expect(storeInfo.first()).toBeVisible();
    });

    test('should have WhatsApp ordering option', async ({ page }) => {
      const whatsappOrder = page.locator('text=/whatsapp|order/i');
      await expect(whatsappOrder.first()).toBeVisible();
    });
  });

  test.describe('Store Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/store/index.html');
    });

    test('should load store dashboard', async ({ page }) => {
      await expect(page).toHaveTitle(/Store|Dashboard|Adinath/i);
    });

    test('should display inventory section', async ({ page }) => {
      const inventorySection = page.locator('text=/inventory|stock|medicine/i');
      await expect(inventorySection.first()).toBeVisible();
    });

    test('should have sales tracking', async ({ page }) => {
      const salesSection = page.locator('text=/sale|billing|payment/i');
      await expect(salesSection.first()).toBeVisible();
    });

    test('should display patient queue', async ({ page }) => {
      const queueSection = page.locator('text=/queue|waiting|patient/i');
      await expect(queueSection.first()).toBeVisible();
    });

    test('should have print queue functionality', async ({ page }) => {
      const printSection = page.locator('text=/print|prescription/i');
      await expect(printSection.first()).toBeVisible();
    });
  });

  test.describe('Inventory Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/store/index.html');
    });

    test('should be able to add new medicine', async ({ page }) => {
      // Look for add button or form
      const addButton = page.getByRole('button', { name: /add|new|create/i });
      const hasAddFunction = await addButton.count() > 0;
      expect(hasAddFunction).toBeTruthy();
    });

    test('should display medicine list', async ({ page }) => {
      // Should show some inventory items or empty state
      const inventoryList = page.locator('table, .inventory-list, .medicine-list, .card');
      await expect(inventoryList.first()).toBeVisible();
    });

    test('should show stock levels', async ({ page }) => {
      const stockInfo = page.locator('text=/stock|quantity|available/i');
      await expect(stockInfo.first()).toBeVisible();
    });
  });

  test.describe('Sales Processing', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/store/index.html');
    });

    test('should have billing form', async ({ page }) => {
      const billingSection = page.locator('text=/bill|sale|payment/i');
      await expect(billingSection.first()).toBeVisible();
    });

    test('should support cash payment', async ({ page }) => {
      const cashOption = page.locator('text=/cash/i');
      const hasCashOption = await cashOption.count() > 0;
      expect(hasCashOption).toBeTruthy();
    });
  });
});

