// ============================================
// SECURITY UTILITIES
// Prevents XSS, CSRF, and protects sensitive data
// ============================================
/* global ENV */

const SecurityUtils = {
    /**
     * Sanitize HTML - remove script tags and dangerous attributes
     */
    sanitizeHTML(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },

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
                const cleanPhone = trimmed.replace(/[\s\-+91]/g, '');
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
     * Generate CSRF token
     */
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
        sessionStorage.setItem('csrf_token', token);
        return token;
    },

    /**
     * Get stored CSRF token
     */
    getCSRFToken() {
        let token = sessionStorage.getItem('csrf_token');
        if (!token) {
            token = this.generateCSRFToken();
        }
        return token;
    },

    /**
     * Verify CSRF token
     */
    verifyCSRFToken(token) {
        const stored = sessionStorage.getItem('csrf_token');
        return stored && token === stored;
    },

    /**
     * Basic encryption for localStorage (NOT for production - use real encryption)
     */
    encrypt(data) {
        if (!data) {
            return '';
        }
        try {
            return btoa(JSON.stringify({ data, timestamp: Date.now() }));
        } catch {
            return '';
        }
    },

    /**
     * Basic decryption for localStorage (NOT for production)
     */
    decrypt(encrypted) {
        if (!encrypted) {
            return '';
        }
        try {
            const decoded = atob(encrypted);
            const obj = JSON.parse(decoded);
            if (Date.now() - obj.timestamp > 30 * 24 * 60 * 60 * 1000) {
                return '';
            }
            return obj.data;
        } catch {
            return '';
        }
    },

    /**
     * Check if request is from trusted origin
     */
    isTrustedOrigin(origin) {
        const trustedOrigins = [
            'https://adinathhealth.com',
            'https://main.d2a0i6erg1hmca.amplifyapp.com',
            'http://localhost:8080',
            'http://localhost:3000',
            'http://127.0.0.1:8080',
        ];
        return trustedOrigins.includes(origin);
    },

    /**
     * Validate object references - prevent IDOR
     */
    canAccessResource(userId, resourceOwnerId, userRole) {
        if (userRole === 'admin') {
            return true;
        }
        return userId === resourceOwnerId;
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
        if (typeof ENV !== 'undefined' && ENV === 'local') {
            console.warn('[SECURITY]', log);
        }
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
     * Check for common XSS patterns in input
     */
    containsXSSPattern(input) {
        if (!input || typeof input !== 'string') {
            return false;
        }
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /on\w+\s*=/gi,
            /javascript:/gi,
            /eval\(/gi,
            /expression\(/gi,
            /<iframe/gi,
        ];
        return xssPatterns.some((pattern) => pattern.test(input));
    },

    /**
     * Rate limit helper - track attempts in sessionStorage
     */
    checkRateLimit(key, maxAttempts = 5, windowMs = 5 * 60 * 1000) {
        try {
            const stored = sessionStorage.getItem(`ratelimit_${key}`);
            const now = Date.now();
            const record = stored ? JSON.parse(stored) : { attempts: [], firstAttempt: now };
            record.attempts = record.attempts.filter((t) => now - t < windowMs);
            if (record.attempts.length >= maxAttempts) {
                const oldestAttempt = Math.min(...record.attempts);
                const resetIn = windowMs - (now - oldestAttempt);
                return { allowed: false, remaining: 0, resetIn };
            }
            record.attempts.push(now);
            sessionStorage.setItem(`ratelimit_${key}`, JSON.stringify(record));
            return { allowed: true, remaining: maxAttempts - record.attempts.length, resetIn: 0 };
        } catch {
            return { allowed: true, remaining: maxAttempts, resetIn: 0 };
        }
    },

    /**
     * Get security headers for server-side
     */
    getSecurityHeaders() {
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        };
    },

    /**
     * Check if running in secure context (HTTPS)
     */
    isSecureContext() {
        return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
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
