// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Adinath Hospital - Playwright Test Configuration
 * Tests all user flows and pages
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests
  retries: process.env.CI ? 2 : 0,
  
  // Limit workers on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list']
  ],
  
  // Output folder for test artifacts
  outputDir: 'test-results',
  
  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: process.env.TEST_URL || 'https://adinathhealth.com',
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'on-first-retry',
    
    // Default timeout
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Test projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Local dev server (optional)
  // webServer: {
  //   command: 'npx serve -p 8080',
  //   url: 'http://localhost:8080',
  //   reuseExistingServer: !process.env.CI,
  // },
});

