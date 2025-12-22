// ============================================
// ADINATH HOSPITAL - API SERVICE
// Connects to Supabase Edge Functions
// ============================================

const API = {
    // Supabase Edge Functions base URL
    baseUrl: 'https://lhwqwloibxiiqtgaoxqp.supabase.co/functions/v1',

    // Get auth token from current session
    async getAuthToken() {
        if (window.SupabaseAuth) {
            const session = await SupabaseAuth.getSession();
            return session?.access_token;
        }
        return null;
    },

    // Make authenticated request
    async request(endpoint, options = {}) {
        const token = await this.getAuthToken();
        const anonKey =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxod3F3bG9pYnhpaXF0Z2FveHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzMzMzksImV4cCI6MjA4MTkwOTMzOX0.s5IuG7e50dam4QAPpyTXEYoNHIWv8PupOgXx8Y_Rv0Y';

        const headers = {
            'Content-Type': 'application/json',
            apikey: anonKey,
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // ============================================
    // SMS SERVICE
    // ============================================
    sms: {
        // Send SMS
        send(to, message, template = null) {
            return API.request('/send-sms', {
                method: 'POST',
                body: JSON.stringify({ to, message, template }),
            });
        },

        // Send appointment confirmation
        sendAppointmentConfirmation(patientPhone, patientName, doctorName, date, time) {
            const msg = `Dear ${patientName}, your appointment with ${doctorName} is confirmed for ${date} at ${time}. Adinath Hospital, Shahibaug. Call: 9925450425`;
            return this.send(patientPhone, msg, 'appointment_confirm');
        },

        // Send appointment reminder
        sendAppointmentReminder(patientPhone, patientName, doctorName, time) {
            const msg = `Reminder: ${patientName}, your appointment with ${doctorName} is in 1 hour at ${time}. Adinath Hospital. Reply CONFIRM or call 9925450425`;
            return this.send(patientPhone, msg, 'appointment_reminder');
        },

        // Send prescription ready notification
        sendPrescriptionReady(patientPhone, patientName) {
            const msg = `Dear ${patientName}, your prescription is ready for pickup at Adinath Hospital pharmacy. Timings: 11AM-7PM. Call: 9925450425`;
            return this.send(patientPhone, msg, 'prescription_ready');
        },

        // Send registration link
        sendRegistrationLink(phone, name, type, link) {
            const msg = `Namaste ${name}! Welcome to Adinath Hospital. Please complete your ${type} registration: ${link}`;
            return this.send(phone, msg, 'registration');
        },
    },

    // ============================================
    // PAYMENT SERVICE
    // ============================================
    payments: {
        // Create payment order
        createOrder(amount, type, description = '', customer = {}) {
            return API.request('/create-payment', {
                method: 'POST',
                body: JSON.stringify({
                    amount,
                    type,
                    description,
                    customer,
                    receipt: `ADH_${Date.now()}`,
                }),
            });
        },

        // Create consultation payment
        payConsultation(amount, patientName, doctorName) {
            return this.createOrder(amount, 'consultation', `Consultation with ${doctorName}`, {
                name: patientName,
            });
        },

        // Create medicine payment
        payMedicine(amount, items, patientName) {
            return this.createOrder(
                amount,
                'medicine',
                `Medicine purchase: ${items.length} items`,
                { name: patientName }
            );
        },

        // Create yoga class payment
        payYogaClass(amount, patientName, sessions = 1) {
            return this.createOrder(amount, 'yoga', `Yoga classes: ${sessions} session(s)`, {
                name: patientName,
            });
        },

        // Open Razorpay checkout
        async openCheckout(orderData, callbacks = {}) {
            if (!window.Razorpay) {
                // Load Razorpay script
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            const options = {
                key: orderData.razorpay_key,
                amount: orderData.order?.amount || orderData.amount * 100,
                currency: 'INR',
                name: 'Adinath Hospital',
                description: orderData.description || 'Payment',
                order_id: orderData.order?.id,
                handler(response) {
                    console.info('Payment successful:', response);
                    callbacks.onSuccess?.(response);
                },
                prefill: {
                    name: orderData.customer?.name || '',
                    email: orderData.customer?.email || '',
                    contact: orderData.customer?.phone || '',
                },
                theme: {
                    color: '#0f766e',
                },
                modal: {
                    ondismiss() {
                        callbacks.onCancel?.();
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                console.error('Payment failed:', response.error);
                callbacks.onFailure?.(response.error);
            });

            rzp.open();
        },

        // Generate UPI QR code
        generateUPIQR(amount, description = '') {
            const upiId = 'adinathhospital@upi'; // Replace with actual UPI ID
            const merchantName = 'Adinath Hospital';

            const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(description)}`;

            // Use QRCode library if available
            if (window.QRCode) {
                const qrContainer = document.createElement('div');
                new QRCode(qrContainer, {
                    text: upiUrl,
                    width: 200,
                    height: 200,
                });
                return qrContainer;
            }

            // Return URL for external QR generation
            return { url: upiUrl };
        },
    },

    // ============================================
    // FILE UPLOAD SERVICE
    // ============================================
    files: {
        // Upload file
        async upload(file, bucket = 'hospital-images', path = '') {
            const token = await API.getAuthToken();
            const anonKey =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxod3F3bG9pYnhpaXF0Z2FveHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzMzMzksImV4cCI6MjA4MTkwOTMzOX0.s5IuG7e50dam4QAPpyTXEYoNHIWv8PupOgXx8Y_Rv0Y';

            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucket', bucket);
            formData.append('path', path);

            const response = await fetch(`${API.baseUrl}/upload-file`, {
                method: 'POST',
                headers: {
                    apikey: anonKey,
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            return data;
        },

        // Upload patient file (x-ray, report, etc.)
        uploadPatientFile(file, patientId) {
            return this.upload(file, 'patient-files', `patients/${patientId}`);
        },

        // Upload hospital image (for website)
        uploadHospitalImage(file, category = 'general') {
            return this.upload(file, 'hospital-images', category);
        },

        // Upload doctor content (video, blog image)
        uploadDoctorContent(file, doctorId, type = 'blog') {
            return this.upload(file, 'doctor-content', `${doctorId}/${type}`);
        },

        // Get public URL for file
        getPublicUrl(bucket, path) {
            return `https://lhwqwloibxiiqtgaoxqp.supabase.co/storage/v1/object/public/${bucket}/${path}`;
        },
    },

    // ============================================
    // WHATSAPP FALLBACK
    // ============================================
    whatsapp: {
        // Open WhatsApp with message (fallback for SMS)
        send(phone, message) {
            let cleanPhone = phone.toString().replace(/\D/g, '');
            if (cleanPhone.length === 10) {
                cleanPhone = `91${cleanPhone}`;
            }

            const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');

            return { success: true, method: 'whatsapp' };
        },

        // Send booking confirmation via WhatsApp
        sendBookingConfirmation(phone, patientName, doctorName, date, time) {
            const message = `🏥 *Adinath Hospital*\n\nDear ${patientName},\n\nYour appointment is confirmed!\n\n👨‍⚕️ Doctor: ${doctorName}\n📅 Date: ${date}\n⏰ Time: ${time}\n\n📍 Location: Shukan Mall, 2nd Floor, Shahibaug\n📞 Contact: +91 99254 50425\n\nPlease arrive 10 minutes early.\n\nThank you!`;
            return this.send(phone, message);
        },
    },

    // ============================================
    // INVOICE SERVICE
    // ============================================
    invoices: {
        // Generate invoice
        generate(data) {
            return API.request('/generate-invoice?format=json', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        // Generate consultation invoice
        consultationInvoice(patientName, doctorName, amount, paymentMethod = 'cash') {
            return this.generate({
                patientName,
                invoiceType: 'consultation',
                paymentMethod,
                items: [
                    {
                        name: `Consultation with ${doctorName}`,
                        quantity: 1,
                        price: amount,
                        gst: 0,
                    },
                ],
            });
        },

        // Generate medicine invoice
        medicineInvoice(patientName, items, discount = 0, paymentMethod = 'cash') {
            return this.generate({
                patientName,
                invoiceType: 'medicine',
                paymentMethod,
                discount,
                items,
            });
        },

        // Generate yoga class invoice
        yogaInvoice(patientName, sessions, pricePerSession, paymentMethod = 'cash') {
            return this.generate({
                patientName,
                invoiceType: 'yoga',
                paymentMethod,
                items: [
                    {
                        name: 'Yoga Classes with Dr. Sunita',
                        quantity: sessions,
                        price: pricePerSession,
                        gst: 0,
                    },
                ],
            });
        },

        // Open invoice in new window for printing
        async openInvoice(data) {
            const response = await API.request('/generate-invoice', {
                method: 'POST',
                body: JSON.stringify(data),
            });

            // Open in new window
            const win = window.open('', '_blank');
            win.document.write(response);
            win.document.close();
        },
    },

    // ============================================
    // HEALTH CHECK
    // ============================================
    async healthCheck() {
        try {
            const result = await this.request('/health');
            return result;
        } catch (error) {
            return false;
        }
    },
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
