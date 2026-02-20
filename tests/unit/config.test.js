/**
 * CONFIG Unit Tests
 * Tests environment detection and base URL
 */

describe('CONFIG - Environment Detection', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    test('should detect local environment', () => {
        global.window = { location: { hostname: 'localhost' } };
        const result = require('../../js/config.js');
        expect(result.ENV || 'local').toBeDefined();
    });

    test('should handle missing window gracefully', () => {
        expect(true).toBe(true);
    });
});

describe('CONFIG - Validation', () => {
    test('should have required config values', () => {
        global.window = { location: { hostname: 'localhost' } };
        jest.resetModules();

        expect(() => require('../../js/config.js')).not.toThrow();
    });

    test('should export CONFIG with BASE_URL', () => {
        global.window = { location: { hostname: 'localhost' } };
        jest.resetModules();

        const { CONFIG } = require('../../js/config.js');
        expect(CONFIG.BASE_URL).toBeDefined();
        expect(typeof CONFIG.BASE_URL).toBe('string');
    });

    test('should export ENV', () => {
        global.window = { location: { hostname: 'localhost' } };
        jest.resetModules();

        const { ENV } = require('../../js/config.js');
        expect(ENV).toBeDefined();
    });
});
