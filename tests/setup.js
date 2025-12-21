// Jest Test Setup
// This file runs before all tests

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.localStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = {
  hostname: 'localhost',
  href: 'http://localhost:8080',
  origin: 'http://localhost:8080',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn()
};

// Mock window.open
window.open = jest.fn();

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  })
);

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Restore console for debugging when needed
global.restoreConsole = () => {
  global.console = originalConsole;
};

// Mock alert and confirm
window.alert = jest.fn();
window.confirm = jest.fn(() => true);
window.prompt = jest.fn();

// Mock QRCode library
global.QRCode = {
  toCanvas: jest.fn((canvas, text, options, callback) => {
    if (callback) callback(null, canvas);
  })
};

// Mock Razorpay
global.Razorpay = jest.fn().mockImplementation(() => ({
  open: jest.fn(),
  on: jest.fn()
}));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.getItem.mockReturnValue(null);
});

// Clean up after all tests
afterAll(() => {
  jest.restoreAllMocks();
});

