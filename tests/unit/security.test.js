/**
 * Security Utilities Unit Tests
 * Tests XSS prevention, input validation, CSRF, rate limiting
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

describe('SecurityUtils.sanitizeHTML()', () => {
  test('should sanitize script tags', () => {
    const result = SecurityUtils.sanitizeHTML('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
  });

  test('should return empty string for null/undefined', () => {
    expect(SecurityUtils.sanitizeHTML(null)).toBe('');
    expect(SecurityUtils.sanitizeHTML(undefined)).toBe('');
  });

  test('should return empty string for non-string input', () => {
    expect(SecurityUtils.sanitizeHTML(42)).toBe('');
  });

  test('should handle normal text', () => {
    expect(SecurityUtils.sanitizeHTML('Hello')).toBe('Hello');
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

describe('SecurityUtils CSRF', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('generateCSRFToken should create and store token', () => {
    const token = SecurityUtils.generateCSRFToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64); // 32 bytes * 2 hex chars
    expect(sessionStorage.getItem('csrf_token')).toBe(token);
  });

  test('getCSRFToken should return existing token', () => {
    const token = SecurityUtils.generateCSRFToken();
    expect(SecurityUtils.getCSRFToken()).toBe(token);
  });

  test('getCSRFToken should generate new token if none exists', () => {
    const token = SecurityUtils.getCSRFToken();
    expect(token).toBeDefined();
    expect(token.length).toBe(64);
  });

  test('verifyCSRFToken should validate correct token', () => {
    const token = SecurityUtils.generateCSRFToken();
    expect(SecurityUtils.verifyCSRFToken(token)).toBe(true);
  });

  test('verifyCSRFToken should reject wrong token', () => {
    SecurityUtils.generateCSRFToken();
    expect(SecurityUtils.verifyCSRFToken('wrong-token')).toBe(false);
  });

  test('verifyCSRFToken should reject when no token stored', () => {
    expect(SecurityUtils.verifyCSRFToken('any-token')).toBeFalsy();
  });
});

describe('SecurityUtils.encrypt() / decrypt()', () => {
  test('should encrypt and decrypt data', () => {
    const data = { name: 'Test', value: 42 };
    const encrypted = SecurityUtils.encrypt(data);
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe('');

    const decrypted = SecurityUtils.decrypt(encrypted);
    expect(decrypted).toEqual(data);
  });

  test('should encrypt and decrypt strings', () => {
    const encrypted = SecurityUtils.encrypt('hello');
    const decrypted = SecurityUtils.decrypt(encrypted);
    expect(decrypted).toBe('hello');
  });

  test('encrypt should return empty for null/undefined', () => {
    expect(SecurityUtils.encrypt(null)).toBe('');
    expect(SecurityUtils.encrypt(undefined)).toBe('');
    expect(SecurityUtils.encrypt('')).toBe('');
  });

  test('decrypt should return empty for null/undefined', () => {
    expect(SecurityUtils.decrypt(null)).toBe('');
    expect(SecurityUtils.decrypt(undefined)).toBe('');
    expect(SecurityUtils.decrypt('')).toBe('');
  });

  test('decrypt should return empty for invalid base64', () => {
    expect(SecurityUtils.decrypt('not-valid-base64!!!')).toBe('');
  });
});

describe('SecurityUtils.isTrustedOrigin()', () => {
  test('should trust production domain', () => {
    expect(SecurityUtils.isTrustedOrigin('https://adinathhealth.com')).toBe(true);
  });

  test('should trust staging domain', () => {
    expect(
      SecurityUtils.isTrustedOrigin('https://main.d2a0i6erg1hmca.amplifyapp.com')
    ).toBe(true);
  });

  test('should trust localhost', () => {
    expect(SecurityUtils.isTrustedOrigin('http://localhost:8080')).toBe(true);
    expect(SecurityUtils.isTrustedOrigin('http://localhost:3000')).toBe(true);
  });

  test('should reject untrusted origins', () => {
    expect(SecurityUtils.isTrustedOrigin('https://evil.com')).toBe(false);
    expect(SecurityUtils.isTrustedOrigin('https://adinathhealth.com.evil.com')).toBe(false);
  });
});

describe('SecurityUtils.canAccessResource()', () => {
  test('admin should access any resource', () => {
    expect(SecurityUtils.canAccessResource('U001', 'U002', 'admin')).toBe(true);
  });

  test('user should access own resource', () => {
    expect(SecurityUtils.canAccessResource('U001', 'U001', 'patient')).toBe(true);
  });

  test('user should not access others resource', () => {
    expect(SecurityUtils.canAccessResource('U001', 'U002', 'patient')).toBe(false);
  });
});

describe('SecurityUtils.containsXSSPattern()', () => {
  test('should detect script tags', () => {
    expect(SecurityUtils.containsXSSPattern('<script>alert(1)</script>')).toBe(true);
  });

  test('should detect event handlers', () => {
    expect(SecurityUtils.containsXSSPattern('<img onerror=alert(1)>')).toBe(true);
  });

  test('should detect javascript: protocol', () => {
    expect(SecurityUtils.containsXSSPattern('javascript:alert(1)')).toBe(true);
  });

  // Note: containsXSSPattern checks for the pattern "eval(" in user input strings
  // This is a security detection test, not use of the function itself
  test('should detect dangerous function calls in input', () => {
    expect(SecurityUtils.containsXSSPattern('something eval(code) here')).toBe(true);
  });

  test('should detect iframe', () => {
    expect(SecurityUtils.containsXSSPattern('<iframe src="evil">')).toBe(true);
  });

  test('should return false for safe input', () => {
    expect(SecurityUtils.containsXSSPattern('Hello World')).toBe(false);
    expect(SecurityUtils.containsXSSPattern('Dr. Ashok Sajnani')).toBe(false);
  });

  test('should return false for null/undefined', () => {
    expect(SecurityUtils.containsXSSPattern(null)).toBe(false);
    expect(SecurityUtils.containsXSSPattern(undefined)).toBe(false);
    expect(SecurityUtils.containsXSSPattern(42)).toBe(false);
  });
});

describe('SecurityUtils.checkRateLimit()', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('should allow first attempt', () => {
    const result = SecurityUtils.checkRateLimit('login');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4); // 5 max - 1 used
  });

  test('should block after max attempts', () => {
    for (let i = 0; i < 5; i++) {
      SecurityUtils.checkRateLimit('login');
    }
    const result = SecurityUtils.checkRateLimit('login');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  test('should use custom max attempts', () => {
    for (let i = 0; i < 3; i++) {
      SecurityUtils.checkRateLimit('otp', 3);
    }
    const result = SecurityUtils.checkRateLimit('otp', 3);
    expect(result.allowed).toBe(false);
  });

  test('should track separate keys independently', () => {
    for (let i = 0; i < 5; i++) {
      SecurityUtils.checkRateLimit('login');
    }
    const loginResult = SecurityUtils.checkRateLimit('login');
    const signupResult = SecurityUtils.checkRateLimit('signup');
    expect(loginResult.allowed).toBe(false);
    expect(signupResult.allowed).toBe(true);
  });
});

describe('SecurityUtils.getSecurityHeaders()', () => {
  test('should return security headers object', () => {
    const headers = SecurityUtils.getSecurityHeaders();
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('SAMEORIGIN');
    expect(headers['X-XSS-Protection']).toBe('1; mode=block');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Permissions-Policy']).toBeDefined();
  });
});

describe('SecurityUtils.isSecureContext()', () => {
  test('should return true for localhost', () => {
    // jsdom default is localhost
    expect(SecurityUtils.isSecureContext()).toBe(true);
  });
});

describe('SecurityUtils.logSecurityEvent()', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should log event to localStorage', () => {
    SecurityUtils.logSecurityEvent('login_attempt', { email: 'test@test.com' });
    const logs = JSON.parse(localStorage.getItem('security_logs'));
    expect(logs.length).toBe(1);
    expect(logs[0].event).toBe('login_attempt');
    expect(logs[0].details.email).toBe('test@test.com');
  });

  test('should cap logs at 100 entries', () => {
    // Fill 100 entries
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
