/**
 * MAIN.JS Unit Tests
 * Tests for main application initialization functions
 */

// Mock CONFIG
global.CONFIG = { BASE_URL: '' };

// Mock navigator.serviceWorker
const mockRegister = jest.fn().mockResolvedValue({ scope: '/' });
Object.defineProperty(navigator, 'serviceWorker', {
    value: { register: mockRegister },
    writable: true,
    configurable: true
});

// Mock IntersectionObserver
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect
}));

// Load main module
const {
    fixBaseUrls,
    registerServiceWorker,
    initMobileMenu,
    initDropdowns,
    initSmoothScroll,
    initHeaderScroll,
    initAnimations,
    toggleFAQ
} = require('../../js/main.js');

beforeEach(() => {
    document.body.innerHTML = '';
    mockRegister.mockClear();
});

describe('Main Module Structure', () => {
    test('should export fixBaseUrls function', () => {
        expect(typeof fixBaseUrls).toBe('function');
    });

    test('should export registerServiceWorker function', () => {
        expect(typeof registerServiceWorker).toBe('function');
    });

    test('should export initMobileMenu function', () => {
        expect(typeof initMobileMenu).toBe('function');
    });

    test('should export initDropdowns function', () => {
        expect(typeof initDropdowns).toBe('function');
    });

    test('should export initSmoothScroll function', () => {
        expect(typeof initSmoothScroll).toBe('function');
    });

    test('should export initHeaderScroll function', () => {
        expect(typeof initHeaderScroll).toBe('function');
    });

    test('should export initAnimations function', () => {
        expect(typeof initAnimations).toBe('function');
    });

    test('should export toggleFAQ function', () => {
        expect(typeof toggleFAQ).toBe('function');
    });
});

describe('fixBaseUrls()', () => {
    test('should process internal links starting with /', () => {
        document.body.innerHTML = `
            <a href="/book.html">Book</a>
            <a href="/services/ortho.html">Services</a>
        `;
        
        fixBaseUrls();
        
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            expect(href).toBeDefined();
            expect(href).not.toContain('undefined');
        });
    });

    test('should not modify external links', () => {
        document.body.innerHTML = `
            <a href="https://google.com">External</a>
        `;
        
        fixBaseUrls();
        
        const link = document.querySelector('a');
        expect(link.getAttribute('href')).toBe('https://google.com');
    });

    test('should handle pages with no links', () => {
        document.body.innerHTML = '<div>No links here</div>';
        
        expect(() => fixBaseUrls()).not.toThrow();
    });
});

describe('initMobileMenu()', () => {
    test('should not throw when menu elements missing', () => {
        document.body.innerHTML = '<div>No menu</div>';
        expect(() => initMobileMenu()).not.toThrow();
    });

    test('should add click handler when elements exist', () => {
        document.body.innerHTML = `
            <button class="mobile-menu-btn">Menu</button>
            <nav class="nav">Nav content</nav>
        `;
        
        initMobileMenu();
        
        const btn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('.nav');
        
        // Click should toggle active class
        btn.click();
        expect(nav.classList.contains('active')).toBe(true);
        
        btn.click();
        expect(nav.classList.contains('active')).toBe(false);
    });
});

describe('initDropdowns()', () => {
    test('should not throw when dropdown elements missing', () => {
        document.body.innerHTML = '<div>No dropdowns</div>';
        expect(() => initDropdowns()).not.toThrow();
    });

    test('should handle dropdown toggle', () => {
        document.body.innerHTML = `
            <div class="dropdown">
                <button class="dropdown-toggle">Toggle</button>
                <div class="dropdown-menu"></div>
            </div>
        `;
        
        expect(() => initDropdowns()).not.toThrow();
    });
});

describe('initSmoothScroll()', () => {
    test('should not throw when no anchor links', () => {
        document.body.innerHTML = '<div>No anchors</div>';
        expect(() => initSmoothScroll()).not.toThrow();
    });

    test('should handle anchor links', () => {
        document.body.innerHTML = `
            <a href="#section1">Go to section</a>
            <section id="section1">Content</section>
        `;
        
        expect(() => initSmoothScroll()).not.toThrow();
    });
});

describe('initHeaderScroll()', () => {
    test('should not throw when header missing', () => {
        document.body.innerHTML = '<div>No header</div>';
        expect(() => initHeaderScroll()).not.toThrow();
    });

    test('should handle header element', () => {
        document.body.innerHTML = `
            <header class="header">Header content</header>
        `;
        
        expect(() => initHeaderScroll()).not.toThrow();
    });
});

describe('initAnimations()', () => {
    test('should not throw when no animatable elements', () => {
        document.body.innerHTML = '<div>No animations</div>';
        expect(() => initAnimations()).not.toThrow();
    });

    test('should handle animate-on-scroll elements', () => {
        document.body.innerHTML = `
            <div class="animate-on-scroll">Animate me</div>
        `;
        
        expect(() => initAnimations()).not.toThrow();
    });
});

describe('toggleFAQ()', () => {
    test('should toggle FAQ item', () => {
        document.body.innerHTML = `
            <div class="faq-item">
                <button class="faq-question" onclick="toggleFAQ(this)">Question</button>
                <div class="faq-answer">Answer</div>
            </div>
        `;
        
        const button = document.querySelector('.faq-question');
        toggleFAQ(button);
        
        const faqItem = document.querySelector('.faq-item');
        expect(faqItem.classList.contains('active')).toBe(true);
    });

    test('should close other FAQs when opening one', () => {
        document.body.innerHTML = `
            <div class="faq-item active">
                <button class="faq-question" onclick="toggleFAQ(this)">Q1</button>
            </div>
            <div class="faq-item">
                <button class="faq-question" onclick="toggleFAQ(this)">Q2</button>
            </div>
        `;
        
        const button2 = document.querySelectorAll('.faq-question')[1];
        toggleFAQ(button2);
        
        const faqItems = document.querySelectorAll('.faq-item');
        expect(faqItems[0].classList.contains('active')).toBe(false);
        expect(faqItems[1].classList.contains('active')).toBe(true);
    });

    test('should close FAQ when clicking same button twice', () => {
        document.body.innerHTML = `
            <div class="faq-item">
                <button class="faq-question">Question</button>
            </div>
        `;
        
        const button = document.querySelector('.faq-question');
        
        // First click - open
        toggleFAQ(button);
        expect(document.querySelector('.faq-item').classList.contains('active')).toBe(true);
        
        // Second click - close
        toggleFAQ(button);
        expect(document.querySelector('.faq-item').classList.contains('active')).toBe(false);
    });
});

describe('registerServiceWorker()', () => {
    test('should not throw', () => {
        expect(() => registerServiceWorker()).not.toThrow();
    });
});

