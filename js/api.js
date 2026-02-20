// ============================================
// ADINATH HOSPITAL - API SERVICE
// Connects to Supabase Edge Functions
// ============================================
/* global ENV */

const API = {
    supabaseConfig: {
        url: 'https://lhwqwloibxiiqtgaoxqp.supabase.co',
        anonKey: null,
    },

    getSupabaseKey() {
        if (this.supabaseConfig.anonKey) {
            return this.supabaseConfig.anonKey;
        }

        const demoKey =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxod3F3bG9pYnhpaXF0Z2FveHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzMzMzksImV4cCI6MjA4MTkwOTMzOX0.s5IuG7e50dam4QAPpyTXEYoNHIWv8PupOgXx8Y_Rv0Y';

        if (typeof ENV === 'undefined' || ENV !== 'production') {
            return demoKey;
        }

        console.error(
            '⚠️ ERROR: Supabase API key not configured. Set SUPABASE_ANON_KEY environment variable.'
        );
        throw new Error('Supabase configuration missing');
    },

    get baseUrl() {
        return `${this.supabaseConfig.url}/functions/v1`;
    },

    async getAuthToken() {
        if (window.SupabaseAuth) {
            const session = await SupabaseAuth.getSession();
            return session?.access_token;
        }
        return null;
    },

    async request(endpoint, options = {}) {
        const token = await this.getAuthToken();
        const anonKey = this.getSupabaseKey();

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
        } catch (_error) {
            console.error('API Error:', _error);
            throw _error;
        }
    },

    payments: {
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
    },
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
