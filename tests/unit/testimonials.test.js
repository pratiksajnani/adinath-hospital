/**
 * TESTIMONIALS Unit Tests
 */

// Mock BookingWizard
global.BookingWizard = { open: jest.fn() };

// Load module
const Testimonials = require('../../js/testimonials.js');

describe('Testimonials', () => {
    describe('Module Structure', () => {
        test('should be defined', () => {
            expect(Testimonials).toBeDefined();
        });

        test('should have init method', () => {
            expect(typeof Testimonials.init).toBe('function');
        });

        test('should have renderTestimonials method', () => {
            expect(typeof Testimonials.renderTestimonials).toBe('function');
        });

        test('should have createTestimonialCard method', () => {
            expect(typeof Testimonials.createTestimonialCard).toBe('function');
        });

        test('should have addTestimonial method', () => {
            expect(typeof Testimonials.addTestimonial).toBe('function');
        });

        test('should have getTestimonials method', () => {
            expect(typeof Testimonials.getTestimonials).toBe('function');
        });

        test('should have filterByDoctor method', () => {
            expect(typeof Testimonials.filterByDoctor).toBe('function');
        });

        test('should have getAverageRating method', () => {
            expect(typeof Testimonials.getAverageRating).toBe('function');
        });

        test('should have setupEventListeners method', () => {
            expect(typeof Testimonials.setupEventListeners).toBe('function');
        });

        test('should have _createHeader helper', () => {
            expect(typeof Testimonials._createHeader).toBe('function');
        });

        test('should have _createGrid helper', () => {
            expect(typeof Testimonials._createGrid).toBe('function');
        });

        test('should have _createStars helper', () => {
            expect(typeof Testimonials._createStars).toBe('function');
        });

        test('should have _createQuote helper', () => {
            expect(typeof Testimonials._createQuote).toBe('function');
        });

        test('should have _createAuthor helper', () => {
            expect(typeof Testimonials._createAuthor).toBe('function');
        });
    });

    describe('Data', () => {
        test('should have 4 sample testimonials', () => {
            expect(Array.isArray(Testimonials.data)).toBe(true);
            expect(Testimonials.data.length).toBe(4);
        });

        test('each testimonial should have name', () => {
            Testimonials.data.forEach((t) => {
                expect(t.name).toBeDefined();
                expect(typeof t.name).toBe('string');
            });
        });

        test('each testimonial should have quote', () => {
            Testimonials.data.forEach((t) => {
                expect(t.quote).toBeDefined();
                expect(typeof t.quote).toBe('string');
            });
        });

        test('each testimonial should have rating 1-5', () => {
            Testimonials.data.forEach((t) => {
                expect(t.rating).toBeGreaterThanOrEqual(1);
                expect(t.rating).toBeLessThanOrEqual(5);
            });
        });

        test('each testimonial should have doctor', () => {
            Testimonials.data.forEach((t) => {
                expect(t.doctor).toBeDefined();
            });
        });

        test('should have 4 trust badges', () => {
            expect(Array.isArray(Testimonials.badges)).toBe(true);
            expect(Testimonials.badges.length).toBe(4);
        });

        test('each badge should have icon, title, desc', () => {
            Testimonials.badges.forEach((b) => {
                expect(b.icon).toBeDefined();
                expect(b.title).toBeDefined();
                expect(b.desc).toBeDefined();
            });
        });
    });

    describe('filterByDoctor()', () => {
        test('should find Dr. Ashok testimonials', () => {
            const results = Testimonials.filterByDoctor('Dr. Ashok Sajnani');
            expect(results.length).toBe(2);
            results.forEach((t) => {
                expect(t.doctor).toBe('Dr. Ashok Sajnani');
            });
        });

        test('should find Dr. Sunita testimonials', () => {
            const results = Testimonials.filterByDoctor('Dr. Sunita Sajnani');
            expect(results.length).toBe(2);
        });

        test('should return empty for unknown doctor', () => {
            const results = Testimonials.filterByDoctor('Dr. Nobody');
            expect(results.length).toBe(0);
        });
    });

    describe('getAverageRating()', () => {
        test('should return 5.0 for default data', () => {
            expect(Testimonials.getAverageRating()).toBe('5.0');
        });

        test('should return 0 for empty data', () => {
            const orig = Testimonials.data;
            Testimonials.data = [];
            expect(Testimonials.getAverageRating()).toBe(0);
            Testimonials.data = orig;
        });

        test('should calculate mixed ratings', () => {
            const orig = Testimonials.data;
            Testimonials.data = [{ rating: 3 }, { rating: 4 }, { rating: 5 }];
            expect(Testimonials.getAverageRating()).toBe('4.0');
            Testimonials.data = orig;
        });
    });

    describe('addTestimonial()', () => {
        afterEach(() => {
            // Keep only original 4
            Testimonials.data = Testimonials.data.slice(0, 4);
        });

        test('should add valid testimonial', () => {
            const count = Testimonials.data.length;
            const result = Testimonials.addTestimonial({
                name: 'New',
                condition: 'Test',
                quote: 'Great!',
                rating: 4,
            });
            expect(result).toBe(true);
            expect(Testimonials.data.length).toBe(count + 1);
        });

        test('should reject without name', () => {
            expect(
                Testimonials.addTestimonial({ condition: 'T', quote: 'T', rating: 3 })
            ).toBe(false);
        });

        test('should reject without condition', () => {
            expect(
                Testimonials.addTestimonial({ name: 'T', quote: 'T', rating: 3 })
            ).toBe(false);
        });

        test('should reject without quote', () => {
            expect(
                Testimonials.addTestimonial({ name: 'T', condition: 'T', rating: 3 })
            ).toBe(false);
        });

        test('should reject rating > 5', () => {
            expect(
                Testimonials.addTestimonial({ name: 'T', condition: 'T', quote: 'T', rating: 6 })
            ).toBe(false);
        });

        test('should reject rating < 1', () => {
            expect(
                Testimonials.addTestimonial({ name: 'T', condition: 'T', quote: 'T', rating: 0 })
            ).toBe(false);
        });
    });

    describe('getTestimonials()', () => {
        test('should return data array', () => {
            const data = Testimonials.getTestimonials();
            expect(Array.isArray(data)).toBe(true);
            expect(data).toBe(Testimonials.data);
        });
    });

    describe('createTestimonialCard()', () => {
        test('should create element with testimonial-card class', () => {
            const card = Testimonials.createTestimonialCard({
                name: 'Test',
                condition: 'Test',
                quote: 'Good!',
                rating: 5,
                avatar: 'T',
                doctor: 'Dr. Test',
            });
            expect(card.className).toBe('testimonial-card');
        });

        test('should contain stars section', () => {
            const card = Testimonials.createTestimonialCard({
                name: 'Test',
                condition: 'Test',
                quote: 'Good!',
                rating: 4,
                avatar: 'T',
                doctor: 'Dr. Test',
            });
            expect(card.querySelector('.testimonial-stars')).not.toBeNull();
        });

        test('should contain quote text', () => {
            const card = Testimonials.createTestimonialCard({
                name: 'Test',
                condition: 'Test',
                quote: 'Excellent!',
                rating: 5,
                avatar: 'T',
                doctor: 'Dr. Test',
            });
            const q = card.querySelector('.testimonial-quote');
            expect(q.textContent).toBe('Excellent!');
        });

        test('should contain author name', () => {
            const card = Testimonials.createTestimonialCard({
                name: 'John',
                condition: 'Knee',
                quote: 'Great!',
                rating: 5,
                avatar: 'J',
                doctor: 'Dr. Test',
            });
            const name = card.querySelector('.testimonial-name');
            expect(name.textContent).toBe('John');
        });
    });

    describe('_createStars()', () => {
        test('should create 5 star elements', () => {
            const div = Testimonials._createStars(5);
            expect(div.querySelectorAll('.star').length).toBe(5);
        });

        test('should show rating text', () => {
            const div = Testimonials._createStars(4);
            const text = div.querySelector('.star-text');
            expect(text.textContent).toBe('4.0 / 5.0');
        });
    });

    describe('_createQuote()', () => {
        test('should create P element', () => {
            const q = Testimonials._createQuote('Hello');
            expect(q.tagName).toBe('P');
        });

        test('should have testimonial-quote class', () => {
            const q = Testimonials._createQuote('Hello');
            expect(q.className).toBe('testimonial-quote');
        });

        test('should have correct text', () => {
            const q = Testimonials._createQuote('Hello world');
            expect(q.textContent).toBe('Hello world');
        });
    });
});
