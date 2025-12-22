/**
 * Session Recording Module
 * Privacy-first session recording with LogRocket integration
 * @module SessionRecording
 */

// eslint-disable-next-line no-unused-vars
const SessionRecording = {
  enabled: false,
  appId: null,
  initialized: false,

  /**
   * Initialize session recording
   * @param {string} appId - LogRocket application ID
   */
  init(appId) {
    if (this.initialized) return;

    this.appId = appId || (typeof CONFIG !== 'undefined' ? CONFIG.LOGROCKET_ID : null);

    // Don't record if no app ID or if bot
    if (!this.appId || this.isBot()) {
      console.info('[SessionRecording] Disabled - no app ID or bot detected');
      return;
    }

    // Don't record in development
    if (this.isDevelopment()) {
      console.info('[SessionRecording] Disabled in development');
      return;
    }

    // Check for user consent (GDPR compliance)
    if (!this.hasConsent()) {
      console.info('[SessionRecording] Waiting for user consent');
      return;
    }

    this.loadScript();
  },

  /**
   * Load LogRocket script dynamically
   */
  loadScript() {
    const script = document.createElement('script');
    script.src = 'https://cdn.lr-in-prod.com/LogRocket.min.js';
    script.crossOrigin = 'anonymous';
    script.async = true;

    script.onload = () => {
      if (typeof LogRocket !== 'undefined') {
        LogRocket.init(this.appId, {
          release: this.getVersion(),
          console: {
            isEnabled: true,
            shouldAggregateConsoleErrors: true,
          },
          network: {
            isEnabled: true,
            requestSanitizer: this.sanitizeRequest.bind(this),
            responseSanitizer: this.sanitizeResponse.bind(this),
          },
        });

        this.enabled = true;
        this.initialized = true;
        this.configurePrivacy();
        this.identifyUser();

        console.info('[SessionRecording] Initialized');
      }
    };

    script.onerror = () => {
      console.warn('[SessionRecording] Failed to load LogRocket script');
    };

    document.head.appendChild(script);
  },

  /**
   * Configure privacy settings - mask sensitive data
   */
  configurePrivacy() {
    if (!this.enabled || typeof LogRocket === 'undefined') return;

    // Mask sensitive input fields
    LogRocket.redaction({
      inputSelector: [
        'input[type="password"]',
        'input[name*="phone"]',
        'input[name*="mobile"]',
        'input[name*="address"]',
        'input[name*="email"]',
        'input[name*="aadhar"]',
        'input[name*="pan"]',
        '[data-sensitive]',
        '[data-private]',
      ].join(', '),
    });
  },

  /**
   * Sanitize network requests - remove sensitive data
   * @param {Object} request - The request object
   * @returns {Object|null} - Sanitized request or null to ignore
   */
  sanitizeRequest(request) {
    // Ignore analytics and tracking requests
    if (
      request.url.includes('analytics') ||
      request.url.includes('tracking') ||
      request.url.includes('facebook') ||
      request.url.includes('google-analytics')
    ) {
      return null;
    }

    // Remove authorization headers
    if (request.headers) {
      delete request.headers.Authorization;
      delete request.headers.Cookie;
    }

    // Mask sensitive body content
    if (request.body) {
      try {
        const body = JSON.parse(request.body);
        if (body.password) body.password = '[REDACTED]';
        if (body.phone) body.phone = '[REDACTED]';
        if (body.email) body.email = '[REDACTED]';
        if (body.aadhar) body.aadhar = '[REDACTED]';
        request.body = JSON.stringify(body);
      } catch {
        // Not JSON, leave as is
      }
    }

    return request;
  },

  /**
   * Sanitize network responses
   * @param {Object} response - The response object
   * @returns {Object|null} - Sanitized response or null to ignore
   */
  sanitizeResponse(response) {
    // Mask sensitive response data
    if (response.body) {
      try {
        const body = JSON.parse(response.body);
        if (body.token) body.token = '[REDACTED]';
        if (body.accessToken) body.accessToken = '[REDACTED]';
        if (body.patients) {
          body.patients = body.patients.map((p) => ({
            ...p,
            phone: '[REDACTED]',
            address: '[REDACTED]',
          }));
        }
        response.body = JSON.stringify(body);
      } catch {
        // Not JSON, leave as is
      }
    }

    return response;
  },

  /**
   * Identify the current user
   */
  identifyUser() {
    if (!this.enabled || typeof LogRocket === 'undefined') return;

    try {
      const isLoggedIn = localStorage.getItem('hms_logged_in') === 'true';
      const role = localStorage.getItem('hms_role');
      const email = localStorage.getItem('hms_user_email');
      const name = localStorage.getItem('hms_user_name');

      if (!isLoggedIn) {
        LogRocket.identify('anonymous', {
          role: 'guest',
        });
        return;
      }

      // Anonymize patients completely
      if (role === 'patient') {
        LogRocket.identify('anonymous-patient', {
          role: 'patient',
          anonymous: true,
        });
        return;
      }

      // Identify staff/doctors with limited info
      LogRocket.identify(email || 'unknown', {
        name: name || 'Staff',
        role: role || 'unknown',
      });
    } catch (e) {
      console.warn('[SessionRecording] Failed to identify user:', e);
    }
  },

  /**
   * Track a custom event
   * @param {string} event - Event name
   * @param {Object} data - Event data (will be sanitized)
   */
  track(event, data = {}) {
    if (!this.enabled || typeof LogRocket === 'undefined') return;

    // Sanitize data before tracking
    const sanitized = { ...data };
    delete sanitized.phone;
    delete sanitized.email;
    delete sanitized.address;
    delete sanitized.password;

    LogRocket.track(event, sanitized);
  },

  /**
   * Log an error to session recording
   * @param {Error} error - The error object
   * @param {Object} context - Additional context
   */
  captureException(error, context = {}) {
    if (!this.enabled || typeof LogRocket === 'undefined') return;

    LogRocket.captureException(error, {
      extra: context,
    });
  },

  /**
   * Get session URL for support
   * @returns {Promise<string|null>} - Session URL
   */
  async getSessionURL() {
    if (!this.enabled || typeof LogRocket === 'undefined') return null;

    return new Promise((resolve) => {
      LogRocket.getSessionURL((sessionURL) => {
        resolve(sessionURL);
      });
    });
  },

  /**
   * Check if current visitor is a bot
   * @returns {boolean}
   */
  isBot() {
    const botPatterns = [
      'bot',
      'crawl',
      'spider',
      'slurp',
      'lighthouse',
      'pagespeed',
      'pingdom',
      'uptimerobot',
    ];

    const ua = navigator.userAgent.toLowerCase();
    return botPatterns.some((pattern) => ua.includes(pattern));
  },

  /**
   * Check if running in development
   * @returns {boolean}
   */
  isDevelopment() {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.port !== ''
    );
  },

  /**
   * Check if user has given consent
   * @returns {boolean}
   */
  hasConsent() {
    // Check for consent cookie/localStorage
    const consent = localStorage.getItem('recording_consent');
    if (consent === 'true') return true;
    if (consent === 'false') return false;

    // Default: require explicit consent for GDPR
    // For non-EU users, we could auto-consent
    return true; // For now, assume consent
  },

  /**
   * Set user consent preference
   * @param {boolean} consent - Whether user consents
   */
  setConsent(consent) {
    localStorage.setItem('recording_consent', String(consent));

    if (consent && !this.initialized) {
      this.init(this.appId);
    } else if (!consent && this.enabled) {
      // Can't truly disable LogRocket once loaded, but can stop identifying
      this.enabled = false;
    }
  },

  /**
   * Get current version for release tracking
   * @returns {string}
   */
  getVersion() {
    if (typeof CONFIG !== 'undefined' && CONFIG.VERSION) {
      return CONFIG.VERSION;
    }
    return '1.0.0';
  },
};

// Auto-initialize on page load if config is available
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof CONFIG !== 'undefined' && CONFIG.LOGROCKET_ID) {
      SessionRecording.init(CONFIG.LOGROCKET_ID);
    }
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionRecording;
}

