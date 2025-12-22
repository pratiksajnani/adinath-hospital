/**
 * Chatbot Unit Tests
 * Tests FAQ matching, multilingual support, and user interaction
 */

// Mock DOM elements
const mockElement = {
  style: {},
  classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
  addEventListener: jest.fn(),
  appendChild: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  querySelector: jest.fn(() => null),
  innerHTML: '',
  textContent: '',
  value: '',
  focus: jest.fn(),
  remove: jest.fn(),
};

global.document = {
  createElement: jest.fn(() => ({ ...mockElement })),
  body: { appendChild: jest.fn() },
  getElementById: jest.fn(() => ({ ...mockElement })),
  querySelector: jest.fn(() => ({ ...mockElement })),
  querySelectorAll: jest.fn(() => []),
  addEventListener: jest.fn(),
};

global.window = {
  location: { pathname: '/', hostname: 'localhost' },
  open: jest.fn(),
};

global.navigator = {
  language: 'en-US',
};

// Load the module
const Chatbot = require('../../js/chatbot.js');

describe('Chatbot', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    Chatbot.messages = [];
    Chatbot.unansweredQuestions = [];
    Chatbot.isOpen = false;
    Chatbot.language = 'en';
  });

  describe('Language Detection', () => {
    test('should default to English', () => {
      const lang = Chatbot.detectLanguage();
      expect(lang).toBe('en');
    });

    test('should use stored language preference', () => {
      localStorage.setItem('preferred_language', 'hi');
      const lang = Chatbot.detectLanguage();
      expect(lang).toBe('hi');
    });

    test('should detect Hindi from browser language', () => {
      global.navigator.language = 'hi-IN';
      localStorage.clear();
      const lang = Chatbot.detectLanguage();
      expect(lang).toBe('hi');
    });

    test('should detect Gujarati from browser language', () => {
      global.navigator.language = 'gu-IN';
      localStorage.clear();
      const lang = Chatbot.detectLanguage();
      expect(lang).toBe('gu');
    });

    test('should fallback to English for unsupported languages', () => {
      global.navigator.language = 'fr-FR';
      localStorage.clear();
      const lang = Chatbot.detectLanguage();
      expect(lang).toBe('en');
    });
  });

  describe('FAQ Database', () => {
    test('should have appointment FAQ', () => {
      expect(Chatbot.faq.appointment).toBeDefined();
      expect(Chatbot.faq.appointment.keywords).toContain('appointment');
      expect(Chatbot.faq.appointment.response.en).toBeDefined();
      expect(Chatbot.faq.appointment.response.hi).toBeDefined();
      expect(Chatbot.faq.appointment.response.gu).toBeDefined();
    });

    test('should have hours FAQ', () => {
      expect(Chatbot.faq.hours).toBeDefined();
      expect(Chatbot.faq.hours.keywords).toContain('hours');
    });

    test('should have location FAQ', () => {
      expect(Chatbot.faq.location).toBeDefined();
      expect(Chatbot.faq.location.keywords).toContain('location');
    });

    test('should have doctors FAQ', () => {
      expect(Chatbot.faq.doctors).toBeDefined();
      expect(Chatbot.faq.doctors.keywords).toContain('doctor');
    });

    test('should have emergency FAQ', () => {
      expect(Chatbot.faq.emergency).toBeDefined();
      expect(Chatbot.faq.emergency.keywords).toContain('emergency');
    });

    test('should have contact FAQ', () => {
      expect(Chatbot.faq.contact).toBeDefined();
      expect(Chatbot.faq.contact.keywords).toContain('phone');
    });

    test('should have all FAQs with multilingual responses', () => {
      const languages = ['en', 'hi', 'gu'];
      Object.values(Chatbot.faq).forEach((faq) => {
        languages.forEach((lang) => {
          expect(faq.response[lang]).toBeDefined();
          expect(typeof faq.response[lang]).toBe('string');
          expect(faq.response[lang].length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Response Finding', () => {
    test('should find appointment response for "book appointment"', () => {
      Chatbot.language = 'en';
      const response = Chatbot.findResponse('I want to book an appointment');
      expect(response.text).toContain('appointment');
    });

    test('should find hours response for "what time"', () => {
      Chatbot.language = 'en';
      const response = Chatbot.findResponse('What time are you open?');
      expect(response.text).toContain('11');
    });

    test('should find location response for "where is hospital"', () => {
      Chatbot.language = 'en';
      const response = Chatbot.findResponse('Where is the hospital located?');
      expect(response.text).toContain('Shahibaug');
    });

    test('should find emergency response for "emergency"', () => {
      Chatbot.language = 'en';
      const response = Chatbot.findResponse('Is this an emergency hospital?');
      expect(response.text).toContain('108');
    });

    test('should find doctor response in Hindi', () => {
      Chatbot.language = 'hi';
      const response = Chatbot.findResponse('डॉक्टर कौन हैं?');
      expect(response.text).toContain('डॉ.');
    });

    test('should find appointment response in Gujarati', () => {
      Chatbot.language = 'gu';
      const response = Chatbot.findResponse('એપોઇન્ટમેન્ટ બુક કરો');
      expect(response.text).toContain('બુકિંગ');
    });

    test('should return fallback for unmatched queries', () => {
      Chatbot.language = 'en';
      const response = Chatbot.findResponse('random gibberish xyz123');
      expect(response.text).toContain('not sure');
    });

    test('should log unanswered questions', () => {
      Chatbot.language = 'en';
      Chatbot.findResponse('completely random question xyz');
      expect(Chatbot.unansweredQuestions.length).toBe(1);
      expect(Chatbot.unansweredQuestions[0].question).toBe(
        'completely random question xyz'
      );
    });
  });

  describe('Quick Replies', () => {
    test('should have English quick replies', () => {
      expect(Chatbot.quickReplies.en).toBeDefined();
      expect(Chatbot.quickReplies.en.length).toBeGreaterThan(0);
    });

    test('should have Hindi quick replies', () => {
      expect(Chatbot.quickReplies.hi).toBeDefined();
      expect(Chatbot.quickReplies.hi.length).toBeGreaterThan(0);
    });

    test('should have Gujarati quick replies', () => {
      expect(Chatbot.quickReplies.gu).toBeDefined();
      expect(Chatbot.quickReplies.gu.length).toBeGreaterThan(0);
    });

    test('should have same number of quick replies in all languages', () => {
      expect(Chatbot.quickReplies.en.length).toBe(Chatbot.quickReplies.hi.length);
      expect(Chatbot.quickReplies.hi.length).toBe(Chatbot.quickReplies.gu.length);
    });
  });

  describe('Language Setting', () => {
    test('should set language and store in localStorage', () => {
      Chatbot.setLanguage('hi');
      expect(Chatbot.language).toBe('hi');
      expect(localStorage.getItem('preferred_language')).toBe('hi');
    });

    test('should update language to Gujarati', () => {
      Chatbot.setLanguage('gu');
      expect(Chatbot.language).toBe('gu');
    });
  });

  describe('Chat State', () => {
    test('should start closed', () => {
      expect(Chatbot.isOpen).toBe(false);
    });

    test('should open when toggle called while closed', () => {
      // Mock DOM elements for open
      const mockPanel = { style: { display: 'none' } };
      const mockToggle = { classList: { add: jest.fn(), remove: jest.fn() } };
      const mockInput = { focus: jest.fn() };
      const mockBadge = { style: { display: 'block' } };

      document.getElementById = jest.fn((id) => {
        if (id === 'chatbot-panel') return mockPanel;
        if (id === 'chatbot-toggle') return mockToggle;
        if (id === 'chatbot-input') return mockInput;
        return mockElement;
      });
      document.querySelector = jest.fn(() => mockBadge);

      Chatbot.isOpen = false;
      Chatbot.open();

      expect(Chatbot.isOpen).toBe(true);
    });

    test('should close when close called', () => {
      const mockPanel = { style: { display: 'flex' } };
      const mockToggle = { classList: { add: jest.fn(), remove: jest.fn() } };

      document.getElementById = jest.fn((id) => {
        if (id === 'chatbot-panel') return mockPanel;
        if (id === 'chatbot-toggle') return mockToggle;
        return mockElement;
      });

      Chatbot.isOpen = true;
      Chatbot.close();

      expect(Chatbot.isOpen).toBe(false);
    });
  });

  describe('Analytics', () => {
    test('should return analytics data', () => {
      Chatbot.messages = [{ text: 'test', sender: 'user' }];
      Chatbot.unansweredQuestions = [{ question: 'test' }];
      Chatbot.language = 'en';

      const analytics = Chatbot.getAnalytics();

      expect(analytics.messageCount).toBe(1);
      expect(analytics.unansweredCount).toBe(1);
      expect(analytics.language).toBe('en');
    });
  });

  describe('Unanswered Question Logging', () => {
    test('should log unanswered question with timestamp', () => {
      Chatbot.language = 'en';
      Chatbot.logUnanswered('test question');

      expect(Chatbot.unansweredQuestions.length).toBe(1);
      expect(Chatbot.unansweredQuestions[0].question).toBe('test question');
      expect(Chatbot.unansweredQuestions[0].language).toBe('en');
      expect(Chatbot.unansweredQuestions[0].timestamp).toBeDefined();
    });

    test('should store unanswered questions in localStorage', () => {
      Chatbot.logUnanswered('test question');

      const stored = JSON.parse(localStorage.getItem('chatbot_unanswered'));
      expect(stored).toBeDefined();
      expect(stored.length).toBe(1);
    });
  });
});

