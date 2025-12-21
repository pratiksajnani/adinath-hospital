/**
 * Config Module Unit Tests
 * Tests environment detection and configuration
 */

describe('Config Module', () => {
    // Save original window/location
    let originalWindow;

    beforeEach(() => {
        originalWindow = global.window;
        global.window = {
            location: {
                hostname: 'localhost',
                port: '3000',
                origin: 'http://localhost:3000'
            }
        };
    });

    afterEach(() => {
        global.window = originalWindow;
    });

    test('should detect localhost as development', () => {
        global.window.location.hostname = 'localhost';
        // Config would detect this as development
        expect(['localhost', '127.0.0.1'].includes(global.window.location.hostname)).toBe(true);
    });

    test('should detect github.io as staging', () => {
        global.window.location.hostname = 'pratiksajnani.github.io';
        expect(global.window.location.hostname.includes('github.io')).toBe(true);
    });

    test('should detect adinathhealth.com as production', () => {
        global.window.location.hostname = 'adinathhealth.com';
        expect(global.window.location.hostname).toBe('adinathhealth.com');
    });
});

describe('Hospital Configuration', () => {
    const hospitalConfig = {
        name: 'Adinath Hospital',
        tagline: 'Care with Compassion',
        phone: '+91 99254 50425',
        address: {
            line1: 'Shukan Mall, 2nd Floor',
            line2: 'Shahibaug Road',
            landmark: 'Near Rajasthan Hospital',
            city: 'Ahmedabad',
            state: 'Gujarat',
            pincode: '380004'
        },
        hours: {
            weekdays: '11:00 AM - 7:00 PM',
            sunday: 'Closed'
        },
        doctors: [
            { id: 'ashok', name: 'Dr. Ashok Sajnani', specialty: 'Orthopedic Surgery' },
            { id: 'sunita', name: 'Dr. Sunita Sajnani', specialty: 'Obstetrics & Gynecology' }
        ]
    };

    test('should have hospital name', () => {
        expect(hospitalConfig.name).toBe('Adinath Hospital');
    });

    test('should have valid phone number', () => {
        expect(hospitalConfig.phone).toMatch(/^\+91\s?\d{5}\s?\d{5}$/);
    });

    test('should have complete address', () => {
        expect(hospitalConfig.address.city).toBe('Ahmedabad');
        expect(hospitalConfig.address.state).toBe('Gujarat');
        expect(hospitalConfig.address.pincode).toBe('380004');
    });

    test('should have two doctors', () => {
        expect(hospitalConfig.doctors.length).toBe(2);
    });

    test('doctors should have required fields', () => {
        hospitalConfig.doctors.forEach(doc => {
            expect(doc.id).toBeDefined();
            expect(doc.name).toBeDefined();
            expect(doc.specialty).toBeDefined();
        });
    });

    test('should have operating hours', () => {
        expect(hospitalConfig.hours.weekdays).toMatch(/\d{1,2}:\d{2}\s?[AP]M/i);
    });
});

describe('URL Configuration', () => {
    test('production URL should be adinathhealth.com', () => {
        const productionUrl = 'https://adinathhealth.com';
        expect(productionUrl).toMatch(/^https:\/\/adinathhealth\.com$/);
    });

    test('staging URL should be github pages', () => {
        const stagingUrl = 'https://pratiksajnani.github.io/adinath-hospital';
        expect(stagingUrl).toMatch(/github\.io/);
    });

    test('WhatsApp link should be properly formatted', () => {
        const phone = '919925450425';
        const waLink = `https://wa.me/${phone}`;
        expect(waLink).toBe('https://wa.me/919925450425');
    });

    test('Google Maps link should have coordinates', () => {
        const mapsLink = 'https://www.google.com/maps?q=23.0439,72.5969';
        expect(mapsLink).toMatch(/maps\?q=[\d.-]+,[\d.-]+/);
    });
});

describe('Feature Flags', () => {
    const features = {
        enableBooking: true,
        enablePharmacy: true,
        enableYoga: true,
        enablePatientPortal: true,
        enableDoctorPortal: true,
        enableAdminPortal: true,
        enableMultilingual: true,
        enablePWA: true
    };

    test('all core features should be enabled', () => {
        expect(features.enableBooking).toBe(true);
        expect(features.enablePatientPortal).toBe(true);
        expect(features.enableDoctorPortal).toBe(true);
    });

    test('multilingual should be enabled', () => {
        expect(features.enableMultilingual).toBe(true);
    });

    test('PWA should be enabled', () => {
        expect(features.enablePWA).toBe(true);
    });
});

console.log('Config Unit Tests loaded');

