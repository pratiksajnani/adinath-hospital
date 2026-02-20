/**
 * API Service Unit Tests
 * Tests API endpoints, request handling, and payment service
 */

// Mock window
window.SupabaseAuth = null;

// Mock fetch
global.fetch = jest.fn();

// Load API module
const API = require('../../js/api.js');

beforeEach(() => {
    fetch.mockClear();
    window.SupabaseAuth = null;
});

describe('API Module Structure', () => {
    test('should have baseUrl defined', () => {
        expect(API.baseUrl).toBeDefined();
        expect(API.baseUrl).toContain('supabase.co');
    });

    test('should have request function', () => {
        expect(typeof API.request).toBe('function');
    });

    test('should have payments service', () => {
        expect(API.payments).toBeDefined();
        expect(typeof API.payments.createOrder).toBe('function');
    });

    test('should have getAuthToken function', () => {
        expect(typeof API.getAuthToken).toBe('function');
    });
});

describe('API.getAuthToken()', () => {
    test('should return null when SupabaseAuth not available', async () => {
        window.SupabaseAuth = null;
        const token = await API.getAuthToken();
        expect(token).toBeNull();
    });

    test('should return token when session exists', async () => {
        window.SupabaseAuth = {
            getSession: jest.fn().mockResolvedValue({
                access_token: 'test-token-123',
            }),
        };
        const token = await API.getAuthToken();
        expect(token).toBe('test-token-123');
    });
});

describe('API.request()', () => {
    beforeEach(() => {
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true }),
        });
    });

    test('should include apikey header', async () => {
        await API.request('/test');
        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    apikey: expect.any(String),
                }),
            })
        );
    });

    test('should include Content-Type header', async () => {
        await API.request('/test');
        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                }),
            })
        );
    });

    test('should throw on non-ok response', async () => {
        fetch.mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: 'Unauthorized' }),
        });
        await expect(API.request('/test')).rejects.toThrow('Unauthorized');
    });

    test('should throw on network error', async () => {
        fetch.mockRejectedValue(new Error('Network failure'));
        await expect(API.request('/test')).rejects.toThrow('Network failure');
    });

    test('should construct full URL with baseUrl', async () => {
        await API.request('/test-endpoint');
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/test-endpoint'),
            expect.any(Object)
        );
    });
});

describe('API.payments', () => {
    beforeEach(() => {
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ order_id: 'order_123' }),
        });
    });

    test('createOrder() should call /create-payment endpoint', async () => {
        await API.payments.createOrder(500, 'consultation', 'Test');
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/create-payment'),
            expect.objectContaining({ method: 'POST' })
        );
    });

    test('createOrder() should include order details', async () => {
        await API.payments.createOrder(500, 'consultation', 'Test');
        const callArgs = fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.amount).toBe(500);
        expect(body.type).toBe('consultation');
        expect(body.receipt).toContain('ADH_');
    });
});
