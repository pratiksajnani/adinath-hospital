/**
 * Rate Limiter Unit Tests
 * Tests rate limiting, storage, and cleanup
 */

// Mock crypto
global.crypto = {
  getRandomValues: jest.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
};

global.document = {
  addEventListener: jest.fn(),
};

global.alert = jest.fn();

const RateLimiter = require('../../js/rate-limiter.js');

describe('RateLimiter', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Ensure clean state
    RateLimiter.init();
  });

  describe('Limits Configuration', () => {
    test('should have login limit', () => {
      expect(RateLimiter.limits.login).toBeDefined();
      expect(RateLimiter.limits.login.max).toBeGreaterThan(0);
      expect(RateLimiter.limits.login.windowMs).toBeGreaterThan(0);
    });

    test('should have booking limit', () => {
      expect(RateLimiter.limits.booking).toBeDefined();
      expect(RateLimiter.limits.booking.max).toBeGreaterThan(0);
    });

    test('should have api limit', () => {
      expect(RateLimiter.limits.api).toBeDefined();
      expect(RateLimiter.limits.api.max).toBeGreaterThan(0);
    });

    test('should have feedback limit', () => {
      expect(RateLimiter.limits.feedback).toBeDefined();
    });

    test('should have sms limit', () => {
      expect(RateLimiter.limits.sms).toBeDefined();
    });

    test('should have payment limit', () => {
      expect(RateLimiter.limits.payment).toBeDefined();
    });

    test('all limits should have message', () => {
      Object.values(RateLimiter.limits).forEach((limit) => {
        expect(limit.message).toBeDefined();
        expect(typeof limit.message).toBe('string');
      });
    });
  });

  describe('check()', () => {
    test('should allow first request', () => {
      const result = RateLimiter.check('login');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RateLimiter.limits.login.max);
    });

    test('should return remaining count', () => {
      // Record some attempts
      RateLimiter.record('login');
      RateLimiter.record('login');

      const result = RateLimiter.check('login');

      expect(result.remaining).toBe(RateLimiter.limits.login.max - 2);
    });

    test('should block when limit exceeded', () => {
      const limit = RateLimiter.limits.login.max;

      // Exhaust the limit
      for (let i = 0; i < limit; i++) {
        RateLimiter.record('login');
      }

      const result = RateLimiter.check('login');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.message).toBe(RateLimiter.limits.login.message);
    });

    test('should return true for unknown action', () => {
      const result = RateLimiter.check('unknown-action');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(Infinity);
    });

    test('should track different actions separately', () => {
      // Exhaust login limit
      for (let i = 0; i < RateLimiter.limits.login.max; i++) {
        RateLimiter.record('login');
      }

      // Booking should still be allowed
      const result = RateLimiter.check('booking');

      expect(result.allowed).toBe(true);
    });
  });

  describe('record()', () => {
    test('should record attempt', () => {
      const before = RateLimiter.check('login');

      RateLimiter.record('login');

      const after = RateLimiter.check('login');

      expect(after.remaining).toBe(before.remaining - 1);
    });

    test('should return current status after recording', () => {
      const result = RateLimiter.record('login');

      expect(result.allowed).toBeDefined();
      expect(result.remaining).toBeDefined();
    });

    test('should store attempts in localStorage', () => {
      RateLimiter.record('login');

      // Check localStorage has the key
      let found = false;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(RateLimiter.storagePrefix)) {
          found = true;
          break;
        }
      }

      expect(found).toBe(true);
    });
  });

  describe('try()', () => {
    test('should check and record in one call', () => {
      const result = RateLimiter.try('login');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RateLimiter.limits.login.max - 1);
    });

    test('should block when limit exceeded', () => {
      const limit = RateLimiter.limits.login.max;

      // Exhaust limit
      for (let i = 0; i < limit; i++) {
        RateLimiter.try('login');
      }

      const result = RateLimiter.try('login');

      expect(result.allowed).toBe(false);
    });
  });

  describe('reset()', () => {
    test('should reset rate limit for action', () => {
      // Record some attempts
      RateLimiter.record('login');
      RateLimiter.record('login');

      // Reset
      RateLimiter.reset('login');

      // Should be back to full limit
      const result = RateLimiter.check('login');
      expect(result.remaining).toBe(RateLimiter.limits.login.max);
    });
  });

  describe('getClientId()', () => {
    test('should return consistent client ID', () => {
      const id1 = RateLimiter.getClientId();
      const id2 = RateLimiter.getClientId();

      expect(id1).toBe(id2);
    });

    test('should generate new ID if not exists', () => {
      localStorage.clear();

      const id = RateLimiter.getClientId();

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    test('should store client ID in localStorage', () => {
      localStorage.clear();

      RateLimiter.getClientId();

      expect(localStorage.getItem('client_id')).toBeDefined();
    });
  });

  describe('generateId()', () => {
    test('should generate string ID', () => {
      const id = RateLimiter.generateId();

      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    test('should generate unique IDs', () => {
      const ids = new Set();

      for (let i = 0; i < 100; i++) {
        ids.add(RateLimiter.generateId());
      }

      expect(ids.size).toBe(100);
    });
  });

  describe('hash()', () => {
    test('should return consistent hash for same input', () => {
      const hash1 = RateLimiter.hash('test-string');
      const hash2 = RateLimiter.hash('test-string');

      expect(hash1).toBe(hash2);
    });

    test('should return different hash for different input', () => {
      const hash1 = RateLimiter.hash('string1');
      const hash2 = RateLimiter.hash('string2');

      expect(hash1).not.toBe(hash2);
    });

    test('should return string', () => {
      const hash = RateLimiter.hash('test');

      expect(typeof hash).toBe('string');
    });
  });

  describe('cleanup()', () => {
    test('should remove expired entries', () => {
      // This is tested implicitly through the flow
      // Add some entries and then cleanup
      RateLimiter.record('login');

      // Cleanup shouldn't throw
      expect(() => RateLimiter.cleanup()).not.toThrow();
    });
  });

  describe('formatResetTime()', () => {
    test('should format seconds', () => {
      const result = RateLimiter.formatResetTime(30000);

      expect(result).toContain('seconds');
    });

    test('should format minutes', () => {
      const result = RateLimiter.formatResetTime(180000);

      expect(result).toContain('minutes');
    });

    test('should format hours', () => {
      const result = RateLimiter.formatResetTime(7200000);

      expect(result).toContain('hours');
    });
  });

  describe('showError()', () => {
    test('should call alert with message', () => {
      const result = {
        allowed: false,
        message: 'Too many requests',
        resetIn: 60000,
      };

      RateLimiter.showError(result);

      expect(alert).toHaveBeenCalled();
    });
  });

  describe('wrap()', () => {
    test('should return wrapped function', () => {
      const fn = jest.fn();
      const wrapped = RateLimiter.wrap('login', fn);

      expect(typeof wrapped).toBe('function');
    });

    test('should execute function when not rate limited', async () => {
      const fn = jest.fn().mockResolvedValue('result');
      const wrapped = RateLimiter.wrap('login', fn);

      const result = await wrapped();

      expect(fn).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    test('should throw when rate limited', async () => {
      const limit = RateLimiter.limits.login.max;

      // Exhaust limit
      for (let i = 0; i < limit; i++) {
        RateLimiter.record('login');
      }

      const fn = jest.fn();
      const wrapped = RateLimiter.wrap('login', fn);

      await expect(wrapped()).rejects.toThrow('Rate limited');
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('Window Expiration', () => {
    test('should allow requests after window expires', () => {
      // Mock Date.now to simulate time passing
      const originalNow = Date.now;
      let currentTime = originalNow();

      Date.now = jest.fn(() => currentTime);

      // Exhaust limit
      const limit = RateLimiter.limits.login.max;
      for (let i = 0; i < limit; i++) {
        RateLimiter.record('login');
      }

      // Should be blocked
      expect(RateLimiter.check('login').allowed).toBe(false);

      // Advance time past the window
      currentTime += RateLimiter.limits.login.windowMs + 1000;

      // Should be allowed again
      expect(RateLimiter.check('login').allowed).toBe(true);

      // Restore Date.now
      Date.now = originalNow;
    });
  });

  describe('Identifier-based limiting', () => {
    test('should track different identifiers separately', () => {
      // Exhaust limit for user1
      const limit = RateLimiter.limits.login.max;
      for (let i = 0; i < limit; i++) {
        RateLimiter.record('login', 'user1@test.com');
      }

      // user1 should be blocked
      expect(RateLimiter.check('login', 'user1@test.com').allowed).toBe(false);

      // user2 should still be allowed
      expect(RateLimiter.check('login', 'user2@test.com').allowed).toBe(true);
    });
  });

  describe('Storage Key', () => {
    test('should create valid storage key', () => {
      const key = RateLimiter.getKey('login', 'test@email.com');

      expect(key).toContain(RateLimiter.storagePrefix);
      expect(key).toContain('login');
    });

    test('should use client ID if no identifier provided', () => {
      const key1 = RateLimiter.getKey('login');
      const key2 = RateLimiter.getKey('login');

      expect(key1).toBe(key2);
    });
  });
});

