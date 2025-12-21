/**
 * API Service Unit Tests
 * Tests API endpoints, request handling, and service configuration
 */

// Mock window
window.SupabaseAuth = null;
window.Razorpay = null;

// Mock fetch
global.fetch = jest.fn();

// Mock document for script loading
const mockAppendChild = jest.fn();
Object.defineProperty(document, 'createElement', {
    value: (tag) => ({
        src: '',
        onload: null,
        onerror: null
    }),
    writable: true,
    configurable: true
});
Object.defineProperty(document, 'head', {
    value: { appendChild: mockAppendChild },
    writable: true,
    configurable: true
});

// Load API module
const API = require('../../js/api.js');

beforeEach(() => {
    fetch.mockClear();
    mockAppendChild.mockClear();
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

    test('should have sms service', () => {
        expect(API.sms).toBeDefined();
        expect(typeof API.sms.send).toBe('function');
    });

    test('should have payments service', () => {
        expect(API.payments).toBeDefined();
        expect(typeof API.payments.createOrder).toBe('function');
    });

    test('should have whatsapp service', () => {
        expect(API.whatsapp).toBeDefined();
        expect(typeof API.whatsapp.send).toBe('function');
    });

    test('should have invoices service', () => {
        expect(API.invoices).toBeDefined();
        expect(typeof API.invoices.generate).toBe('function');
    });

    test('should have healthCheck function', () => {
        expect(typeof API.healthCheck).toBe('function');
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
                access_token: 'test-token-123'
            })
        };
        const token = await API.getAuthToken();
        expect(token).toBe('test-token-123');
    });
});

describe('API.request()', () => {
    beforeEach(() => {
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true })
        });
    });

    test('should include apikey header', async () => {
        await API.request('/test');
        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'apikey': expect.any(String)
                })
            })
        );
    });

    test('should include Content-Type header', async () => {
        await API.request('/test');
        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Content-Type': 'application/json'
                })
            })
        );
    });

    test('should throw on non-ok response', async () => {
        fetch.mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: 'Unauthorized' })
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

describe('API.sms', () => {
    beforeEach(() => {
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true })
        });
    });

    test('send() should call /send-sms endpoint', async () => {
        await API.sms.send('9925450425', 'Test message');
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/send-sms'),
            expect.objectContaining({ method: 'POST' })
        );
    });

    test('send() should include message in body', async () => {
        await API.sms.send('9925450425', 'Hello');
        const callArgs = fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.to).toBe('9925450425');
        expect(body.message).toBe('Hello');
    });

    test('sendAppointmentConfirmation() should use correct template', async () => {
        await API.sms.sendAppointmentConfirmation('9925450425', 'Ramesh', 'Dr. Ashok', '2025-12-25', '11:00 AM');
        const callArgs = fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.template).toBe('appointment_confirm');
    });

    test('sendAppointmentReminder() should include reminder', async () => {
        await API.sms.sendAppointmentReminder('9925450425', 'Ramesh', 'Dr. Ashok', '11:00 AM');
        const callArgs = fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.template).toBe('appointment_reminder');
    });

    test('sendPrescriptionReady() should include patient name', async () => {
        await API.sms.sendPrescriptionReady('9925450425', 'Ramesh');
        const callArgs = fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.template).toBe('prescription_ready');
    });
});

describe('API.payments', () => {
    beforeEach(() => {
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ order_id: 'order_123' })
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

    test('payConsultation() should set correct type', async () => {
        await API.payments.payConsultation(500, 'Ramesh', 'Dr. Ashok');
        const callArgs = fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.type).toBe('consultation');
    });

    test('payMedicine() should include items', async () => {
        const items = [{ name: 'Paracetamol', qty: 2 }];
        await API.payments.payMedicine(200, items, 'Ramesh');
        const callArgs = fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.type).toBe('medicine');
    });

    test('payYogaClass() should include sessions', async () => {
        await API.payments.payYogaClass(1000, 'Ramesh', 5);
        const callArgs = fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.type).toBe('yoga');
    });
});

describe('API.whatsapp', () => {
    const mockOpen = jest.fn();
    
    beforeEach(() => {
        window.open = mockOpen;
        mockOpen.mockClear();
    });

    test('send() should open WhatsApp URL', () => {
        API.whatsapp.send('9925450425', 'Hello');
        expect(mockOpen).toHaveBeenCalledWith(
            expect.stringContaining('wa.me'),
            '_blank'
        );
    });

    test('send() should normalize phone number', () => {
        API.whatsapp.send('9925450425', 'Hello');
        expect(mockOpen).toHaveBeenCalledWith(
            expect.stringContaining('919925450425'),
            '_blank'
        );
    });

    test('send() should return success', () => {
        const result = API.whatsapp.send('9925450425', 'Test');
        expect(result.success).toBe(true);
        expect(result.method).toBe('whatsapp');
    });

    test('sendBookingConfirmation() should include message', () => {
        API.whatsapp.sendBookingConfirmation('9925450425', 'Ramesh', 'Dr. Ashok', '2025-12-25', '11:00 AM');
        expect(mockOpen).toHaveBeenCalledWith(
            expect.stringContaining('Adinath%20Hospital'),
            '_blank'
        );
    });
});

describe('API.invoices', () => {
    beforeEach(() => {
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true })
        });
    });

    test('generate() should call /generate-invoice endpoint', async () => {
        await API.invoices.generate({ patientName: 'Test', items: [] });
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/generate-invoice'),
            expect.objectContaining({ method: 'POST' })
        );
    });

    test('consultationInvoice() should set correct type', async () => {
        await API.invoices.consultationInvoice('Ramesh', 'Dr. Ashok', 500);
        const callArgs = fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.invoiceType).toBe('consultation');
    });

    test('medicineInvoice() should include items', async () => {
        const items = [{ name: 'Paracetamol', quantity: 2, price: 10 }];
        await API.invoices.medicineInvoice('Ramesh', items);
        const callArgs = fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.invoiceType).toBe('medicine');
    });

    test('yogaInvoice() should include sessions', async () => {
        await API.invoices.yogaInvoice('Ramesh', 5, 200);
        const callArgs = fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.invoiceType).toBe('yoga');
    });
});

describe('API.healthCheck()', () => {
    test('should return status on success', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ status: 'ok' })
        });
        const result = await API.healthCheck();
        expect(result.status).toBe('ok');
    });

    test('should return false on failure', async () => {
        fetch.mockRejectedValue(new Error('Connection failed'));
        const result = await API.healthCheck();
        expect(result).toBe(false);
    });
});
