// ============================================
// ADINATH HOSPITAL - CONFIGURATION
// Change BASE_URL when moving to standalone domain
// ============================================

const CONFIG = {
    // OPTION 1: Project page (current)
    BASE_URL: '/adinath-hospital',
    
    // OPTION 2: Standalone domain (uncomment when ready)
    // BASE_URL: '',
    
    // Hospital Info
    HOSPITAL_NAME: 'Adinath Hospital',
    PHONE: '+919925450425',
    WHATSAPP: '919925450425',
    EMAIL: 'adinathhospital@gmail.com',
    
    // Address
    ADDRESS: {
        line1: 'ShukanMall, Shahibaug Rd.',
        line2: 'Near Rajasthan Hospitals',
        city: 'Shahibag, Ahmedabad',
        state: 'Gujarat',
        pincode: '380004',
        country: 'India',
        plusCode: '3H3W+WJ6'
    },
    
    // Working Hours
    HOURS: {
        weekdays: '11:00 AM - 7:00 PM',
        saturday: '11:00 AM - 7:00 PM',
        sunday: 'By Appointment'
    },
    
    // Social Links (update when available)
    SOCIAL: {
        instagram: '',
        facebook: '',
        youtube: ''
    },
    
    // Doctors
    DOCTORS: {
        ashok: {
            name: 'Dr. Ashok Sajnani',
            phone: '+919925450425',
            specialty: 'Orthopedic & Joint Surgeon'
        },
        sunita: {
            name: 'Dr. Sunita Sajnani',
            phone: '+919925450425',
            specialty: 'OB-GYN Specialist'
        }
    }
};

// Helper to build URLs
function buildUrl(path) {
    return CONFIG.BASE_URL + path;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, buildUrl };
}

