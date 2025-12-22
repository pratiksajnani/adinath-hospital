/**
 * Circuit Breaker Unit Tests
 * Tests circuit states, failure handling, and recovery
 */

const CircuitBreaker = require('../../js/circuit-breaker.js');

describe('CircuitBreaker', () => {
  beforeEach(() => {
    // Reset all circuits before each test
    CircuitBreaker.circuits = {};
    jest.clearAllMocks();
  });

  describe('States', () => {
    test('should define CLOSED state', () => {
      expect(CircuitBreaker.STATES.CLOSED).toBe('CLOSED');
    });

    test('should define OPEN state', () => {
      expect(CircuitBreaker.STATES.OPEN).toBe('OPEN');
    });

    test('should define HALF_OPEN state', () => {
      expect(CircuitBreaker.STATES.HALF_OPEN).toBe('HALF_OPEN');
    });
  });

  describe('Default Configuration', () => {
    test('should have failure threshold', () => {
      expect(CircuitBreaker.defaultConfig.failureThreshold).toBeDefined();
      expect(CircuitBreaker.defaultConfig.failureThreshold).toBeGreaterThan(0);
    });

    test('should have success threshold', () => {
      expect(CircuitBreaker.defaultConfig.successThreshold).toBeDefined();
      expect(CircuitBreaker.defaultConfig.successThreshold).toBeGreaterThan(0);
    });

    test('should have timeout', () => {
      expect(CircuitBreaker.defaultConfig.timeout).toBeDefined();
      expect(CircuitBreaker.defaultConfig.timeout).toBeGreaterThan(0);
    });
  });

  describe('getCircuit()', () => {
    test('should create new circuit if not exists', () => {
      const circuit = CircuitBreaker.getCircuit('test-service');

      expect(circuit).toBeDefined();
      expect(circuit.name).toBe('test-service');
      expect(circuit.state).toBe(CircuitBreaker.STATES.CLOSED);
      expect(circuit.failures).toBe(0);
    });

    test('should return existing circuit if exists', () => {
      const circuit1 = CircuitBreaker.getCircuit('test-service');
      circuit1.failures = 3;

      const circuit2 = CircuitBreaker.getCircuit('test-service');
      expect(circuit2.failures).toBe(3);
    });

    test('should use custom config if provided', () => {
      const circuit = CircuitBreaker.getCircuit('custom-service', {
        failureThreshold: 10,
        timeout: 60000,
      });

      expect(circuit.config.failureThreshold).toBe(10);
      expect(circuit.config.timeout).toBe(60000);
    });
  });

  describe('recordSuccess()', () => {
    test('should reset failure count on success', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.failures = 3;

      CircuitBreaker.recordSuccess(circuit);

      expect(circuit.failures).toBe(0);
    });

    test('should increment success count', () => {
      const circuit = CircuitBreaker.getCircuit('test');

      CircuitBreaker.recordSuccess(circuit);

      expect(circuit.successes).toBe(1);
    });

    test('should close circuit when enough successes in half-open state', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.state = CircuitBreaker.STATES.HALF_OPEN;
      circuit.config.successThreshold = 2;
      circuit.successes = 1;

      CircuitBreaker.recordSuccess(circuit);

      expect(circuit.state).toBe(CircuitBreaker.STATES.CLOSED);
    });
  });

  describe('recordFailure()', () => {
    test('should increment failure count', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      const error = new Error('test error');

      CircuitBreaker.recordFailure(circuit, error);

      expect(circuit.failures).toBe(1);
    });

    test('should reset success count on failure', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.successes = 5;
      const error = new Error('test error');

      CircuitBreaker.recordFailure(circuit, error);

      expect(circuit.successes).toBe(0);
    });

    test('should open circuit when threshold reached', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.config.failureThreshold = 3;
      circuit.failures = 2;

      CircuitBreaker.recordFailure(circuit, new Error('test'));

      expect(circuit.state).toBe(CircuitBreaker.STATES.OPEN);
    });

    test('should immediately open circuit on failure in half-open state', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.state = CircuitBreaker.STATES.HALF_OPEN;

      CircuitBreaker.recordFailure(circuit, new Error('test'));

      expect(circuit.state).toBe(CircuitBreaker.STATES.OPEN);
    });

    test('should set lastFailureTime', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      const before = Date.now();

      CircuitBreaker.recordFailure(circuit, new Error('test'));

      expect(circuit.lastFailureTime).toBeGreaterThanOrEqual(before);
    });
  });

  describe('openCircuit()', () => {
    test('should set state to OPEN', () => {
      const circuit = CircuitBreaker.getCircuit('test');

      CircuitBreaker.openCircuit(circuit);

      expect(circuit.state).toBe(CircuitBreaker.STATES.OPEN);
    });

    test('should set lastStateChange', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      const before = Date.now();

      CircuitBreaker.openCircuit(circuit);

      expect(circuit.lastStateChange).toBeGreaterThanOrEqual(before);
    });
  });

  describe('closeCircuit()', () => {
    test('should set state to CLOSED', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.state = CircuitBreaker.STATES.OPEN;

      CircuitBreaker.closeCircuit(circuit);

      expect(circuit.state).toBe(CircuitBreaker.STATES.CLOSED);
    });

    test('should reset failures and successes', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.state = CircuitBreaker.STATES.HALF_OPEN; // Must be non-CLOSED to trigger reset
      circuit.failures = 5;
      circuit.successes = 3;

      CircuitBreaker.closeCircuit(circuit);

      expect(circuit.failures).toBe(0);
      expect(circuit.successes).toBe(0);
    });
  });

  describe('halfOpenCircuit()', () => {
    test('should transition from OPEN to HALF_OPEN', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.state = CircuitBreaker.STATES.OPEN;

      CircuitBreaker.halfOpenCircuit(circuit);

      expect(circuit.state).toBe(CircuitBreaker.STATES.HALF_OPEN);
    });

    test('should not transition if not in OPEN state', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.state = CircuitBreaker.STATES.CLOSED;

      CircuitBreaker.halfOpenCircuit(circuit);

      expect(circuit.state).toBe(CircuitBreaker.STATES.CLOSED);
    });
  });

  describe('checkStateTransition()', () => {
    test('should transition to half-open after timeout', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.state = CircuitBreaker.STATES.OPEN;
      circuit.config.timeout = 1000;
      circuit.lastStateChange = Date.now() - 2000; // 2 seconds ago

      CircuitBreaker.checkStateTransition(circuit);

      expect(circuit.state).toBe(CircuitBreaker.STATES.HALF_OPEN);
    });

    test('should not transition if timeout not elapsed', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.state = CircuitBreaker.STATES.OPEN;
      circuit.config.timeout = 10000;
      circuit.lastStateChange = Date.now() - 1000; // 1 second ago

      CircuitBreaker.checkStateTransition(circuit);

      expect(circuit.state).toBe(CircuitBreaker.STATES.OPEN);
    });
  });

  describe('execute()', () => {
    test('should execute function when circuit is closed', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const fallback = jest.fn();

      const result = await CircuitBreaker.execute('test', fn, fallback);

      expect(fn).toHaveBeenCalled();
      expect(fallback).not.toHaveBeenCalled();
      expect(result).toBe('success');
    });

    test('should use fallback when circuit is open', async () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.state = CircuitBreaker.STATES.OPEN;
      circuit.lastStateChange = Date.now(); // Just opened

      const fn = jest.fn();
      const fallback = jest.fn().mockResolvedValue('fallback-result');

      const result = await CircuitBreaker.execute('test', fn, fallback);

      expect(fn).not.toHaveBeenCalled();
      expect(fallback).toHaveBeenCalled();
      expect(result).toBe('fallback-result');
    });

    test('should record success on successful execution', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const fallback = jest.fn();

      await CircuitBreaker.execute('test', fn, fallback);

      const circuit = CircuitBreaker.getCircuit('test');
      expect(circuit.successes).toBeGreaterThan(0);
    });

    test('should record failure and use fallback when fn throws', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('test error'));
      const fallback = jest.fn().mockResolvedValue('fallback');

      // Need to fail multiple times to open circuit
      const circuit = CircuitBreaker.getCircuit('test-fail', {
        failureThreshold: 1,
      });

      const result = await CircuitBreaker.execute('test-fail', fn, fallback);

      expect(circuit.state).toBe(CircuitBreaker.STATES.OPEN);
      expect(result).toBe('fallback');
    });
  });

  describe('getStatus()', () => {
    test('should return status for existing circuit', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.failures = 2;

      const status = CircuitBreaker.getStatus('test');

      expect(status.exists).toBe(true);
      expect(status.name).toBe('test');
      expect(status.failures).toBe(2);
      expect(status.isHealthy).toBe(true);
    });

    test('should return exists: false for non-existent circuit', () => {
      const status = CircuitBreaker.getStatus('non-existent');

      expect(status.exists).toBe(false);
    });

    test('should report unhealthy when circuit is open', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.state = CircuitBreaker.STATES.OPEN;

      const status = CircuitBreaker.getStatus('test');

      expect(status.isHealthy).toBe(false);
    });
  });

  describe('getAllStatuses()', () => {
    test('should return all circuit statuses', () => {
      CircuitBreaker.getCircuit('service1');
      CircuitBreaker.getCircuit('service2');
      CircuitBreaker.getCircuit('service3');

      const statuses = CircuitBreaker.getAllStatuses();

      expect(Object.keys(statuses).length).toBe(3);
      expect(statuses.service1).toBeDefined();
      expect(statuses.service2).toBeDefined();
      expect(statuses.service3).toBeDefined();
    });
  });

  describe('reset()', () => {
    test('should reset circuit to closed state', () => {
      const circuit = CircuitBreaker.getCircuit('test');
      circuit.state = CircuitBreaker.STATES.OPEN;
      circuit.failures = 5;

      CircuitBreaker.reset('test');

      expect(circuit.state).toBe(CircuitBreaker.STATES.CLOSED);
      expect(circuit.failures).toBe(0);
    });
  });

  describe('resetAll()', () => {
    test('should reset all circuits', () => {
      const circuit1 = CircuitBreaker.getCircuit('service1');
      const circuit2 = CircuitBreaker.getCircuit('service2');
      circuit1.state = CircuitBreaker.STATES.OPEN;
      circuit2.failures = 10;

      CircuitBreaker.resetAll();

      expect(circuit1.state).toBe(CircuitBreaker.STATES.CLOSED);
      expect(circuit2.failures).toBe(0);
    });
  });

  describe('wrap()', () => {
    test('should return a wrapped function', () => {
      const fn = jest.fn();
      const fallback = jest.fn();

      const wrapped = CircuitBreaker.wrap('test', fn, fallback);

      expect(typeof wrapped).toBe('function');
    });

    test('wrapped function should work correctly', async () => {
      const fn = jest.fn((x) => Promise.resolve(x * 2));
      const fallback = jest.fn();

      const wrapped = CircuitBreaker.wrap('test', fn, fallback);
      const result = await wrapped(5);

      expect(fn).toHaveBeenCalledWith(5);
      expect(result).toBe(10);
    });
  });

  describe('createServiceBreakers()', () => {
    test('should create sms breaker', () => {
      const breakers = CircuitBreaker.createServiceBreakers();

      expect(breakers.sms).toBeDefined();
      expect(typeof breakers.sms).toBe('function');
    });

    test('should create payment breaker', () => {
      const breakers = CircuitBreaker.createServiceBreakers();

      expect(breakers.payment).toBeDefined();
      expect(typeof breakers.payment).toBe('function');
    });

    test('should create whatsapp breaker', () => {
      const breakers = CircuitBreaker.createServiceBreakers();

      expect(breakers.whatsapp).toBeDefined();
      expect(typeof breakers.whatsapp).toBe('function');
    });
  });
});

