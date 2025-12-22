/**
 * SMS Service Unit Tests
 * Tests SMS templates and phone number normalization
 */

// Mock window.open before loading module
const mockOpen = jest.fn();
window.open = mockOpen;

// Jest 30+ with jsdom - use the existing location object
// Note: Tests that rely on window.location.origin will use jsdom's default (http://localhost)

// Mock fetch
global.fetch = jest.fn();

// Load SMS module
const SMS = require('../../js/sms.js');

beforeEach(() => {
    mockOpen.mockClear();
    fetch.mockClear();
    SMS.provider = 'whatsapp';
});

describe('SMS Module Structure', () => {
    test('should have provider property', () => {
        expect(SMS.provider).toBeDefined();
    });

    test('should have templates object', () => {
        expect(SMS.templates).toBeDefined();
    });

    test('should have send function', () => {
        expect(typeof SMS.send).toBe('function');
    });

    test('should have sendViaWhatsApp function', () => {
        expect(typeof SMS.sendViaWhatsApp).toBe('function');
    });

    test('should have generateDoctorLink function', () => {
        expect(typeof SMS.generateDoctorLink).toBe('function');
    });

    test('should have sendDoctorRegistrationSMS function', () => {
        expect(typeof SMS.sendDoctorRegistrationSMS).toBe('function');
    });
});

describe('SMS - Phone Number Normalization', () => {
    test('should normalize 10-digit phone', async () => {
        await SMS.send('9925450425', 'Test message');
        expect(mockOpen).toHaveBeenCalledWith(
            expect.stringContaining('919925450425'),
            '_blank'
        );
    });

    test('should handle phone with +91 prefix', async () => {
        await SMS.send('+919925450425', 'Test');
        expect(mockOpen).toHaveBeenCalledWith(
            expect.stringContaining('919925450425'),
            '_blank'
        );
    });

    test('should strip non-numeric characters', async () => {
        await SMS.send('99254-50425', 'Test');
        expect(mockOpen).toHaveBeenCalledWith(
            expect.stringContaining('919925450425'),
            '_blank'
        );
    });

    test('should handle phone with spaces', async () => {
        await SMS.send('99 254 504 25', 'Test');
        expect(mockOpen).toHaveBeenCalledWith(
            expect.stringContaining('919925450425'),
            '_blank'
        );
    });
});

describe('SMS - Templates', () => {
    test('doctorRegistration should format correctly', () => {
        const msg = SMS.templates.doctorRegistration('Dr. Ashok', 'https://example.com/reg');
        expect(msg).toContain('Dr. Ashok');
        expect(msg).toContain('https://example.com/reg');
        expect(msg).toContain('Adinath Hospital');
    });

    test('appointmentConfirm should include all details', () => {
        const msg = SMS.templates.appointmentConfirm('Ramesh', 'Dr. Ashok', '2025-12-25', '11:00 AM');
        expect(msg).toContain('Ramesh');
        expect(msg).toContain('Dr. Ashok');
        expect(msg).toContain('2025-12-25');
        expect(msg).toContain('11:00 AM');
    });

    test('appointmentReminder should include reminder context', () => {
        const msg = SMS.templates.appointmentReminder('Ramesh', 'Dr. Ashok', '11:00 AM');
        expect(msg).toContain('Reminder');
        expect(msg).toContain('1 hour');
    });

    test('prescriptionReady should mention pharmacy', () => {
        const msg = SMS.templates.prescriptionReady('Ramesh');
        expect(msg).toContain('Ramesh');
        expect(msg).toContain('prescription');
        expect(msg).toContain('pharmacy');
    });
});

describe('SMS - WhatsApp Fallback', () => {
    test('sendViaWhatsApp should return success', () => {
        const result = SMS.sendViaWhatsApp('919925450425', 'Test');
        expect(result.success).toBe(true);
        expect(result.method).toBe('whatsapp');
    });

    test('sendViaWhatsApp should construct correct URL', () => {
        SMS.sendViaWhatsApp('919925450425', 'Hello World');
        expect(mockOpen).toHaveBeenCalledWith(
            'https://wa.me/919925450425?text=Hello%20World',
            '_blank'
        );
    });

    test('should properly encode special characters', () => {
        SMS.sendViaWhatsApp('919925450425', 'Hello & Goodbye!');
        expect(mockOpen).toHaveBeenCalledWith(
            expect.stringContaining('Hello%20%26%20Goodbye!'),
            '_blank'
        );
    });
});

