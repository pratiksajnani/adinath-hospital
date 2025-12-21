// ============================================
// ADINATH HOSPITAL - Internationalization (i18n)
// Full multilingual support: English, Hindi, Gujarati
// ============================================

const I18N = {
    currentLanguage: 'en',
    
    // Complete translations
    translations: {
        // ===== NAVIGATION =====
        nav_home: { en: 'Home', hi: 'होम', gu: 'હોમ' },
        nav_services: { en: 'Services', hi: 'सेवाएं', gu: 'સેવાઓ' },
        nav_doctors: { en: 'Doctors', hi: 'डॉक्टर', gu: 'ડોક્ટર્સ' },
        nav_gallery: { en: 'Gallery', hi: 'गैलरी', gu: 'ગેલેરી' },
        nav_contact: { en: 'Contact', hi: 'संपर्क', gu: 'સંપર્ક' },
        nav_book: { en: 'Book Appointment', hi: 'अपॉइंटमेंट बुक करें', gu: 'એપોઇન્ટમેન્ટ બુક કરો' },
        nav_pharmacy: { en: 'Pharmacy', hi: 'फार्मेसी', gu: 'ફાર્મસી' },
        
        // ===== HERO SECTION =====
        hero_tagline: { en: 'Care with Compassion', hi: 'करुणा के साथ देखभाल', gu: 'કરુણા સાથે સંભાળ' },
        hero_title: { en: 'Your Health, Our Priority', hi: 'आपका स्वास्थ्य, हमारी प्राथमिकता', gu: 'તમારું સ્વાસ્થ્ય, અમારી પ્રાથમિકતા' },
        hero_subtitle: { en: 'Expert orthopedic and gynecology care with 35+ years of experience', hi: '35+ वर्षों के अनुभव के साथ विशेषज्ञ हड्डी और स्त्री रोग देखभाल', gu: '35+ વર્ષના અનુભવ સાથે નિષ્ણાત ઓર્થોપેડિક અને સ્ત્રીરોગ સંભાળ' },
        
        // ===== SERVICES =====
        services_tag: { en: 'Our Services', hi: 'हमारी सेवाएं', gu: 'અમારી સેવાઓ' },
        services_title: { en: 'Comprehensive Healthcare Services', hi: 'व्यापक स्वास्थ्य सेवाएं', gu: 'વ્યાપક આરોગ્ય સેવાઓ' },
        services_subtitle: { en: 'Expert care across multiple specialties', hi: 'विभिन्न विशेषताओं में विशेषज्ञ देखभाल', gu: 'વિવિધ વિશેષતાઓમાં નિષ્ણાત સંભાળ' },
        
        // Orthopedic
        ortho_title: { en: 'Orthopedic Services', hi: 'हड्डी रोग सेवाएं', gu: 'ઓર્થોપેડિક સેવાઓ' },
        ortho_doctor: { en: 'Dr. Ashok Sajnani', hi: 'डॉ. अशोक सजनानी', gu: 'ડૉ. અશોક સજનાની' },
        ortho_1: { en: 'Joint Preservation & Conservation', hi: 'जोड़ों का संरक्षण', gu: 'સાંધાનું જાળવણ અને સંરક્ષણ' },
        ortho_2: { en: 'Non-Surgical Knee Treatment', hi: 'बिना सर्जरी घुटने का इलाज', gu: 'સર્જરી વિના ઘૂંટણની સારવાર' },
        ortho_3: { en: 'Orthobiology Treatments', hi: 'ऑर्थोबायोलॉजी उपचार', gu: 'ઓર્થોબાયોલોજી સારવાર' },
        ortho_4: { en: 'Fracture Management', hi: 'फ्रैक्चर प्रबंधन', gu: 'ફ્રેક્ચર મેનેજમેન્ટ' },
        ortho_5: { en: 'Sports Injuries', hi: 'खेल चोटें', gu: 'રમત-ગમતની ઇજાઓ' },
        ortho_6: { en: 'Arthritis Care', hi: 'गठिया देखभाल', gu: 'આર્થરાઈટિસ સંભાળ' },
        
        // Gynecology
        gyn_title: { en: 'OB-GYN Services', hi: 'प्रसूति-स्त्री रोग सेवाएं', gu: 'પ્રસૂતિ-સ્ત્રીરોગ સેવાઓ' },
        gyn_doctor: { en: 'Dr. Sunita Sajnani', hi: 'डॉ. सुनीता सजनानी', gu: 'ડૉ. સુનિતા સજનાની' },
        gyn_1: { en: 'Obstetrics & Delivery Care', hi: 'प्रसूति और प्रसव देखभाल', gu: 'પ્રસૂતિ અને ડિલિવરી સંભાળ' },
        gyn_2: { en: 'Gynecology Consultations', hi: 'स्त्री रोग परामर्श', gu: 'સ્ત્રીરોગ પરામર્શ' },
        gyn_3: { en: 'Adolescent Gynecology', hi: 'किशोर स्त्री रोग', gu: 'કિશોર સ્ત્રીરોગ' },
        gyn_4: { en: 'Adolescent Education', hi: 'किशोर शिक्षा', gu: 'કિશોર શિક્ષણ' },
        gyn_5: { en: 'Cosmetic Gynecology', hi: 'कॉस्मेटिक स्त्री रोग', gu: 'કોસ્મેટિક સ્ત્રીરોગ' },
        gyn_6: { en: 'Women\'s Wellness', hi: 'महिला स्वास्थ्य', gu: 'મહિલા સ્વાસ્થ્ય' },
        
        // Facilities
        facilities_title: { en: 'Our Facilities', hi: 'हमारी सुविधाएं', gu: 'અમારી સુવિધાઓ' },
        facilities_subtitle: { en: 'Modern & Comfortable', hi: 'आधुनिक और आरामदायक', gu: 'આધુનિક અને આરામદાયક' },
        facility_1: { en: 'Modern Operation Theatre with IITV', hi: 'IITV के साथ आधुनिक ऑपरेशन थियेटर', gu: 'IITV સાથે આધુનિક ઓપરેશન થિયેટર' },
        facility_2: { en: 'Latest X-Ray Machine', hi: 'नवीनतम एक्स-रे मशीन', gu: 'નવીનતમ એક્સ-રે મશીન' },
        facility_3: { en: 'AC Private Rooms', hi: 'वातानुकूलित निजी कमरे', gu: 'AC પ્રાઇવેટ રૂમ' },
        facility_4: { en: 'Comfortable Patient Beds', hi: 'आरामदायक रोगी बिस्तर', gu: 'આરામદાયક પેશન્ટ બેડ' },
        facility_5: { en: 'Diagnostic Services', hi: 'नैदानिक सेवाएं', gu: 'ડાયગ્નોસ્ટિક સેવાઓ' },
        facility_6: { en: '24/7 Nursing Care', hi: '24/7 नर्सिंग देखभाल', gu: '24/7 નર્સિંગ સંભાળ' },
        
        // ===== BOOKING =====
        book_title: { en: 'Book Appointment', hi: 'अपॉइंटमेंट बुक करें', gu: 'એપોઇન્ટમેન્ટ બુક કરો' },
        book_subtitle: { en: 'Schedule your visit with our expert doctors', hi: 'हमारे विशेषज्ञ डॉक्टरों के साथ अपनी मुलाकात शेड्यूल करें', gu: 'અમારા નિષ્ણાત ડોક્ટરો સાથે તમારી મુલાકાત શેડ્યૂલ કરો' },
        select_doctor: { en: 'Select Doctor', hi: 'डॉक्टर चुनें', gu: 'ડોક્ટર પસંદ કરો' },
        select_date: { en: 'Select Date', hi: 'तारीख चुनें', gu: 'તારીખ પસંદ કરો' },
        select_time: { en: 'Select Time', hi: 'समय चुनें', gu: 'સમય પસંદ કરો' },
        your_name: { en: 'Your Name', hi: 'आपका नाम', gu: 'તમારું નામ' },
        phone_number: { en: 'Phone Number', hi: 'फोन नंबर', gu: 'ફોન નંબર' },
        reason_visit: { en: 'Reason for Visit', hi: 'मिलने का कारण', gu: 'મુલાકાતનું કારણ' },
        submit: { en: 'Submit', hi: 'जमा करें', gu: 'સબમિટ કરો' },
        
        // ===== PATIENT PORTAL =====
        patient_login: { en: 'Patient Login', hi: 'पेशेंट लॉगिन', gu: 'પેશન્ટ લૉગિન' },
        my_appointments: { en: 'My Appointments', hi: 'मेरी अपॉइंटमेंट्स', gu: 'મારી એપોઇન્ટમેન્ટ્સ' },
        my_prescriptions: { en: 'My Prescriptions', hi: 'मेरे प्रिस्क्रिप्शन', gu: 'મારા પ્રિસ્ક્રિપ્શન' },
        my_profile: { en: 'My Profile', hi: 'मेरी प्रोफाइल', gu: 'મારી પ્રોફાઇલ' },
        
        // ===== STAFF INTERFACE =====
        send_signup_link: { en: 'Send Signup Link', hi: 'साइनअप लिंक भेजें', gu: 'સાઇનઅપ લિંક મોકલો' },
        patient_phone: { en: 'Patient Phone', hi: 'पेशेंट फोन', gu: 'પેશન્ટ ફોન' },
        patient_name: { en: 'Patient Name', hi: 'पेशेंट का नाम', gu: 'પેશન્ટનું નામ' },
        send_via_sms: { en: 'Send via SMS', hi: 'SMS से भेजें', gu: 'SMS દ્વારા મોકલો' },
        send_via_whatsapp: { en: 'Send via WhatsApp', hi: 'WhatsApp से भेजें', gu: 'WhatsApp દ્વારા મોકલો' },
        link_sent: { en: 'Link sent successfully!', hi: 'लिंक सफलतापूर्वक भेजा गया!', gu: 'લિંક સફળતાપૂર્વક મોકલાયો!' },
        
        // ===== DOCTOR INTERFACE =====
        todays_patients: { en: 'Today\'s Patients', hi: 'आज के मरीज', gu: 'આજના દર્દીઓ' },
        write_prescription: { en: 'Write Prescription', hi: 'प्रिस्क्रिप्शन लिखें', gu: 'પ્રિસ્ક્રિપ્શન લખો' },
        send_reminder: { en: 'Send Reminder', hi: 'रिमाइंडर भेजें', gu: 'રીમાઇન્ડર મોકલો' },
        view_history: { en: 'View History', hi: 'इतिहास देखें', gu: 'હિસ્ટ્રી જુઓ' },
        upload_images: { en: 'Upload Images', hi: 'इमेज अपलोड करें', gu: 'ઇમેજ અપલોડ કરો' },
        
        // ===== COMMON =====
        welcome: { en: 'Welcome', hi: 'स्वागत है', gu: 'સ્વાગત છે' },
        logout: { en: 'Logout', hi: 'लॉगआउट', gu: 'લૉગઆઉટ' },
        save: { en: 'Save', hi: 'सेव करें', gu: 'સેવ કરો' },
        cancel: { en: 'Cancel', hi: 'रद्द करें', gu: 'રદ કરો' },
        confirm: { en: 'Confirm', hi: 'पुष्टि करें', gu: 'કન્ફર્મ કરો' },
        loading: { en: 'Loading...', hi: 'लोड हो रहा है...', gu: 'લોડ થઈ રહ્યું છે...' },
        success: { en: 'Success!', hi: 'सफल!', gu: 'સફળ!' },
        error: { en: 'Error', hi: 'त्रुटि', gu: 'ભૂલ' },
        yes: { en: 'Yes', hi: 'हां', gu: 'હા' },
        no: { en: 'No', hi: 'नहीं', gu: 'ના' },
        back: { en: 'Back', hi: 'वापस', gu: 'પાછા' },
        next: { en: 'Next', hi: 'आगे', gu: 'આગળ' },
        
        // ===== DAYS & TIMES =====
        monday: { en: 'Monday', hi: 'सोमवार', gu: 'સોમવાર' },
        tuesday: { en: 'Tuesday', hi: 'मंगलवार', gu: 'મંગળવાર' },
        wednesday: { en: 'Wednesday', hi: 'बुधवार', gu: 'બુધવાર' },
        thursday: { en: 'Thursday', hi: 'गुरुवार', gu: 'ગુરુવાર' },
        friday: { en: 'Friday', hi: 'शुक्रवार', gu: 'શુક્રવાર' },
        saturday: { en: 'Saturday', hi: 'शनिवार', gu: 'શનિવાર' },
        sunday: { en: 'Sunday', hi: 'रविवार', gu: 'રવિવાર' },
        morning: { en: 'Morning', hi: 'सुबह', gu: 'સવારે' },
        afternoon: { en: 'Afternoon', hi: 'दोपहर', gu: 'બપોરે' },
        evening: { en: 'Evening', hi: 'शाम', gu: 'સાંજે' },
        
        // ===== MEDICAL TERMS =====
        prescription: { en: 'Prescription', hi: 'प्रिस्क्रिप्शन', gu: 'પ્રિસ્ક્રિપ્શન' },
        medicine: { en: 'Medicine', hi: 'दवाई', gu: 'દવા' },
        dosage: { en: 'Dosage', hi: 'खुराक', gu: 'ડોઝ' },
        duration: { en: 'Duration', hi: 'अवधि', gu: 'સમયગાળો' },
        diagnosis: { en: 'Diagnosis', hi: 'निदान', gu: 'નિદાન' },
        advice: { en: 'Advice', hi: 'सलाह', gu: 'સલાહ' },
        followup: { en: 'Follow-up', hi: 'फॉलो-अप', gu: 'ફોલો-અપ' },
        
        // ===== CONTACT =====
        call_us: { en: 'Call Us', hi: 'कॉल करें', gu: 'કૉલ કરો' },
        whatsapp_us: { en: 'WhatsApp Us', hi: 'WhatsApp करें', gu: 'WhatsApp કરો' },
        email_us: { en: 'Email Us', hi: 'ईमेल करें', gu: 'ઈમેલ કરો' },
        visit_us: { en: 'Visit Us', hi: 'मिलने आएं', gu: 'મળવા આવો' },
        working_hours: { en: 'Working Hours', hi: 'कार्य समय', gu: 'કાર્ય સમય' },
        
        // ===== FOOTER =====
        copyright: { en: '© 2025 Adinath Hospital. All rights reserved.', hi: '© 2025 आदिनाथ हॉस्पिटल। सर्वाधिकार सुरक्षित।', gu: '© 2025 આદિનાથ હોસ્પિટલ. સર્વાધિકાર સુરક્ષિત.' },
        made_with_love: { en: 'Made with ❤️ in Ahmedabad', hi: 'अहमदाबाद में ❤️ से बनाया', gu: 'અમદાવાદમાં ❤️ થી બનાવેલ' }
    },
    
    // Initialize language
    init() {
        // Check user preference or browser language
        const saved = localStorage.getItem('hms_language');
        if (saved) {
            this.currentLanguage = saved;
        } else {
            // Detect from browser
            const browserLang = navigator.language.split('-')[0];
            if (['hi', 'gu'].includes(browserLang)) {
                this.currentLanguage = browserLang;
            }
        }
        this.applyTranslations();
    },
    
    // Set language
    setLanguage(lang) {
        if (!['en', 'hi', 'gu'].includes(lang)) return;
        this.currentLanguage = lang;
        localStorage.setItem('hms_language', lang);
        this.applyTranslations();
        document.documentElement.lang = lang;
    },
    
    // Get translation
    t(key, lang = null) {
        const translation = this.translations[key];
        if (!translation) return key;
        return translation[lang || this.currentLanguage] || translation['en'] || key;
    },
    
    // Apply translations to page
    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
        
        // Update language selector if exists
        const langBtns = document.querySelectorAll('[data-lang]');
        langBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
        });
    },
    
    // Format date in current language
    formatDate(date, options = {}) {
        const locales = { en: 'en-IN', hi: 'hi-IN', gu: 'gu-IN' };
        return new Date(date).toLocaleDateString(locales[this.currentLanguage], {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            ...options
        });
    },
    
    // Get language name
    getLanguageName(code) {
        const names = { en: 'English', hi: 'हिंदी', gu: 'ગુજરાતી' };
        return names[code] || code;
    },
    
    // Translate dynamic content (for staff entering in one language, others reading in another)
    async translateText(text, fromLang, toLang) {
        // In production, this would use a translation API (Google Translate, etc.)
        // For now, return the original text with a note
        console.log(`Translation request: ${fromLang} → ${toLang}: ${text}`);
        return text; // Would be translated in production
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => I18N.init());

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18N;
}
