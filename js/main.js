// ============================================
// ADINATH HOSPITAL - MAIN JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    fixBaseUrls();
    initMobileMenu();
    initDropdowns();
    initSmoothScroll();
    initHeaderScroll();
    initAnimations();
    registerServiceWorker();
});

// Fix all internal links to use BASE_URL
function fixBaseUrls() {
    const BASE_URL = typeof CONFIG !== 'undefined' ? CONFIG.BASE_URL : '';

    // Fix all internal links that start with /
    document.querySelectorAll('a[href^="/"]').forEach((link) => {
        const href = link.getAttribute('href');
        // Don't modify external links or already fixed links
        if (!href.startsWith('http') && !href.startsWith(BASE_URL)) {
            link.setAttribute('href', BASE_URL + href);
        }
    });

    // Fix logo link
    document.querySelectorAll('a.logo[href="/"]').forEach((link) => {
        link.setAttribute('href', `${BASE_URL}/`);
    });
}

// Register Service Worker for PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const BASE_URL = typeof CONFIG !== 'undefined' ? CONFIG.BASE_URL : '';
            const swPath = `${BASE_URL}/sw.js`;
            navigator.serviceWorker
                .register(swPath)
                .then((registration) => {
                    console.log('SW registered:', registration.scope);
                })
                .catch((error) => {
                    console.warn('SW registration failed:', error);
                });
        });
    }
}

// Mobile Menu Toggle
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });

        // Close menu on link click (but not dropdown triggers)
        nav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', (_e) => {
                // Don't close menu if clicking a dropdown trigger
                if (link.classList.contains('dropdown-trigger')) {
                    return;
                }
                nav.classList.remove('active');
                menuBtn.classList.remove('active');
            });
        });
    }
}

// Mobile Dropdown Toggle
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    dropdowns.forEach((dropdown) => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');

        if (trigger && menu) {
            // Toggle on click for mobile
            trigger.addEventListener('click', (e) => {
                // Check if on mobile (nav is visible = mobile menu is open)
                const isMobile = window.innerWidth <= 900;

                if (isMobile) {
                    e.preventDefault();
                    dropdown.classList.toggle('open');

                    // Close other dropdowns
                    dropdowns.forEach((other) => {
                        if (other !== dropdown) {
                            other.classList.remove('open');
                        }
                    });
                }
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            dropdowns.forEach((dropdown) => {
                dropdown.classList.remove('open');
            });
        }
    });
}

// Smooth Scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') {
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                });
            }
        });
    });
}

// Header background on scroll
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) {
        return;
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
    });
}

// Fade-in animations on scroll
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe sections
    document.querySelectorAll('section').forEach((section) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        observer.observe(section);
    });
}

// ============================================
// FAQ ACCORDION
// ============================================
function toggleFAQ(button) {
    const faqItem = button.parentElement;
    const wasActive = faqItem.classList.contains('active');

    // Close all other FAQs
    document.querySelectorAll('.faq-item').forEach((item) => {
        item.classList.remove('active');
    });

    // Toggle current FAQ
    if (!wasActive) {
        faqItem.classList.add('active');
    }
}

// Export for Node.js/Jest testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fixBaseUrls,
        registerServiceWorker,
        initMobileMenu,
        initDropdowns,
        initSmoothScroll,
        initHeaderScroll,
        initAnimations,
        toggleFAQ,
    };
}
