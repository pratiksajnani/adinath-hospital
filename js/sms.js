// ============================================
// ADINATH HOSPITAL - SMS SERVICE
// Supports multiple providers: Twilio, MSG91
// ============================================

const SMS = {
    // Current provider (can be changed in config)
    provider: 'whatsapp', // 'twilio', 'msg91', 'whatsapp' (fallback)
    
    // Twilio configuration (add your credentials)
    twilio: {
        accountSid: '', // Your Twilio Account SID
        authToken: '',  // Your Twilio Auth Token
        fromNumber: '', // Your Twilio phone number
    },
    
    // MSG91 configuration (recommended for India)
    msg91: {
        authKey: '',    // Your MSG91 Auth Key
        senderId: 'ADNHSP',
        route: '4',     // Transactional
        dltTemplateId: '' // DLT registered template ID
    },
    
    // SMS Templates
    templates: {
        doctorRegistration: (name, link) => 
            `Namaste ${name}! Welcome to Adinath Hospital digital system. Please complete your registration: ${link} - Adinath Hospital`,
        
        appointmentConfirm: (patientName, doctorName, date, time) =>
            `Dear ${patientName}, your appointment with ${doctorName} is confirmed for ${date} at ${time}. Adinath Hospital, Shahibaug. Call: 9925450425`,
        
        appointmentReminder: (patientName, doctorName, time) =>
            `Reminder: ${patientName}, your appointment with ${doctorName} is in 1 hour at ${time}. Adinath Hospital. Reply CONFIRM or call 9925450425`,
        
        prescriptionReady: (patientName) =>
            `Dear ${patientName}, your prescription is ready for pickup at Adinath Hospital pharmacy. Timings: 11AM-7PM. Call: 9925450425`
    },
    
    // Send SMS via configured provider
    async send(to, message) {
        // Normalize phone number
        let phone = to.toString().replace(/\D/g, '');
        if (phone.length === 10) phone = '91' + phone;
        if (!phone.startsWith('91')) phone = '91' + phone;
        
        console.log(`📱 SMS to +${phone}: ${message}`);
        
        switch (this.provider) {
            case 'twilio':
                return this.sendViaTwilio(phone, message);
            case 'msg91':
                return this.sendViaMsg91(phone, message);
            case 'whatsapp':
            default:
                return this.sendViaWhatsApp(phone, message);
        }
    },
    
    // Send via Twilio (requires backend or serverless function)
    async sendViaTwilio(phone, message) {
        if (!this.twilio.accountSid) {
            console.warn('Twilio not configured, using WhatsApp fallback');
            return this.sendViaWhatsApp(phone, message);
        }
        
        // In production, this would call a serverless function
        // that handles the actual Twilio API call
        try {
            const response = await fetch('/api/sms/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: phone, message, provider: 'twilio' })
            });
            return response.ok;
        } catch (error) {
            console.error('Twilio send failed:', error);
            return this.sendViaWhatsApp(phone, message);
        }
    },
    
    // Send via MSG91 (requires backend or serverless function)
    async sendViaMsg91(phone, message) {
        if (!this.msg91.authKey) {
            console.warn('MSG91 not configured, using WhatsApp fallback');
            return this.sendViaWhatsApp(phone, message);
        }
        
        // In production, this would call a serverless function
        try {
            const response = await fetch('/api/sms/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: phone, message, provider: 'msg91' })
            });
            return response.ok;
        } catch (error) {
            console.error('MSG91 send failed:', error);
            return this.sendViaWhatsApp(phone, message);
        }
    },
    
    // WhatsApp fallback (opens WhatsApp with pre-filled message)
    sendViaWhatsApp(phone, message) {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        return { 
            success: true, 
            method: 'whatsapp',
            note: 'WhatsApp opened - please send manually'
        };
    },
    
    // Generate doctor registration link
    generateDoctorLink(doctorId) {
        const baseUrl = window.location.origin;
        const tokens = {
            'ashok': 'ASH2024REG',
            'sunita': 'SUN2024REG'
        };
        
        if (!tokens[doctorId]) {
            console.error('Unknown doctor ID');
            return null;
        }
        
        return `${baseUrl}/onboard/doctor.html?id=${doctorId}&token=${tokens[doctorId]}`;
    },
    
    // Send doctor registration SMS
    async sendDoctorRegistrationSMS(doctorId) {
        const doctors = {
            'ashok': { name: 'Dr. Ashok', phone: '9824066854' },
            'sunita': { name: 'Dr. Sunita', phone: '9925450425' }
        };
        
        const doctor = doctors[doctorId];
        if (!doctor) {
            console.error('Unknown doctor');
            return false;
        }
        
        const link = this.generateDoctorLink(doctorId);
        const message = this.templates.doctorRegistration(doctor.name, link);
        
        return this.send(doctor.phone, message);
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SMS;
}

console.log('📱 SMS Service loaded');

