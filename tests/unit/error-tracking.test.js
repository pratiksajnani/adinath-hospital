/**
 * Error Tracking Unit Tests
 * Tests error capture, breadcrumbs, and reporting
 */

// Mock window and document
global.window = {
  location: { href: 'https://test.com/page', pathname: '/page' },
  innerWidth: 1024,
  innerHeight: 768,
  onerror: null,
  onunhandledrejection: null,
  Sentry: null,
};

global.document = {
  referrer: 'https://google.com',
  addEventListener: jest.fn(),
};

global.navigator = {
  userAgent: 'Mozilla/5.0 Test Browser',
  language: 'en-US',
  onLine: true,
};

global.performance = {
  now: jest.fn(() => Date.now()),
};

const ErrorTracking = require('../../js/error-tracking.js');

describe('ErrorTracking', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
    ErrorTracking.dsn = null;
    ErrorTracking.enabled = false;
    ErrorTracking.queue = [];
  });

  describe('init()', () => {
    test('should initialize with DSN', () => {
      ErrorTracking.init({ dsn: 'https://test@sentry.io/123' });

      expect(ErrorTracking.dsn).toBe('https://test@sentry.io/123');
      expect(ErrorTracking.enabled).toBe(true);
    });

    test('should not enable if no DSN provided', () => {
      ErrorTracking.init({});

      expect(ErrorTracking.enabled).toBe(false);
    });

    test('should set up global error handler', () => {
      ErrorTracking.init({ dsn: 'https://test@sentry.io/123' });

      expect(window.onerror).toBeDefined();
      expect(typeof window.onerror).toBe('function');
    });

    test('should set up unhandled rejection handler', () => {
      ErrorTracking.init({ dsn: 'https://test@sentry.io/123' });

      expect(window.onunhandledrejection).toBeDefined();
      expect(typeof window.onunhandledrejection).toBe('function');
    });

    test('should respect sample rate', () => {
      ErrorTracking.init({ dsn: 'https://test@sentry.io/123', sampleRate: 0.5 });

      expect(ErrorTracking.sampleRate).toBe(0.5);
    });
  });

  describe('captureException()', () => {
    beforeEach(() => {
      ErrorTracking.init({ dsn: 'https://test@sentry.io/123' });
    });

    test('should add error to queue', () => {
      const error = new Error('Test error');

      ErrorTracking.captureException(error);

      expect(ErrorTracking.queue.length).toBeGreaterThan(0);
    });

    test('should include error message in payload', () => {
      const error = new Error('Test error message');

      ErrorTracking.captureException(error);

      const payload = ErrorTracking.queue[0];
      expect(payload.message).toBe('Test error message');
    });

    test('should include stack trace', () => {
      const error = new Error('Test error');

      ErrorTracking.captureException(error);

      const payload = ErrorTracking.queue[0];
      expect(payload.stack).toBeDefined();
    });

    test('should include context', () => {
      const error = new Error('Test error');

      ErrorTracking.captureException(error, { custom: 'data' });

      const payload = ErrorTracking.queue[0];
      expect(payload.context.custom).toBe('data');
    });
  });

  describe('captureMessage()', () => {
    beforeEach(() => {
      ErrorTracking.init({ dsn: 'https://test@sentry.io/123' });
    });

    test('should capture message with level', () => {
      ErrorTracking.captureMessage('Test message', 'warning');

      const payload = ErrorTracking.queue[0];
      expect(payload.message).toBe('Test message');
      expect(payload.level).toBe('warning');
    });

    test('should default to info level', () => {
      ErrorTracking.captureMessage('Test message');

      const payload = ErrorTracking.queue[0];
      expect(payload.level).toBe('info');
    });
  });

  describe('buildPayload()', () => {
    test('should include timestamp', () => {
      const error = new Error('Test');
      const payload = ErrorTracking.buildPayload(error);

      expect(payload.timestamp).toBeDefined();
    });

    test('should include URL', () => {
      const error = new Error('Test');
      const payload = ErrorTracking.buildPayload(error);

      expect(payload.url).toBe('https://test.com/page');
    });

    test('should include user agent', () => {
      const error = new Error('Test');
      const payload = ErrorTracking.buildPayload(error);

      expect(payload.userAgent).toContain('Mozilla');
    });

    test('should include screen size', () => {
      const error = new Error('Test');
      const payload = ErrorTracking.buildPayload(error);

      expect(payload.screenSize).toBe('1024x768');
    });

    test('should include online status', () => {
      const error = new Error('Test');
      const payload = ErrorTracking.buildPayload(error);

      expect(payload.online).toBe(true);
    });
  });

  describe('getUser()', () => {
    test('should return anonymous for guests', () => {
      const user = ErrorTracking.getUser();

      expect(user.anonymous).toBe(true);
    });

    test('should anonymize patient data', () => {
      localStorage.setItem('hms_logged_in', 'true');
      localStorage.setItem('hms_role', 'patient');

      const user = ErrorTracking.getUser();

      expect(user.role).toBe('patient');
      expect(user.anonymous).toBe(true);
    });

    test('should include role for staff', () => {
      localStorage.setItem('hms_logged_in', 'true');
      localStorage.setItem('hms_role', 'doctor');
      localStorage.setItem('hms_user_email', 'doc@test.com');

      const user = ErrorTracking.getUser();

      expect(user.role).toBe('doctor');
      expect(user.email).toBe('doc@test.com');
    });
  });

  describe('Breadcrumbs', () => {
    test('addBreadcrumb should store breadcrumb', () => {
      ErrorTracking.addBreadcrumb('test', 'Test message', { key: 'value' });

      const breadcrumbs = ErrorTracking.getBreadcrumbs();

      expect(breadcrumbs.length).toBe(1);
      expect(breadcrumbs[0].category).toBe('test');
      expect(breadcrumbs[0].message).toBe('Test message');
    });

    test('should limit breadcrumbs to 20', () => {
      for (let i = 0; i < 25; i++) {
        ErrorTracking.addBreadcrumb('test', `Message ${i}`);
      }

      const breadcrumbs = ErrorTracking.getBreadcrumbs();

      expect(breadcrumbs.length).toBeLessThanOrEqual(20);
    });

    test('getBreadcrumbs should return last 10 for payload', () => {
      for (let i = 0; i < 15; i++) {
        ErrorTracking.addBreadcrumb('test', `Message ${i}`);
      }

      const breadcrumbs = ErrorTracking.getBreadcrumbs();

      expect(breadcrumbs.length).toBeLessThanOrEqual(10);
    });
  });

  describe('shouldSample()', () => {
    test('should return true when sample rate is 1', () => {
      ErrorTracking.sampleRate = 1.0;

      // Run multiple times to ensure consistency
      for (let i = 0; i < 10; i++) {
        expect(ErrorTracking.shouldSample()).toBe(true);
      }
    });

    test('should return false when sample rate is 0', () => {
      ErrorTracking.sampleRate = 0;

      for (let i = 0; i < 10; i++) {
        expect(ErrorTracking.shouldSample()).toBe(false);
      }
    });
  });

  describe('flush()', () => {
    beforeEach(() => {
      ErrorTracking.init({ dsn: 'https://custom.endpoint/errors' });
    });

    test('should send queued errors', async () => {
      ErrorTracking.captureException(new Error('Test 1'));
      ErrorTracking.captureException(new Error('Test 2'));

      await ErrorTracking.flush();

      expect(fetch).toHaveBeenCalled();
    });

    test('should clear queue after successful flush', async () => {
      ErrorTracking.captureException(new Error('Test'));

      await ErrorTracking.flush();

      // Queue should be cleared (it gets cleared before fetch in the implementation)
      expect(ErrorTracking.queue.length).toBe(0);
    });

    test('should not call fetch if queue is empty', async () => {
      await ErrorTracking.flush();

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('trackEvent()', () => {
    test('should add event as breadcrumb', () => {
      ErrorTracking.trackEvent('button_click', { button: 'submit' });

      const breadcrumbs = ErrorTracking.getBreadcrumbs();

      expect(breadcrumbs[0].category).toBe('event');
      expect(breadcrumbs[0].message).toBe('button_click');
    });

    test('should capture critical events as messages', () => {
      ErrorTracking.init({ dsn: 'https://test@sentry.io/123' });

      ErrorTracking.trackEvent('payment_failed', { critical: true });

      expect(ErrorTracking.queue.length).toBeGreaterThan(0);
    });
  });

  describe('wrap()', () => {
    test('should return a wrapped function', () => {
      const fn = () => 'result';
      const wrapped = ErrorTracking.wrap(fn);

      expect(typeof wrapped).toBe('function');
    });

    test('wrapped function should return same result', () => {
      const fn = (x) => x * 2;
      const wrapped = ErrorTracking.wrap(fn);

      expect(wrapped(5)).toBe(10);
    });

    test('wrapped function should capture exceptions', () => {
      ErrorTracking.init({ dsn: 'https://test@sentry.io/123' });

      const fn = () => {
        throw new Error('Test error');
      };
      const wrapped = ErrorTracking.wrap(fn);

      expect(() => wrapped()).toThrow('Test error');
      expect(ErrorTracking.queue.length).toBeGreaterThan(0);
    });
  });

  describe('startSpan()', () => {
    test('should return span object', () => {
      const span = ErrorTracking.startSpan('test-operation');

      expect(span).toBeDefined();
      expect(span.name).toBe('test-operation');
      expect(typeof span.end).toBe('function');
    });

    test('span.end() should add breadcrumb', () => {
      const span = ErrorTracking.startSpan('test-operation');

      span.end();

      const breadcrumbs = ErrorTracking.getBreadcrumbs();
      expect(breadcrumbs[0].category).toBe('performance');
      expect(breadcrumbs[0].message).toBe('test-operation');
    });
  });

  describe('Queue Management', () => {
    beforeEach(() => {
      ErrorTracking.init({ dsn: 'https://test@sentry.io/123' });
    });

    test('should limit queue size', () => {
      for (let i = 0; i < 100; i++) {
        ErrorTracking.captureException(new Error(`Error ${i}`));
      }

      expect(ErrorTracking.queue.length).toBeLessThanOrEqual(
        ErrorTracking.maxQueueSize
      );
    });
  });
});

