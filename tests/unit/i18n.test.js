/**
 * I18N (Internationalization) Unit Tests
 * Tests multilingual support for English, Hindi, Gujarati
 */

// Load I18N module
const I18N = require('../../js/i18n.js');

describe('I18N Core', () => {
    beforeEach(() => {
        localStorage.clear();
        I18N.currentLanguage = 'en';
    });

    test('should have default language as English', () => {
        expect(I18N.currentLanguage).toBe('en');
    });

    test('should have translations object', () => {
        expect(I18N.translations).toBeDefined();
        expect(typeof I18N.translations).toBe('object');
    });

    test('should have hospital_name translations', () => {
        expect(I18N.translations.hospital_name).toBeDefined();
        expect(I18N.translations.hospital_name.en).toBe('Adinath Hospital');
        expect(I18N.translations.hospital_name.hi).toBe('आदिनाथ हॉस्पिटल');
        expect(I18N.translations.hospital_name.gu).toBe('આદિનાથ હોસ્પિટલ');
    });

    test('should have init function', () => {
        expect(typeof I18N.init).toBe('function');
    });

    test('should have setLanguage function', () => {
        expect(typeof I18N.setLanguage).toBe('function');
    });

    test('should have t function', () => {
        expect(typeof I18N.t).toBe('function');
    });

    test('should have applyTranslations function', () => {
        expect(typeof I18N.applyTranslations).toBe('function');
    });
});

describe('I18N.t() - Translation Function', () => {
    beforeEach(() => {
        localStorage.clear();
        I18N.currentLanguage = 'en';
    });

    test('should return English translation by default', () => {
        const result = I18N.t('hospital_name');
        expect(result).toBe('Adinath Hospital');
    });

    test('should return Hindi translation when language is hi', () => {
        I18N.currentLanguage = 'hi';
        const result = I18N.t('hospital_name');
        expect(result).toBe('आदिनाथ हॉस्पिटल');
    });

    test('should return Gujarati translation when language is gu', () => {
        I18N.currentLanguage = 'gu';
        const result = I18N.t('hospital_name');
        expect(result).toBe('આદિનાથ હોસ્પિટલ');
    });

    test('should return key for missing translation', () => {
        const result = I18N.t('nonexistent_key');
        expect(result).toBe('nonexistent_key');
    });

    test('should translate navigation items', () => {
        expect(I18N.t('nav_home')).toBe('Home');
        expect(I18N.t('nav_services')).toBe('Services');
        expect(I18N.t('nav_doctors')).toBe('Doctors');
    });

    test('should translate CTA buttons', () => {
        expect(I18N.t('cta_book')).toBeDefined();
        expect(I18N.t('cta_call')).toBeDefined();
        expect(I18N.t('book_appointment')).toBeDefined();
    });

    test('should accept explicit language parameter', () => {
        I18N.currentLanguage = 'en';
        expect(I18N.t('hospital_name', 'hi')).toBe('आदिनाथ हॉस्पिटल');
        expect(I18N.t('hospital_name', 'gu')).toBe('આદિનાથ હોસ્પિટલ');
    });
});

describe('I18N.setLanguage()', () => {
    beforeEach(() => {
        localStorage.clear();
        I18N.currentLanguage = 'en';
    });

    test('should change current language', () => {
        I18N.setLanguage('hi');
        expect(I18N.currentLanguage).toBe('hi');
    });

    test('should save to localStorage', () => {
        I18N.setLanguage('gu');
        expect(localStorage.getItem('hms_language')).toBe('gu');
    });

    test('should accept all supported languages', () => {
        ['en', 'hi', 'gu'].forEach(lang => {
            I18N.setLanguage(lang);
            expect(I18N.currentLanguage).toBe(lang);
        });
    });

    test('should reject invalid language', () => {
        I18N.currentLanguage = 'en';
        I18N.setLanguage('fr');
        expect(I18N.currentLanguage).toBe('en');
    });
});

describe('I18N.init()', () => {
    beforeEach(() => {
        localStorage.clear();
        I18N.currentLanguage = 'en';
    });

    test('should initialize with default language', () => {
        I18N.init();
        expect(I18N.currentLanguage).toBeDefined();
    });

    test('should load language from localStorage', () => {
        localStorage.setItem('hms_language', 'hi');
        I18N.init();
        expect(I18N.currentLanguage).toBe('hi');
    });

    test('should keep English when no language stored', () => {
        // When no language is stored, init keeps the current (default) language
        I18N.currentLanguage = 'en';
        I18N.init();
        expect(I18N.currentLanguage).toBe('en');
    });
});

describe('Translation Coverage - Navigation', () => {
    const navKeys = ['nav_home', 'nav_services', 'nav_doctors', 'nav_contact', 'nav_book'];

    test.each(navKeys)('should have translation for %s', (key) => {
        expect(I18N.translations[key]).toBeDefined();
    });

    test.each(navKeys)('%s should have all three languages', (key) => {
        expect(I18N.translations[key].en).toBeDefined();
        expect(I18N.translations[key].hi).toBeDefined();
        expect(I18N.translations[key].gu).toBeDefined();
    });
});

describe('Translation Coverage - CTAs', () => {
    const ctaKeys = ['cta_book', 'cta_call', 'book_appointment', 'learn_more'];

    test.each(ctaKeys)('should have translation for %s', (key) => {
        expect(I18N.translations[key]).toBeDefined();
    });
});

describe('Translation Coverage - Doctor Info', () => {
    test('should have Dr. Ashok title translation', () => {
        expect(I18N.translations.dr_ashok_title).toBeDefined();
        expect(I18N.translations.dr_ashok_title.en).toBe('Orthopedic Surgeon');
    });

    test('should have Dr. Sunita title translation', () => {
        expect(I18N.translations.dr_sunita_title).toBeDefined();
        expect(I18N.translations.dr_sunita_title.en).toBeDefined();
    });

    test('should have Dr. Ashok experience translation', () => {
        expect(I18N.translations.dr_ashok_exp).toBeDefined();
        expect(I18N.translations.dr_ashok_exp.en).toContain('Years');
    });

    test('should have Dr. Sunita experience translation', () => {
        expect(I18N.translations.dr_sunita_exp).toBeDefined();
        expect(I18N.translations.dr_sunita_exp.en).toContain('Years');
    });
});

describe('Language-specific Content', () => {
    test('Hindi translations should contain Devanagari script', () => {
        const hindi = I18N.translations.hospital_name.hi;
        expect(/[\u0900-\u097F]/.test(hindi)).toBe(true);
    });

    test('Gujarati translations should contain Gujarati script', () => {
        const gujarati = I18N.translations.hospital_name.gu;
        expect(/[\u0A80-\u0AFF]/.test(gujarati)).toBe(true);
    });

    test('English translations should be ASCII', () => {
        const english = I18N.translations.hospital_name.en;
        expect(/^[\x00-\x7F]+$/.test(english)).toBe(true);
    });
});

describe('I18N - Hero Section Translations', () => {
    const heroKeys = ['hero_title_1', 'hero_title_2', 'hero_subtitle'];

    test.each(heroKeys)('should have translation for %s', (key) => {
        expect(I18N.translations[key]).toBeDefined();
    });
});

describe('I18N - Service Translations', () => {
    const serviceKeys = ['feature_ortho', 'feature_gyn', 'feature_yoga'];

    test.each(serviceKeys)('should have translation for %s', (key) => {
        expect(I18N.translations[key]).toBeDefined();
    });
});
