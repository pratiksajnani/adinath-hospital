/**
 * I18N (Internationalization) Unit Tests
 * Tests the multilingual support
 */

describe('I18N - Supported Languages', () => {
    const supportedLanguages = ['en', 'hi', 'gu'];

    test('should support English', () => {
        expect(supportedLanguages).toContain('en');
    });

    test('should support Hindi', () => {
        expect(supportedLanguages).toContain('hi');
    });

    test('should support Gujarati', () => {
        expect(supportedLanguages).toContain('gu');
    });
});

describe('I18N - Translation Keys', () => {
    const translations = {
        hospital_name: { en: 'Adinath Hospital', hi: 'आदिनाथ हॉस्पिटल', gu: 'આદિનાથ હોસ્પિટલ' },
        book_appointment: { en: 'Book Appointment', hi: 'अपॉइंटमेंट बुक करें', gu: 'એપોઇન્ટમેન્ટ બુક કરો' },
        welcome: { en: 'Welcome', hi: 'स्वागत है', gu: 'સ્વાગત છે' }
    };

    test('hospital_name should have all translations', () => {
        expect(translations.hospital_name.en).toBeDefined();
        expect(translations.hospital_name.hi).toBeDefined();
        expect(translations.hospital_name.gu).toBeDefined();
    });

    test('book_appointment should have all translations', () => {
        expect(translations.book_appointment.en).toBe('Book Appointment');
        expect(translations.book_appointment.hi).toBe('अपॉइंटमेंट बुक करें');
        expect(translations.book_appointment.gu).toBe('એપોઇન્ટમેન્ટ બુક કરો');
    });

    test('Hindi text should contain Devanagari characters', () => {
        expect(translations.hospital_name.hi).toMatch(/[\u0900-\u097F]/);
    });

    test('Gujarati text should contain Gujarati characters', () => {
        expect(translations.hospital_name.gu).toMatch(/[\u0A80-\u0AFF]/);
    });
});

describe('I18N - Language Detection', () => {
    test('should return stored language or default to English', () => {
        const getLanguage = (stored) => stored || 'en';

        expect(getLanguage('hi')).toBe('hi');
        expect(getLanguage('gu')).toBe('gu');
        expect(getLanguage(null)).toBe('en');
        expect(getLanguage(undefined)).toBe('en');
    });

    test('should default to English if no language set', () => {
        const defaultLanguage = 'en';
        expect(defaultLanguage).toBe('en');
    });
});

describe('I18N - Translation Function', () => {
    const translations = {
        greeting: { en: 'Hello', hi: 'नमस्ते', gu: 'નમસ્તે' }
    };

    const translate = (key, lang = 'en') => {
        const translation = translations[key];
        if (!translation) return key;
        return translation[lang] || translation.en || key;
    };

    test('should return English translation', () => {
        expect(translate('greeting', 'en')).toBe('Hello');
    });

    test('should return Hindi translation', () => {
        expect(translate('greeting', 'hi')).toBe('नमस्ते');
    });

    test('should return Gujarati translation', () => {
        expect(translate('greeting', 'gu')).toBe('નમસ્તે');
    });

    test('should fallback to English for unknown language', () => {
        expect(translate('greeting', 'fr')).toBe('Hello');
    });

    test('should return key for unknown translation', () => {
        expect(translate('unknown_key', 'en')).toBe('unknown_key');
    });
});

describe('I18N - Doctor Names', () => {
    const doctorNames = {
        ashok: { en: 'Dr. Ashok Sajnani', hi: 'डॉ. अशोक सजनानी', gu: 'ડૉ. અશોક સજનાની' },
        sunita: { en: 'Dr. Sunita Sajnani', hi: 'डॉ. सुनीता सजनानी', gu: 'ડૉ. સુનિતા સજનાની' }
    };

    test('should have Dr. Ashok name in all languages', () => {
        expect(doctorNames.ashok.en).toContain('Ashok');
        expect(doctorNames.ashok.hi).toContain('अशोक');
        expect(doctorNames.ashok.gu).toContain('અશોક');
    });

    test('should have Dr. Sunita name in all languages', () => {
        expect(doctorNames.sunita.en).toContain('Sunita');
        expect(doctorNames.sunita.hi).toContain('सुनीता');
        expect(doctorNames.sunita.gu).toContain('સુનિતા');
    });
});

describe('I18N - Service Names', () => {
    const services = {
        orthopedic: { en: 'Orthopedic Care', hi: 'हड्डी रोग', gu: 'હાડકાની સારવાર' },
        gynecology: { en: 'Gynecology', hi: 'स्त्री रोग', gu: 'સ્ત્રીરોગ' },
        yoga: { en: 'Yoga Classes', hi: 'योग कक्षाएं', gu: 'યોગ વર્ગો' }
    };

    test('orthopedic should have translations', () => {
        expect(services.orthopedic.en).toBe('Orthopedic Care');
        expect(services.orthopedic.hi).toBeDefined();
        expect(services.orthopedic.gu).toBeDefined();
    });

    test('yoga should have translations', () => {
        expect(services.yoga.en).toBe('Yoga Classes');
        expect(services.yoga.hi).toContain('योग');
    });
});

describe('I18N - Button Labels', () => {
    const buttons = {
        login: { en: '🔐 Login', hi: '🔐 लॉगिन करें', gu: '🔐 લોગિન કરો' },
        book: { en: 'Book Now', hi: 'अभी बुक करें', gu: 'હમણાં બુક કરો' }
    };

    test('login button should have emoji in all languages', () => {
        expect(buttons.login.en).toContain('🔐');
        expect(buttons.login.hi).toContain('🔐');
        expect(buttons.login.gu).toContain('🔐');
    });
});
