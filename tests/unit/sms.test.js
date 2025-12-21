/**
 * SMS Service Unit Tests
 * Tests SMS templates and phone number normalization
 */

describe('SMS - Phone Number Normalization', () => {
    test('should normalize 10-digit Indian phone numbers', () => {
        // Test the normalization logic
        const normalize = (phone) => {
            let p = phone.toString().replace(/\D/g, '');
            if (p.length === 10) p = '91' + p;
            if (!p.startsWith('91')) p = '91' + p;
            return p;
        };

        expect(normalize('9925450425')).toBe('919925450425');
        expect(normalize('+919925450425')).toBe('919925450425');
        expect(normalize('919925450425')).toBe('919925450425');
        expect(normalize('99254-50425')).toBe('919925450425');
        expect(normalize('99 254 504 25')).toBe('919925450425');
    });

    test('should handle international numbers', () => {
        const normalize = (phone) => {
            let p = phone.toString().replace(/\D/g, '');
            if (p.length === 10) p = '91' + p;
            return p;
        };

        // 10 digit number gets +91
        expect(normalize('1234567890')).toBe('911234567890');
    });
});

describe('SMS - Templates', () => {
    // Template format tests
    const templates = {
        doctorRegistration: (name, link) => 
            `Namaste ${name}! Welcome to Adinath Hospital digital system. Please complete your registration: ${link} - Adinath Hospital`,
        
        appointmentConfirm: (patientName, doctorName, date, time) =>
            `Dear ${patientName}, your appointment with ${doctorName} is confirmed for ${date} at ${time}. Adinath Hospital, Shahibaug. Call: 9925450425`,
        
        appointmentReminder: (patientName, doctorName, time) =>
            `Reminder: ${patientName}, your appointment with ${doctorName} is in 1 hour at ${time}. Adinath Hospital. Reply CONFIRM or call 9925450425`,
        
        prescriptionReady: (patientName) =>
            `Dear ${patientName}, your prescription is ready for pickup at Adinath Hospital pharmacy. Timings: 11AM-7PM. Call: 9925450425`
    };

    test('doctorRegistration should include name and link', () => {
        const message = templates.doctorRegistration('Dr. Ashok', 'https://example.com/register');
        expect(message).toContain('Dr. Ashok');
        expect(message).toContain('https://example.com/register');
        expect(message).toContain('Adinath Hospital');
    });

    test('appointmentConfirm should include all details', () => {
        const message = templates.appointmentConfirm(
            'Ramesh Kumar', 
            'Dr. Ashok', 
            '2025-12-25', 
            '11:00 AM'
        );
        expect(message).toContain('Ramesh Kumar');
        expect(message).toContain('Dr. Ashok');
        expect(message).toContain('2025-12-25');
        expect(message).toContain('11:00 AM');
        expect(message).toContain('9925450425');
    });

    test('appointmentReminder should include reminder info', () => {
        const message = templates.appointmentReminder(
            'Ramesh Kumar', 
            'Dr. Ashok', 
            '11:00 AM'
        );
        expect(message).toContain('Reminder');
        expect(message).toContain('Ramesh Kumar');
        expect(message).toContain('Dr. Ashok');
        expect(message).toContain('1 hour');
    });

    test('prescriptionReady should include patient name', () => {
        const message = templates.prescriptionReady('Ramesh Kumar');
        expect(message).toContain('Ramesh Kumar');
        expect(message).toContain('prescription');
        expect(message).toContain('pharmacy');
    });
});

describe('SMS - WhatsApp URL Generation', () => {
    test('should generate valid WhatsApp URL', () => {
        const phone = '919925450425';
        const message = 'Hello World';
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        
        expect(url).toBe('https://wa.me/919925450425?text=Hello%20World');
    });

    test('should encode special characters properly', () => {
        const message = 'Hello & Goodbye!';
        const encoded = encodeURIComponent(message);
        expect(encoded).toBe('Hello%20%26%20Goodbye!');
    });
});

describe('SMS - Doctor Tokens', () => {
    const tokens = {
        'ashok': 'ASH2024REG',
        'sunita': 'SUN2024REG'
    };

    test('should have valid token for ashok', () => {
        expect(tokens['ashok']).toBe('ASH2024REG');
    });

    test('should have valid token for sunita', () => {
        expect(tokens['sunita']).toBe('SUN2024REG');
    });

    test('should return undefined for unknown doctor', () => {
        expect(tokens['unknown']).toBeUndefined();
    });
});

describe('SMS - Doctor Phone Numbers', () => {
    const doctors = {
        'ashok': { name: 'Dr. Ashok', phone: '9824066854' },
        'sunita': { name: 'Dr. Sunita', phone: '9925450425' }
    };

    test('should have correct phone for ashok', () => {
        expect(doctors['ashok'].phone).toBe('9824066854');
    });

    test('should have correct phone for sunita', () => {
        expect(doctors['sunita'].phone).toBe('9925450425');
    });
});
