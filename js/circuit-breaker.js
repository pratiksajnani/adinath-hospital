/**
 * Circuit Breaker Module
 * Implements the circuit breaker pattern for resilient API calls
 * @module CircuitBreaker
 */

/* global ErrorTracking */

const CircuitBreaker = {
  // Circuit states
  STATES: {
    CLOSED: 'CLOSED', // Normal operation, requests go through
    OPEN: 'OPEN', // Circuit is open, requests fail fast
    HALF_OPEN: 'HALF_OPEN', // Testing if service is recovered
  },

  // Default configuration
  defaultConfig: {
    failureThreshold: 5, // Number of failures before opening circuit
    successThreshold: 2, // Number of successes to close circuit
    timeout: 30000, // Time in ms before attempting to close circuit
    monitorInterval: 5000, // How often to check circuit state
  },

  // Circuit instances
  circuits: {},

  /**
   * Get or create a circuit for a service
   * @param {string} name - Service name
   * @param {Object} config - Optional configuration
   * @returns {Object} - Circuit instance
   */
  getCircuit(name, config = {}) {
    if (!this.circuits[name]) {
      this.circuits[name] = {
        name,
        state: this.STATES.CLOSED,
        failures: 0,
        successes: 0,
        lastFailureTime: null,
        lastStateChange: Date.now(),
        config: { ...this.defaultConfig, ...config },
      };
    }
    return this.circuits[name];
  },

  /**
   * Execute a function with circuit breaker protection
   * @param {string} name - Circuit name
   * @param {Function} fn - Function to execute
   * @param {Function} fallback - Fallback function if circuit is open
   * @param {Object} config - Optional configuration
   * @returns {Promise<*>} - Result of fn or fallback
   */
  async execute(name, fn, fallback, config = {}) {
    const circuit = this.getCircuit(name, config);

    // Check if circuit should be half-open
    this.checkStateTransition(circuit);

    // If circuit is open, use fallback
    if (circuit.state === this.STATES.OPEN) {
      console.warn(`[CircuitBreaker] ${name} is OPEN, using fallback`);
      return this.executeFallback(fallback, name);
    }

    try {
      const result = await fn();
      this.recordSuccess(circuit);
      return result;
    } catch (error) {
      this.recordFailure(circuit, error);

      // If circuit just opened, use fallback
      if (circuit.state === this.STATES.OPEN) {
        return this.executeFallback(fallback, name);
      }

      // Re-throw for handling
      throw error;
    }
  },

  /**
   * Execute fallback function
   * @param {Function} fallback - Fallback function
   * @param {string} circuitName - Circuit name for logging
   * @returns {Promise<*>} - Fallback result
   */
  async executeFallback(fallback, circuitName) {
    if (typeof fallback !== 'function') {
      throw new Error(`Circuit ${circuitName} is open and no fallback provided`);
    }

    try {
      return await fallback();
    } catch (error) {
      console.error(`[CircuitBreaker] Fallback for ${circuitName} failed:`, error);
      throw error;
    }
  },

  /**
   * Record a successful call
   * @param {Object} circuit - Circuit instance
   */
  recordSuccess(circuit) {
    circuit.failures = 0;
    circuit.successes++;

    // If half-open and enough successes, close circuit
    if (
      circuit.state === this.STATES.HALF_OPEN &&
      circuit.successes >= circuit.config.successThreshold
    ) {
      this.closeCircuit(circuit);
    }
  },

  /**
   * Record a failed call
   * @param {Object} circuit - Circuit instance
   * @param {Error} error - The error that occurred
   */
  recordFailure(circuit, error) {
    circuit.failures++;
    circuit.successes = 0;
    circuit.lastFailureTime = Date.now();

    console.warn(`[CircuitBreaker] ${circuit.name} failure #${circuit.failures}:`, error.message);

    // If in half-open state, open immediately on failure
    if (circuit.state === this.STATES.HALF_OPEN) {
      this.openCircuit(circuit);
      return;
    }

    // Check if we should open the circuit
    if (circuit.failures >= circuit.config.failureThreshold) {
      this.openCircuit(circuit);
    }
  },

  /**
   * Open the circuit
   * @param {Object} circuit - Circuit instance
   */
  openCircuit(circuit) {
    if (circuit.state !== this.STATES.OPEN) {
      console.warn(`[CircuitBreaker] Opening circuit: ${circuit.name}`);
      circuit.state = this.STATES.OPEN;
      circuit.lastStateChange = Date.now();

      // Track with error tracking
      if (typeof ErrorTracking !== 'undefined' && ErrorTracking.captureMessage) {
        ErrorTracking.captureMessage(`Circuit opened: ${circuit.name}`, 'warning', {
          failures: circuit.failures,
        });
      }
    }
  },

  /**
   * Close the circuit
   * @param {Object} circuit - Circuit instance
   */
  closeCircuit(circuit) {
    if (circuit.state !== this.STATES.CLOSED) {
      console.info(`[CircuitBreaker] Closing circuit: ${circuit.name}`);
      circuit.state = this.STATES.CLOSED;
      circuit.failures = 0;
      circuit.successes = 0;
      circuit.lastStateChange = Date.now();
    }
  },

  /**
   * Transition to half-open state
   * @param {Object} circuit - Circuit instance
   */
  halfOpenCircuit(circuit) {
    if (circuit.state === this.STATES.OPEN) {
      console.info(`[CircuitBreaker] Half-opening circuit: ${circuit.name}`);
      circuit.state = this.STATES.HALF_OPEN;
      circuit.successes = 0;
      circuit.lastStateChange = Date.now();
    }
  },

  /**
   * Check if circuit should transition state
   * @param {Object} circuit - Circuit instance
   */
  checkStateTransition(circuit) {
    if (circuit.state !== this.STATES.OPEN) {
      return;
    }

    const now = Date.now();
    const timeSinceOpen = now - circuit.lastStateChange;

    // If enough time has passed, try half-open
    if (timeSinceOpen >= circuit.config.timeout) {
      this.halfOpenCircuit(circuit);
    }
  },

  /**
   * Get circuit status
   * @param {string} name - Circuit name
   * @returns {Object} - Circuit status
   */
  getStatus(name) {
    const circuit = this.circuits[name];
    if (!circuit) {
      return { exists: false };
    }

    return {
      exists: true,
      name: circuit.name,
      state: circuit.state,
      failures: circuit.failures,
      successes: circuit.successes,
      lastFailureTime: circuit.lastFailureTime,
      lastStateChange: circuit.lastStateChange,
      isHealthy: circuit.state === this.STATES.CLOSED,
    };
  },

  /**
   * Get all circuit statuses
   * @returns {Object} - All circuit statuses
   */
  getAllStatuses() {
    const statuses = {};
    for (const name of Object.keys(this.circuits)) {
      statuses[name] = this.getStatus(name);
    }
    return statuses;
  },

  /**
   * Reset a circuit
   * @param {string} name - Circuit name
   */
  reset(name) {
    if (this.circuits[name]) {
      const circuit = this.circuits[name];
      circuit.state = this.STATES.CLOSED;
      circuit.failures = 0;
      circuit.successes = 0;
      circuit.lastFailureTime = null;
      circuit.lastStateChange = Date.now();
      console.info(`[CircuitBreaker] Reset circuit: ${name}`);
    }
  },

  /**
   * Reset all circuits
   */
  resetAll() {
    for (const name of Object.keys(this.circuits)) {
      this.reset(name);
    }
  },

  /**
   * Create a wrapped function with circuit breaker
   * @param {string} name - Circuit name
   * @param {Function} fn - Function to wrap
   * @param {Function} fallback - Fallback function
   * @param {Object} config - Configuration
   * @returns {Function} - Wrapped function
   */
  wrap(name, fn, fallback, config = {}) {
    return (...args) => {
      return this.execute(
        name,
        () => fn(...args),
        () => (typeof fallback === 'function' ? fallback(...args) : fallback),
        config
      );
    };
  },

  /**
   * Create circuit breakers for common services
   * @returns {Object} - Pre-configured circuit breakers
   */
  createServiceBreakers() {
    return {
      sms: this.wrap(
        'sms',
        async (to, message) => {
          const response = await fetch('/api/sms', {
            method: 'POST',
            body: JSON.stringify({ to, message }),
          });
          if (!response.ok) throw new Error('SMS failed');
          return response.json();
        },
        () => {
          console.warn('[CircuitBreaker] SMS fallback: showing phone number');
          return { success: false, fallback: true, message: 'Please call +91 99254 50425' };
        }
      ),

      payment: this.wrap(
        'payment',
        async (amount, details) => {
          const response = await fetch('/api/payment', {
            method: 'POST',
            body: JSON.stringify({ amount, details }),
          });
          if (!response.ok) throw new Error('Payment failed');
          return response.json();
        },
        () => {
          console.warn('[CircuitBreaker] Payment fallback: showing UPI QR');
          return {
            success: false,
            fallback: true,
            message: 'Please use UPI to pay',
            upiId: 'adinathospital@upi',
          };
        }
      ),

      whatsapp: this.wrap(
        'whatsapp',
        async (to, message) => {
          const response = await fetch('/api/whatsapp', {
            method: 'POST',
            body: JSON.stringify({ to, message }),
          });
          if (!response.ok) throw new Error('WhatsApp failed');
          return response.json();
        },
        (to, message) => {
          console.warn('[CircuitBreaker] WhatsApp fallback: opening link');
          const url = `https://wa.me/${to}?text=${encodeURIComponent(message)}`;
          window.open(url, '_blank');
          return { success: true, fallback: true, url };
        }
      ),
    };
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CircuitBreaker;
}

