// ============================================
// SECURITY UTILITIES
// Input validation and security logging
// ============================================
const SecurityUtils = {
    /**
     * Escape HTML special characters
     */
    escapeHTML(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, (char) => map[char]);
    },

    /**
     * Validate and sanitize user input
     */
    validateInput(input, type = 'text') {
        if (!input || typeof input !== 'string') {
            return { valid: false, value: '', error: 'Input is required' };
        }
        const trimmed = input.trim();
        if (trimmed.length > 500) {
            return { valid: false, value: '', error: 'Input is too long (max 500 characters)' };
        }
        switch (type) {
            case 'email': {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(trimmed)) {
                    return { valid: false, value: '', error: 'Invalid email format' };
                }
                return { valid: true, value: this.escapeHTML(trimmed), error: '' };
            }
            case 'phone': {
                const phoneRegex = /^[6-9]\d{9}$/;
                const cleanPhone = trimmed.replace(/^\+91/, '').replace(/[\s-]/g, '');
                if (!phoneRegex.test(cleanPhone)) {
                    return { valid: false, value: '', error: 'Invalid phone number' };
                }
                return { valid: true, value: cleanPhone, error: '' };
            }
            case 'name': {
                const nameRegex = /^[a-zA-Z\s\-'.]{2,100}$/;
                if (!nameRegex.test(trimmed)) {
                    return { valid: false, value: '', error: 'Invalid name format' };
                }
                return { valid: true, value: this.escapeHTML(trimmed), error: '' };
            }
            case 'password': {
                if (trimmed.length < 6) {
                    return {
                        valid: false,
                        value: '',
                        error: 'Password must be at least 6 characters',
                    };
                }
                return { valid: true, value: trimmed, error: '' };
            }
            default: {
                return { valid: true, value: this.escapeHTML(trimmed), error: '' };
            }
        }
    },

    /**
     * Log security event
     */
    logSecurityEvent(event, details = {}) {
        const timestamp = new Date().toISOString();
        const log = {
            timestamp,
            event,
            details,
            url: window.location.href,
            userAgent: navigator.userAgent,
        };
        console.warn('[SECURITY]', log);
        try {
            const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
            logs.push(log);
            if (logs.length > 100) {
                logs.shift();
            }
            localStorage.setItem('security_logs', JSON.stringify(logs));
        } catch {
            // Ignore storage errors
        }
    },

    /**
     * Add security meta tags
     */
    addSecurityMeta() {
        const meta1 = document.createElement('meta');
        meta1.httpEquiv = 'X-UA-Compatible';
        meta1.content = 'IE=edge';
        document.head.appendChild(meta1);
    },
};

// Initialize on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        SecurityUtils.addSecurityMeta();
    });
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityUtils;
}
