// ============================================
// TESTIMONIALS MODULE
// Patient success stories and trust signals
// ============================================
/* global BookingWizard */

const Testimonials = {
    // Sample testimonials (can be replaced with real data from API)
    data: [
        {
            name: 'Rajesh Patel',
            condition: 'Knee Surgery Patient',
            quote: 'Dr. Ashok\'s expertise and care transformed my knee problem. I\'m back to playing cricket after years!',
            rating: 5,
            avatar: '👨‍💼',
            doctor: 'Dr. Ashok Sajnani'
        },
        {
            name: 'Priya Mehta',
            condition: 'Pregnancy Care',
            quote: 'Dr. Sunita made my pregnancy journey smooth and safe. Her personalized care made all the difference.',
            rating: 5,
            avatar: '👩‍⚕️',
            doctor: 'Dr. Sunita Sajnani'
        },
        {
            name: 'Amit Kumar',
            condition: 'Joint Preservation',
            quote: 'Non-surgical knee treatment from Dr. Ashok helped me avoid surgery. Highly recommend Adinath Hospital!',
            rating: 5,
            avatar: '👨‍💻',
            doctor: 'Dr. Ashok Sajnani'
        },
        {
            name: 'Deepa Singh',
            condition: 'Yoga & Wellness',
            quote: 'Dr. Sunita\'s yoga classes helped me recover post-delivery. Grateful for her holistic approach to health.',
            rating: 5,
            avatar: '👩‍🦱',
            doctor: 'Dr. Sunita Sajnani'
        }
    ],

    // Trust badges
    badges: [
        {
            icon: '🏆',
            title: '35+ Years',
            desc: 'Of experience in healthcare'
        },
        {
            icon: '🎓',
            title: '100% Qualified',
            desc: 'Licensed & certified physicians'
        },
        {
            icon: '⏱️',
            title: 'Fast Response',
            desc: 'Appointments within 24 hours'
        },
        {
            icon: '❤️',
            title: 'Patient-Centric',
            desc: 'Compassionate, personalized care'
        }
    ],

    /**
     * Initialize testimonials section
     */
    init() {
        this.renderTestimonials();
        this.setupEventListeners();
    },

    /**
     * Render testimonials section
     */
    renderTestimonials() {
        const section = document.createElement('section');
        section.className = 'testimonials-section';
        section.id = 'testimonials';

        section.appendChild(this._createHeader());
        section.appendChild(this._createGrid());
        section.appendChild(this._createCtaAndBadges());

        this._insertSection(section);
    },

    _createHeader() {
        const container = document.createElement('div');
        container.className = 'container';

        const header = document.createElement('div');
        header.className = 'testimonials-header';

        const tag = document.createElement('span');
        tag.className = 'testimonials-tag';
        tag.textContent = '💬 Patient Stories';

        const title = document.createElement('h2');
        title.textContent = 'What Our Patients Say';

        const subtitle = document.createElement('p');
        subtitle.textContent = 'Real experiences from people we\'ve helped on their health journey';

        header.appendChild(tag);
        header.appendChild(title);
        header.appendChild(subtitle);
        container.appendChild(header);
        return container;
    },

    _createGrid() {
        const container = document.createElement('div');
        container.className = 'container';

        const grid = document.createElement('div');
        grid.className = 'testimonials-grid';

        this.data.forEach((testimonial) => {
            grid.appendChild(this.createTestimonialCard(testimonial));
        });

        container.appendChild(grid);
        return container;
    },

    _createCtaAndBadges() {
        const container = document.createElement('div');
        container.className = 'container';

        container.appendChild(this._createCta());
        container.appendChild(this._createBadges());
        return container;
    },

    _createCta() {
        const cta = document.createElement('div');
        cta.className = 'testimonials-cta visible';

        const text = document.createElement('p');
        text.className = 'testimonials-cta-text';
        text.textContent = 'Join thousands of satisfied patients. Schedule your appointment today.';

        const btn = document.createElement('button');
        btn.className = 'testimonials-cta-button';
        btn.textContent = 'Book Your Consultation →';
        btn.onclick = () => BookingWizard.open();

        cta.appendChild(text);
        cta.appendChild(btn);
        return cta;
    },

    _createBadges() {
        const badges = document.createElement('div');
        badges.className = 'trust-badges visible';

        this.badges.forEach((badge) => {
            const el = document.createElement('div');
            el.className = 'badge';

            const icon = document.createElement('span');
            icon.className = 'badge-icon';
            icon.textContent = badge.icon;

            const title = document.createElement('div');
            title.className = 'badge-title';
            title.textContent = badge.title;

            const desc = document.createElement('p');
            desc.className = 'badge-desc';
            desc.textContent = badge.desc;

            el.appendChild(icon);
            el.appendChild(title);
            el.appendChild(desc);
            badges.appendChild(el);
        });

        return badges;
    },

    _insertSection(section) {
        const expectSection = document.getElementById('expect');
        if (expectSection) {
            expectSection.parentNode.insertBefore(section, expectSection.nextSibling);
            return;
        }

        const doctorsSection = document.getElementById('doctors');
        if (doctorsSection) {
            doctorsSection.parentNode.insertBefore(section, doctorsSection.nextSibling);
        }
    },

    /**
     * Create individual testimonial card
     */
    createTestimonialCard(testimonial) {
        const card = document.createElement('div');
        card.className = 'testimonial-card';

        card.appendChild(this._createStars(testimonial.rating));
        card.appendChild(this._createQuote(testimonial.quote));
        card.appendChild(this._createAuthor(testimonial));

        return card;
    },

    _createStars(rating) {
        const starsDiv = document.createElement('div');
        starsDiv.className = 'testimonial-stars';

        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.textContent = i < rating ? '⭐' : '☆';
            starsDiv.appendChild(star);
        }

        const ratingText = document.createElement('span');
        ratingText.className = 'star-text';
        ratingText.textContent = `${rating}.0 / 5.0`;
        starsDiv.appendChild(ratingText);
        return starsDiv;
    },

    _createQuote(text) {
        const quote = document.createElement('p');
        quote.className = 'testimonial-quote';
        quote.textContent = text;
        return quote;
    },

    _createAuthor(testimonial) {
        const authorDiv = document.createElement('div');
        authorDiv.className = 'testimonial-author';

        const avatar = document.createElement('div');
        avatar.className = 'testimonial-avatar';
        avatar.textContent = testimonial.avatar;

        const infoDiv = document.createElement('div');
        infoDiv.className = 'testimonial-info';

        const name = document.createElement('p');
        name.className = 'testimonial-name';
        name.textContent = testimonial.name;

        const condition = document.createElement('p');
        condition.className = 'testimonial-condition';
        condition.textContent = testimonial.condition;

        infoDiv.appendChild(name);
        infoDiv.appendChild(condition);
        authorDiv.appendChild(avatar);
        authorDiv.appendChild(infoDiv);
        return authorDiv;
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Scroll reveal animations
        const cards = document.querySelectorAll('.testimonial-card');
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            });

            cards.forEach((card) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.6s ease';
                observer.observe(card);
            });
        }
    },

    /**
     * Load testimonials from external source
     * @param {string} url - API endpoint or data source
     */
    async loadFromAPI(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                this.data = data;
                this.renderTestimonials();
            }
        } catch (error) {
            console.error('Error loading testimonials:', error);
            // Keep default testimonials on error
        }
    },

    /**
     * Add new testimonial
     * @param {object} testimonial - Testimonial data
     */
    addTestimonial(testimonial) {
        if (
            testimonial.name &&
            testimonial.condition &&
            testimonial.quote &&
            testimonial.rating >= 1 &&
            testimonial.rating <= 5
        ) {
            this.data.push(testimonial);
            this.renderTestimonials();
            return true;
        }
        return false;
    },

    /**
     * Get testimonials data
     */
    getTestimonials() {
        return this.data;
    },

    /**
     * Filter testimonials by doctor
     * @param {string} doctorName - Doctor name to filter by
     */
    filterByDoctor(doctorName) {
        return this.data.filter((t) => t.doctor === doctorName);
    },

    /**
     * Get average rating
     */
    getAverageRating() {
        if (this.data.length === 0) {
            return 0;
        }
        const sum = this.data.reduce((acc, t) => acc + (t.rating || 0), 0);
        return (sum / this.data.length).toFixed(1);
    }
};

// Initialize on page load
function initTestimonials() {
    if (typeof BookingWizard !== 'undefined') {
        Testimonials.init();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonials);
} else {
    initTestimonials();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Testimonials;
}
