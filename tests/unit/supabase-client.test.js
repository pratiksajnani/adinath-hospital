/**
 * Supabase Client Unit Tests
 * Tests configuration, auth basics, and utility functions
 */

// Mock window
global.window = {
  location: { hostname: 'localhost', href: 'http://localhost/', pathname: '/' },
};

// Mock document
global.document = {
  addEventListener: jest.fn(),
  referrer: '',
};

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [], error: null }),
  })
);

// Load the module
const SupabaseClient = require('../../js/supabase-client.js');

describe('SupabaseClient', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    test('should have SUPABASE_CONFIG defined', () => {
      expect(SupabaseClient.SUPABASE_CONFIG).toBeDefined();
    });

    test('should have url in config', () => {
      expect(SupabaseClient.SUPABASE_CONFIG.url).toBeDefined();
      expect(typeof SupabaseClient.SUPABASE_CONFIG.url).toBe('string');
    });

    test('should have anonKey in config', () => {
      expect(SupabaseClient.SUPABASE_CONFIG.anonKey).toBeDefined();
    });

    test('should export SupabaseAuth', () => {
      expect(SupabaseClient.SupabaseAuth).toBeDefined();
    });

    test('should export SupabaseDB', () => {
      expect(SupabaseClient.SupabaseDB).toBeDefined();
    });
  });

  describe('SupabaseAuth', () => {
    test('should have isConfigured method', () => {
      expect(typeof SupabaseClient.SupabaseAuth.isConfigured).toBe('function');
    });

    test('should have signUp method', () => {
      expect(typeof SupabaseClient.SupabaseAuth.signUp).toBe('function');
    });

    test('should have signIn method', () => {
      expect(typeof SupabaseClient.SupabaseAuth.signIn).toBe('function');
    });

    test('should have signOut method', () => {
      expect(typeof SupabaseClient.SupabaseAuth.signOut).toBe('function');
    });

    test('should have getSession method', () => {
      expect(typeof SupabaseClient.SupabaseAuth.getSession).toBe('function');
    });

    test('should have getCurrentUser method', () => {
      expect(typeof SupabaseClient.SupabaseAuth.getCurrentUser).toBe('function');
    });

    describe('signUp validation', () => {
      test('should validate email format', async () => {
        const result = await SupabaseClient.SupabaseAuth.signUp(
          'invalid-email',
          'password123',
          { role: 'patient' }
        );

        expect(result.error).toBeDefined();
      });

      test('should require password minimum length', async () => {
        const result = await SupabaseClient.SupabaseAuth.signUp(
          'test@test.com',
          '123',
          { role: 'patient' }
        );

        expect(result.error).toBeDefined();
      });
    });
  });

  describe('SupabaseDB', () => {
    test('should have fetch method', () => {
      expect(typeof SupabaseClient.SupabaseDB.fetch).toBe('function');
    });

    test('should have insert method', () => {
      expect(typeof SupabaseClient.SupabaseDB.insert).toBe('function');
    });

    test('should have update method', () => {
      expect(typeof SupabaseClient.SupabaseDB.update).toBe('function');
    });

    test('fetch should return array from localStorage when not configured', async () => {
      // Mock isConfigured to return false
      const originalIsConfigured = SupabaseClient.SupabaseAuth.isConfigured;
      SupabaseClient.SupabaseAuth.isConfigured = jest.fn(() => false);

      localStorage.setItem('hms_patients', JSON.stringify([{ id: '1', name: 'Test' }]));

      const result = await SupabaseClient.SupabaseDB.fetch('patients');

      expect(Array.isArray(result)).toBe(true);

      // Restore
      SupabaseClient.SupabaseAuth.isConfigured = originalIsConfigured;
    });
  });

  describe('Utility Functions', () => {
    describe('validateEmail()', () => {
      test('should validate correct email', () => {
        expect(SupabaseClient.utils.validateEmail('test@example.com')).toBe(true);
      });

      test('should reject invalid email - no @', () => {
        expect(SupabaseClient.utils.validateEmail('invalid')).toBe(false);
      });

      test('should reject invalid email - no domain', () => {
        expect(SupabaseClient.utils.validateEmail('test@')).toBe(false);
      });

      test('should reject invalid email - no local part', () => {
        expect(SupabaseClient.utils.validateEmail('@example.com')).toBe(false);
      });
    });

    describe('generateId()', () => {
      test('should generate unique IDs', () => {
        const id1 = SupabaseClient.utils.generateId();
        const id2 = SupabaseClient.utils.generateId();

        expect(id1).not.toBe(id2);
      });

      test('should generate string ID', () => {
        const id = SupabaseClient.utils.generateId();

        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
      });

      test('should start with id_ prefix', () => {
        const id = SupabaseClient.utils.generateId();

        expect(id.startsWith('id_')).toBe(true);
      });
    });
  });

  describe('isDemoMode()', () => {
    test('should be a function', () => {
      expect(typeof SupabaseClient.isDemoMode).toBe('function');
    });

    test('should return boolean', () => {
      const result = SupabaseClient.isDemoMode();
      expect(typeof result).toBe('boolean');
    });
  });
});
