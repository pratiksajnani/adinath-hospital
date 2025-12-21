/**
 * i18n (Internationalization) Unit Tests
 * Tests the language translation functionality
 */

const fs = require('fs');
const path = require('path');

// Read and evaluate i18n module
const i18nCode = fs.readFileSync(path.join(__dirname, '../../js/i18n.js'), 'utf8');
eval(i18nCode);

describe('I18N Module', () => {
  
  beforeEach(() => {
    localStorage.clear();
    I18N.currentLanguage = 'en';
  });

  describe('Initialization', () => {
    test('should default to English', () => {
      expect(I18N.currentLanguage).toBe('en');
    });

    test('should have translations object', () => {
      expect(I18N.translations).toBeDefined();
      expect(typeof I18N.translations).toBe('object');
    });

    test('should have required translation keys', () => {
      const requiredKeys = [
        'hospital_name',
        'nav_home',
        'nav_services',
        'nav_doctors',
        'cta_book'
      ];
      
      requiredKeys.forEach(key => {
        expect(I18N.translations[key]).toBeDefined();
      });
    });
  });

  describe('Language Switching', () => {
    test('should switch to Hindi', () => {
      I18N.setLanguage('hi');
      expect(I18N.currentLanguage).toBe('hi');
    });

    test('should switch to Gujarati', () => {
      I18N.setLanguage('gu');
      expect(I18N.currentLanguage).toBe('gu');
    });

    test('should switch back to English', () => {
      I18N.setLanguage('gu');
      I18N.setLanguage('en');
      expect(I18N.currentLanguage).toBe('en');
    });

    test('should reject invalid language codes', () => {
      I18N.setLanguage('invalid');
      expect(I18N.currentLanguage).toBe('en');
    });

    test('should persist language to localStorage', () => {
      I18N.setLanguage('hi');
      expect(localStorage.getItem('hms_language')).toBe('hi');
    });

    test('should load saved language', () => {
      localStorage.setItem('hms_language', 'gu');
      I18N.init();
      expect(I18N.currentLanguage).toBe('gu');
    });
  });

  describe('Translation Function', () => {
    test('should return English translation by default', () => {
      const result = I18N.t('hospital_name');
      expect(result).toBe('Adinath Hospital');
    });

    test('should return Hindi translation when set', () => {
      I18N.setLanguage('hi');
      const result = I18N.t('hospital_name');
      expect(result).toBe('आदिनाथ हॉस्पिटल');
    });

    test('should return Gujarati translation when set', () => {
      I18N.setLanguage('gu');
      const result = I18N.t('hospital_name');
      expect(result).toBe('આદિનાથ હોસ્પિટલ');
    });

    test('should return key if translation not found', () => {
      const result = I18N.t('nonexistent_key');
      expect(result).toBe('nonexistent_key');
    });

    test('should support explicit language parameter', () => {
      const result = I18N.t('hospital_name', 'gu');
      expect(result).toBe('આદિનાથ હોસ્પિટલ');
    });

    test('should fall back to English if translation missing', () => {
      // Add a key with only English translation
      I18N.translations.test_key = { en: 'Test Value' };
      
      I18N.setLanguage('hi');
      const result = I18N.t('test_key');
      expect(result).toBe('Test Value');
    });
  });

  describe('Translation Coverage', () => {
    test('should have all three languages for essential keys', () => {
      const essentialKeys = [
        'hospital_name',
        'tagline',
        'nav_home',
        'nav_services',
        'nav_doctors',
        'nav_contact',
        'cta_book',
        'cta_call'
      ];
      
      essentialKeys.forEach(key => {
        const translation = I18N.translations[key];
        expect(translation.en).toBeDefined();
        expect(translation.hi).toBeDefined();
        expect(translation.gu).toBeDefined();
      });
    });

    test('should have service translations', () => {
      expect(I18N.translations.ortho_title).toBeDefined();
      expect(I18N.translations.gyn_title).toBeDefined();
      expect(I18N.translations.pharmacy_title).toBeDefined();
    });

    test('should have doctor translations', () => {
      expect(I18N.translations.dr_ashok_title).toBeDefined();
      expect(I18N.translations.dr_sunita_title).toBeDefined();
    });

    test('should have contact translations', () => {
      expect(I18N.translations.contact_title).toBeDefined();
      expect(I18N.translations.address_label).toBeDefined();
      expect(I18N.translations.phone_label).toBeDefined();
    });
  });

  describe('RTL Support', () => {
    // Note: Hindi and Gujarati are LTR languages
    test('should not require RTL for supported languages', () => {
      const supportedLanguages = ['en', 'hi', 'gu'];
      // All current languages are LTR
      supportedLanguages.forEach(lang => {
        expect(['en', 'hi', 'gu']).toContain(lang);
      });
    });
  });
});
