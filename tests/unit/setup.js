/**
 * Jest Setup File
 * Configures the test environment
 */

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
  get length() {
    return Object.keys(this.store).length;
  },
  key(index) {
    return Object.keys(this.store)[index] || null;
  }
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock console.warn to prevent noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  log: jest.fn(),
};

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

