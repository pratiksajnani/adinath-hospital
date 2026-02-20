/**
 * CONFIG Unit Tests
 * Tests Supabase connection config and base URL
 */

describe('CONFIG - Structure', () => {
    beforeEach(() => {
        jest.resetModules();
        global.window = { location: { hostname: 'localhost' } };
    });

    test('should load without throwing', () => {
        expect(() => require('../../js/config.js')).not.toThrow();
    });

    test('should export CONFIG object', () => {
        const { CONFIG } = require('../../js/config.js');
        expect(CONFIG).toBeDefined();
        expect(typeof CONFIG).toBe('object');
    });

    test('should have BASE_URL key', () => {
        const { CONFIG } = require('../../js/config.js');
        expect(Object.prototype.hasOwnProperty.call(CONFIG, 'BASE_URL')).toBe(true);
        expect(typeof CONFIG.BASE_URL).toBe('string');
    });

    test('should have SUPABASE_URL key', () => {
        const { CONFIG } = require('../../js/config.js');
        expect(Object.prototype.hasOwnProperty.call(CONFIG, 'SUPABASE_URL')).toBe(true);
    });

    test('should have SUPABASE_ANON_KEY key', () => {
        const { CONFIG } = require('../../js/config.js');
        expect(Object.prototype.hasOwnProperty.call(CONFIG, 'SUPABASE_ANON_KEY')).toBe(true);
    });
});

describe('CONFIG - SUPABASE_URL validation', () => {
    beforeEach(() => {
        jest.resetModules();
        global.window = { location: { hostname: 'localhost' } };
    });

    test('should be a valid HTTPS URL', () => {
        const { CONFIG } = require('../../js/config.js');
        // Validate URL format with regex (global.URL is mocked without constructor in setup.js)
        expect(CONFIG.SUPABASE_URL).toMatch(/^https:\/\/[a-zA-Z0-9.-]+\.supabase\.co$/);
    });

    test('should point to a supabase.co domain', () => {
        const { CONFIG } = require('../../js/config.js');
        expect(CONFIG.SUPABASE_URL).toContain('supabase.co');
    });
});

describe('CONFIG - SUPABASE_ANON_KEY validation', () => {
    beforeEach(() => {
        jest.resetModules();
        global.window = { location: { hostname: 'localhost' } };
    });

    test('should be defined and non-empty', () => {
        const { CONFIG } = require('../../js/config.js');
        expect(CONFIG.SUPABASE_ANON_KEY).toBeDefined();
        expect(CONFIG.SUPABASE_ANON_KEY.length).toBeGreaterThan(0);
    });

    test('should be a string', () => {
        const { CONFIG } = require('../../js/config.js');
        expect(typeof CONFIG.SUPABASE_ANON_KEY).toBe('string');
    });
});

describe('CONFIG - BASE_URL', () => {
    test('should be a string', () => {
        jest.resetModules();
        const { CONFIG } = require('../../js/config.js');
        expect(typeof CONFIG.BASE_URL).toBe('string');
    });

    test('should be empty string in test environment (localhost)', () => {
        jest.resetModules();
        // jsdom sets hostname to 'localhost', so BASE_URL should be empty
        const { CONFIG } = require('../../js/config.js');
        expect(CONFIG.BASE_URL).toBe('');
    });
});
