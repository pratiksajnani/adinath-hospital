/**
 * Jest Configuration for Unit Tests
 * Tests JavaScript modules (HMS, i18n, etc.)
 */
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/unit/**/*.test.js'],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/config.js',
    '!js/supabase-client.js',
  ],
  coverageDirectory: 'test-results/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
  moduleFileExtensions: ['js'],
  verbose: true,
  testTimeout: 10000,
};
