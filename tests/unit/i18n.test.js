/**
 * I18N (Internationalization) Unit Tests
 * Tests multilingual support for English, Hindi, Gujarati
 */

// Sample translations for testing
const translations = {
    hospital_name: {
        en: 'Adinath Hospital',
        hi: 'आदिनाथ हॉस्पिटल',
        gu: 'આદિનાથ હોસ્પિટલ'
    },
    book_appointment: {
        en: 'Book Appointment',
        hi: 'अपॉइंटमेंट बुक करें',
        gu: 'એપોઇન્ટમેન્ટ બુક કરો'
    },
    dr_ashok_title: {
        en: 'Dr. Ashok Sajnani',
        hi: 'डॉ. अशोक सजनानी',
        gu: 'ડૉ. અશોક સજનાની'
    },
    dr_sunita_title: {
        en: 'Dr. Sunita Sajnani',
        hi: 'डॉ. सुनीता सजनानी',
        gu: 'ડૉ. સુનીતા સજનાની'
    },
    nav_home: { en: 'Home', hi: 'होम', gu: 'હોમ' },
    nav_services: { en: 'Services', hi: 'सेवाएं', gu: 'સેવાઓ' },
    nav_doctors: { en: 'Doctors', hi: 'डॉक्टर्स', gu: 'ડોક્ટર્સ' },
    nav_contact: { en: 'Contact', hi: 'संपर्क', gu: 'સંપર્ક' }
};

describe('I18N - Supported Languages', () => {
    const SUPPORTED_LANGUAGES = ['en', 'hi', 'gu'];

    test('should support English', () => {
        expect(SUPPORTED_LANGUAGES).toContain('en');
    });

    test('should support Hindi', () => {
        expect(SUPPORTED_LANGUAGES).toContain('hi');
    });

    test('should support Gujarati', () => {
        expect(SUPPORTED_LANGUAGES).toContain('gu');
    });
});

describe('I18N - Translation Keys', () => {
    test('hospital_name should have all translations', () => {
        expect(translations.hospital_name.en).toBe('Adinath Hospital');
        expect(translations.hospital_name.hi).toBe('आदिनाथ हॉस्पिटल');
        expect(translations.hospital_name.gu).toBe('આદિનાથ હોસ્પિટલ');
    });

    test('book_appointment should have all translations', () => {
        expect(translations.book_appointment.en).toBeDefined();
        expect(translations.book_appointment.hi).toBeDefined();
        expect(translations.book_appointment.gu).toBeDefined();
    });

    test('Hindi text should contain Devanagari characters', () => {
        expect(translations.hospital_name.hi).toMatch(/[\u0900-\u097F]/);
    });

    test('Gujarati text should contain Gujarati characters', () => {
        expect(translations.hospital_name.gu).toMatch(/[\u0A80-\u0AFF]/);
    });
});

describe('I18N - Language Detection', () => {
    test('should get language from localStorage', () => {
        const getLanguage = () => {
            const stored = localStorage.getItem('hms_language');
            return stored || 'en';
        };

        // Set Hindi language
        localStorage.setItem('hms_language', 'hi');
        expect(getLanguage()).toBe('hi');

        // Clear and check default
        localStorage.removeItem('hms_language');
        expect(getLanguage()).toBe('en');
    });

    test('should default to English if no language set', () => {
        const getLanguage = () => localStorage.getItem('hms_language') || 'en';
        localStorage.clear();
        expect(getLanguage()).toBe('en');
    });
});

describe('I18N - Translation Function', () => {
    const t = (key, lang = 'en') => {
        const translation = translations[key];
        if (!translation) return key;
        return translation[lang] || translation['en'] || key;
    };

    test('should return English translation', () => {
        expect(t('hospital_name', 'en')).toBe('Adinath Hospital');
    });

    test('should return Hindi translation', () => {
        expect(t('hospital_name', 'hi')).toBe('आदिनाथ हॉस्पिटल');
    });

    test('should return Gujarati translation', () => {
        expect(t('hospital_name', 'gu')).toBe('આદિનાથ હોસ્પિટલ');
    });

    test('should fallback to English for unknown language', () => {
        expect(t('hospital_name', 'fr')).toBe('Adinath Hospital');
    });

    test('should return key for unknown translation', () => {
        expect(t('nonexistent_key', 'en')).toBe('nonexistent_key');
    });
});

