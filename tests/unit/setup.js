/**
 * Jest Setup File
 * Global mocks and setup for unit and integration tests
 */

// Create separate storage instances
const createStorageMock = () => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i) => Object.keys(store)[i] || null,
  };
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock location methods for jsdom - don't replace the object, just the methods
// In Jest 30+ with jsdom, window.location cannot be deleted or redefined
const mockLocationMethods = () => {
  if (typeof window !== 'undefined' && window.location) {
    // Mock navigation methods to prevent actual navigation
    window.location.assign = jest.fn();
    window.location.replace = jest.fn();
    window.location.reload = jest.fn();
  }
};

// Create a location mock for tests that need it
const createLocationMock = () => ({
  _href: 'http://localhost/',
  hostname: 'localhost',
  pathname: '/',
  origin: 'http://localhost',
  protocol: 'http:',
  host: 'localhost',
  search: '',
  hash: '',
  get href() {
    return this._href;
  },
  set href(value) {
    this._href = value;
  },
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
});

// Export for use in test files
global.createLocationMock = createLocationMock;

// Apply mock methods
mockLocationMethods();

// Mock window object for non-jsdom contexts
if (typeof global.window === 'undefined') {
  global.window = {
    location: createLocationMock(),
  };
}

Object.assign(global.window, {
  open: jest.fn(),
  alert: jest.fn(),
  confirm: jest.fn(() => true),
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onerror: null,
  onunhandledrejection: null,
});

// Set location on global for compatibility (works in non-jsdom)
if (typeof global.location === 'undefined') {
  global.location = createLocationMock();
}

// Mock document object
global.document = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  createElement: jest.fn(() => ({
    style: {},
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn(() => false),
    },
    addEventListener: jest.fn(),
    appendChild: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    querySelector: jest.fn(() => null),
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    innerHTML: '',
    textContent: '',
    value: '',
    focus: jest.fn(),
    remove: jest.fn(),
    async: false,
    src: '',
    onload: null,
    onerror: null,
  })),
  body: {
    appendChild: jest.fn(),
    insertAdjacentHTML: jest.fn(),
  },
  head: {
    appendChild: jest.fn(),
  },
  getElementById: jest.fn(() => null),
  querySelector: jest.fn(() => null),
  querySelectorAll: jest.fn(() => []),
  referrer: '',
};

// Mock navigator
global.navigator = {
  userAgent: 'Mozilla/5.0 Test Browser',
  language: 'en-US',
  onLine: true,
};

// Mock performance
global.performance = {
  now: jest.fn(() => Date.now()),
  timing: {
    navigationStart: Date.now() - 1000,
    responseStart: Date.now() - 800,
    responseEnd: Date.now() - 700,
    domContentLoadedEventEnd: Date.now() - 500,
    loadEventEnd: Date.now() - 100,
    domInteractive: Date.now() - 600,
  },
  getEntriesByType: jest.fn(() => []),
};

// Mock crypto
global.crypto = {
  getRandomValues: jest.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
  randomUUID: jest.fn(
    () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      })
  ),
};

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Mock alert, confirm, prompt
global.alert = jest.fn();
global.confirm = jest.fn(() => true);
global.prompt = jest.fn(() => '');

// Mock Blob
global.Blob = class Blob {
  constructor(content, options) {
    this.content = content;
    this.options = options;
    this.size = content.reduce((acc, val) => acc + val.length, 0);
    this.type = options?.type || '';
  }
};

// Mock URL
global.URL = {
  createObjectURL: jest.fn(() => 'blob:mock-url'),
  revokeObjectURL: jest.fn(),
};

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock MutationObserver
global.MutationObserver = class MutationObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock console methods for cleaner test output
const originalConsole = { ...console };
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Reset mocks before each test
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  jest.clearAllMocks();
  global.fetch.mockClear();
});

// Clean up after all tests
afterAll(() => {
  jest.restoreAllMocks();
});
