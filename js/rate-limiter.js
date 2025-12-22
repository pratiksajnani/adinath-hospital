/**
 * Rate Limiter Module
 * Client-side rate limiting to prevent abuse
 * @module RateLimiter
 */

/* global ErrorTracking */

const RateLimiter = {
  // Rate limit configurations
  limits: {
    login: { max: 5, windowMs: 5 * 60 * 1000, message: 'Too many login attempts. Please wait 5 minutes.' },
    signup: { max: 3, windowMs: 60 * 60 * 1000, message: 'Too many signup attempts. Please wait 1 hour.' },
    booking: { max: 10, windowMs: 60 * 60 * 1000, message: 'Too many booking requests. Please wait 1 hour.' },
    api: { max: 100, windowMs: 60 * 1000, message: 'Too many requests. Please slow down.' },
    feedback: { max: 5, windowMs: 60 * 60 * 1000, message: 'Too much feedback submitted. Please wait.' },
    sms: { max: 5, windowMs: 5 * 60 * 1000, message: 'Too many SMS requests. Please wait.' },
    payment: { max: 10, windowMs: 60 * 60 * 1000, message: 'Too many payment attempts. Please wait.' },
  },

  // Storage key prefix
  storagePrefix: 'rl_',

  /**
   * Initialize rate limiter
   */
  init() {
    // Clean up expired entries on init
    this.cleanup();
    console.info('[RateLimiter] Initialized');
  },

  /**
   * Check if an action is allowed
   * @param {string} action - The action to check (e.g., 'login', 'booking')
   * @param {string} identifier - Optional identifier (e.g., email, IP)
   * @returns {Object} - { allowed: boolean, remaining: number, resetIn: number, message: string }
   */
  check(action, identifier = '') {
    const limit = this.limits[action];
    if (!limit) {
      console.warn(`[RateLimiter] Unknown action: ${action}`);
      return { allowed: true, remaining: Infinity, resetIn: 0 };
    }

    const key = this.getKey(action, identifier);
    const record = this.getRecord(key);
    const now = Date.now();

    // Filter out expired attempts
    const validAttempts = record.attempts.filter(
      (timestamp) => now - timestamp < limit.windowMs
    );

    // Check if limit exceeded
    if (validAttempts.length >= limit.max) {
      const oldestAttempt = Math.min(...validAttempts);
      const resetIn = limit.windowMs - (now - oldestAttempt);

      // Log suspicious activity
      this.logExceeded(action, identifier, validAttempts.length);

      return {
        allowed: false,
        remaining: 0,
        resetIn,
        resetAt: new Date(now + resetIn),
        message: limit.message,
      };
    }

    return {
      allowed: true,
      remaining: limit.max - validAttempts.length,
      resetIn: 0,
      message: '',
    };
  },

  /**
   * Record an attempt for an action
   * @param {string} action - The action
   * @param {string} identifier - Optional identifier
   * @returns {Object} - Result of check after recording
   */
  record(action, identifier = '') {
    const limit = this.limits[action];
    if (!limit) {
      return { allowed: true, remaining: Infinity };
    }

    const key = this.getKey(action, identifier);
    const record = this.getRecord(key);
    const now = Date.now();

    // Add new attempt
    record.attempts.push(now);

    // Clean old attempts
    record.attempts = record.attempts.filter(
      (timestamp) => now - timestamp < limit.windowMs
    );

    // Save record
    this.saveRecord(key, record);

    // Return current status
    return this.check(action, identifier);
  },

  /**
   * Try to perform an action (check + record)
   * @param {string} action - The action
   * @param {string} identifier - Optional identifier
   * @returns {Object} - { allowed: boolean, remaining: number, message: string }
   */
  try(action, identifier = '') {
    const status = this.check(action, identifier);

    if (!status.allowed) {
      return status;
    }

    return this.record(action, identifier);
  },

  /**
   * Reset rate limit for an action
   * @param {string} action - The action
   * @param {string} identifier - Optional identifier
   */
  reset(action, identifier = '') {
    const key = this.getKey(action, identifier);
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  },

  /**
   * Get storage key
   * @param {string} action - The action
   * @param {string} identifier - Optional identifier
   * @returns {string} - Storage key
   */
  getKey(action, identifier) {
    const id = identifier || this.getClientId();
    return `${this.storagePrefix}${action}_${this.hash(id)}`;
  },

  /**
   * Get record from storage
   * @param {string} key - Storage key
   * @returns {Object} - Record object
   */
  getRecord(key) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    return { attempts: [] };
  },

  /**
   * Save record to storage
   * @param {string} key - Storage key
   * @param {Object} record - Record to save
   */
  saveRecord(key, record) {
    try {
      localStorage.setItem(key, JSON.stringify(record));
    } catch {
      // Storage full or disabled
      console.warn('[RateLimiter] Could not save to localStorage');
    }
  },

  /**
   * Get client identifier
   * @returns {string} - Client ID
   */
  getClientId() {
    // Try to get persistent client ID
    let clientId = localStorage.getItem('client_id');

    if (!clientId) {
      // Generate new ID
      clientId = this.generateId();
      try {
        localStorage.setItem('client_id', clientId);
      } catch {
        // Ignore storage errors
      }
    }

    return clientId;
  },

  /**
   * Generate a random ID
   * @returns {string}
   */
  generateId() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Simple hash function
   * @param {string} str - String to hash
   * @returns {string} - Hashed string
   */
  hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  },

  /**
   * Log when rate limit is exceeded
   * @param {string} action - The action
   * @param {string} identifier - The identifier
   * @param {number} attempts - Number of attempts
   */
  logExceeded(action, identifier, attempts) {
    console.warn(`[RateLimiter] Rate limit exceeded for ${action}`, {
      attempts,
      identifier: identifier ? this.hash(identifier) : 'anonymous',
    });

    // Track with error tracking if available
    if (typeof ErrorTracking !== 'undefined' && ErrorTracking.captureMessage) {
      ErrorTracking.captureMessage(`Rate limit exceeded: ${action}`, 'warning', {
        action,
        attempts,
      });
    }
  },

  /**
   * Clean up expired entries from storage
   */
  cleanup() {
    try {
      const now = Date.now();
      const keysToRemove = [];
      // eslint-disable-next-line security/detect-non-literal-regexp
      const prefixRegex = new RegExp(`^${this.storagePrefix}([^_]+)_`);

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(this.storagePrefix)) continue;

        const record = this.getRecord(key);
        const actionMatch = key.match(prefixRegex);
        if (!actionMatch) continue;

        const action = actionMatch[1];
        const limit = this.limits[action];
        if (!limit) continue;

        // Check if all attempts are expired
        const validAttempts = record.attempts.filter(
          (timestamp) => now - timestamp < limit.windowMs
        );
        if (validAttempts.length === 0) {
          keysToRemove.push(key);
        }
      }

      // Remove expired keys
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      if (keysToRemove.length > 0) {
        console.info(`[RateLimiter] Cleaned up ${keysToRemove.length} expired entries`);
      }
    } catch {
      // Ignore cleanup errors
    }
  },

  /**
   * Get formatted time until reset
   * @param {number} ms - Milliseconds until reset
   * @returns {string} - Formatted time
   */
  formatResetTime(ms) {
    if (ms < 60000) {
      return `${Math.ceil(ms / 1000)} seconds`;
    }
    if (ms < 3600000) {
      return `${Math.ceil(ms / 60000)} minutes`;
    }
    return `${Math.ceil(ms / 3600000)} hours`;
  },

  /**
   * Show rate limit error to user
   * @param {Object} result - Result from check/try
   */
  showError(result) {
    const timeLeft = this.formatResetTime(result.resetIn);
    const message = `${result.message}\n\nPlease try again in ${timeLeft}.`;

    // Show alert or custom UI (alert is intentional for user feedback)
    // eslint-disable-next-line no-alert
    alert(message);
  },

  /**
   * Wrap a function with rate limiting
   * @param {string} action - The action to rate limit
   * @param {Function} fn - The function to wrap
   * @param {string} identifier - Optional identifier
   * @returns {Function} - Wrapped function
   */
  wrap(action, fn, identifier = '') {
    return async (...args) => {
      const result = this.try(action, identifier);

      if (!result.allowed) {
        this.showError(result);
        throw new Error(`Rate limited: ${action}`);
      }

      return fn(...args);
    };
  },
};

// Auto-initialize
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    RateLimiter.init();
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RateLimiter;
}