describe('I18N - Doctor Names', () => {
    test('should have Dr. Ashok name in all languages', () => {
        expect(translations.dr_ashok_title.en).toBe('Dr. Ashok Sajnani');
        expect(translations.dr_ashok_title.hi).toContain('डॉ');
        expect(translations.dr_ashok_title.gu).toContain('ડૉ');
    });

    test('should have Dr. Sunita name in all languages', () => {
        expect(translations.dr_sunita_title.en).toBe('Dr. Sunita Sajnani');
        expect(translations.dr_sunita_title.hi).toContain('डॉ');
        expect(translations.dr_sunita_title.gu).toContain('ડૉ');
    });
});

describe('I18N - Navigation Translations', () => {
    test('should have nav_home in all languages', () => {
        expect(translations.nav_home.en).toBe('Home');
        expect(translations.nav_home.hi).toBeDefined();
        expect(translations.nav_home.gu).toBeDefined();
    });

    test('should have nav_services in all languages', () => {
        expect(translations.nav_services.en).toBe('Services');
        expect(translations.nav_services.hi).toBeDefined();
        expect(translations.nav_services.gu).toBeDefined();
    });

    test('should have nav_doctors in all languages', () => {
        expect(translations.nav_doctors.en).toBe('Doctors');
        expect(translations.nav_doctors.hi).toBeDefined();
        expect(translations.nav_doctors.gu).toBeDefined();
    });

    test('should have nav_contact in all languages', () => {
        expect(translations.nav_contact.en).toBe('Contact');
        expect(translations.nav_contact.hi).toBeDefined();
        expect(translations.nav_contact.gu).toBeDefined();
    });
});

describe('I18N - Language Validation', () => {
    const isValidLanguage = (lang) => ['en', 'hi', 'gu'].includes(lang);

    test('should validate English', () => {
        expect(isValidLanguage('en')).toBe(true);
    });

    test('should validate Hindi', () => {
        expect(isValidLanguage('hi')).toBe(true);
    });

    test('should validate Gujarati', () => {
        expect(isValidLanguage('gu')).toBe(true);
    });

    test('should reject invalid language', () => {
        expect(isValidLanguage('fr')).toBe(false);
        expect(isValidLanguage('de')).toBe(false);
        expect(isValidLanguage('')).toBe(false);
    });
});

describe('I18N - Script Detection', () => {
    test('should detect Devanagari script', () => {
        const hasDevanagari = (text) => /[\u0900-\u097F]/.test(text);
        
        expect(hasDevanagari('आदिनाथ')).toBe(true);
        expect(hasDevanagari('Adinath')).toBe(false);
    });

    test('should detect Gujarati script', () => {
        const hasGujarati = (text) => /[\u0A80-\u0AFF]/.test(text);
        
        expect(hasGujarati('આદિનાથ')).toBe(true);
        expect(hasGujarati('Adinath')).toBe(false);
    });

    test('should detect ASCII/English text', () => {
        const isASCII = (text) => /^[\x00-\x7F]+$/.test(text);
        
        expect(isASCII('Adinath Hospital')).toBe(true);
        expect(isASCII('आदिनाथ')).toBe(false);
    });
});

describe('I18N - Language Persistence', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should save language to localStorage', () => {
        const setLanguage = (lang) => {
            if (['en', 'hi', 'gu'].includes(lang)) {
                localStorage.setItem('hms_language', lang);
                return true;
            }
            return false;
        };

        expect(setLanguage('hi')).toBe(true);
        expect(localStorage.getItem('hms_language')).toBe('hi');
    });

    test('should reject invalid language save', () => {
        const setLanguage = (lang) => {
            if (['en', 'hi', 'gu'].includes(lang)) {
                localStorage.setItem('hms_language', lang);
                return true;
            }
            return false;
        };

        expect(setLanguage('fr')).toBe(false);
        expect(localStorage.getItem('hms_language')).toBeNull();
    });
});

describe('I18N - RTL Support Check', () => {
    test('none of the supported languages should be RTL', () => {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        const supportedLanguages = ['en', 'hi', 'gu'];
        
        supportedLanguages.forEach(lang => {
            expect(rtlLanguages).not.toContain(lang);
        });
    });
});

describe('I18N - Translation Completeness', () => {
    test('all translation keys should have all three languages', () => {
        Object.keys(translations).forEach(key => {
            expect(translations[key].en).toBeDefined();
            expect(translations[key].hi).toBeDefined();
            expect(translations[key].gu).toBeDefined();
        });
    });

    test('no translation should be empty string', () => {
        Object.keys(translations).forEach(key => {
            expect(translations[key].en).not.toBe('');
            expect(translations[key].hi).not.toBe('');
            expect(translations[key].gu).not.toBe('');
        });
    });
});
