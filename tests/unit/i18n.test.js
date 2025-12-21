/**
 * I18N (Internationalization) Unit Tests
 * Tests multilingual support for English, Hindi, Gujarati
 */

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

// Mock document
const mockElements = [];
const documentMock = {
    querySelectorAll: (selector) => mockElements.filter(el => el.matches(selector)),
    documentElement: { lang: 'en' },
    addEventListener: () => {}
};

global.localStorage = localStorageMock;
global.document = documentMock;

// Load I18N module
const fs = require('fs');
const path = require('path');
const i18nCode = fs.readFileSync(path.join(__dirname, '../../js/i18n.js'), 'utf8');
eval(i18nCode);

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

    test('should have all three languages', () => {
        const sampleKey = 'hospital_name';
        expect(I18N.translations[sampleKey].en).toBeDefined();
        expect(I18N.translations[sampleKey].hi).toBeDefined();
        expect(I18N.translations[sampleKey].gu).toBeDefined();
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

    test('should return Hindi translation', () => {
        I18N.currentLanguage = 'hi';
        const result = I18N.t('hospital_name');
        expect(result).toBe('आदिनाथ हॉस्पिटल');
    });

    test('should return Gujarati translation', () => {
        I18N.currentLanguage = 'gu';
        const result = I18N.t('hospital_name');
        expect(result).toBe('આદિનાથ હોસ્પિટલ');
    });

    test('should return key for missing translation', () => {
        const result = I18N.t('nonexistent_key');
        expect(result).toBe('nonexistent_key');
    });

    test('should accept explicit language parameter', () => {
        I18N.currentLanguage = 'en';
        const result = I18N.t('hospital_name', 'gu');
        expect(result).toBe('આદિનાથ હોસ્પિટલ');
    });

    test('should fallback to English if language missing', () => {
        // If a key only has English, should return English
        const result = I18N.t('hospital_name', 'fr');
        expect(result).toBe('Adinath Hospital');
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

    test('should reject invalid language', () => {
        I18N.setLanguage('fr');
        expect(I18N.currentLanguage).toBe('en');
    });

    test('should accept en, hi, gu only', () => {
        ['en', 'hi', 'gu'].forEach(lang => {
            I18N.setLanguage(lang);
            expect(I18N.currentLanguage).toBe(lang);
        });
    });
});

describe('Translation Coverage', () => {
    const requiredKeys = [
        // Header & Branding
        'hospital_name', 'tagline',
        // Navigation
        'nav_home', 'nav_services', 'nav_doctors', 'nav_contact', 'nav_book',
        // Hero
        'hero_title_1', 'hero_title_2', 'hero_subtitle',
        // CTAs
        'cta_book', 'cta_call', 'book_appointment',
        // Doctor Cards
        'dr_ashok_title', 'dr_ashok_exp', 'dr_sunita_title', 'dr_sunita_exp',
        // Services
        'ortho_title', 'ortho_1', 'ortho_2', 'gyn_title', 'gyn_1', 'gyn_2',
        // Stats
        'stat_since', 'stat_doctors', 'stat_rotary',
        // Doctors Section
        'doctors_tag', 'doctors_title',
        // Specialties
        'spec_ortho', 'spec_joint', 'spec_orthobio', 'spec_obgyn', 'spec_adolescent', 'spec_cosmetic',
        // Doctor Interests
        'special_interest', 'ashok_int_1', 'ashok_int_2', 'ashok_int_3',
        'sunita_int_1', 'sunita_int_2', 'sunita_int_3',
        // Expect Section
        'expect_tag', 'expect_title', 'expect_subtitle',
        'step1_title', 'step1_desc', 'step2_title', 'step2_desc',
        'step3_title', 'step3_desc', 'step4_title', 'step4_desc',
        // Gallery
        'gallery_tag', 'gallery_title',
        // Yoga
        'yoga_tag', 'yoga_title', 'yoga_desc',
        // Dr. Corner
        'corner_tag', 'corner_title', 'corner_desc',
        // Contact
        'contact_tag', 'contact_title', 'address_label', 'phone_label', 'hours_full',
        // Pharmacy
        'pharmacy_title', 'pharmacy_1', 'pharmacy_2',
        // Common
        'welcome', 'logout', 'save', 'cancel', 'loading', 'error',
        // Footer
        'footer_about', 'quick_links', 'copyright'
    ];

    test.each(requiredKeys)('should have translation for "%s"', (key) => {
        expect(I18N.translations[key]).toBeDefined();
    });

    test.each(requiredKeys)('"%s" should have all three languages', (key) => {
        const translation = I18N.translations[key];
        expect(translation.en).toBeDefined();
        expect(translation.hi).toBeDefined();
        expect(translation.gu).toBeDefined();
    });
});

describe('Language-specific Content', () => {
    test('Hindi translations should contain Devanagari script', () => {
        const hindi = I18N.t('hospital_name', 'hi');
        expect(/[\u0900-\u097F]/.test(hindi)).toBe(true);
    });

    test('Gujarati translations should contain Gujarati script', () => {
        const gujarati = I18N.t('hospital_name', 'gu');
        expect(/[\u0A80-\u0AFF]/.test(gujarati)).toBe(true);
    });

    test('English translations should be ASCII', () => {
        const english = I18N.t('hospital_name', 'en');
        expect(/^[\x00-\x7F]+$/.test(english)).toBe(true);
    });
});

console.log('I18N Unit Tests loaded');