describe('SMS - Doctor Link Generation', () => {
    test('should generate valid link for ashok', () => {
        const link = SMS.generateDoctorLink('ashok');
        expect(link).toContain('/onboard/doctor.html');
        expect(link).toContain('id=ashok');
        expect(link).toContain('token=ASH2024REG');
    });

    test('should generate valid link for sunita', () => {
        const link = SMS.generateDoctorLink('sunita');
        expect(link).toContain('id=sunita');
        expect(link).toContain('token=SUN2024REG');
    });

    test('should return null for unknown doctor', () => {
        const link = SMS.generateDoctorLink('unknown');
        expect(link).toBeNull();
    });
});

describe('SMS - Doctor Registration SMS', () => {
    test('should send to correct phone for ashok', async () => {
        await SMS.sendDoctorRegistrationSMS('ashok');
        expect(mockOpen).toHaveBeenCalledWith(
            expect.stringContaining('919824066854'),
            '_blank'
        );
    });

    test('should send to correct phone for sunita', async () => {
        await SMS.sendDoctorRegistrationSMS('sunita');
        expect(mockOpen).toHaveBeenCalledWith(
            expect.stringContaining('919925450425'),
            '_blank'
        );
    });

    test('should return false for unknown doctor', async () => {
        const result = await SMS.sendDoctorRegistrationSMS('unknown');
        expect(result).toBe(false);
    });
});

describe('SMS - Configuration', () => {
    test('should have MSG91 config with correct sender ID', () => {
        expect(SMS.msg91).toBeDefined();
        expect(SMS.msg91.senderId).toBe('ADNHSP');
    });

    test('should have Twilio config structure', () => {
        expect(SMS.twilio).toBeDefined();
        expect(SMS.twilio).toHaveProperty('accountSid');
        expect(SMS.twilio).toHaveProperty('authToken');
        expect(SMS.twilio).toHaveProperty('fromNumber');
    });

    test('should have all required templates', () => {
        expect(typeof SMS.templates.doctorRegistration).toBe('function');
        expect(typeof SMS.templates.appointmentConfirm).toBe('function');
        expect(typeof SMS.templates.appointmentReminder).toBe('function');
        expect(typeof SMS.templates.prescriptionReady).toBe('function');
    });
});

describe('SMS - Provider Fallback', () => {
    test('should fallback to WhatsApp when Twilio not configured', async () => {
        SMS.provider = 'twilio';
        SMS.twilio.accountSid = '';
        await SMS.send('9925450425', 'Test');
        expect(mockOpen).toHaveBeenCalled();
    });

    test('should fallback to WhatsApp when MSG91 not configured', async () => {
        SMS.provider = 'msg91';
        SMS.msg91.authKey = '';
        await SMS.send('9925450425', 'Test');
        expect(mockOpen).toHaveBeenCalled();
    });
});

describe('SMS - Twilio Provider', () => {
    beforeEach(() => {
        SMS.provider = 'twilio';
        SMS.twilio.accountSid = 'test-account-sid';
        SMS.twilio.authToken = 'test-auth-token';
        SMS.twilio.fromNumber = '+1234567890';
    });

    test('sendViaTwilio should call fetch when configured', async () => {
        fetch.mockResolvedValue({ ok: true });
        await SMS.sendViaTwilio('919925450425', 'Test');
        expect(fetch).toHaveBeenCalledWith('/api/sms/send', expect.any(Object));
    });

    test('sendViaTwilio should fallback to WhatsApp on fetch error', async () => {
        fetch.mockRejectedValue(new Error('Network error'));
        const result = await SMS.sendViaTwilio('919925450425', 'Test');
        expect(mockOpen).toHaveBeenCalled();
        expect(result.success).toBe(true);
    });

    test('sendViaTwilio should return true on success', async () => {
        fetch.mockResolvedValue({ ok: true });
        const result = await SMS.sendViaTwilio('919925450425', 'Test');
        expect(result).toBe(true);
    });
});

describe('SMS - MSG91 Provider', () => {
    beforeEach(() => {
        SMS.provider = 'msg91';
        SMS.msg91.authKey = 'test-auth-key';
        SMS.msg91.senderId = 'ADNHSP';
    });

    test('sendViaMsg91 should call fetch when configured', async () => {
        fetch.mockResolvedValue({ ok: true });
        await SMS.sendViaMsg91('919925450425', 'Test');
        expect(fetch).toHaveBeenCalledWith('/api/sms/send', expect.any(Object));
    });

    test('sendViaMsg91 should fallback to WhatsApp on fetch error', async () => {
        fetch.mockRejectedValue(new Error('Network error'));
        const result = await SMS.sendViaMsg91('919925450425', 'Test');
        expect(mockOpen).toHaveBeenCalled();
        expect(result.success).toBe(true);
    });

    test('sendViaMsg91 should return true on success', async () => {
        fetch.mockResolvedValue({ ok: true });
        const result = await SMS.sendViaMsg91('919925450425', 'Test');
        expect(result).toBe(true);
    });
});

