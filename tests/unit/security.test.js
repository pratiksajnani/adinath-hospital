/**
 * Security Utilities Unit Tests
 * Tests input validation, HTML escaping, and security logging
 */

const SecurityUtils = require('../../js/security.js');

describe('SecurityUtils.escapeHTML()', () => {
  test('should escape HTML special characters', () => {
    expect(SecurityUtils.escapeHTML('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  test('should escape ampersands', () => {
    expect(SecurityUtils.escapeHTML('A & B')).toBe('A &amp; B');
  });

  test('should escape single quotes', () => {
    expect(SecurityUtils.escapeHTML("it's")).toBe('it&#039;s');
  });

  test('should return empty string for null/undefined', () => {
    expect(SecurityUtils.escapeHTML(null)).toBe('');
    expect(SecurityUtils.escapeHTML(undefined)).toBe('');
    expect(SecurityUtils.escapeHTML('')).toBe('');
  });

  test('should return empty string for non-string input', () => {
    expect(SecurityUtils.escapeHTML(123)).toBe('');
    expect(SecurityUtils.escapeHTML({})).toBe('');
  });

  test('should return safe text unchanged', () => {
    expect(SecurityUtils.escapeHTML('Hello World')).toBe('Hello World');
  });
});

describe('SecurityUtils.validateInput()', () => {
  describe('text validation', () => {
    test('should validate normal text', () => {
      const result = SecurityUtils.validateInput('Hello World');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('Hello World');
    });

    test('should reject empty input', () => {
      expect(SecurityUtils.validateInput('').valid).toBe(false);
      expect(SecurityUtils.validateInput(null).valid).toBe(false);
      expect(SecurityUtils.validateInput(undefined).valid).toBe(false);
    });

    test('should reject non-string input', () => {
      expect(SecurityUtils.validateInput(123).valid).toBe(false);
    });

    test('should reject input over 500 characters', () => {
      const long = 'a'.repeat(501);
      const result = SecurityUtils.validateInput(long);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too long');
    });

    test('should trim whitespace', () => {
      const result = SecurityUtils.validateInput('  hello  ');
      expect(result.valid).toBe(true);
    });

    test('should escape HTML in text input', () => {
      const result = SecurityUtils.validateInput('<b>bold</b>');
      expect(result.valid).toBe(true);
      expect(result.value).not.toContain('<b>');
    });
  });

  describe('email validation', () => {
    test('should accept valid email', () => {
      const result = SecurityUtils.validateInput('test@example.com', 'email');
      expect(result.valid).toBe(true);
    });

    test('should reject invalid email', () => {
      expect(SecurityUtils.validateInput('not-email', 'email').valid).toBe(false);
      expect(SecurityUtils.validateInput('missing@', 'email').valid).toBe(false);
      expect(SecurityUtils.validateInput('@missing.com', 'email').valid).toBe(false);
    });
  });

  describe('phone validation', () => {
    test('should accept valid Indian phone', () => {
      const result = SecurityUtils.validateInput('9925450425', 'phone');
      expect(result.valid).toBe(true);
    });

    test('should accept phone with +91 prefix', () => {
      const result = SecurityUtils.validateInput('+919925450425', 'phone');
      expect(result.valid).toBe(true);
    });

    test('should reject invalid phone', () => {
      expect(SecurityUtils.validateInput('12345', 'phone').valid).toBe(false);
      expect(SecurityUtils.validateInput('abcdefghij', 'phone').valid).toBe(false);
    });
  });

  describe('name validation', () => {
    test('should accept valid name', () => {
      const result = SecurityUtils.validateInput('Dr. Ashok Sajnani', 'name');
      expect(result.valid).toBe(true);
    });

    test('should reject name with numbers', () => {
      expect(SecurityUtils.validateInput('Test123', 'name').valid).toBe(false);
    });

    test('should reject single character name', () => {
      expect(SecurityUtils.validateInput('A', 'name').valid).toBe(false);
    });
  });

  describe('password validation', () => {
    test('should accept password >= 6 chars', () => {
      const result = SecurityUtils.validateInput('password123', 'password');
      expect(result.valid).toBe(true);
    });

    test('should reject password < 6 chars', () => {
      const result = SecurityUtils.validateInput('short', 'password');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('6 characters');
    });
  });
});

describe('SecurityUtils.logSecurityEvent()', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  test('should always log to console.warn regardless of environment', () => {
    SecurityUtils.logSecurityEvent('login_attempt', { email: 'test@test.com' });
    expect(console.warn).toHaveBeenCalledWith('[SECURITY]', expect.objectContaining({
      event: 'login_attempt',
    }));
  });

  test('should log event to localStorage', () => {
    SecurityUtils.logSecurityEvent('login_attempt', { email: 'test@test.com' });
    const logs = JSON.parse(localStorage.getItem('security_logs'));
    expect(logs.length).toBe(1);
    expect(logs[0].event).toBe('login_attempt');
    expect(logs[0].details.email).toBe('test@test.com');
  });

  test('should include timestamp in log entry', () => {
    SecurityUtils.logSecurityEvent('access_denied');
    const logs = JSON.parse(localStorage.getItem('security_logs'));
    expect(logs[0].timestamp).toBeDefined();
  });

  test('should cap logs at 100 entries', () => {
    const existingLogs = Array.from({ length: 100 }, (_, i) => ({
      event: `event_${i}`,
      timestamp: new Date().toISOString(),
    }));
    localStorage.setItem('security_logs', JSON.stringify(existingLogs));

    SecurityUtils.logSecurityEvent('new_event');
    const logs = JSON.parse(localStorage.getItem('security_logs'));
    expect(logs.length).toBe(100);
    expect(logs[logs.length - 1].event).toBe('new_event');
  });
});

describe('SecurityUtils.addSecurityMeta()', () => {
  test('should add meta tag to document head', () => {
    const before = document.head.querySelectorAll('meta').length;
    SecurityUtils.addSecurityMeta();
    const after = document.head.querySelectorAll('meta').length;
    expect(after).toBeGreaterThan(before);
  });
});
