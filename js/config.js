// ============================================
// ADINATH HOSPITAL - CONFIGURATION
// Supports multiple environments
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
    // Environment
    ENV,

    // Production domain info
    PRODUCTION_DOMAIN: 'adinathhealth.com',
    PRODUCTION_URL: 'https://adinathhealth.com',

    // Base URL configuration
    BASE_URL: (() => {
        switch (ENV) {
            case 'local':
                return ''; // No prefix for local
            case 'github':
                return '/adinath-hospital'; // GitHub Pages project path
            case 'staging':
            case 'production':
            default:
                return ''; // No prefix for Amplify/custom domain
        }
    })(),

    // API endpoints (for future backend)
    API_URL: (() => {
        switch (ENV) {
            case 'local':
                return 'http://localhost:3000/api';
            case 'staging':
                return 'https://api-staging.adinathhealth.com';
            case 'production':
                return 'https://api.adinathhealth.com';
            default:
                return ''; // No API for static demo
        }
    })(),

    // Feature flags
    FEATURES: {
        // Enable real SMS in production only
        SMS_ENABLED: ENV === 'production',
        // Enable analytics in production
        ANALYTICS_ENABLED: ENV === 'production',
        // Show demo banner in non-production
        SHOW_DEMO_BANNER: ENV !== 'production',
        // Enable local storage (always on for now)
        LOCAL_STORAGE: true,
        // Enable cloud sync when backend is ready
        CLOUD_SYNC: false,
    },

    // Hospital Info
    HOSPITAL_NAME: 'Adinath Hospital',
    HOSPITAL_NAME_GU: 'આદિનાથ હોસ્પિટલ',
    HOSPITAL_NAME_HI: 'आदिनाथ हॉस्पिटल',

    // Contact
    PHONE: '+919925450425',
    PHONE_DISPLAY: '+91 99254 50425',
    WHATSAPP: '919925450425',
    EMAIL: 'info@adinathhealth.com',

    // Address
    ADDRESS: {
        line1: 'Shukan Mall, 2nd Floor',
        line2: 'Shahibaug Rd., Near Rajasthan Hospital',
        city: 'Shahi Baug, Ahmedabad',
        state: 'Gujarat',
        pincode: '380004',
        country: 'India',
        plusCode: '3H3W+WJ6',
        googleMapsUrl: 'https://www.google.com/maps/search/Shukan+Mall+Shahibaug+Ahmedabad',
    },

    // Working Hours
    HOURS: {
        weekdays: '11:00 AM - 7:00 PM',
        saturday: '11:00 AM - 7:00 PM',
        sunday: 'By Appointment',
        display: 'Mon-Sat: 11 AM - 7 PM',
    },

    // Social Links
    SOCIAL: {
        instagram: '', // To be added
        facebook: '',
        youtube: '',
        linkedin_ashok: 'https://www.linkedin.com/in/ashok-sajnani-11937322/',
        linkedin_sunita: 'https://www.linkedin.com/in/dr-sunita-sajnani-6b81b384/',
    },

    // Doctors
    DOCTORS: {
        ashok: {
            id: 'ashok',
            name: 'Dr. Ashok Sajnani',
            nameGu: 'ડૉ. અશોક સજનાની',
            nameHi: 'डॉ. अशोक सजनानी',
            title: 'M.S. (Ortho), D.Ortho',
            email: 'drsajnani@gmail.com',
            phone: '+919824066854',
            specialty: 'Orthopedic & Joint Surgeon',
            experience: '35+ years',
            photo: 'images/dr-ashok-sajnani.jpg',
        },
        sunita: {
            id: 'sunita',
            name: 'Dr. Sunita Sajnani',
            nameGu: 'ડૉ. સુનિતા સજનાની',
            nameHi: 'डॉ. सुनीता सजनानी',
            title: 'M.D. (OB-GYN)',
            email: 'sunita.sajnani9@gmail.com',
            phone: '+919925450425',
            specialty: 'Obstetrics & Gynecology',
            experience: '30+ years',
            photo: 'images/dr-sunita-sajnani.jpg',
        },
    },

    // Admin
    ADMIN: {
        email: 'pratik.sajnani@gmail.com',
        name: 'Pratik Sajnani',
    },

    // SMS Provider (for production)
    SMS: {
        provider: 'msg91', // or 'twilio'
        senderId: 'ADNHSP',
    },
};

// Helper to build URLs
function buildUrl(path) {
    if (path.startsWith('http')) {
        return path;
    }
    const base = CONFIG.BASE_URL;
    if (path.startsWith('/')) {
        return base + path;
    }
    return `${base}/${path}`;
}

// Helper to get asset URL
function assetUrl(path) {
    return buildUrl(path);
}

// Log environment info (for debugging)
console.info(`🏥 Adinath Hospital | Environment: ${ENV} | Base: ${CONFIG.BASE_URL || '/'}`);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, buildUrl, assetUrl, ENV };
}
