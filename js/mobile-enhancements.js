// ============================================
// MOBILE ENHANCEMENTS MODULE
// Sticky buttons, improved mobile nav, etc.
// ============================================
/* global BookingWizard */

const MobileEnhancements = {
    config: {
        stickyButtonsThreshold: 300, // Show after scrolling 300px
        stickEnabled: true,
    },

    /**
     * Initialize mobile enhancements
     */
    init() {
        this.createStickyActionButtons();
        this.setupScrollListener();
        this.improveMobileNav();
        this.optimizeTouchTargets();
    },

    /**
     * Create sticky action buttons for mobile
     */
    createStickyActionButtons() {
        // Only show on mobile
        if (window.innerWidth > 768) {
            return;
        }

        const container = document.createElement('div');
        container.id = 'sticky-actions';
        container.className = 'sticky-actions hidden';

        const bookBtn = document.createElement('button');
        bookBtn.className = 'sticky-action-btn primary';
        bookBtn.textContent = '📅 Book';
        bookBtn.onclick = () => BookingWizard.open();
        bookBtn.setAttribute('aria-label', 'Book appointment');
        bookBtn.setAttribute('title', 'Book appointment');

        const callBtn = document.createElement('a');
        callBtn.href = 'tel:+919925450425';
        callBtn.className = 'sticky-action-btn secondary';
        callBtn.textContent = '📞 Call';
        callBtn.setAttribute('aria-label', 'Call hospital');
        callBtn.setAttribute('title', 'Call: +91 99254 50425');

        container.appendChild(bookBtn);
        container.appendChild(callBtn);
        document.body.appendChild(container);
    },

    /**
     * Setup scroll listener for sticky buttons
     */
    setupScrollListener() {
        const stickyActions = document.getElementById('sticky-actions');
        if (!stickyActions) {
            return;
        }

        let ticking = false;

        const updateStickyButtons = () => {
            if (!this.config.stickEnabled) {
                stickyActions.classList.add('hidden');
                return;
            }

            const scrolled = window.scrollY;

            if (scrolled > this.config.stickyButtonsThreshold) {
                stickyActions.classList.remove('hidden');
            } else {
                stickyActions.classList.add('hidden');
            }

            ticking = false;
        };

        window.addEventListener(
            'scroll',
            () => {
                if (!ticking) {
                    window.requestAnimationFrame(updateStickyButtons);
                    ticking = true;
                }
            },
            { passive: true }
        );
    },

    /**
     * Improve mobile navigation menu
     */
    improveMobileNav() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('.nav');

        if (!mobileMenuBtn || !nav) {
            return;
        }

        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu on link click
        const links = nav.querySelectorAll('a');
        links.forEach((link) => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                nav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    },

    /**
     * Optimize touch targets to 44px minimum
     */
    optimizeTouchTargets() {
        // Button touch targets
        const buttons = document.querySelectorAll('button, a.btn, a.action-card');
        buttons.forEach((btn) => {
            const computed = window.getComputedStyle(btn);
            const height = parseFloat(computed.height);
            const width = parseFloat(computed.width);

            // Check if below 44px and adjust padding
            if (height < 44) {
                btn.style.minHeight = '44px';
                btn.style.display = 'flex';
                btn.style.alignItems = 'center';
                btn.style.justifyContent = 'center';
            }

            if (width < 44) {
                btn.style.minWidth = '44px';
            }
        });

        // Form inputs
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach((input) => {
            const computed = window.getComputedStyle(input);
            const height = parseFloat(computed.height);

            if (height < 44) {
                input.style.minHeight = '44px';
                input.style.padding = '12px';
            }
        });
    },

    /**
     * Enable/disable sticky buttons
     */
    setStickyEnabled(enabled) {
        this.config.stickEnabled = enabled;
        const stickyActions = document.getElementById('sticky-actions');
        if (stickyActions) {
            if (enabled) {
                stickyActions.classList.remove('hidden');
            } else {
                stickyActions.classList.add('hidden');
            }
        }
    },

    /**
     * Check if device is mobile
     */
    isMobile() {
        return window.innerWidth <= 768;
    },

    /**
     * Get viewport dimensions
     */
    getViewport() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            isMobile: window.innerWidth <= 768,
            isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
            isDesktop: window.innerWidth > 1024,
        };
    }
};

// Initialize on document ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        MobileEnhancements.init();
    });
} else {
    MobileEnhancements.init();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileEnhancements;
}
