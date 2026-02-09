/**
 * Jest Configuration for Unit and Integration Tests
 * Tests JavaScript modules (HMS, i18n, chatbot, circuit-breaker, etc.)
 */
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.worktrees/'],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/config.js', // Configuration file
  ],
  coverageDirectory: 'test-results/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
  moduleFileExtensions: ['js'],
  verbose: true,
  testTimeout: 15000,
  // Mock modules that don't exist or need special handling
  moduleNameMapper: {
    '^../../js/(.*)$': '<rootDir>/js/$1',
  },
  // Transform settings
  transform: {},
  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
