/**
 * AI Chatbot Module
 * Rule-based multilingual chatbot for patient support
 * @module Chatbot
 */

const Chatbot = {
    isOpen: false,
    messages: [],
    language: 'en',
    unansweredQuestions: [],

    // FAQ Database with multilingual support
    faq: {
        appointment: {
            keywords: ['appointment', 'book', 'booking', 'schedule', 'अपॉइंटमेंट', 'બુક'],
            response: {
                en: '📅 To book an appointment:\n\n1. Visit our [Booking Page](/book.html)\n2. Select your preferred doctor\n3. Choose a convenient time slot\n4. Fill in your details\n\nOr call us at +91 99254 50425',
                hi: '📅 अपॉइंटमेंट बुक करने के लिए:\n\n1. हमारे बुकिंग पेज पर जाएं\n2. अपने पसंदीदा डॉक्टर का चयन करें\n3. सुविधाजनक समय चुनें\n4. अपनी जानकारी भरें\n\nया हमें +91 99254 50425 पर कॉल करें',
                gu: '📅 એપોઇન્ટમેન્ટ બુક કરવા માટે:\n\n1. અમારા બુકિંગ પેજ પર જાઓ\n2. તમારા પસંદગીના ડૉક્ટરની પસંદગી કરો\n3. અનુકૂળ સમય પસંદ કરો\n4. તમારી માહિતી ભરો\n\nઅથવા અમને +91 99254 50425 પર કૉલ કરો',
            },
            action: { type: 'link', url: '/book.html', label: 'Book Appointment' },
        },

        hours: {
            keywords: ['hours', 'timing', 'open', 'close', 'time', 'समय', 'સમય', 'when'],
            response: {
                en: '🕐 Our Working Hours:\n\nMonday - Saturday: 11:00 AM - 7:00 PM\nSunday: Closed\n\nNote: We do not handle emergencies. For emergencies, please call 108.',
                hi: '🕐 हमारे कार्य समय:\n\nसोमवार - शनिवार: सुबह 11:00 - शाम 7:00\nरविवार: बंद\n\nनोट: हम आपातकालीन स्थिति नहीं संभालते। आपातकाल के लिए 108 पर कॉल करें।',
                gu: '🕐 અમારા કામના કલાકો:\n\nસોમવાર - શનિવાર: સવારે 11:00 - સાંજે 7:00\nરવિવાર: બંધ\n\nનોંધ: અમે ઇમરજન્સી સંભાળતા નથી. ઇમરજન્સી માટે 108 પર કૉલ કરો.',
            },
        },

        location: {
            keywords: ['location', 'address', 'where', 'directions', 'map', 'पता', 'સરનામું'],
            response: {
                en: '📍 Adinath Hospital Location:\n\n2nd Floor, Shukan Mall\nShahibaug Road, near Rajasthan Hospital\nAhmedabad, Gujarat 380004\n\n🗺️ [View on Google Maps](https://maps.google.com/?q=Adinath+Hospital+Shahibaug+Ahmedabad)',
                hi: '📍 आदिनाथ अस्पताल का पता:\n\n2nd Floor, शुकन मॉल\nशाहीबाग रोड, राजस्थान हॉस्पिटल के पास\nअहमदाबाद, गुजरात 380004\n\n🗺️ गूगल मैप्स पर देखें',
                gu: '📍 આદિનાથ હોસ્પિટલનું સ્થાન:\n\n2nd Floor, શુકન મોલ\nશાહીબાગ રોડ, રાજસ્થાન હોસ્પિટલ પાસે\nઅમદાવાદ, ગુજરાત 380004\n\n🗺️ Google Maps પર જુઓ',
            },
            action: {
                type: 'link',
                url: 'https://maps.google.com/?q=Adinath+Hospital+Shahibaug+Ahmedabad',
                label: 'Open Maps',
            },
        },

        doctors: {
            keywords: ['doctor', 'dr', 'specialist', 'डॉक्टर', 'ડૉક્ટર', 'ashok', 'sunita'],
            response: {
                en: '👨‍⚕️ Our Doctors:\n\n**Dr. Ashok Sajnani**\nOrthopedic Surgeon | 35+ years experience\nSpecialties: Joint preservation, Orthobiology, Non-surgical treatments\n\n**Dr. Sunita Sajnani**\nMD Obstetrics & Gynecology\nSpecialties: Adolescent gynecology, Cosmetic gynecology, Yoga therapy',
                hi: '👨‍⚕️ हमारे डॉक्टर:\n\n**डॉ. अशोक सजनानी**\nऑर्थोपेडिक सर्जन | 35+ वर्ष का अनुभव\n\n**डॉ. सुनीता सजनानी**\nएमडी प्रसूति एवं स्त्री रोग',
                gu: '👨‍⚕️ અમારા ડૉક્ટર:\n\n**ડૉ. અશોક સજનાની**\nઓર્થોપેડિક સર્જન | 35+ વર્ષનો અનુભવ\n\n**ડૉ. સુનીતા સજનાની**\nએમડી પ્રસૂતિ અને સ્ત્રી રોગ',
            },
        },

        orthopedic: {
            keywords: ['bone', 'joint', 'knee', 'orthopedic', 'ortho', 'हड्डी', 'घुटना', 'હાડકું'],
            response: {
                en: '🦴 Orthopedic Services:\n\nDr. Ashok Sajnani specializes in:\n• Joint preservation (non-surgical)\n• Knee pain treatment\n• Orthobiology\n• Sports injuries\n• Bone & joint disorders\n\nBook a consultation for a personalized treatment plan.',
                hi: '🦴 ऑर्थोपेडिक सेवाएं:\n\nडॉ. अशोक सजनानी विशेषज्ञ हैं:\n• जोड़ों का संरक्षण\n• घुटने के दर्द का इलाज\n• ऑर्थोबायोलॉजी\n• खेल चोटें',
                gu: '🦴 ઓર્થોપેડિક સેવાઓ:\n\nડૉ. અશોક સજનાની નિષ્ણાત છે:\n• સાંધાની જાળવણી\n• ઘૂંટણના દુખાવાની સારવાર\n• ઓર્થોબાયોલોજી',
            },
            action: { type: 'link', url: '/services/orthopedic.html', label: 'Learn More' },
        },

        gynecology: {
            keywords: ['gynec', 'women', 'pregnancy', 'महिला', 'गर्भावस्था', 'સ્ત્રી', 'obgyn'],
            response: {
                en: "👩‍⚕️ Gynecology Services:\n\nDr. Sunita Sajnani specializes in:\n• Adolescent gynecology\n• Cosmetic gynecology\n• Pregnancy care\n• Women's health\n• Yoga therapy for women",
                hi: '👩‍⚕️ स्त्री रोग सेवाएं:\n\nडॉ. सुनीता सजनानी विशेषज्ञ हैं:\n• किशोर स्त्री रोग\n• कॉस्मेटिक स्त्री रोग\n• गर्भावस्था देखभाल',
                gu: '👩‍⚕️ સ્ત્રીરોગ સેવાઓ:\n\nડૉ. સુનીતા સજનાની નિષ્ણાત છે:\n• કિશોર સ્ત્રીરોગ\n• કોસ્મેટિક સ્ત્રીરોગ\n• ગર્ભાવસ્થા સંભાળ',
            },
            action: { type: 'link', url: '/services/gynecology.html', label: 'Learn More' },
        },

        yoga: {
            keywords: ['yoga', 'class', 'exercise', 'योग', 'યોગ', 'fitness'],
            response: {
                en: "🧘 Yoga Classes:\n\nDr. Sunita Sajnani conducts therapeutic yoga sessions:\n• For women's health\n• Pregnancy yoga\n• General wellness\n• Stress relief\n\nSchedule: Check our website for current timings.",
                hi: '🧘 योग कक्षाएं:\n\nडॉ. सुनीता सजनानी चिकित्सीय योग सत्र आयोजित करती हैं:\n• महिलाओं के स्वास्थ्य के लिए\n• गर्भावस्था योग\n• सामान्य कल्याण',
                gu: '🧘 યોગ વર્ગો:\n\nડૉ. સુનીતા સજનાની ઉપચારાત્મક યોગ સત્રો આયોજિત કરે છે:\n• સ્ત્રીઓના સ્વાસ્થ્ય માટે\n• ગર્ભાવસ્થા યોગ\n• સામાન્ય સુખાકારી',
            },
            action: { type: 'link', url: '/services/yoga.html', label: 'View Schedule' },
        },

        medicine: {
            keywords: ['medicine', 'pharmacy', 'drug', 'tablet', 'दवा', 'દવા', 'store'],
            response: {
                en: '💊 Medical Store:\n\nOur pharmacy is located on the ground floor.\n\nServices:\n• Prescription medicines\n• OTC medications\n• Medical supplies\n\nTiming: 11 AM - 7 PM (Mon-Sat)',
                hi: '💊 मेडिकल स्टोर:\n\nहमारी फार्मेसी ग्राउंड फ्लोर पर स्थित है।\n\nसमय: सुबह 11 - शाम 7 (सोम-शनि)',
                gu: '💊 મેડિકલ સ્ટોર:\n\nઅમારી ફાર્મસી ગ્રાઉન્ડ ફ્લોર પર સ્થિત છે।\n\nસમય: સવારે 11 - સાંજે 7 (સોમ-શનિ)',
            },
            action: { type: 'link', url: '/store.html', label: 'Visit Store' },
        },

        emergency: {
            keywords: ['emergency', 'urgent', 'accident', 'आपातकाल', 'ઇમરજન્સી', '108'],
            response: {
                en: '🚨 EMERGENCY NOTICE:\n\n⚠️ Adinath Hospital does NOT handle emergencies.\n\nFor emergencies, please:\n• Call 108 (Ambulance)\n• Visit the nearest emergency hospital\n• Rajasthan Hospital is nearby\n\nStay safe!',
                hi: '🚨 आपातकालीन सूचना:\n\n⚠️ आदिनाथ अस्पताल आपातकाल नहीं संभालता।\n\nआपातकाल के लिए:\n• 108 पर कॉल करें\n• निकटतम आपातकालीन अस्पताल जाएं',
                gu: '🚨 ઇમરજન્સી સૂચના:\n\n⚠️ આદિનાથ હોસ્પિટલ ઇમરજન્સી સંભાળતી નથી।\n\nઇમરજન્સી માટે:\n• 108 પર કૉલ કરો\n• નજીકની ઇમરજન્સી હોસ્પિટલમાં જાઓ',
            },
        },

        contact: {
            keywords: ['contact', 'phone', 'call', 'whatsapp', 'फोन', 'ફોન', 'number'],
            response: {
                en: "📞 Contact Us:\n\nPhone: +91 99254 50425\nWhatsApp: +91 99254 50425\nEmail: info@adinathhealth.com\n\nWe're happy to help!",
                hi: '📞 संपर्क करें:\n\nफोन: +91 99254 50425\nव्हाट्सएप: +91 99254 50425\nईमेल: info@adinathhealth.com',
                gu: '📞 સંપર્ક કરો:\n\nફોન: +91 99254 50425\nવોટ્સએપ: +91 99254 50425\nઇમેઇલ: info@adinathhealth.com',
            },
            action: {
                type: 'whatsapp',
                url: 'https://wa.me/919925450425',
                label: 'Chat on WhatsApp',
            },
        },

        payment: {
            keywords: ['payment', 'pay', 'cost', 'fee', 'price', 'भुगतान', 'ચુકવણી', 'upi'],
            response: {
                en: '💳 Payment Options:\n\n• Cash\n• UPI (GPay, PhonePe, Paytm)\n• Debit/Credit Cards\n• Bank Transfer\n\nConsultation fees vary by service. Please call for specific pricing.',
                hi: '💳 भुगतान विकल्प:\n\n• नकद\n• UPI (GPay, PhonePe, Paytm)\n• डेबिट/क्रेडिट कार्ड\n\nपरामर्श शुल्क सेवा के अनुसार भिन्न होता है।',
                gu: '💳 ચુકવણી વિકલ્પો:\n\n• રોકડ\n• UPI (GPay, PhonePe, Paytm)\n• ડેબિટ/ક્રેડિટ કાર્ડ\n\nસલાહ ફી સેવા પ્રમાણે અલગ અલગ હોય છે.',
            },
        },

        insurance: {
            keywords: ['insurance', 'claim', 'mediclaim', 'बीमा', 'વીમો', 'cashless'],
            response: {
                en: '🏥 Insurance:\n\nWe accept various insurance plans. Please bring:\n• Insurance card\n• ID proof\n• Pre-authorization (if required)\n\nContact us for specific insurance queries.',
                hi: '🏥 बीमा:\n\nहम विभिन्न बीमा योजनाएं स्वीकार करते हैं। कृपया लाएं:\n• बीमा कार्ड\n• पहचान प्रमाण',
                gu: '🏥 વીમો:\n\nઅમે વિવિધ વીમા યોજનાઓ સ્વીકારીએ છીએ. કૃપા કરીને લાવો:\n• વીમા કાર્ડ\n• ઓળખ પ્રમાણ',
            },
        },
    },

    // Quick reply suggestions
    quickReplies: {
        en: [
            '📅 Book Appointment',
            '🕐 Working Hours',
            '📍 Location',
            '👨‍⚕️ Our Doctors',
            '📞 Contact',
        ],
        hi: ['📅 अपॉइंटमेंट बुक करें', '🕐 समय', '📍 पता', '👨‍⚕️ डॉक्टर', '📞 संपर्क'],
        gu: ['📅 એપોઇન્ટમેન્ટ', '🕐 સમય', '📍 સ્થાન', '👨‍⚕️ ડૉક્ટર', '📞 સંપર્ક'],
    },

    /**
     * Initialize the chatbot
     */
    init() {
        this.language = this.detectLanguage();
        this.createWidget();
        this.attachEventListeners();
        console.info('[Chatbot] Initialized');
    },

    /**
     * Detect user's preferred language
     * @returns {string}
     */
    detectLanguage() {
        // Check localStorage
        const stored = localStorage.getItem('preferred_language');
        if (stored && ['en', 'hi', 'gu'].includes(stored)) {
            return stored;
        }

        // Check browser language
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('hi')) {
            return 'hi';
        }
        if (browserLang.startsWith('gu')) {
            return 'gu';
        }

        return 'en';
    },

    /**
     * Create the chat widget HTML
     */
    createWidget() {
        const widget = document.createElement('div');
        widget.id = 'chatbot-widget';
        widget.innerHTML = `
      <button id="chatbot-toggle" class="chatbot-toggle" aria-label="Open chat">
        <span class="chatbot-icon">💬</span>
        <span class="chatbot-badge" style="display: none;">1</span>
      </button>
      
      <div id="chatbot-panel" class="chatbot-panel" style="display: none;">
        <div class="chatbot-header">
          <div class="chatbot-title">
            <span class="chatbot-avatar">🏥</span>
            <div>
              <strong>Adinath Hospital</strong>
              <small>Ask us anything!</small>
            </div>
          </div>
          <div class="chatbot-actions">
            <select id="chatbot-lang" class="chatbot-lang-select">
              <option value="en">EN</option>
              <option value="hi">हिंदी</option>
              <option value="gu">ગુજ</option>
            </select>
            <button id="chatbot-close" class="chatbot-close" aria-label="Close chat">×</button>
          </div>
        </div>
        
        <div id="chatbot-messages" class="chatbot-messages">
          <!-- Messages will be inserted here -->
        </div>
        
        <div id="chatbot-quick-replies" class="chatbot-quick-replies">
          <!-- Quick replies will be inserted here -->
        </div>
        
        <div class="chatbot-input-container">
          <input type="text" id="chatbot-input" class="chatbot-input" 
                 placeholder="Type your question..." 
                 autocomplete="off">
          <button id="chatbot-send" class="chatbot-send" aria-label="Send message">
            ➤
          </button>
        </div>
      </div>
    `;

        document.body.appendChild(widget);

        // Set initial language
        document.getElementById('chatbot-lang').value = this.language;

        // Show welcome message
        this.showWelcome();
    },

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Toggle button
        document.getElementById('chatbot-toggle').addEventListener('click', () => {
            this.toggle();
        });

        // Close button
        document.getElementById('chatbot-close').addEventListener('click', () => {
            this.close();
        });

        // Send button
        document.getElementById('chatbot-send').addEventListener('click', () => {
            this.sendMessage();
        });

        // Input enter key
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Language change
        document.getElementById('chatbot-lang').addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    /**
     * Toggle chat panel
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Open chat panel
     */
    open() {
        this.isOpen = true;
        document.getElementById('chatbot-panel').style.display = 'flex';
        document.getElementById('chatbot-toggle').classList.add('active');
        document.getElementById('chatbot-input').focus();

        // Hide badge
        document.querySelector('.chatbot-badge').style.display = 'none';
    },

    /**
     * Close chat panel
     */
    close() {
        this.isOpen = false;
        document.getElementById('chatbot-panel').style.display = 'none';
        document.getElementById('chatbot-toggle').classList.remove('active');
    },

    /**
     * Set language
     * @param {string} lang - Language code
     */
    setLanguage(lang) {
        this.language = lang;
        localStorage.setItem('preferred_language', lang);
        this.updateQuickReplies();

        // Update input placeholder
        const placeholders = {
            en: 'Type your question...',
            hi: 'अपना सवाल टाइप करें...',
            gu: 'તમારો પ્રશ્ન ટાઈપ કરો...',
        };
        document.getElementById('chatbot-input').placeholder = placeholders[lang];
    },

    /**
     * Show welcome message
     */
    showWelcome() {
        const welcomes = {
            en: 'Welcome to Adinath Hospital! 👋 How can I help you today?',
            hi: 'आदिनाथ अस्पताल में आपका स्वागत है! 👋 मैं आपकी कैसे मदद कर सकता हूं?',
            gu: 'આદિનાથ હોસ્પિટલમાં આપનું સ્વાગત છે! 👋 હું તમને કેવી રીતે મદદ કરી શકું?',
        };

        this.addMessage(welcomes[this.language], 'bot');
        this.updateQuickReplies();
    },

    /**
     * Update quick reply buttons
     */
    updateQuickReplies() {
        const container = document.getElementById('chatbot-quick-replies');
        const replies = this.quickReplies[this.language];

        container.innerHTML = replies
            .map((reply) => `<button class="quick-reply-btn">${reply}</button>`)
            .join('');

        // Add click handlers
        container.querySelectorAll('.quick-reply-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.processMessage(btn.textContent);
            });
        });
    },

    /**
     * Send message from input
     */
    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();

        if (!message) {
            return;
        }

        input.value = '';
        this.processMessage(message);
    },

    /**
     * Process a user message
     * @param {string} message - User's message
     */
    processMessage(message) {
        // Add user message
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTyping();

        // Find response with slight delay for natural feel
        setTimeout(
            () => {
                this.hideTyping();
                const response = this.findResponse(message);
                this.addMessage(response.text, 'bot', response.action);
            },
            500 + Math.random() * 500
        );
    },

    /**
     * Find best matching response
     * @param {string} message - User's message
     * @returns {Object} - Response object
     */
    findResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Check each FAQ category
        for (const [, data] of Object.entries(this.faq)) {
            for (const keyword of data.keywords) {
                if (lowerMessage.includes(keyword.toLowerCase())) {
                    return {
                        text: data.response[this.language] || data.response.en,
                        action: data.action,
                    };
                }
            }
        }

        // No match found - log for improvement
        this.logUnanswered(message);

        // Return fallback
        const fallbacks = {
            en: "I'm not sure about that. Would you like to speak with our team?\n\n📞 Call: +91 99254 50425\n💬 WhatsApp: +91 99254 50425",
            hi: 'मुझे इसके बारे में पूरी जानकारी नहीं है। क्या आप हमारी टीम से बात करना चाहेंगे?\n\n📞 कॉल: +91 99254 50425',
            gu: 'મને આ વિશે ખાતરી નથી. શું તમે અમારી ટીમ સાથે વાત કરવા માંગો છો?\n\n📞 કૉલ: +91 99254 50425',
        };

        return {
            text: fallbacks[this.language],
            action: {
                type: 'whatsapp',
                url: 'https://wa.me/919925450425',
                label: this.language === 'en' ? 'Chat on WhatsApp' : 'WhatsApp पर चैट करें',
            },
        };
    },

    /**
     * Add message to chat
     * @param {string} text - Message text
     * @param {string} sender - 'user' or 'bot'
     * @param {Object} action - Optional action button
     */
    addMessage(text, sender, action = null) {
        const container = document.getElementById('chatbot-messages');

        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;

        // Process markdown-like links
        const processedText = text.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" target="_blank">$1</a>'
        );

        messageDiv.innerHTML = `
      <div class="message-content">
        ${processedText.replace(/\n/g, '<br>')}
      </div>
      ${
          action
              ? `<a href="${action.url}" class="message-action" target="_blank">${action.label}</a>`
              : ''
      }
    `;

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;

        // Store message
        this.messages.push({ text, sender, timestamp: new Date() });
    },

    /**
     * Show typing indicator
     */
    showTyping() {
        const container = document.getElementById('chatbot-messages');
        const typing = document.createElement('div');
        typing.id = 'chatbot-typing';
        typing.className = 'chatbot-message bot';
        typing.innerHTML =
            '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
    },

    /**
     * Hide typing indicator
     */
    hideTyping() {
        const typing = document.getElementById('chatbot-typing');
        if (typing) {
            typing.remove();
        }
    },

    /**
     * Log unanswered question for improvement
     * @param {string} question - The unanswered question
     */
    logUnanswered(question) {
        this.unansweredQuestions.push({
            question,
            language: this.language,
            timestamp: new Date().toISOString(),
        });

        // Store in localStorage for analytics
        try {
            const stored = JSON.parse(localStorage.getItem('chatbot_unanswered') || '[]');
            stored.push({ question, timestamp: new Date().toISOString() });
            localStorage.setItem('chatbot_unanswered', JSON.stringify(stored.slice(-50)));
        } catch {
            // Ignore storage errors
        }

        console.info('[Chatbot] Unanswered question:', question);
    },

    /**
     * Get analytics data
     * @returns {Object} - Analytics data
     */
    getAnalytics() {
        return {
            messageCount: this.messages.length,
            unansweredCount: this.unansweredQuestions.length,
            unansweredQuestions: this.unansweredQuestions,
            language: this.language,
        };
    },
};

// Auto-initialize on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Don't init on admin/portal pages
        const path = window.location.pathname;
        if (!path.includes('/portal/') && !path.includes('/admin/') && !path.includes('/store/')) {
            Chatbot.init();
        }
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Chatbot;
}
