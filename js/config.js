// ============================================
// ADINATH HOSPITAL - CONFIGURATION
// Supabase connection and base URL
// ============================================

const CONFIG = {
    // Base URL for GitHub Pages path prefix (empty for production/local)
    BASE_URL: window.location.hostname.includes('github.io') ? '/adinath-hospital' : '',

    // Supabase connection
    SUPABASE_URL: 'https://lhwqwloibxiiqtgaoxqp.supabase.co',
    SUPABASE_ANON_KEY:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxod3F3bG9pYnhpaXF0Z2FveHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzMzMzksImV4cCI6MjA4MTkwOTMzOX0.s5IuG7e50dam4QAPpyTXEYoNHIWv8PupOgXx8Y_Rv0Y',
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG };
}
