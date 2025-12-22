/**
 * Session Recording Unit Tests
 * Tests session capture, privacy, and user tracking
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
    SessionRecording.initialized = false;
    SessionRecording.appId = null;
    window.LogRocket = null;
  });

  describe('init()', () => {
    test('should not initialize without appId', () => {
      SessionRecording.init();

      expect(SessionRecording.initialized).toBe(false);
    });

    test('should not initialize in development', () => {
      global.window.location.hostname = 'localhost';

      SessionRecording.init('test-app/id');

      expect(SessionRecording.initialized).toBe(false);

      global.window.location.hostname = 'adinathhealth.com';
    });

    test('should not initialize for bots', () => {
      global.navigator.userAgent =
        'Googlebot/2.1 (+http://www.google.com/bot.html)';

      SessionRecording.init('test-app/id');

      expect(SessionRecording.initialized).toBe(false);

      global.navigator.userAgent = 'Mozilla/5.0 Test Browser';
    });

    test('should set appId when initialized', () => {
      // Mock LogRocket loading
      window.LogRocket = {
        init: jest.fn(),
        identify: jest.fn(),
        track: jest.fn(),
        redact: jest.fn(),
      };

      SessionRecording.init('test-app/project');

      expect(SessionRecording.appId).toBe('test-app/project');
    });
  });

  describe('isBot()', () => {
    test('should detect Googlebot', () => {
      global.navigator.userAgent =
        'Googlebot/2.1 (+http://www.google.com/bot.html)';

      expect(SessionRecording.isBot()).toBe(true);

      global.navigator.userAgent = 'Mozilla/5.0 Test Browser';
    });

    test('should detect bingbot', () => {
      global.navigator.userAgent = 'Mozilla/5.0 (compatible; bingbot/2.0)';

      expect(SessionRecording.isBot()).toBe(true);

      global.navigator.userAgent = 'Mozilla/5.0 Test Browser';
    });

    test('should detect headless browsers', () => {
      global.navigator.userAgent = 'HeadlessChrome/90.0.4430.0';

      expect(SessionRecording.isBot()).toBe(true);

      global.navigator.userAgent = 'Mozilla/5.0 Test Browser';
    });

    test('should return false for normal browser', () => {
      global.navigator.userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124';

      expect(SessionRecording.isBot()).toBe(false);

      global.navigator.userAgent = 'Mozilla/5.0 Test Browser';
    });
  });

  describe('isLocalDevelopment()', () => {
    test('should return true for localhost', () => {
      global.window.location.hostname = 'localhost';

      expect(SessionRecording.isLocalDevelopment()).toBe(true);

      global.window.location.hostname = 'adinathhealth.com';
    });

    test('should return true for 127.0.0.1', () => {
      global.window.location.hostname = '127.0.0.1';

      expect(SessionRecording.isLocalDevelopment()).toBe(true);

      global.window.location.hostname = 'adinathhealth.com';
    });

    test('should return false for production domain', () => {
      global.window.location.hostname = 'adinathhealth.com';

      expect(SessionRecording.isLocalDevelopment()).toBe(false);
    });
  });

  describe('identify()', () => {
    beforeEach(() => {
      window.LogRocket = {
        init: jest.fn(),
        identify: jest.fn(),
        track: jest.fn(),
      };
      SessionRecording.initialized = true;
    });

    test('should not identify if not initialized', () => {
      SessionRecording.initialized = false;

      SessionRecording.identify('user123', { role: 'doctor' });

      expect(window.LogRocket.identify).not.toHaveBeenCalled();
    });

    test('should identify staff users', () => {
      SessionRecording.identify('doc@test.com', {
        role: 'doctor',
        name: 'Dr. Test',
      });

      expect(window.LogRocket.identify).toHaveBeenCalledWith('doc@test.com', {
        role: 'doctor',
        name: 'Dr. Test',
      });
    });

    test('should anonymize patient data', () => {
      SessionRecording.identify('patient@test.com', {
        role: 'patient',
        name: 'John Doe',
      });

      // For patients, should use anonymized ID
      const call = window.LogRocket.identify.mock.calls[0];
      expect(call[0]).not.toBe('patient@test.com');
      expect(call[1].role).toBe('patient');
    });
  });

  describe('track()', () => {
    beforeEach(() => {
      window.LogRocket = {
        init: jest.fn(),
        identify: jest.fn(),
        track: jest.fn(),
      };
      SessionRecording.initialized = true;
    });

    test('should not track if not initialized', () => {
      SessionRecording.initialized = false;

      SessionRecording.track('button_click', { button: 'submit' });

      expect(window.LogRocket.track).not.toHaveBeenCalled();
    });

    test('should track event', () => {
      SessionRecording.track('appointment_booked', {
        doctor: 'Dr. Ashok',
        date: '2025-01-15',
      });

      expect(window.LogRocket.track).toHaveBeenCalledWith('appointment_booked', {
        doctor: 'Dr. Ashok',
        date: '2025-01-15',
      });
    });

    test('should sanitize sensitive data', () => {
      SessionRecording.track('form_submitted', {
        phone: '+919925450425',
        name: 'Test Patient',
      });

      const call = window.LogRocket.track.mock.calls[0];
      // Phone should be redacted or sanitized
      expect(call[1].phone).not.toBe('+919925450425');
    });
  });

  describe('redactSensitiveData()', () => {
    test('should redact phone numbers', () => {
      const data = { phone: '+919925450425' };

      const result = SessionRecording.redactSensitiveData(data);

      expect(result.phone).not.toBe('+919925450425');
      expect(result.phone).toContain('***');
    });

    test('should redact email partially', () => {
      const data = { email: 'test@example.com' };

      const result = SessionRecording.redactSensitiveData(data);

      expect(result.email).not.toBe('test@example.com');
    });

    test('should redact address', () => {
      const data = { address: '123 Main Street, City' };

      const result = SessionRecording.redactSensitiveData(data);

      expect(result.address).toBe('[REDACTED]');
    });

    test('should redact medical info', () => {
      const data = { diagnosis: 'Knee pain', symptoms: 'Joint swelling' };

      const result = SessionRecording.redactSensitiveData(data);

      expect(result.diagnosis).toBe('[REDACTED]');
      expect(result.symptoms).toBe('[REDACTED]');
    });

    test('should not modify non-sensitive data', () => {
      const data = { page: '/book.html', language: 'en' };

      const result = SessionRecording.redactSensitiveData(data);

      expect(result.page).toBe('/book.html');
      expect(result.language).toBe('en');
    });
  });

  describe('getAnonymousId()', () => {
    test('should generate consistent ID', () => {
      const id1 = SessionRecording.getAnonymousId();
      const id2 = SessionRecording.getAnonymousId();

      expect(id1).toBe(id2);
    });

    test('should generate new ID if not stored', () => {
      sessionStorage.clear();
      localStorage.clear();

      const id = SessionRecording.getAnonymousId();

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    test('should use session storage', () => {
      const id = SessionRecording.getAnonymousId();

      expect(sessionStorage.getItem('anonymous_session_id')).toBe(id);
    });
  });

  describe('capturePageView()', () => {
    beforeEach(() => {
      window.LogRocket = {
        init: jest.fn(),
        identify: jest.fn(),
        track: jest.fn(),
      };
      SessionRecording.initialized = true;
    });

    test('should track page view', () => {
      SessionRecording.capturePageView('/book.html');

      expect(window.LogRocket.track).toHaveBeenCalledWith(
        'page_view',
        expect.objectContaining({
          path: '/book.html',
        })
      );
    });

    test('should include referrer', () => {
      global.document.referrer = 'https://google.com';

      SessionRecording.capturePageView('/book.html');

      const call = window.LogRocket.track.mock.calls[0];
      expect(call[1].referrer).toBeDefined();
    });
  });

  describe('captureAction()', () => {
    beforeEach(() => {
      window.LogRocket = {
        init: jest.fn(),
        identify: jest.fn(),
        track: jest.fn(),
      };
      SessionRecording.initialized = true;
    });

    test('should track user action', () => {
      SessionRecording.captureAction('click', 'book_button');

      expect(window.LogRocket.track).toHaveBeenCalledWith(
        'user_action',
        expect.objectContaining({
          type: 'click',
          element: 'book_button',
        })
      );
    });
  });

  describe('captureError()', () => {
    beforeEach(() => {
      window.LogRocket = {
        init: jest.fn(),
        identify: jest.fn(),
        track: jest.fn(),
        captureException: jest.fn(),
      };
      SessionRecording.initialized = true;
    });

    test('should capture error', () => {
      const error = new Error('Test error');

      SessionRecording.captureError(error);

      expect(window.LogRocket.captureException).toHaveBeenCalledWith(error);
    });
  });

  describe('setUserContext()', () => {
    beforeEach(() => {
      window.LogRocket = {
        init: jest.fn(),
        identify: jest.fn(),
        track: jest.fn(),
        getSessionURL: jest.fn(() => 'https://logrocket.com/session/123'),
      };
      SessionRecording.initialized = true;
    });

    test('should set user context from localStorage', () => {
      localStorage.setItem('hms_logged_in', 'true');
      localStorage.setItem('hms_role', 'doctor');
      localStorage.setItem('hms_user_email', 'doc@test.com');

      SessionRecording.setUserContext();

      expect(window.LogRocket.identify).toHaveBeenCalled();
    });

    test('should use anonymous ID for guests', () => {
      localStorage.clear();

      SessionRecording.setUserContext();

      const call = window.LogRocket.identify.mock.calls[0];
      expect(call[1].role).toBe('guest');
    });
  });

  describe('getSessionURL()', () => {
    test('should return null if not initialized', () => {
      SessionRecording.initialized = false;

      const url = SessionRecording.getSessionURL();

      expect(url).toBeNull();
    });

    test('should return session URL if available', () => {
      window.LogRocket = {
        getSessionURL: jest.fn(() => 'https://logrocket.com/session/abc123'),
      };
      SessionRecording.initialized = true;

      const url = SessionRecording.getSessionURL();

      expect(url).toBe('https://logrocket.com/session/abc123');
    });
  });

  describe('Privacy Compliance', () => {
    test('should respect do-not-track', () => {
      global.navigator.doNotTrack = '1';

      SessionRecording.init('test-app/id');

      expect(SessionRecording.initialized).toBe(false);

      delete global.navigator.doNotTrack;
    });

    test('should respect opt-out preference', () => {
      localStorage.setItem('session_recording_opted_out', 'true');

      SessionRecording.init('test-app/id');

      expect(SessionRecording.initialized).toBe(false);
    });
  });

  describe('optOut() and optIn()', () => {
    test('should opt out and set preference', () => {
      SessionRecording.optOut();

      expect(localStorage.getItem('session_recording_opted_out')).toBe('true');
    });

    test('should opt in and clear preference', () => {
      localStorage.setItem('session_recording_opted_out', 'true');

      SessionRecording.optIn();

      expect(localStorage.getItem('session_recording_opted_out')).toBeNull();
    });
  });
});

