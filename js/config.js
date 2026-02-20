// ============================================
// ADINATH HOSPITAL - CONFIGURATION
// Environment detection and base URL
// ============================================

// Detect environment from hostname
const HOSTNAME = window.location.hostname;

const ENV = (() => {
    if (HOSTNAME.includes('localhost') || HOSTNAME.includes('127.0.0.1')) {
        return 'local';
    } else if (HOSTNAME.includes('github.io')) {
        return 'github'; // GitHub Pages (demo)
    } else if (HOSTNAME.includes('amplifyapp.com')) {
        return 'staging'; // AWS Amplify staging
    } else if (HOSTNAME.includes('adinathhealth.com')) {
        return 'production'; // Production domain
    }
    return 'production'; // Custom domain
})();

const CONFIG = {
    ENV,

    // Base URL configuration
    BASE_URL: (() => {
        switch (ENV) {
            case 'github':
                return '/adinath-hospital'; // GitHub Pages project path
            default:
                return ''; // No prefix for local, staging, production
        }
    })(),
};

// Log environment info (for debugging)
console.info(`🏥 Adinath Hospital | Environment: ${ENV} | Base: ${CONFIG.BASE_URL || '/'}`);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ENV };
}
