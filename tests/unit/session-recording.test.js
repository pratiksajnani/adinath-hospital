/**
 * Session Recording Unit Tests
 * Tests session capture, privacy, and configuration
 */

// Mock window and document
global.window = {
  location: { hostname: 'adinathhealth.com', pathname: '/' },
  LogRocket: null,
};

global.document = {
  addEventListener: jest.fn(),
  createElement: jest.fn(() => ({
    async: true,
    src: '',
    onload: null,
    onerror: null,
  })),
  head: {
    appendChild: jest.fn((script) => {
      if (script.onload) script.onload();
    }),
  },
};

global.navigator = {
  userAgent: 'Mozilla/5.0 Test Browser',
};

const SessionRecording = require('../../js/session-recording.js');

describe('SessionRecording', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    SessionRecording.enabled = false;
    SessionRecording.appId = null;
    window.LogRocket = null;
  });

  describe('Module Structure', () => {
    test('should export SessionRecording object', () => {
      expect(SessionRecording).toBeDefined();
      expect(typeof SessionRecording).toBe('object');
    });

    test('should have init method', () => {
      expect(typeof SessionRecording.init).toBe('function');
    });

    test('should have identifyUser method', () => {
      expect(typeof SessionRecording.identifyUser).toBe('function');
    });

    test('should have track method', () => {
      expect(typeof SessionRecording.track).toBe('function');
    });

    test('should have enabled property', () => {
      expect(SessionRecording).toHaveProperty('enabled');
    });

    test('should have appId property', () => {
      expect(SessionRecording).toHaveProperty('appId');
    });
  });

  describe('init()', () => {
    test('should not initialize without appId', () => {
      SessionRecording.init();
      expect(SessionRecording.enabled).toBe(false);
    });

    test('should not throw when called without appId', () => {
      expect(() => SessionRecording.init()).not.toThrow();
    });

    test('should set appId when provided', () => {
      SessionRecording.init('test-app-id');
      expect(SessionRecording.appId).toBe('test-app-id');
    });
  });

  describe('identifyUser()', () => {
    test('should not throw when not initialized', () => {
      expect(() => SessionRecording.identifyUser()).not.toThrow();
    });
  });

  describe('track()', () => {
    test('should not throw when not initialized', () => {
      expect(() => SessionRecording.track('test_event')).not.toThrow();
    });

    test('should accept event name and data', () => {
      expect(() =>
        SessionRecording.track('button_click', { buttonId: 'submit' })
      ).not.toThrow();
    });
  });

  describe('Privacy', () => {
    test('should have configurePrivacy method', () => {
      expect(typeof SessionRecording.configurePrivacy).toBe('function');
    });

    test('configurePrivacy should not throw when not initialized', () => {
      expect(() => SessionRecording.configurePrivacy()).not.toThrow();
    });
  });

  describe('getVersion()', () => {
    test('should be a function', () => {
      expect(typeof SessionRecording.getVersion).toBe('function');
    });

    test('should return a string', () => {
      expect(typeof SessionRecording.getVersion()).toBe('string');
    });

    test('should return version number', () => {
      const version = SessionRecording.getVersion();
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});
