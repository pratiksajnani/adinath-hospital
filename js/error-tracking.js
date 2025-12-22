/**
 * Error Tracking Module
 * Lightweight error tracking with Sentry-compatible API
 * @module ErrorTracking
 */

// eslint-disable-next-line no-unused-vars
const ErrorTracking = {
  dsn: null,
  enabled: false,
  queue: [],
  maxQueueSize: 50,
  sampleRate: 1.0,

  /**
   * Initialize error tracking
   * @param {Object} options - Configuration options
   * @param {string} options.dsn - Sentry DSN or custom endpoint
   * @param {number} options.sampleRate - Sample rate (0-1)
   */
  init(options = {}) {
    this.dsn = options.dsn || (typeof CONFIG !== 'undefined' ? CONFIG.SENTRY_DSN : null);
    this.sampleRate = options.sampleRate || 1.0;
    this.enabled = !!this.dsn;

    if (!this.enabled) {
      console.info('[ErrorTracking] No DSN configured - errors will log to console only');
      return;
    }

    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      this.captureException(error || new Error(message), {
        source,
        lineno,
        colno,
        type: 'onerror',
      });
      return false; // Don't suppress the error
    };

    // Unhandled promise rejection handler
    window.onunhandledrejection = (event) => {
      this.captureException(event.reason, {
        type: 'unhandledrejection',
      });
    };

    console.info('[ErrorTracking] Initialized');
  },

  /**
   * Capture an exception
   * @param {Error} error - The error to capture
   * @param {Object} context - Additional context
   */
  captureException(error, context = {}) {
    if (!this.shouldSample()) {return;}

    const payload = this.buildPayload(error, context);
    this.send(payload);
  },

  /**
   * Capture a message
   * @param {string} message - The message to capture
   * @param {string} level - Severity level
   * @param {Object} context - Additional context
   */
  captureMessage(message, level = 'info', context = {}) {
    if (!this.shouldSample()) {return;}

    const payload = this.buildPayload(new Error(message), {
      ...context,
      level,
      isMessage: true,
    });
    this.send(payload);
  },

  /**
   * Build the error payload
   * @param {Error} error - The error object
   * @param {Object} context - Additional context
   * @returns {Object} - The payload
   */
  buildPayload(error, context = {}) {
    return {
      timestamp: new Date().toISOString(),
      level: context.level || 'error',
      message: error?.message || String(error),
      stack: error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      online: navigator.onLine,
      context: {
        ...context,
        page: window.location.pathname,
        referrer: document.referrer,
      },
      user: this.getUser(),
      breadcrumbs: this.getBreadcrumbs(),
    };
  },

  /**
   * Get current user info (anonymized for patients)
   * @returns {Object} - User info
   */
  getUser() {
    try {
      const role = localStorage.getItem('hms_role');
      const isLoggedIn = localStorage.getItem('hms_logged_in') === 'true';

      if (!isLoggedIn) {
        return { anonymous: true };
      }

      // Anonymize patient data
      if (role === 'patient') {
        return { role: 'patient', anonymous: true };
      }

      return {
        role,
        email: localStorage.getItem('hms_user_email'),
      };
    } catch {
      return { anonymous: true };
    }
  },

  /**
   * Get navigation breadcrumbs
   * @returns {Array} - Recent navigation events
   */
  getBreadcrumbs() {
    try {
      const stored = sessionStorage.getItem('error_breadcrumbs');
      return stored ? JSON.parse(stored).slice(-10) : [];
    } catch {
      return [];
    }
  },

  /**
   * Add a breadcrumb
   * @param {string} category - Breadcrumb category
   * @param {string} message - Breadcrumb message
   * @param {Object} data - Additional data
   */
  addBreadcrumb(category, message, data = {}) {
    try {
      const breadcrumbs = this.getBreadcrumbs();
      breadcrumbs.push({
        timestamp: new Date().toISOString(),
        category,
        message,
        data,
      });

      // Keep last 20 breadcrumbs
      sessionStorage.setItem(
        'error_breadcrumbs',
        JSON.stringify(breadcrumbs.slice(-20))
      );
    } catch {
      // Ignore storage errors
    }
  },

  /**
   * Check if this error should be sampled
   * @returns {boolean}
   */
  shouldSample() {
    return Math.random() < this.sampleRate;
  },

  /**
   * Send the error to the backend
   * @param {Object} payload - Error payload
   */
  send(payload) {
    if (!this.enabled) {
      console.error('[ErrorTracking]', payload.message, payload);
      return;
    }

    // Add to queue
    this.queue.push(payload);

    // Trim queue if too large
    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift();
    }

    // Send immediately for critical errors
    this.flush();
  },

  /**
   * Flush the error queue to the backend
   */
  async flush() {
    if (!this.enabled || this.queue.length === 0) {return;}

    const errors = [...this.queue];
    this.queue = [];

    try {
      // If using Sentry DSN
      if (this.dsn.includes('sentry.io')) {
        // Use Sentry SDK if available, otherwise use API
        if (window.Sentry) {
          errors.forEach((e) => {
            window.Sentry.captureException(new Error(e.message), {
              extra: e.context,
            });
          });
        }
      } else {
        // Custom endpoint
        await fetch(this.dsn, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ errors }),
        });
      }
    } catch (err) {
      // Re-queue on failure
      this.queue.push(...errors);
      console.error('[ErrorTracking] Failed to send errors:', err);
    }
  },

  /**
   * Track a custom event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  trackEvent(event, data = {}) {
    this.addBreadcrumb('event', event, data);

    // Also send critical events as messages
    if (data.critical) {
      this.captureMessage(`Event: ${event}`, 'warning', data);
    }
  },

  /**
   * Wrap a function to capture errors
   * @param {Function} fn - Function to wrap
   * @param {Object} context - Additional context
   * @returns {Function} - Wrapped function
   */
  wrap(fn, context = {}) {
    const self = this;
    return function wrappedFunction(...args) {
      try {
        return fn.apply(this, args);
      } catch (error) {
        self.captureException(error, {
          ...context,
          functionName: fn.name || 'anonymous',
          arguments: args.map((a) =>
            typeof a === 'object' ? '[object]' : String(a)
          ),
        });
        throw error;
      }
    };
  },

  /**
   * Create a performance monitoring span
   * @param {string} name - Span name
   * @returns {Object} - Span object with end() method
   */
  startSpan(name) {
    const startTime = performance.now();
    return {
      name,
      startTime,
      end: () => {
        const duration = performance.now() - startTime;
        this.addBreadcrumb('performance', name, { duration });

        // Track slow operations
        if (duration > 3000) {
          this.captureMessage(`Slow operation: ${name}`, 'warning', {
            duration,
          });
        }
      },
    };
  },
};

// Auto-initialize if CONFIG is available
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Track navigation
    ErrorTracking.addBreadcrumb('navigation', 'Page load', {
      url: window.location.href,
    });

    // Track clicks for breadcrumbs
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, [role="button"]');
      if (target) {
        ErrorTracking.addBreadcrumb('click', target.textContent?.slice(0, 50), {
          tag: target.tagName,
          id: target.id,
          className: target.className,
        });
      }
    });

    // Initialize with config if available
    if (typeof CONFIG !== 'undefined' && CONFIG.SENTRY_DSN) {
      ErrorTracking.init({ dsn: CONFIG.SENTRY_DSN });
    }
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorTracking;
}

